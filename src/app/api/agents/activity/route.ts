import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/agents/activity - Get recent agent activities
 * Query: ?agentId=X&limit=20&status=error
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId')
  const limit = parseInt(searchParams.get('limit') || '50')
  const status = searchParams.get('status')

  const where: any = {}
  if (agentId) where.agentId = agentId
  if (status) where.status = status

  const activities = await db.agentActivity.findMany({
    where,
    include: { agent: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ activities })
}
