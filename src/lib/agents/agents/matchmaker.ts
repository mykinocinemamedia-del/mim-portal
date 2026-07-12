/**
 * AI Matchmaker Agent
 * -------------------
 * Automatically scores compatibility (0-100) between every active helper and
 * every active/pending employer using AI. Stores results in MatchScore (upsert
 * on [helperId, employerId]). For scores >= 75 auto-triggers interview +
 * notifies both parties via WhatsApp. For scores 60-74 stores as "suggested"
 * for admin manual review. Scores < 60 are not stored (too low).
 *
 * Scoring factors (fed to AI as context):
 *   - Service type match      (+30)
 *   - Location match          (+20)
 *   - Salary match            (+20)
 *   - Live-in preference      (+10)
 *   - Skills match            (+10)
 *   - Religion preference     (+5)
 *   - Rating (>= 4.5)         (+5)
 *
 * Schedule: Every 2 hours
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { aiChat, parseAIJson, type ChatMessage } from '@/lib/ai/provider'
import { sendWhatsApp, WhatsAppTemplates } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

// Limits and thresholds
const MAX_PAIRS_PER_RUN = 20
const HIGH_QUALITY_THRESHOLD = 75 // auto-interview
const SUGGEST_THRESHOLD = 60 // store as suggested
const AUTO_INTERVIEW_SCORE = 85 // matches with this score bypass manual review

interface MatchFactors {
  serviceType: number
  location: number
  salary: number
  liveIn: number
  skills: number
  religion: number
  rating: number
}

interface AIMatchResult {
  score: number
  reasoning: string
  factors: MatchFactors
}

class MatchmakerAgent extends BaseAgent {
  readonly name = 'matchmaker'
  readonly displayName = 'AI Matchmaker Agent'
  readonly description =
    'Menilai keserasian antara pembantu & majikan aktif menggunakan AI. Padanan skor tinggi (>=75) auto-jadual temuduga. Skor 60-74 disimpan sebagai cadangan untuk admin.'
  readonly category = 'matching'
  readonly schedule = 'Every 2 hours'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      employersScanned: 0,
      helpersScanned: 0,
      pairsEvaluated: 0,
      highQualityMatches: 0,
      suggestedMatches: 0,
      interviewsCreated: 0,
      whatsappSent: 0,
      errors: 0,
    }

    try {
      // Step 1: Fetch active employers (status active or pending)
      const employers = await db.employer.findMany({
        where: { status: { in: ['active', 'pending'] } },
        select: {
          id: true,
          fullName: true,
          phone: true,
          serviceType: true,
          state: true,
          city: true,
          salaryOffered: true,
          numKids: true,
          kidsAges: true,
          criteria: true,
        },
      })

      // Step 2: Fetch active helpers (status active)
      const helpers = await db.helper.findMany({
        where: { status: 'active' },
        select: {
          id: true,
          fullName: true,
          nickname: true,
          phone: true,
          serviceType: true,
          state: true,
          city: true,
          workArea: true,
          canRelocate: true,
          liveIn: true,
          backAndForth: true,
          canBoth: true,
          skills: true,
          otherSkills: true,
          religion: true,
          rating: true,
          desiredJob: true,
          motivation: true,
          experience: true,
        },
      })

      stats.employersScanned = employers.length
      stats.helpersScanned = helpers.length

      await this.logActivity({
        action: 'scan_candidates',
        status: 'success',
        input: JSON.stringify({ trigger: context.trigger }),
        output: JSON.stringify({ employers: employers.length, helpers: helpers.length }),
      })

      if (employers.length === 0 || helpers.length === 0) {
        const summary = `AI Matchmaker: Tiada calon dijumpai (${employers.length} majikan, ${helpers.length} pembantu).`
        return { success: true, summary, data: stats }
      }

      // Step 3: Pre-compute heuristic score for every pair, take top MAX_PAIRS_PER_RUN
      type Pair = {
        employer: (typeof employers)[number]
        helper: (typeof helpers)[number]
        heuristicScore: number
      }
      const allPairs: Pair[] = []
      for (const employer of employers) {
        for (const helper of helpers) {
          const heuristicScore = this.computeHeuristicScore(helper, employer)
          if (heuristicScore >= SUGGEST_THRESHOLD - 10) {
            allPairs.push({ employer, helper, heuristicScore })
          }
        }
      }
      // Sort by heuristic desc, take top MAX_PAIRS_PER_RUN
      allPairs.sort((a, b) => b.heuristicScore - a.heuristicScore)
      const pairsToEvaluate = allPairs.slice(0, MAX_PAIRS_PER_RUN)

      // Step 4: For each top pair, call AI for refined scoring
      for (const { employer, helper } of pairsToEvaluate) {
        try {
          stats.pairsEvaluated++

          const aiResult = await this.scorePairWithAI(helper, employer)

          if (!aiResult) {
            stats.errors++
            continue
          }

          const score = Math.max(0, Math.min(100, Math.round(aiResult.score)))

          // Skip pairs below suggest threshold
          if (score < SUGGEST_THRESHOLD) {
            continue
          }

          // Step 5: Upsert MatchScore record (unique on [helperId, employerId])
          const existing = await db.matchScore.findUnique({
            where: {
              helperId_employerId: {
                helperId: helper.id,
                employerId: employer.id,
              },
            },
          })

          // Skip if already matched/interview scheduled - don't overwrite
          if (existing && ['matched', 'accepted'].includes(existing.status)) {
            continue
          }

          const matchScore = await db.matchScore.upsert({
            where: {
              helperId_employerId: {
                helperId: helper.id,
                employerId: employer.id,
              },
            },
            create: {
              agentId: this.agentId,
              helperId: helper.id,
              employerId: employer.id,
              score,
              reasoning: aiResult.reasoning,
              factors: JSON.stringify(aiResult.factors),
              status: 'suggested',
            },
            update: {
              agentId: this.agentId,
              score,
              reasoning: aiResult.reasoning,
              factors: JSON.stringify(aiResult.factors),
              // keep status if already 'viewed', otherwise reset to 'suggested'
              status: existing?.status === 'viewed' ? 'viewed' : 'suggested',
            },
          })

          if (score >= HIGH_QUALITY_THRESHOLD) {
            stats.highQualityMatches++

            // Auto-create interview + notify both parties (for very high scores)
            if (score >= AUTO_INTERVIEW_SCORE && !existing) {
              const interview = await this.createInterviewAndNotify(helper, employer, matchScore.id)
              if (interview) {
                stats.interviewsCreated++
                stats.whatsappSent += interview.notificationsSent
              }
            }
          } else {
            stats.suggestedMatches++
          }

          await this.logActivity({
            action: 'score_pair',
            status: 'success',
            input: JSON.stringify({
              helperId: helper.id,
              employerId: employer.id,
              helperName: helper.fullName,
              employerName: employer.fullName,
            }),
            output: JSON.stringify({ score, factors: aiResult.factors }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'score_pair',
            status: 'error',
            input: JSON.stringify({
              helperId: helper.id,
              employerId: employer.id,
            }),
            errorMessage: e.message || String(e),
          })
        }
      }

      // Step 6: Notify admin with summary
      const summary =
        `AI Matchmaker: ${stats.pairsEvaluated} pasangan dinilai, ` +
        `${stats.highQualityMatches} padanan berkualiti tinggi (>=${HIGH_QUALITY_THRESHOLD}), ` +
        `${stats.suggestedMatches} cadangan (${SUGGEST_THRESHOLD}-${HIGH_QUALITY_THRESHOLD - 1}), ` +
        `${stats.interviewsCreated} temuduga auto-dijadualkan, ` +
        `${stats.whatsappSent} WhatsApp dihantar. Errors: ${stats.errors}.`

      await this.notify({
        category: 'match',
        severity: stats.highQualityMatches > 0 ? 'info' : 'info',
        title: `${stats.highQualityMatches} padanan berkualiti tinggi dijumpai!`,
        message: summary,
        actionUrl: '/admin/match',
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'AI Matchmaker gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Compute a quick heuristic compatibility score to pre-filter pairs.
   * Used to rank pairs before sending the top N to AI for refined scoring.
   */
  private computeHeuristicScore(
    helper: {
      serviceType: string | null
      state: string | null
      city: string | null
      canRelocate: boolean
      liveIn: boolean
      backAndForth: boolean
      canBoth: boolean
      skills: string | null
      otherSkills: string | null
      religion: string | null
      rating: number
    },
    employer: {
      serviceType: string | null
      state: string | null
      city: string | null
      salaryOffered: number | null
      numKids: number
      kidsAges: string | null
      criteria: string | null
    }
  ): number {
    let score = 0

    // Service type match
    if (
      helper.serviceType &&
      employer.serviceType &&
      helper.serviceType.toLowerCase() === employer.serviceType.toLowerCase()
    ) {
      score += 30
    } else if (helper.serviceType && employer.serviceType) {
      // Partial: helper can do multiple service types
      score += 10
    }

    // Location match (same state OR helper can relocate)
    if (helper.state && employer.state) {
      if (helper.state.toLowerCase() === employer.state.toLowerCase()) {
        score += 20
      } else if (helper.canRelocate) {
        score += 10
      }
    }

    // Rating (helper >= 4.5)
    if (helper.rating >= 4.5) {
      score += 5
    } else if (helper.rating >= 4.0) {
      score += 3
    }

    // Live-in compatibility
    if (employer.serviceType) {
      // assume employer with criteria mentions live-in - check helper flags
      if (helper.liveIn || helper.canBoth) {
        score += 8
      }
      if (helper.backAndForth || helper.canBoth) {
        score += 4
      }
    }

    // Skills partial match (very rough - AI will refine)
    const skillsStr = `${helper.skills || ''} ${helper.otherSkills || ''}`.toLowerCase()
    const criteriaStr = (employer.criteria || '').toLowerCase()
    if (criteriaStr && skillsStr) {
      const keywords = ['masak', 'cuci', 'jaga', 'kanak', 'orang tua', 'sabar']
      for (const kw of keywords) {
        if (criteriaStr.includes(kw) && skillsStr.includes(kw)) {
          score += 3
        }
      }
    }

    return Math.min(100, score)
  }

  /**
   * Call AI to score a single helper-employer pair.
   * Returns null if AI fails or response is unparseable.
   */
  private async scorePairWithAI(
    helper: any,
    employer: any
  ): Promise<AIMatchResult | null> {
    const helperSkills = this.parseSkillsList(helper.skills, helper.otherSkills)
    const helperSalaryRange = this.estimateHelperSalaryRange(helper.serviceType)

    const systemPrompt =
      'Anda adalah AI matchmaker untuk MIM Portal, platform pembantu rumah Malaysia. ' +
      'Tugaskan skor keserasian (0-100) antara pembantu dan majikan berdasarkan faktor-faktor yang diberi. ' +
      'Balas dalam format JSON SAHAJA: ' +
      '{"score": number, "reasoning": "string (penjelasan ringkas dalam BM)", "factors": {"serviceType": number, "location": number, "salary": number, "liveIn": number, "skills": number, "religion": number, "rating": number}}. ' +
      `Maksimum faktor: serviceType=30, location=20, salary=20, liveIn=10, skills=10, religion=5, rating=5. Jumlah maksimum = 100.`

    const userPrompt = `PEMBANTU:
- Nama: ${helper.fullName}
- Perkhidmatan: ${helper.serviceType || 'tidak ditetapkan'}
- Lokasi: ${helper.city || ''}, ${helper.state || 'tidak diketahui'}
- Boleh pindah: ${helper.canRelocate ? 'Ya' : 'Tidak'}
- Live-in: ${helper.liveIn ? 'Ya' : helper.canBoth ? 'Ya (fleksibel)' : 'Tidak'}
- Kemahiran: ${helperSkills.join(', ') || 'tiada'}
- Agama: ${helper.religion || 'tidak diketahui'}
- Rating: ${helper.rating.toFixed(1)}/5
- Julat gaji dijangka: ${helperSalaryRange}

MAJIKAN:
- Nama: ${employer.fullName}
- Keperluan: ${employer.serviceType || 'tidak ditetapkan'}
- Lokasi: ${employer.city || ''}, ${employer.state || 'tidak diketahui'}
- Gaji ditawarkan: RM${employer.salaryOffered || 'tidak ditetapkan'}
- Live-in diperlukan: Ya (umum untuk majikan pembantu rumah)
- Kanak-kanak: ${employer.numKids} ${employer.kidsAges ? `(umur: ${employer.kidsAges})` : ''}
- Kriteria: "${employer.criteria || 'tiada kriteria khusus'}"

Tugaskan skor keserasian (0-100). Pertimbangkan:
1. Service type match (30 mata maks)
2. Location match - same state atau boleh pindah (20 mata maks)
3. Salary match - gaji majikan dalam julat pembantu (20 mata maks)
4. Live-in preference match (10 mata maks)
5. Skills match - kemahiran pembantu vs kriteria majikan (10 mata maks)
6. Religion match - sesetengah majikan utamakan agama sama (5 mata maks)
7. Rating - pembantu rating >= 4.5 (5 mata maks)`

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]
      const aiRes = await aiChat(messages, { temperature: 0.4, maxTokens: 800 })
      const parsed = parseAIJson<AIMatchResult>(aiRes.content)
      if (!parsed || typeof parsed.score !== 'number') {
        return null
      }
      // Normalize factors
      const factors: MatchFactors = {
        serviceType: parsed.factors?.serviceType ?? 0,
        location: parsed.factors?.location ?? 0,
        salary: parsed.factors?.salary ?? 0,
        liveIn: parsed.factors?.liveIn ?? 0,
        skills: parsed.factors?.skills ?? 0,
        religion: parsed.factors?.religion ?? 0,
        rating: parsed.factors?.rating ?? 0,
      }
      return {
        score: parsed.score,
        reasoning: parsed.reasoning || 'Skor diberi oleh AI matchmaker.',
        factors,
      }
    } catch (e: any) {
      return null
    }
  }

  private parseSkillsList(skillsJson: string | null, otherSkills: string | null): string[] {
    const out: string[] = []
    if (skillsJson) {
      try {
        const arr = JSON.parse(skillsJson)
        if (Array.isArray(arr)) out.push(...arr.map((s) => String(s)))
      } catch {
        out.push(skillsJson)
      }
    }
    if (otherSkills) {
      out.push(otherSkills)
    }
    return out
  }

  private estimateHelperSalaryRange(serviceType: string | null): string {
    if (!serviceType) return 'RM1,500-2,500 (anggaran umum)'
    const st = serviceType.toLowerCase()
    if (st.includes('pengasuh')) return 'RM1,800-3,000'
    if (st.includes('orang tua')) return 'RM1,800-3,200'
    if (st.includes('pembantu rumah')) return 'RM1,500-2,500'
    return 'RM1,500-2,500'
  }

  /**
   * Create an Interview record + notify both helper and employer via WhatsApp.
   * Returns null on failure.
   */
  private async createInterviewAndNotify(
    helper: { id: string; fullName: string; phone: string | null },
    employer: { id: string; fullName: string; phone: string | null },
    matchScoreId: string
  ): Promise<{ interviewId: string; notificationsSent: number } | null> {
    try {
      // Suggest next business day 10am (mock scheduling)
      const scheduledAt = this.nextBusinessDayAt(10)
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
          helperId: helper.id,
          employerId: employer.id,
          meetUrl,
          scheduledAt,
          status: 'scheduled',
          notes: `Auto-scheduled by AI Matchmaker. MatchScore: ${matchScoreId}. Skor keserasian tinggi.`,
        },
      })

      // Update MatchScore status to 'matched'
      await db.matchScore.update({
        where: { id: matchScoreId },
        data: { status: 'matched' },
      })

      // Send WhatsApp to both parties (if phone available)
      let notificationsSent = 0

      if (employer.phone) {
        const msg = WhatsAppTemplates.interviewScheduled(
          employer.fullName,
          dateStr,
          timeStr,
          meetUrl,
          `Pembantu: ${helper.fullName}`
        )
        const waResult = await sendWhatsApp({ to: employer.phone, body: msg })
        if (waResult.success) notificationsSent++
        await this.logActivity({
          action: 'send_whatsapp_interview',
          status: waResult.success ? 'success' : 'error',
          input: JSON.stringify({ to: employer.phone, role: 'employer', name: employer.fullName }),
          output: JSON.stringify({ method: waResult.method, error: waResult.error }),
          errorMessage: waResult.error,
        })
      }

      if (helper.phone) {
        const msg = WhatsAppTemplates.interviewScheduled(
          helper.fullName,
          dateStr,
          timeStr,
          meetUrl,
          `Majikan: ${employer.fullName}`
        )
        const waResult = await sendWhatsApp({ to: helper.phone, body: msg })
        if (waResult.success) notificationsSent++
        await this.logActivity({
          action: 'send_whatsapp_interview',
          status: waResult.success ? 'success' : 'error',
          input: JSON.stringify({ to: helper.phone, role: 'helper', name: helper.fullName }),
          output: JSON.stringify({ method: waResult.method, error: waResult.error }),
          errorMessage: waResult.error,
        })
      }

      // Create in-app notifications for both
      await db.notification.create({
        data: {
          userId: employer.id,
          userType: 'employer',
          employerId: employer.id,
          title: 'Temuduga Auto-Dijadualkan',
          message: `Temuduga dengan ${helper.fullName} pada ${dateStr} ${timeStr}. Google Meet: ${meetUrl}`,
          link: '/employer/dashboard',
        },
      })
      await db.notification.create({
        data: {
          userId: helper.id,
          userType: 'helper',
          helperId: helper.id,
          title: 'Temuduga Auto-Dijadualkan',
          message: `Temuduga dengan ${employer.fullName} pada ${dateStr} ${timeStr}. Google Meet: ${meetUrl}`,
          link: '/helper/dashboard',
        },
      })

      return { interviewId: interview.id, notificationsSent }
    } catch (e: any) {
      await this.logActivity({
        action: 'create_interview',
        status: 'error',
        input: JSON.stringify({ helperId: helper.id, employerId: employer.id }),
        errorMessage: e.message || String(e),
      })
      return null
    }
  }

  /**
   * Get the next business day at the given hour (10 or 14).
   */
  private nextBusinessDayAt(hour: number): Date {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    // Skip Saturday (6) and Sunday (0)
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1)
    }
    d.setHours(hour, 0, 0, 0)
    return d
  }

  /**
   * Generate a mock Google Meet URL (xxx-xxxx-xxx format).
   */
  private generateMockMeetUrl(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const segment = (n: number) =>
      Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `https://meet.google.com/${segment(3)}-${segment(4)}-${segment(3)}`
  }
}

// Register singleton
agentRegistry.register(new MatchmakerAgent())

export { MatchmakerAgent }
