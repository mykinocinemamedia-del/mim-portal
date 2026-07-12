/**
 * Interview Coordinator Agent
 * ---------------------------
 * Automatically schedules Google Meet interviews for matched helper-employer
 * pairs. Sends invites & reminders via WhatsApp. Sends feedback request after
 * the interview time has passed.
 *
 * Behavior:
 *   - Finds MatchScores with status 'accepted' (or auto-accepted score >= 85)
 *   - Generates mock Google Meet URL (xxx-xxxx-xxx format)
 *   - Suggests next business day at 10am or 2pm (mock mutual availability)
 *   - Creates Interview record + updates MatchScore status -> 'matched'
 *   - Sends WhatsAppTemplates.interviewScheduled() to both parties
 *   - 24h before interview: sends reminder
 *   - After interview time: sends WhatsAppTemplates.feedback() request
 *
 * Schedule: Every 30 minutes
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { sendWhatsApp, WhatsAppTemplates } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

// Thresholds
const AUTO_ACCEPT_SCORE = 85
const REMINDER_WINDOW_HOURS = 24
const FEEDBACK_WINDOW_HOURS = 1 // send feedback request 1h after interview time
const MAX_INTERVIEWS_PER_RUN = 10

class InterviewCoordinatorAgent extends BaseAgent {
  readonly name = 'interview_coordinator'
  readonly displayName = 'Interview Coordinator Agent'
  readonly description =
    'Jadual automatik temuduga Google Meet untuk pasangan pembantu-majikan yang dipadankan. Hantar jemputan, peringatan & permintaan maklum balas via WhatsApp.'
  readonly category = 'matching'
  readonly schedule = 'Every 30 minutes'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      newScheduled: 0,
      remindersSent: 0,
      feedbackRequestsSent: 0,
      matchesProcessed: 0,
      whatsappSent: 0,
      errors: 0,
    }

    try {
      // Step 1: Schedule new interviews for accepted/auto-accepted MatchScores
      stats.newScheduled = await this.scheduleNewInterviews(stats)

      // Step 2: Send 24h reminders for upcoming interviews
      stats.remindersSent = await this.sendUpcomingReminders(stats)

      // Step 3: Send feedback requests for completed interviews
      stats.feedbackRequestsSent = await this.sendFeedbackRequests(stats)

      stats.matchesProcessed = stats.newScheduled

      const summary =
        `Interview Coordinator: ${stats.newScheduled} temuduga baru dijadualkan, ` +
        `${stats.remindersSent} peringatan 24j dihantar, ` +
        `${stats.feedbackRequestsSent} permintaan maklum balas dihantar. ` +
        `${stats.whatsappSent} WhatsApp berjaya. Errors: ${stats.errors}.`

      await this.notify({
        category: 'summary',
        severity: 'info',
        title: 'Interview Coordinator Run Selesai',
        message: summary,
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'Interview Coordinator gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Schedule new interviews for MatchScores that are accepted or auto-accepted.
   */
  private async scheduleNewInterviews(stats: any): Promise<number> {
    let scheduled = 0

    try {
      // Find MatchScores with status 'accepted' OR score >= 85 (auto-accept)
      // that don't yet have an interview record
      const matches = await db.matchScore.findMany({
        where: {
          AND: [
            {
              OR: [{ status: 'accepted' }, { score: { gte: AUTO_ACCEPT_SCORE } }],
            },
            // exclude already-matched
            { status: { not: 'matched' } },
          ],
        },
        include: {
          helper: { select: { id: true, fullName: true, phone: true, state: true } },
          employer: { select: { id: true, fullName: true, phone: true, state: true } },
        },
        take: MAX_INTERVIEWS_PER_RUN,
      })

      for (const match of matches) {
        try {
          // Check if interview already exists for this pair
          const existingInterview = await db.interview.findFirst({
            where: {
              helperId: match.helperId,
              employerId: match.employerId,
              status: { in: ['scheduled', 'completed'] },
            },
          })
          if (existingInterview) {
            // Already scheduled - just update MatchScore status
            await db.matchScore.update({
              where: { id: match.id },
              data: { status: 'matched' },
            })
            continue
          }

          const scheduledAt = this.findMutualSlot()
          const meetUrl = this.generateMockMeetUrl()
          const dateStr = scheduledAt.toLocaleDateString('ms-MY', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
          const timeStr = scheduledAt.toLocaleTimeString('ms-MY', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })

          // Create Interview record
          const interview = await db.interview.create({
            data: {
              helperId: match.helperId,
              employerId: match.employerId,
              meetUrl,
              scheduledAt,
              status: 'scheduled',
              notes: `Auto-scheduled by Interview Coordinator. MatchScore: ${match.id} (skor: ${match.score}).`,
            },
          })

          // Update MatchScore status to 'matched'
          await db.matchScore.update({
            where: { id: match.id },
            data: { status: 'matched' },
          })

          stats.matchesProcessed++

          // Send WhatsApp to both parties
          let sent = 0

          if (match.employer.phone) {
            const msg = WhatsAppTemplates.interviewScheduled(
              match.employer.fullName,
              dateStr,
              timeStr,
              meetUrl,
              `Pembantu: ${match.helper.fullName}`
            )
            const waResult = await sendWhatsApp({ to: match.employer.phone, body: msg })
            if (waResult.success) {
              sent++
              stats.whatsappSent++
            }
            await this.logActivity({
              action: 'send_interview_invite',
              status: waResult.success ? 'success' : 'error',
              input: JSON.stringify({
                to: match.employer.phone,
                role: 'employer',
                interviewId: interview.id,
              }),
              output: JSON.stringify({
                method: waResult.method,
                error: waResult.error,
                meetUrl,
                scheduledAt,
              }),
              errorMessage: waResult.error,
            })
          }

          if (match.helper.phone) {
            const msg = WhatsAppTemplates.interviewScheduled(
              match.helper.fullName,
              dateStr,
              timeStr,
              meetUrl,
              `Majikan: ${match.employer.fullName}`
            )
            const waResult = await sendWhatsApp({ to: match.helper.phone, body: msg })
            if (waResult.success) {
              sent++
              stats.whatsappSent++
            }
            await this.logActivity({
              action: 'send_interview_invite',
              status: waResult.success ? 'success' : 'error',
              input: JSON.stringify({
                to: match.helper.phone,
                role: 'helper',
                interviewId: interview.id,
              }),
              output: JSON.stringify({
                method: waResult.method,
                error: waResult.error,
                meetUrl,
                scheduledAt,
              }),
              errorMessage: waResult.error,
            })
          }

          // Create in-app notifications for both parties
          await db.notification.create({
            data: {
              userId: match.employer.id,
              userType: 'employer',
              employerId: match.employer.id,
              title: 'Temuduga Dijadualkan',
              message: `Temuduga dengan ${match.helper.fullName} pada ${dateStr} ${timeStr}. Google Meet: ${meetUrl}`,
              link: '/employer/dashboard',
            },
          })
          await db.notification.create({
            data: {
              userId: match.helper.id,
              userType: 'helper',
              helperId: match.helper.id,
              title: 'Temuduga Dijadualkan',
              message: `Temuduga dengan ${match.employer.fullName} pada ${dateStr} ${timeStr}. Google Meet: ${meetUrl}`,
              link: '/helper/dashboard',
            },
          })

          scheduled++
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'schedule_interview',
            status: 'error',
            input: JSON.stringify({ matchScoreId: match.id }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
      await this.logActivity({
        action: 'schedule_interviews',
        status: 'error',
        input: JSON.stringify({}),
        errorMessage: e.message || String(e),
      })
    }

    return scheduled
  }

  /**
   * Send 24-hour reminders for upcoming scheduled interviews.
   */
  private async sendUpcomingReminders(stats: any): Promise<number> {
    let sent = 0

    try {
      const now = new Date()
      const in24h = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000)
      const in30h = new Date(now.getTime() + (REMINDER_WINDOW_HOURS + 6) * 60 * 60 * 1000)

      // Find interviews scheduled 24-30h from now, status='scheduled', reminder not yet sent
      // (Use notes field as a soft flag - we append "[REMINDER_SENT]" after sending)
      const upcoming = await db.interview.findMany({
        where: {
          status: 'scheduled',
          scheduledAt: { gte: in24h, lte: in30h },
          // Hasn't been reminded yet (no marker in notes)
          notes: { not: { contains: '[REMINDER_SENT]' } },
        },
        include: {
          helper: { select: { id: true, fullName: true, phone: true } },
          employer: { select: { id: true, fullName: true, phone: true } },
        },
        take: 20,
      })

      for (const iv of upcoming) {
        try {
          const dateStr = iv.scheduledAt
            ? iv.scheduledAt.toLocaleDateString('ms-MY', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })
            : 'tidak diketahui'
          const timeStr = iv.scheduledAt
            ? iv.scheduledAt.toLocaleTimeString('ms-MY', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : 'tidak diketahui'

          // Reminder message - similar to interviewScheduled but with reminder prefix
          const reminderBody = (name: string, otherParty: string) =>
            `🔔 Peringatan Temuduga!\n\nHai ${name}, temuduga MIM Portal anda akan berlangsung ESOK!\n\n` +
            `📅 Tarikh: ${dateStr}\n` +
            `⏰ Masa: ${timeStr}\n` +
            `🤝 Dengan: ${otherParty}\n` +
            `🔗 Google Meet: ${iv.meetUrl || 'akan diberitahu'}\n\n` +
            `Sila hadir 5 minit awal. Jika perlu ubah waktu, reply "UBAH". Jumpa esok! 🙏`

          let thisSent = 0
          if (iv.employer?.phone) {
            const r = await sendWhatsApp({
              to: iv.employer.phone,
              body: reminderBody(iv.employer.fullName, `Pembantu: ${iv.helper?.fullName || ''}`),
            })
            if (r.success) {
              thisSent++
              stats.whatsappSent++
            }
          }
          if (iv.helper?.phone) {
            const r = await sendWhatsApp({
              to: iv.helper.phone,
              body: reminderBody(iv.helper.fullName, `Majikan: ${iv.employer?.fullName || ''}`),
            })
            if (r.success) {
              thisSent++
              stats.whatsappSent++
            }
          }

          // Mark reminder as sent (append to notes)
          await db.interview.update({
            where: { id: iv.id },
            data: {
              notes: `${iv.notes || ''} [REMINDER_SENT ${now.toISOString()}]`.trim(),
            },
          })

          sent++

          await this.logActivity({
            action: 'send_interview_reminder',
            status: 'success',
            input: JSON.stringify({ interviewId: iv.id }),
            output: JSON.stringify({ whatsappSent: thisSent }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'send_interview_reminder',
            status: 'error',
            input: JSON.stringify({ interviewId: iv.id }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return sent
  }

  /**
   * Send feedback requests for interviews whose time has passed.
   */
  private async sendFeedbackRequests(stats: any): Promise<number> {
    let sent = 0

    try {
      const now = new Date()
      const feedbackThreshold = new Date(now.getTime() - FEEDBACK_WINDOW_HOURS * 60 * 60 * 1000)

      // Find scheduled interviews whose scheduledAt has passed but not yet completed/feedbacked
      // (Use notes field marker [FEEDBACK_REQUESTED] to avoid duplicates)
      const past = await db.interview.findMany({
        where: {
          status: 'scheduled',
          scheduledAt: { lte: feedbackThreshold },
          notes: { not: { contains: '[FEEDBACK_REQUESTED]' } },
        },
        include: {
          helper: { select: { id: true, fullName: true, phone: true } },
          employer: { select: { id: true, fullName: true, phone: true } },
        },
        take: 20,
      })

      for (const iv of past) {
        try {
          // Send feedback request to employer about helper
          let thisSent = 0
          if (iv.employer?.phone) {
            const fbMsg = WhatsAppTemplates.feedback(
              iv.employer.fullName,
              'temuduga',
              iv.helper?.fullName || 'pembantu'
            )
            const r = await sendWhatsApp({ to: iv.employer.phone, body: fbMsg })
            if (r.success) {
              thisSent++
              stats.whatsappSent++
            }
          }

          // Send to helper too - asking about their interview experience
          if (iv.helper?.phone) {
            const helperFbMsg =
              `Hai ${iv.helper.fullName}!\n\n` +
              `Ia baru sahaja selesai temuduga dengan ${iv.employer?.fullName || 'majikan'}. Bagaimana ia berjalan? 🤔\n\n` +
              `Scale 1-5, berapa puas hati anda dengan majikan? (5 = sangat puas hati)\n` +
              `Reply: [nombor] + komen anda\n\n` +
              `Contoh: "5 - Majikan sangat baik dan mesra"\n\n` +
              `Maklum balas anda membantu kami improve servis! 🌟`
            const r = await sendWhatsApp({ to: iv.helper.phone, body: helperFbMsg })
            if (r.success) {
              thisSent++
              stats.whatsappSent++
            }
          }

          // Mark feedback requested + update interview status to 'completed'
          await db.interview.update({
            where: { id: iv.id },
            data: {
              status: 'completed',
              notes: `${iv.notes || ''} [FEEDBACK_REQUESTED ${now.toISOString()}]`.trim(),
            },
          })

          sent++

          await this.logActivity({
            action: 'send_feedback_request',
            status: 'success',
            input: JSON.stringify({ interviewId: iv.id }),
            output: JSON.stringify({ whatsappSent: thisSent }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'send_feedback_request',
            status: 'error',
            input: JSON.stringify({ interviewId: iv.id }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return sent
  }

  /**
   * Find the next mutual available slot (mock: next business day 10am or 2pm).
   * Alternates between 10am and 2pm based on day to distribute load.
   */
  private findMutualSlot(): Date {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    // Skip Saturday (6) and Sunday (0)
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1)
    }
    // Alternate 10am / 2pm
    const hour = d.getDate() % 2 === 0 ? 10 : 14
    d.setHours(hour, 0, 0, 0)
    return d
  }

  /**
   * Generate a mock Google Meet URL in the format https://meet.google.com/xxx-xxxx-xxx
   */
  private generateMockMeetUrl(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const segment = (n: number) =>
      Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `https://meet.google.com/${segment(3)}-${segment(4)}-${segment(3)}`
  }
}

// Register singleton
agentRegistry.register(new InterviewCoordinatorAgent())

export { InterviewCoordinatorAgent }
