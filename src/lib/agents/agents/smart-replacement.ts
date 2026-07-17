import { BaseAgent, AgentRunResult, AgentContext, agentRegistry } from '@/lib/agents/core/base-agent'
import { db } from '@/lib/db'
import { aiComplete } from '@/lib/ai/provider'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'

export class SmartReplacementAgent extends BaseAgent {
  readonly name = 'smart_replacement'
  readonly displayName = 'Smart Replacement Agent'
  readonly description = 'Auto-find replacement helper when match fails (rating <3 or negative feedback)'
  readonly category = 'operations'
  readonly schedule = 'Daily'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = { matchesChecked: 0, replacementsFound: 0, replacementsInitiated: 0 }

    // Find matches with low ratings or negative feedback
    const badMatches = await db.feedback.findMany({
      where: { rating: { lte: 2 }, resolvedAt: null },
      take: 10,
    }).catch(() => [])

    for (const feedback of badMatches) {
      stats.matchesChecked++
      try {
        // Find the booking associated with this user
        const helper = await db.helper.findFirst({ where: { id: feedback.userId } }).catch(() => null)
        if (!helper) continue

        // Find replacement helpers with similar criteria
        const replacements = await db.helper.findMany({
          where: {
            status: 'active',
            id: { not: helper.id },
            serviceType: helper.serviceType,
          },
          orderBy: { rating: 'desc' },
          take: 3,
        }).catch(() => [])

        if (replacements.length > 0) {
          stats.replacementsFound++
          
          // Find the employer from the booking
          const booking = await db.booking.findFirst({
            where: { helperId: helper.id, status: 'confirmed' },
          }).catch(() => null)

          if (booking) {
            const employer = await db.employer.findUnique({ where: { id: booking.employerId } })
            if (employer?.phone) {
              const helperList = replacements.map((h, i) => `${i+1}. ${h.fullName} - Rating: ${h.rating}`).join('\n')
              await sendWhatsApp({
                to: employer.phone,
                body: `🔄 Penggantian Pembantu\n\nKami mendapati ada isu dengan pembantu semasa anda. Berikut adalah pembantu pengganti yang dicadangkan:\n\n${helperList}\n\nHubungi admin untuk proses penggantian: 017-663 5990`,
              }).catch(() => {})
              stats.replacementsInitiated++
            }
          }

          // Mark feedback as resolved
          await db.feedback.update({
            where: { id: feedback.id },
            data: { resolvedAt: new Date(), actionTaken: 'Replacement suggestions sent' },
          }).catch(() => {})
        }
      } catch (e: any) {
        await this.logActivity({ action: 'replacement_check', status: 'error', errorMessage: e.message })
      }
    }

    return {
      success: true,
      summary: `Smart Replacement: Checked ${stats.matchesChecked} bad matches, found ${stats.replacementsFound} replacements, initiated ${stats.replacementsInitiated}.`,
      data: stats,
    }
  }
}

agentRegistry.register(new SmartReplacementAgent())
