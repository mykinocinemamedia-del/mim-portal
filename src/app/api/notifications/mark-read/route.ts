import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Tidak dibenarkan' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { notificationId } = body as { notificationId: string }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId diperlukan' },
        { status: 400 }
      )
    }

    const notif = await db.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notif) {
      return NextResponse.json(
        { error: 'Notifikasi tidak dijumpai' },
        { status: 404 }
      )
    }

    // Optional: verify ownership (notification belongs to this user)
    const isOwner =
      notif.userId === session.id ||
      notif.helperId === session.id ||
      notif.employerId === session.id
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Tidak dibenarkan' },
        { status: 403 }
      )
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Mark notification read error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat pelayan' },
      { status: 500 }
    )
  }
}
