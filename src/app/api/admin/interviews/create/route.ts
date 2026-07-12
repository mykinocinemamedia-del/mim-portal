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
    const { helperId, employerId, scheduledAt, meetUrl, notes } = body

    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'scheduledAt diperlukan' },
        { status: 400 }
      )
    }
    if (!helperId && !employerId) {
      return NextResponse.json(
        { error: 'helperId atau employerId diperlukan' },
        { status: 400 }
      )
    }

    // Generate Google Meet URL if not provided
    const finalMeetUrl =
      meetUrl ||
      `https://meet.google.com/mim-${Math.random().toString(36).slice(2, 8).toLowerCase()}`

    const interview = await db.interview.create({
      data: {
        helperId: helperId || null,
        employerId: employerId || null,
        meetUrl: finalMeetUrl,
        scheduledAt: new Date(scheduledAt),
        status: 'scheduled',
        notes: notes || null,
      },
    })

    // Notify helper
    if (helperId) {
      await db.notification.create({
        data: {
          userId: helperId,
          userType: 'helper',
          helperId,
          title: 'Temuduga Dijadualkan',
          message: `Temuduga Google Meet dijadualkan pada ${new Date(scheduledAt).toLocaleString('ms-MY')}. Link: ${finalMeetUrl}`,
          link: '/helper/dashboard',
        },
      })
    }
    // Notify employer
    if (employerId) {
      await db.notification.create({
        data: {
          userId: employerId,
          userType: 'employer',
          employerId,
          title: 'Temuduga Dijadualkan',
          message: `Temuduga Google Meet dijadualkan pada ${new Date(scheduledAt).toLocaleString('ms-MY')}. Link: ${finalMeetUrl}`,
          link: '/employer/my-helper',
        },
      })
    }

    return NextResponse.json({
      success: true,
      interview: {
        id: interview.id,
        meetUrl: interview.meetUrl,
        scheduledAt: interview.scheduledAt,
      },
    })
  } catch (e: any) {
    console.error('Interview create error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa cipta temuduga' },
      { status: 500 }
    )
  }
}
