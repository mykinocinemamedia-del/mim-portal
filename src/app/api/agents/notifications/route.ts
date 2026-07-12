import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * GET /api/agents/notifications - Get agent notifications
 * POST /api/agents/notifications - Mark as read
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unreadOnly') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')

  const where: any = {}
  if (unreadOnly) where.isRead = false

  const notifications = await db.agentNotification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const unreadCount = await db.agentNotification.count({ where: { isRead: false } })

  return NextResponse.json({ notifications, unreadCount })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { notificationId, markAllRead } = await req.json()

  if (markAllRead) {
    await db.agentNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    })
    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
  }

  if (notificationId) {
    await db.agentNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'notificationId or markAllRead required' }, { status: 400 })
}
