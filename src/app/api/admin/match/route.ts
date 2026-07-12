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
    const { bookingId, helperId, scheduledAt } = body as {
      bookingId: string
      helperId: string
      scheduledAt?: string
    }

    if (!bookingId || !helperId) {
      return NextResponse.json(
        { error: 'bookingId dan helperId diperlukan' },
        { status: 400 }
      )
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { employer: true, helper: true },
    })
    if (!booking) {
      return NextResponse.json(
        { error: 'Tempahan tidak dijumpai' },
        { status: 404 }
      )
    }

    const helper = await db.helper.findUnique({ where: { id: helperId } })
    if (!helper) {
      return NextResponse.json(
        { error: 'Pembantu tidak dijumpai' },
        { status: 404 }
      )
    }

    // Update booking: switch helper if different, confirm
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        helperId: helper.id,
        status: 'confirmed',
        adminNotes: `Dipadankan oleh admin (${session.name}) pada ${new Date().toISOString()}`,
      },
    })

    // Update helper status to matched
    await db.helper.update({
      where: { id: helper.id },
      data: { status: 'matched' },
    })

    // Create Google Meet URL (placeholder pattern)
    const meetId = `${booking.id.slice(-6)}-${helper.id.slice(-6)}`
    const meetUrl = `https://meet.google.com/mim-${meetId}`
    const interviewDate = scheduledAt
      ? new Date(scheduledAt)
      : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now

    // Create interview record
    const interview = await db.interview.create({
      data: {
        helperId: helper.id,
        employerId: booking.employerId,
        meetUrl,
        scheduledAt: interviewDate,
        status: 'scheduled',
        notes: `Temuduga dijadualkan oleh admin (${session.name}) untuk tempahan ${booking.id}`,
      },
    })

    // Notify helper
    await db.notification.create({
      data: {
        userId: helper.id,
        userType: 'helper',
        helperId: helper.id,
        title: 'Temuduga Dijadualkan',
        message: `Anda telah dipadankan dengan ${booking.employer.fullName}. Temuduga Google Meet dijadualkan pada ${interviewDate.toLocaleString('ms-MY')}.`,
        link: '/helper/dashboard',
      },
    })

    // Notify employer
    await db.notification.create({
      data: {
        userId: booking.employerId,
        userType: 'employer',
        employerId: booking.employerId,
        title: 'Pembantu Dipadankan',
        message: `${helper.fullName} telah dipadankan untuk anda. Temuduga Google Meet dijadualkan pada ${interviewDate.toLocaleString('ms-MY')}.`,
        link: '/employer/my-helper',
      },
    })

    return NextResponse.json({
      success: true,
      booking: { id: updatedBooking.id, status: updatedBooking.status },
      interview: {
        id: interview.id,
        meetUrl: interview.meetUrl,
        scheduledAt: interview.scheduledAt,
      },
    })
  } catch (e: any) {
    console.error('Admin match error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa padanan' },
      { status: 500 }
    )
  }
}
