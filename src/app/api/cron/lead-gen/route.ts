import { NextRequest, NextResponse } from 'next/server'
import { agentRegistry } from '@/lib/agents'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const CRON_SECRET = process.env.CRON_SECRET || 'mim-cron-secret-2026'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = req.nextUrl.searchParams.get('secret')
  if (auth !== `Bearer ${CRON_SECRET}` && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: any[] = []

  // Run lead gen agents every 6 hours
  const leadAgents = ['helper_recruiter', 'employer_hunter']

  for (const name of leadAgents) {
    const agent = agentRegistry.get(name)
    if (agent) {
      try {
        const result = await agent.run({ trigger: 'scheduled' })
        results.push({ agent: name, success: result.success, summary: result.summary })
      } catch (e: any) {
        results.push({ agent: name, success: false, error: e.message })
      }
    }
  }

  return NextResponse.json({ time: new Date().toISOString(), results })
}
