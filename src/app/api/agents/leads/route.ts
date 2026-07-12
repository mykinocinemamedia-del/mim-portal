import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/agents/leads - Get all leads
 * Query: ?status=new&type=helper&limit=20
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const leadType = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '50')

  const where: any = {}
  if (status) where.status = status
  if (leadType) where.leadType = leadType

  const leads = await db.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  // Get summary stats
  const stats = {
    total: await db.lead.count(),
    new: await db.lead.count({ where: { status: 'new' } }),
    contacted: await db.lead.count({ where: { status: 'contacted' } }),
    qualified: await db.lead.count({ where: { status: 'qualified' } }),
    converted: await db.lead.count({ where: { status: 'converted' } }),
    byType: {
      helper: await db.lead.count({ where: { leadType: 'helper' } }),
      employer: await db.lead.count({ where: { leadType: 'employer' } }),
    },
  }

  return NextResponse.json({ leads, stats })
}
