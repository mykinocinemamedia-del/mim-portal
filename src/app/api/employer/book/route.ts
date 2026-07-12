import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServiceSalaryRange, formatMYR } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json(
        { error: 'Tidak dibenarkan. Sila log masuk sebagai majikan.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      helperId,
      salary,
      startDate,
      durationMonths,
      liveIn,
      specialRequests,
    } = body as {
      helperId: string
      salary: number
      startDate: string
      durationMonths: number
      liveIn: boolean
      specialRequests?: string
    }

    if (!helperId || !salary || !startDate || !durationMonths) {
      return NextResponse.json(
        { error: 'helperId, salary, startDate, dan durationMonths diperlukan' },
        { status: 400 }
      )
    }

    // Verify helper exists and is active
    const helper = await db.helper.findUnique({ where: { id: helperId } })
    if (!helper) {
      return NextResponse.json(
        { error: 'Pembantu tidak dijumpai' },
        { status: 404 }
      )
    }
    if (helper.status !== 'active') {
      return NextResponse.json(
        { error: 'Pembantu ini tidak aktif untuk tempahan' },
        { status: 400 }
      )
    }

    // Verify salary within range
    const serviceType = helper.serviceType || helper.desiredJob
    const range = getServiceSalaryRange(serviceType)
    if (range && (salary < range.min || salary > range.max)) {
      return NextResponse.json(
        {
          error: `Gaji mesti antara ${formatMYR(range.min)} - ${formatMYR(range.max)} untuk jenis perkhidmatan ini`,
        },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        employerId: session.id,
        helperId,
        serviceType: serviceType,
        salary: parseFloat(salary),
        startDate: new Date(startDate),
        durationMonths: parseInt(durationMonths),
        liveIn: !!liveIn,
        specialRequests: specialRequests || null,
        status: 'pending',
      },
      include: { helper: true },
    })

    // Notify admin
    await db.notification.create({
      data: {
        userId: 'admin',
        userType: 'admin',
        title: 'Tempahan Baru',
        message: `${session.name} telah menempah pembantu ${helper.fullName} (${formatMYR(parseFloat(salary))}/bulan).`,
        link: '/admin/bookings',
      },
    })

    // Notify helper
    await db.notification.create({
      data: {
        userId: helper.id,
        userType: 'helper',
        helperId: helper.id,
        title: 'Tempahan Baru Diterima',
        message: `${session.name} telah menempah anda sebagai ${serviceType || 'pembantu'}. Sila tunggu pengesahan admin.`,
        link: '/helper/contract',
      },
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        helperName: booking.helper.fullName,
      },
    })
  } catch (e: any) {
    console.error('Booking create error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa membuat tempahan' },
      { status: 500 }
    )
  }
}
