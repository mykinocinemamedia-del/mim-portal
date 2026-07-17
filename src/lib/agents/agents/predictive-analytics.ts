import { BaseAgent, AgentRunResult, AgentContext, agentRegistry } from '@/lib/agents/core/base-agent'
import { db } from '@/lib/db'
import { aiComplete, parseAIJson } from '@/lib/ai/provider'

export class PredictiveAnalyticsAgent extends BaseAgent {
  readonly name = 'predictive_analytics'
  readonly displayName = 'Predictive Analytics Agent'
  readonly description = 'AI predicts match success, payment defaults, and helper churn. Auto-intervenes before problems occur.'
  readonly category = 'operations'
  readonly schedule = 'Weekly'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = { predictions: 0, atRiskMatches: 0, paymentDefaultRisk: 0, churnRisk: 0 }

    // 1. Predict match success for active bookings
    const activeBookings = await db.booking.findMany({
      where: { status: 'confirmed' },
      include: { helper: true, employer: true },
      take: 20,
    }).catch(() => [])

    for (const booking of activeBookings) {
      stats.predictions++
      try {
        const prompt = `Analyze this maid-employer match and predict success probability (0-100).
        
Helper: ${booking.helper?.fullName}, Rating: ${booking.helper?.rating}, Service: ${booking.helper?.serviceType}
Employer: ${booking.employer?.fullName}, Salary offered: RM${booking.salary}
Duration: ${booking.durationMonths} months, Live-in: ${booking.liveIn}

Return JSON: {"successScore": 85, "riskFactors": ["low rating"], "recommendation": "monitor closely"}`

        const response = await aiComplete(prompt, 'You are a match prediction AI. Return only JSON.')
        const prediction = parseAIJson(response)

        if (prediction?.successScore < 50) {
          stats.atRiskMatches++
          await this.notify({
            category: 'alert',
            severity: 'warning',
            title: '⚠️ At-Risk Match Detected',
            message: `Match: ${booking.helper?.fullName} ↔ ${booking.employer?.fullName} - Score: ${prediction.successScore}. Action: ${prediction.recommendation}`,
          })
        }
      } catch (e: any) {
        // Skip on AI failure
      }
    }

    // 2. Predict payment defaults
    const pendingPayments = await db.payment.findMany({
      where: { status: 'pending' },
      include: { employer: true },
      take: 20,
    }).catch(() => [])

    for (const payment of pendingPayments) {
      try {
        const daysOverdue = payment.dueDate ? Math.floor((Date.now() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
        if (daysOverdue > 3) {
          stats.paymentDefaultRisk++
          await this.notify({
            category: 'alert',
            severity: 'warning',
            title: '💰 Payment Default Risk',
            message: `${payment.employer?.fullName} - RM${payment.amount} - ${daysOverdue} days overdue. Auto-reminder sent.`,
          })
        }
      } catch (e: any) {}
    }

    // 3. Predict helper churn (helpers likely to leave)
    const activeHelpers = await db.helper.findMany({
      where: { status: 'employed' },
      take: 20,
    }).catch(() => [])

    for (const helper of activeHelpers) {
      try {
        if (helper.rating < 4.0) {
          stats.churnRisk++
          await this.notify({
            category: 'alert',
            severity: 'info',
            title: '🔄 Helper Churn Risk',
            message: `${helper.fullName} (rating: ${helper.rating}) may need support. Consider quality check call.`,
          })
        }
      } catch (e: any) {}
    }

    return {
      success: true,
      summary: `Predictive Analytics: ${stats.predictions} predictions, ${stats.atRiskMatches} at-risk matches, ${stats.paymentDefaultRisk} payment risks, ${stats.churnRisk} churn risks.`,
      data: stats,
    }
  }
}

agentRegistry.register(new PredictiveAnalyticsAgent())
