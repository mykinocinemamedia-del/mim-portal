/**
 * Quality Monitor Agent
 * -----------------------
 * Collects feedback at key milestones. Flags unhappy matches. Predicts churn.
 * Recommends interventions.
 *
 * Behavior:
 *   - Week 1 feedback: For bookings confirmed 7 days ago, send WhatsAppTemplates.feedback(name, '1 minggu', helperName)
 *   - Month 1 feedback: For bookings confirmed 30 days ago, send feedback request
 *   - Quarterly feedback: For bookings confirmed 90 days ago, send comprehensive survey
 *   - Sentiment analysis: Use AI to analyze feedback text -> positive/neutral/negative
 *   - Churn prediction: If rating <= 2 OR negative sentiment -> flag as 'at_risk'
 *   - Auto-intervention: For at-risk matches:
 *     - Create notification for admin (severity: 'warning')
 *     - Suggest intervention action (AI-generated)
 *     - Schedule follow-up call with employer
 *   - Store all feedback in Feedback table
 *
 * Schedule: Daily 10am
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { aiChat, parseAIJson, type ChatMessage } from '@/lib/ai/provider'
import { sendWhatsApp, WhatsAppTemplates } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

// Day windows (in milliseconds)
const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_1_DAYS = 7
const MONTH_1_DAYS = 30
const QUARTERLY_DAYS = 90
const WINDOW_HOURS = 24 // how long after the milestone date to still send the request

// Sentiment thresholds
const AT_RISK_RATING_THRESHOLD = 2 // rating <= 2 is at-risk

const COMPANY = {
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+6017-663 5990',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'hello@kino.my',
}

const ADMIN_PHONE = COMPANY.phone

interface AISentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
  keyThemes: string[]
}

interface AIIntervention {
  action: string
  priority: 'low' | 'medium' | 'high'
  suggestedMessage: string
}

class QualityMonitorAgent extends BaseAgent {
  readonly name = 'quality_monitor'
  readonly displayName = 'Quality Monitor Agent'
  readonly description =
    'Kumpul maklum balas pada milestone (minggu 1, bulan 1, suku tahun). Analisis sentimen AI, ramal churn (rating <=2 atau sentimen negatif), & cadang intervensi untuk admin.'
  readonly category = 'support'
  readonly schedule = 'Daily 10am'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      week1Sent: 0,
      month1Sent: 0,
      quarterlySent: 0,
      feedbackAnalyzed: 0,
      atRiskFlagged: 0,
      interventionsTriggered: 0,
      whatsappSent: 0,
      errors: 0,
    }

    try {
      // Phase 1: Send feedback requests at milestones
      const phase1 = await this.sendFeedbackRequests(stats)
      stats.week1Sent = phase1.week1
      stats.month1Sent = phase1.month1
      stats.quarterlySent = phase1.quarterly
      stats.whatsappSent += phase1.whatsapp

      // Phase 2: Analyze feedback entries without sentiment
      const analyzeResult = await this.analyzeFeedbackSentiments(stats)
      stats.feedbackAnalyzed = analyzeResult.analyzed
      stats.atRiskFlagged = analyzeResult.atRisk
      stats.whatsappSent += analyzeResult.whatsapp

      // Phase 3: Auto-intervention for at-risk matches (feedback with at_risk marker not yet intervened)
      stats.interventionsTriggered = await this.triggerInterventions(stats)

      const summary =
        `Quality Monitor: ${stats.week1Sent} minggu-1, ${stats.month1Sent} bulan-1, ${stats.quarterlySent} suku tahunan maklum balas dihantar. ` +
        `${stats.feedbackAnalyzed} maklum balas dianalisis, ${stats.atRiskFlagged} at-risk dijumpai, ` +
        `${stats.interventionsTriggered} intervensi dicadang. ` +
        `${stats.whatsappSent} WhatsApp berjaya. Errors: ${stats.errors}.`

      await this.notify({
        category: 'support',
        severity: stats.atRiskFlagged > 0 ? 'warning' : 'info',
        title: 'Quality Monitor Run Selesai',
        message: summary,
        actionUrl: '/admin/feedback',
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'Quality Monitor Agent gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Phase 1: Send feedback requests at the 3 milestone intervals (7, 30, 90 days
   * after booking confirmation). Avoid duplicates by checking existing Feedback records.
   */
  private async sendFeedbackRequests(stats: any): Promise<{
    week1: number
    month1: number
    quarterly: number
    whatsapp: number
  }> {
    const result = { week1: 0, month1: 0, quarterly: 0, whatsapp: 0 }

    try {
      const now = Date.now()
      const windowMs = WINDOW_HOURS * 60 * 60 * 1000

      // Define milestones
      const milestones = [
        {
          feedbackType: 'week_1',
          days: WEEK_1_DAYS,
          period: '1 minggu',
          counter: 'week1' as const,
        },
        {
          feedbackType: 'month_1',
          days: MONTH_1_DAYS,
          period: '1 bulan',
          counter: 'month1' as const,
        },
        {
          feedbackType: 'quarterly',
          days: QUARTERLY_DAYS,
          period: '3 bulan',
          counter: 'quarterly' as const,
        },
      ]

      for (const milestone of milestones) {
        const targetStart = new Date(now - milestone.days * DAY_MS - windowMs)
        const targetEnd = new Date(now - milestone.days * DAY_MS + windowMs)

        // Find confirmed bookings whose createdAt falls in the target window
        const bookings = await db.booking.findMany({
          where: {
            status: { in: ['confirmed', 'active'] },
            createdAt: { gte: targetStart, lte: targetEnd },
          },
          include: {
            helper: {
              select: { id: true, fullName: true, nickname: true, phone: true },
            },
            employer: {
              select: { id: true, fullName: true, phone: true, state: true },
            },
          },
          take: 50,
        })

        for (const booking of bookings) {
          try {
            if (!booking.employer) continue

            // Check if we already sent this feedback type for this booking's employer
            const existing = await db.feedback.findFirst({
              where: {
                userId: booking.employer.id,
                userType: 'employer',
                feedbackType: milestone.feedbackType,
                category: `booking_${booking.id}`,
              },
            })
            if (existing) continue // already sent

            // Create a Feedback record (rating=0 means "pending", will be updated
            // when user responds with rating)
            await db.feedback.create({
              data: {
                agentId: this.agentId,
                userId: booking.employer.id,
                userType: 'employer',
                feedbackType: milestone.feedbackType,
                rating: 0,
                category: `booking_${booking.id}`,
                comments: null,
                sentiment: null,
                actionTaken: `feedback_request_sent_${milestone.feedbackType}`,
              },
            })

            // Send WhatsApp feedback request to employer
            if (booking.employer.phone) {
              let body: string
              if (milestone.feedbackType === 'quarterly') {
                // Quarterly = comprehensive survey
                body =
                  `📋 Kajian Seliduk Suku Tahunan MIM Portal\n\n` +
                  `Hai ${booking.employer.fullName}!\n\n` +
                  `Ia dah ${milestone.period} sejak ${booking.helper.fullName} mula bekerja dengan anda. Kami nak buat kajian seliduk menyeluruh:\n\n` +
                  `1. Scale 1-5, berapa puas hati anda secara keseluruhan? (5 = sangat puas)\n` +
                  `2. Apakah yang berjalan baik?\n` +
                  `3. Apakah yang perlu diperbaiki?\n` +
                  `4. Adakah anda akan memperbaharui kontrak? (Ya/Tidak/Belum pasti)\n\n` +
                  `Reply dengan format: [rating] | [komen]\n` +
                  `Contoh: 4 | Pembantu rajin, tapi masak perlu improve\n\n` +
                  `Maklum balas anda sangat berharga! 🌟`
              } else {
                body = WhatsAppTemplates.feedback(
                  booking.employer.fullName,
                  milestone.period,
                  booking.helper.fullName
                )
              }

              const r = await sendWhatsApp({
                to: booking.employer.phone,
                body,
              })
              if (r.success) {
                result.whatsapp++
              }

              await this.logActivity({
                action: `send_feedback_request_${milestone.feedbackType}`,
                status: r.success ? 'success' : 'error',
                input: JSON.stringify({
                  bookingId: booking.id,
                  employerId: booking.employer.id,
                  feedbackType: milestone.feedbackType,
                }),
                output: JSON.stringify({
                  method: r.method,
                  error: r.error,
                }),
                errorMessage: r.error,
              })
            }

            result[milestone.counter]++
          } catch (e: any) {
            stats.errors++
            await this.logActivity({
              action: 'send_feedback_request',
              status: 'error',
              input: JSON.stringify({
                bookingId: booking.id,
                feedbackType: milestone.feedbackType,
              }),
              errorMessage: e.message || String(e),
            })
          }
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return result
  }

  /**
   * Phase 2: Analyze feedback entries that have comments but no sentiment yet.
   * Uses AI to determine sentiment. Flags at-risk if rating <= 2 or sentiment is negative.
   */
  private async analyzeFeedbackSentiments(stats: any): Promise<{
    analyzed: number
    atRisk: number
    whatsapp: number
  }> {
    const result = { analyzed: 0, atRisk: 0, whatsapp: 0 }

    try {
      // Find feedback with comments but no sentiment analysis
      // (skip entries with rating=0 = pending feedback request)
      const pendingFeedback = await db.feedback.findMany({
        where: {
          sentiment: null,
          comments: { not: null },
          rating: { not: 0 },
        },
        include: {
          // We don't have direct relation to booking, but we can fetch employer info via userId+userType
        },
        take: 30,
      })

      for (const feedback of pendingFeedback) {
        try {
          // Fetch user profile for context
          const userProfile =
            feedback.userType === 'employer'
              ? await db.employer.findUnique({
                  where: { id: feedback.userId },
                  select: { id: true, fullName: true, phone: true },
                })
              : await db.helper.findUnique({
                  where: { id: feedback.userId },
                  select: { id: true, fullName: true, phone: true },
                })

          const sentimentResult = await this.analyzeSentiment(
            feedback.comments || '',
            feedback.rating
          )

          const isAtRisk =
            feedback.rating <= AT_RISK_RATING_THRESHOLD ||
            sentimentResult.sentiment === 'negative'

          await db.feedback.update({
            where: { id: feedback.id },
            data: {
              sentiment: sentimentResult.sentiment,
              actionTaken: isAtRisk
                ? `${feedback.actionTaken || ''} | at_risk_flagged`.trim()
                : feedback.actionTaken,
            },
          })

          result.analyzed++

          if (isAtRisk) {
            result.atRisk++

            // Notify admin about at-risk match
            await this.notify({
              category: 'support',
              severity: 'warning',
              title: `🚩 At-Risk Match Dikesan (${feedback.feedbackType})`,
              message:
                `User: ${userProfile?.fullName || feedback.userId} (${feedback.userType})\n` +
                `Phone: ${userProfile?.phone || 'tiada'}\n` +
                `Rating: ${feedback.rating}/5\n` +
                `Sentiment: ${sentimentResult.sentiment} (confidence: ${(sentimentResult.confidence * 100).toFixed(0)}%)\n` +
                `Komen: "${(feedback.comments || '').slice(0, 300)}"\n` +
                `Tema utama: ${sentimentResult.keyThemes.join(', ') || 'tiada'}\n\n` +
                `Sila pertimbangkan intervensi segera.`,
              actionUrl: '/admin/feedback',
            })

            await this.logActivity({
              action: 'flag_at_risk',
              status: 'success',
              input: JSON.stringify({ feedbackId: feedback.id }),
              output: JSON.stringify({
                rating: feedback.rating,
                sentiment: sentimentResult.sentiment,
                confidence: sentimentResult.confidence,
                keyThemes: sentimentResult.keyThemes,
              }),
            })
          }
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'analyze_sentiment',
            status: 'error',
            input: JSON.stringify({ feedbackId: feedback.id }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return result
  }

  /**
   * Phase 3: For feedback flagged at-risk but not yet intervened, generate AI-suggested
   * intervention & schedule follow-up call with employer.
   */
  private async triggerInterventions(stats: any): Promise<number> {
    let triggered = 0

    try {
      // Find at-risk feedback (actionTaken contains 'at_risk_flagged' but not 'intervened')
      const atRiskFeedback = await db.feedback.findMany({
        where: {
          sentiment: { not: null },
          OR: [
            { rating: { lte: AT_RISK_RATING_THRESHOLD } },
            { sentiment: 'negative' },
          ],
          actionTaken: { contains: 'at_risk_flagged' },
          // Not yet intervened
          AND: [
            { actionTaken: { not: { contains: 'intervened' } } },
          ],
        },
        take: 20,
      })

      for (const feedback of atRiskFeedback) {
        try {
          // Fetch user profile
          const userProfile =
            feedback.userType === 'employer'
              ? await db.employer.findUnique({
                  where: { id: feedback.userId },
                  select: { id: true, fullName: true, phone: true },
                })
              : await db.helper.findUnique({
                  where: { id: feedback.userId },
                  select: { id: true, fullName: true, phone: true },
                })

          // Generate AI intervention suggestion
          const intervention = await this.generateIntervention(
            feedback,
            userProfile
          )

          if (intervention) {
            // Update feedback record with intervention
            await db.feedback.update({
              where: { id: feedback.id },
              data: {
                actionTaken:
                  `${feedback.actionTaken || ''} | intervened: ${intervention.action} (priority: ${intervention.priority})`.trim(),
              },
            })

            // Schedule follow-up call notification for admin
            await this.notify({
              category: 'support',
              severity: intervention.priority === 'high' ? 'critical' : 'warning',
              title: `📞 Tindakan Susulan Diperlukan - ${userProfile?.fullName || 'User'}`,
              message:
                `User: ${userProfile?.fullName || feedback.userId} (${feedback.userType})\n` +
                `Phone: ${userProfile?.phone || 'tiada'}\n` +
                `Rating: ${feedback.rating}/5 | Sentiment: ${feedback.sentiment}\n\n` +
                `Tindakan dicadang AI: ${intervention.action}\n` +
                `Prioriti: ${intervention.priority}\n\n` +
                `Mesej dicadang: "${intervention.suggestedMessage}"\n\n` +
                `Sila hubungi user dalam 24 jam untuk follow-up.`,
              actionUrl: '/admin/feedback',
            })

            // Send WhatsApp to admin for high-priority interventions
            if (intervention.priority === 'high') {
              try {
                await sendWhatsApp({
                  to: ADMIN_PHONE,
                  body:
                    `🚨 INTERVENSI SEGERA DIPERLUKAN\n\n` +
                    `User: ${userProfile?.fullName || feedback.userId} (${feedback.userType})\n` +
                    `Phone: ${userProfile?.phone || 'tiada'}\n` +
                    `Rating: ${feedback.rating}/5\n` +
                    `Tindakan: ${intervention.action}\n\n` +
                    `Sila hubungi user SEGERA.`,
                })
                stats.whatsappSent++
              } catch {}
            }

            triggered++

            await this.logActivity({
              action: 'trigger_intervention',
              status: 'success',
              input: JSON.stringify({ feedbackId: feedback.id }),
              output: JSON.stringify({
                action: intervention.action,
                priority: intervention.priority,
              }),
            })
          }
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'trigger_intervention',
            status: 'error',
            input: JSON.stringify({ feedbackId: feedback.id }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return triggered
  }

  /**
   * Use AI to analyze feedback sentiment based on text + rating.
   */
  private async analyzeSentiment(
    comments: string,
    rating: number
  ): Promise<AISentimentResult> {
    const defaultResult: AISentimentResult = {
      sentiment: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative',
      confidence: 0.5,
      keyThemes: [],
    }

    if (!comments || comments.trim().length === 0) {
      return defaultResult
    }

    try {
      const systemPrompt =
        'Anda adalah AI analyzer maklum balas untuk MIM Portal. ' +
        'Analisis teks maklum balas dari pembantu/majikan & tentukan sentimen. ' +
        'Balas JSON SAHAJA: {"sentiment": "positive|neutral|negative", "confidence": 0-1, "keyThemes": ["tema1", "tema2"]}. ' +
        'Semua tema dalam Bahasa Melayu. Maksimum 4 tema.'

      const userPrompt = `Rating: ${rating}/5
Komen: "${comments}"

Analisis sentimen & tema utama. Jika rating tinggi (4-5) tetapi komen negatif, ambil kira kedua-dua.`

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]
      const aiRes = await aiChat(messages, { temperature: 0.3, maxTokens: 400 })
      const parsed = parseAIJson<AISentimentResult>(aiRes.content)
      if (!parsed || !parsed.sentiment) return defaultResult

      const validSentiments = ['positive', 'neutral', 'negative']
      return {
        sentiment: validSentiments.includes(parsed.sentiment)
          ? (parsed.sentiment as AISentimentResult['sentiment'])
          : defaultResult.sentiment,
        confidence:
          typeof parsed.confidence === 'number'
            ? Math.max(0, Math.min(1, parsed.confidence))
            : 0.5,
        keyThemes: Array.isArray(parsed.keyThemes)
          ? parsed.keyThemes.slice(0, 4).map(String)
          : [],
      }
    } catch {
      return defaultResult
    }
  }

  /**
   * Use AI to generate an intervention suggestion for at-risk feedback.
   */
  private async generateIntervention(
    feedback: any,
    userProfile: any
  ): Promise<AIIntervention | null> {
    try {
      const systemPrompt =
        'Anda adalah AI advisor intervensi untuk MIM Portal. ' +
        'Berdasarkan maklum balas negatif dari user, cadangkan tindakan intervensi yang sesuai. ' +
        'Balas JSON SAHAJA: {"action": "tindakan ringkas", "priority": "low|medium|high", "suggestedMessage": "mesej WhatsApp ke user"}. ' +
        'Mesej mesti mesra, empati, dalam Bahasa Melayu, max 300 aksara.'

      const userPrompt = `USER: ${userProfile?.fullName || 'tidak diketahui'} (${feedback.userType})
Rating: ${feedback.rating}/5
Sentiment: ${feedback.sentiment}
Komen: "${feedback.comments || 'tiada komen'}"
Milestone: ${feedback.feedbackType}

Cadangkan intervensi yang sesuai. Priority "high" jika rating 1 atau ada isu serius (abuse, safety).`

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]
      const aiRes = await aiChat(messages, { temperature: 0.5, maxTokens: 500 })
      const parsed = parseAIJson<AIIntervention>(aiRes.content)
      if (!parsed || typeof parsed.action !== 'string') return null

      const validPriorities = ['low', 'medium', 'high']
      return {
        action: parsed.action,
        priority: validPriorities.includes(parsed.priority)
          ? (parsed.priority as AIIntervention['priority'])
          : 'medium',
        suggestedMessage:
          typeof parsed.suggestedMessage === 'string'
            ? parsed.suggestedMessage
            : 'Hai, kami dari MIM Portal nak follow up tentang pengalaman anda. Boleh hubungi kami?',
      }
    } catch {
      return null
    }
  }
}

// Register singleton
agentRegistry.register(new QualityMonitorAgent())

export { QualityMonitorAgent }
