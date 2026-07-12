import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { agentRegistry } from '@/lib/agents'

/**
 * GET /api/agents - List all agents with stats
 */
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Ensure all agents are registered in DB
    const allAgents = agentRegistry.getAll()
    for (const agent of allAgents) {
      await agent.register()
    }

    // Get all agents from DB with their stats
    const dbAgents = await db.agent.findMany({
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { category: 'asc' },
    })

    // Merge DB stats with registry metadata
    const result = dbAgents.map((dbAgent) => {
      const registryAgent = allAgents.find((a) => a.name === dbAgent.name)
      return {
        id: dbAgent.id,
        name: dbAgent.name,
        displayName: dbAgent.displayName,
        description: dbAgent.description,
        category: dbAgent.category,
        status: dbAgent.status,
        schedule: dbAgent.schedule,
        lastRunAt: dbAgent.lastRunAt,
        nextRunAt: dbAgent.nextRunAt,
        totalRuns: dbAgent.totalRuns,
        successCount: dbAgent.successCount,
        errorCount: dbAgent.errorCount,
        successRate:
          dbAgent.totalRuns > 0
            ? Math.round((dbAgent.successCount / dbAgent.totalRuns) * 100)
            : 0,
        recentActivities: dbAgent.activities,
        canRunManually: !!registryAgent,
      }
    })

    return NextResponse.json({ agents: result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/**
 * POST /api/agents - Trigger an agent manually
 * Body: { agentName: string, input?: any }
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { agentName, input } = await req.json()

    if (!agentName) {
      return NextResponse.json({ error: 'agentName required' }, { status: 400 })
    }

    const agent = agentRegistry.get(agentName)
    if (!agent) {
      return NextResponse.json({ error: `Agent '${agentName}' not found` }, { status: 404 })
    }

    // Run the agent (async - don't wait for completion)
    const result = await agent.run({
      trigger: 'manual',
      userId: session.id,
      input,
    })

    return NextResponse.json({
      success: result.success,
      summary: result.summary,
      data: result.data,
      error: result.error,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
