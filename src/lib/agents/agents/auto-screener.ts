import { BaseAgent, AgentRunResult, AgentContext, agentRegistry } from '@/lib/agents/core/base-agent'
import { db } from '@/lib/db'
import { aiComplete, parseAIJson } from '@/lib/ai/provider'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'

export class AutoScreenerAgent extends BaseAgent {
  readonly name = 'auto_screener'
  readonly displayName = 'Auto-Screener Agent'
  readonly description = 'AI auto-screening helpers & employers - approve, flag, or reject automatically'
  readonly category = 'operations'
  readonly schedule = 'Every 30 minutes'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = { helpersScreened: 0, helpersApproved: 0, helpersRejected: 0, helpersFlagged: 0, employersScreened: 0, employersApproved: 0 }

    // Screen pending helpers
    const pendingHelpers = await db.helper.findMany({
      where: { status: 'pending' },
      take: 20,
    }).catch(() => [])

    for (const helper of pendingHelpers) {
      stats.helpersScreened++
      try {
        const score = await this.screenHelper(helper)
        
        if (score >= 70) {
          await db.helper.update({ where: { id: helper.id }, data: { status: 'active' } })
          stats.helpersApproved++
          
          if (helper.phone) {
            await sendWhatsApp({
              to: helper.phone,
              body: `🎉 Pendaftaran anda telah diluluskan!\n\nSelamat datang ke MIM Portal. Profil anda kini aktif dan boleh dipilih oleh majikan.\n\nLog masuk: https://mim-portal.vercel.app/helper/login`,
            }).catch(() => {})
          }
          await this.notify({ category: 'screening', severity: 'info', title: 'Helper Auto-Approved', message: `${helper.fullName} approved (score: ${score})` })
        } else if (score < 40) {
          await db.helper.update({ where: { id: helper.id }, data: { status: 'rejected' } })
          stats.helpersRejected++
          
          if (helper.phone) {
            await sendWhatsApp({
              to: helper.phone,
              body: `Maaf, pendaftaran anda tidak diluluskan kerana maklumat tidak lengkap. Sila hubungi admin di 017-663 5990 untuk bantuan.`,
            }).catch(() => {})
          }
        } else {
          stats.helpersFlagged++
          await this.notify({ category: 'screening', severity: 'warning', title: 'Helper Flagged for Review', message: `${helper.fullName} needs manual review (score: ${score})` })
        }
      } catch (e: any) {
        await this.logActivity({ action: 'screen_helper', status: 'error', errorMessage: e.message, input: helper.id })
      }
    }

    // Screen pending employers
    const pendingEmployers = await db.employer.findMany({
      where: { status: 'pending' },
      take: 20,
    }).catch(() => [])

    for (const employer of pendingEmployers) {
      stats.employersScreened++
      try {
        const score = await this.screenEmployer(employer)
        
        if (score >= 60) {
          await db.employer.update({ where: { id: employer.id }, data: { status: 'active' } })
          stats.employersApproved++
          
          if (employer.phone) {
            await sendWhatsApp({
              to: employer.phone,
              body: `🎉 Pendaftaran majikan diluluskan!\n\nAnda kini boleh mencari pembantu di MIM Portal.\n\nLog masuk: https://mim-portal.vercel.app/employer/login`,
            }).catch(() => {})
          }
        } else {
          await this.notify({ category: 'screening', severity: 'warning', title: 'Employer Flagged', message: `${employer.fullName} needs review (score: ${score})` })
        }
      } catch (e: any) {
        await this.logActivity({ action: 'screen_employer', status: 'error', errorMessage: e.message })
      }
    }

    return {
      success: true,
      summary: `Auto-Screener: Screened ${stats.helpersScreened} helpers (${stats.helpersApproved} approved, ${stats.helpersRejected} rejected, ${stats.helpersFlagged} flagged) and ${stats.employersScreened} employers (${stats.employersApproved} approved).`,
      data: stats,
    }
  }

  private async screenHelper(helper: any): Promise<number> {
    let score = 0

    // Basic completeness checks
    if (helper.fullName && helper.fullName.length > 5) score += 15
    if (helper.phone && helper.phone.length >= 10) score += 10
    if (helper.ic && helper.ic.length >= 12) score += 15
    if (helper.addressLine1) score += 10
    if (helper.state) score += 5
    if (helper.serviceType) score += 10
    if (helper.skills) score += 10
    if (helper.motivation && helper.motivation.length > 20) score += 10
    if (helper.experience) score += 5
    if (helper.profilePhoto) score += 10

    return Math.min(score, 100)
  }

  private async screenEmployer(employer: any): Promise<number> {
    let score = 0

    if (employer.fullName && employer.fullName.length > 5) score += 20
    if (employer.phone && employer.phone.length >= 10) score += 20
    if (employer.addressLine1) score += 15
    if (employer.state) score += 10
    if (employer.serviceType) score += 15
    if (employer.salaryOffered && employer.salaryOffered >= 1500) score += 20

    return Math.min(score, 100)
  }
}

agentRegistry.register(new AutoScreenerAgent())
