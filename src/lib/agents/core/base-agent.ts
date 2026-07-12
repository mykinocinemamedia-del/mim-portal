/**
 * Base Agent Class - Foundation for all AI agents in MIM Portal.
 * Provides: lifecycle management, activity logging, memory, notifications.
 */

import { db } from '@/lib/db'

export interface AgentRunResult {
  success: boolean
  summary: string
  data?: any
  error?: string
}

export interface AgentContext {
  trigger: 'manual' | 'scheduled' | 'event' | 'webhook'
  userId?: string
  input?: any
}

export abstract class BaseAgent {
  abstract readonly name: string
  abstract readonly displayName: string
  abstract readonly description: string
  abstract readonly category: string
  abstract readonly schedule: string // cron or interval description

  protected agentId: string | null = null

  /**
   * Register this agent in the database (upsert).
   */
  async register(): Promise<void> {
    const existing = await db.agent.findUnique({ where: { name: this.name } })
    if (!existing) {
      const agent = await db.agent.create({
        data: {
          name: this.name,
          displayName: this.displayName,
          description: this.description,
          category: this.category,
          schedule: this.schedule,
          status: 'idle',
        },
      })
      this.agentId = agent.id
    } else {
      this.agentId = existing.id
    }
  }

  /**
   * Main execution method - called when agent runs.
   * Subclasses must implement this.
   */
  protected abstract execute(context: AgentContext): Promise<AgentRunResult>

  /**
   * Run the agent with full lifecycle management.
   */
  async run(context: AgentContext = { trigger: 'manual' }): Promise<AgentRunResult> {
    await this.register()
    if (!this.agentId) {
      return { success: false, summary: 'Agent not registered', error: 'Registration failed' }
    }

    // Update status to running
    await db.agent.update({
      where: { id: this.agentId },
      data: { status: 'running', lastRunAt: new Date(), totalRuns: { increment: 1 } },
    })

    const startTime = Date.now()

    try {
      const result = await this.execute(context)
      const duration = Date.now() - startTime

      // Log activity
      await this.logActivity({
        action: 'run',
        status: result.success ? 'success' : 'error',
        input: JSON.stringify(context),
        output: JSON.stringify(result.data || result.summary),
        errorMessage: result.error,
        duration,
      })

      // Update agent stats
      await db.agent.update({
        where: { id: this.agentId },
        data: {
          status: result.success ? 'idle' : 'error',
          successCount: result.success ? { increment: 1 } : undefined,
          errorCount: result.success ? undefined : { increment: 1 },
        },
      })

      // Create notification if not successful
      if (!result.success) {
        await this.notify({
          category: 'alert',
          severity: 'warning',
          title: `${this.displayName} failed`,
          message: result.error || 'Unknown error',
        })
      }

      return result
    } catch (e: any) {
      const duration = Date.now() - startTime
      const errorMsg = e.message || String(e)

      await this.logActivity({
        action: 'run',
        status: 'error',
        input: JSON.stringify(context),
        output: null,
        errorMessage: errorMsg,
        duration,
      })

      await db.agent.update({
        where: { id: this.agentId },
        data: {
          status: 'error',
          errorCount: { increment: 1 },
        },
      })

      await this.notify({
        category: 'alert',
        severity: 'critical',
        title: `${this.displayName} crashed`,
        message: errorMsg,
      })

      return { success: false, summary: 'Agent crashed', error: errorMsg }
    }
  }

  /**
   * Log an activity for this agent.
   */
  protected async logActivity(params: {
    action: string
    status: string
    input?: string | null
    output?: string | null
    errorMessage?: string | null
    duration?: number | null
  }): Promise<void> {
    if (!this.agentId) return
    await db.agentActivity.create({
      data: {
        agentId: this.agentId,
        action: params.action,
        status: params.status,
        input: params.input || null,
        output: params.output || null,
        errorMessage: params.errorMessage || null,
        duration: params.duration || null,
      },
    })
  }

  /**
   * Send a notification to admin dashboard.
   */
  protected async notify(params: {
    category: string
    severity?: string
    title: string
    message: string
    actionUrl?: string
  }): Promise<void> {
    await db.agentNotification.create({
      data: {
        agentName: this.name,
        category: params.category,
        severity: params.severity || 'info',
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
      },
    })
  }

  /**
   * Get agent stats.
   */
  async getStats() {
    if (!this.agentId) await this.register()
    if (!this.agentId) return null

    const agent = await db.agent.findUnique({
      where: { id: this.agentId },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!agent) return null

    const successRate =
      agent.totalRuns > 0
        ? Math.round((agent.successCount / agent.totalRuns) * 100)
        : 0

    return {
      ...agent,
      successRate,
    }
  }
}

/**
 * Agent Registry - Manages all agent instances.
 */
class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map()

  register(agent: BaseAgent): void {
    this.agents.set(agent.name, agent)
  }

  get(name: string): BaseAgent | undefined {
    return this.agents.get(name)
  }

  getAll(): BaseAgent[] {
    return Array.from(this.agents.values())
  }

  getByCategory(category: string): BaseAgent[] {
    return this.getAll().filter((a) => a.category === category)
  }
}

export const agentRegistry = new AgentRegistry()
