/**
 * Chief of Staff Agent - Master Orchestrator
 *
 * Coordinates all other agents, generates daily summaries,
 * prioritizes tasks, and escalates critical issues to admin.
 */

import { BaseAgent, AgentRunResult, AgentContext, agentRegistry } from '@/lib/agents/core/base-agent'
import { db } from '@/lib/db'
import { aiChat, parseAIJson } from '@/lib/ai/provider'

export class ChiefOfStaffAgent extends BaseAgent {
  readonly name = 'chief_of_staff'
  readonly displayName = 'Chief of Staff Agent'
  readonly description = 'Master orchestrator yang coordinate semua agents, jana laporan harian, dan escalate isu kritikal'
  readonly category = 'orchestrator'
  readonly schedule = 'Daily 6am + 6pm'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats: any = {
      agentsMonitored: 0,
      issuesEscalated: 0,
      recommendations: 0,
      summary: '',
    }

    try {
      // 1. Get all agents and their stats
      const agents = await db.agent.findMany({
        include: {
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { name: 'asc' },
      })
      stats.agentsMonitored = agents.length

      // 2. Identify issues
      const issues: string[] = []
      const errorAgents = agents.filter((a) => a.status === 'error')
      const staleAgents = agents.filter((a) => {
        if (!a.lastRunAt) return true
        const hoursSinceRun = (Date.now() - a.lastRunAt.getTime()) / (1000 * 60 * 60)
        return hoursSinceRun > 24
      })

      if (errorAgents.length > 0) {
        issues.push(`${errorAgents.length} agents dalam keadaan error: ${errorAgents.map((a) => a.displayName).join(', ')}`)
        stats.issuesEscalated += errorAgents.length
      }

      if (staleAgents.length > 0) {
        issues.push(`${staleAgents.length} agents tidak berjalan dalam 24 jam: ${staleAgents.map((a) => a.displayName).join(', ')}`)
      }

      // 3. Get today's key metrics
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [newLeads, newMatches, pendingContracts, overduePayments, unreadNotifications] = await Promise.all([
        db.lead.count({ where: { createdAt: { gte: today } } }),
        db.matchScore.count({ where: { createdAt: { gte: today }, status: 'suggested' } }),
        db.contract.count({ where: { status: { in: ['draft', 'pending'] } } }),
        db.payment.count({ where: { status: 'overdue' } }),
        db.agentNotification.count({ where: { isRead: false } }),
      ])

      // 4. Get recent activities (last 24h)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentActivities = await db.agentActivity.findMany({
        where: { createdAt: { gte: yesterday } },
        include: { agent: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      // 5. Generate AI summary
      const summaryInput = {
        date: new Date().toLocaleDateString('ms-MY'),
        metrics: {
          newLeads,
          newMatches,
          pendingContracts,
          overduePayments,
          unreadNotifications,
          agentStats: agents.map((a) => ({
            name: a.displayName,
            status: a.status,
            successRate: a.totalRuns > 0 ? Math.round((a.successCount / a.totalRuns) * 100) : 0,
            lastRun: a.lastRunAt?.toLocaleString('ms-MY'),
          })),
        },
        issues,
        recentActivities: recentActivities.slice(0, 10).map((a) => ({
          agent: a.agent?.displayName,
          action: a.action,
          status: a.status,
          time: a.createdAt.toLocaleString('ms-MY'),
        })),
      }

      const aiResponse = await aiChat([
        {
          role: 'system',
          content: `Anda adalah Chief of Staff AI untuk MIM Portal (Maid In Malaysia) oleh Kino Studios Sdn. Bhd.

Tugas anda:
1. Analyze metrik harian dan aktiviti semua AI agents
2. Jana laporan eksekutif dalam Bahasa Melayu (ringkas, actionable)
3. Prioritize isu yang perlu admin tindakan
4. Beri recommendations untuk improve operations

Format laporan (JSON):
{
  "executiveSummary": "Ringkasan 2-3 ayat tentang keadaan keseluruhan",
  "keyMetrics": ["Lead baru: X", "Match baru: X", ...],
  "issues": ["Isu 1 yang perlu tindakan", "Isu 2"],
  "recommendations": ["Cadangan 1", "Cadangan 2"],
  "priority": "low|medium|high|critical"
}`
        },
        {
          role: 'user',
          content: `Jana laporan harian berdasarkan data berikut:\n\n${JSON.stringify(summaryInput, null, 2)}`
        }
      ], { temperature: 0.5, maxTokens: 1500 })

      const report = parseAIJson(aiResponse.content) || {
        executiveSummary: `Laporan harian: ${newLeads} leads baru, ${newMatches} match baru, ${pendingContracts} kontrak pending, ${overduePayments} pembayaran tertunggak.`,
        keyMetrics: [],
        issues,
        recommendations: [],
        priority: issues.length > 2 ? 'high' : 'low',
      }

      stats.summary = report.executiveSummary
      stats.recommendations = report.recommendations?.length || 0
      stats.report = report

      // 6. Create daily summary notification
      await this.notify({
        category: 'summary',
        severity: report.priority === 'critical' ? 'critical' : report.priority === 'high' ? 'warning' : 'info',
        title: `📋 Laporan Harian Chief of Staff - ${new Date().toLocaleDateString('ms-MY')}`,
        message: `${report.executiveSummary}\n\n${report.issues?.length || 0} isu dikenalpasti. ${report.recommendations?.length || 0} cadangan dijana.`,
        actionUrl: '/admin/agents',
      })

      // 7. Escalate critical issues
      if (report.priority === 'critical' || errorAgents.length > 2) {
        stats.issuesEscalated += 1
        await this.notify({
          category: 'alert',
          severity: 'critical',
          title: '🚨 ISU KRITIKAL DIPERLUKAN TINDAKAN SEGERA',
          message: report.issues?.join('\n') || 'Pelbagai isu kritikal dikenalpasti. Sila semak dashboard.',
          actionUrl: '/admin/agents',
        })
      }

      // 8. Log activity
      await this.logActivity({
        action: 'daily_report',
        status: 'success',
        input: JSON.stringify(summaryInput),
        output: JSON.stringify(report),
      })

      return {
        success: true,
        summary: `Laporan harian dijana. ${newLeads} leads, ${newMatches} matches, ${issues.length} isu dikenalpasti.`,
        data: stats,
      }
    } catch (e: any) {
      return {
        success: false,
        summary: 'Gagal menjana laporan harian',
        error: e.message,
      }
    }
  }
}

agentRegistry.register(new ChiefOfStaffAgent())
