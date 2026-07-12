import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Tidak dibenarkan. Admin sahaja.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { recipientType, recipientId, subject, body: msgBody } = body

    if (!recipientId || !msgBody) {
      return NextResponse.json(
        { error: 'recipientId dan body diperlukan' },
        { status: 400 }
      )
    }

    const message = await db.message.create({
      data: {
        fromAdmin: true,
        helperId: recipientType === 'helper' ? recipientId : null,
        employerId: recipientType === 'employer' ? recipientId : null,
        subject: subject || null,
        body: msgBody,
        sentVia: 'in_app',
      },
    })

    // Also create a notification
    await db.notification.create({
      data: {
        userId: recipientId,
        userType: recipientType,
        helperId: recipientType === 'helper' ? recipientId : null,
        employerId: recipientType === 'employer' ? recipientId : null,
        title: subject ? `Mesej: ${subject}` : 'Mesej Baru dari Admin',
        message: msgBody,
        link: recipientType === 'helper' ? '/helper/notifications' : '/employer/notifications',
      },
    })

    return NextResponse.json({
      success: true,
      message: { id: message.id },
    })
  } catch (e: any) {
    console.error('Message send error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa hantar mesej' },
      { status: 500 }
    )
  }
}
