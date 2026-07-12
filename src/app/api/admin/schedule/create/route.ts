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
    const { helperId, employerId, workDate, startTime, endTime, isDayOff, notes } = body

    if (!helperId || !workDate) {
      return NextResponse.json(
        { error: 'helperId dan workDate diperlukan' },
        { status: 400 }
      )
    }

    const schedule = await db.schedule.create({
      data: {
        helperId,
        employerId: employerId || null,
        workDate: new Date(workDate),
        startTime: startTime || null,
        endTime: endTime || null,
        isDayOff: !!isDayOff,
        notes: notes || null,
      },
    })

    // Notify helper
    await db.notification.create({
      data: {
        userId: helperId,
        userType: 'helper',
        helperId,
        title: 'Jadual Kerja Baru',
        message: `Jadual kerja baru ditambah untuk ${new Date(workDate).toLocaleDateString('ms-MY')}${startTime ? ` (${startTime}-${endTime || ''})` : ''}.`,
        link: '/helper/schedule',
      },
    })

    return NextResponse.json({
      success: true,
      schedule: { id: schedule.id, workDate: schedule.workDate },
    })
  } catch (e: any) {
    console.error('Schedule create error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa cipta jadual' },
      { status: 500 }
    )
  }
}
