import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/agents/matches - Get AI match scores
 * Query: ?status=suggested&minScore=70&limit=20
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const minScore = searchParams.get('minScore')
  const limit = parseInt(searchParams.get('limit') || '50')

  const where: any = {}
  if (status) where.status = status
  if (minScore) where.score = { gte: parseFloat(minScore) }

  const matches = await db.matchScore.findMany({
    where,
    include: {
      helper: { select: { id: true, fullName: true, phone: true, serviceType: true, rating: true, city: true, state: true } },
      employer: { select: { id: true, fullName: true, phone: true, serviceType: true, city: true, state: true, salaryOffered: true } },
    },
    orderBy: { score: 'desc' },
    take: limit,
  })

  const stats = {
    total: await db.matchScore.count(),
    suggested: await db.matchScore.count({ where: { status: 'suggested' } }),
    accepted: await db.matchScore.count({ where: { status: 'accepted' } }),
    matched: await db.matchScore.count({ where: { status: 'matched' } }),
    rejected: await db.matchScore.count({ where: { status: 'rejected' } }),
    highScore: await db.matchScore.count({ where: { score: { gte: 85 } } }),
  }

  return NextResponse.json({ matches, stats })
}

/**
 * POST /api/agents/matches - Update match status (accept/reject)
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { matchId, action } = await req.json()
  // action: 'accept' | 'reject' | 'match'

  const statusMap: Record<string, string> = {
    accept: 'accepted',
    reject: 'rejected',
    match: 'matched',
  }

  const match = await db.matchScore.update({
    where: { id: matchId },
    data: { status: statusMap[action] || 'viewed' },
  })

  return NextResponse.json({ success: true, match })
}
