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
    const { id, recordingUrl, status, scheduledAt, meetUrl, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const existing = await db.interview.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Temuduga tidak dijumpai' },
        { status: 404 }
      )
    }

    const data: any = {}
    if (recordingUrl !== undefined) data.recordingUrl = recordingUrl
    if (status !== undefined) data.status = status
    if (scheduledAt !== undefined) data.scheduledAt = new Date(scheduledAt)
    if (meetUrl !== undefined) data.meetUrl = meetUrl
    if (notes !== undefined) data.notes = notes

    const updated = await db.interview.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      success: true,
      interview: {
        id: updated.id,
        status: updated.status,
        recordingUrl: updated.recordingUrl,
      },
    })
  } catch (e: any) {
    console.error('Interview update error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa kemas kini temuduga' },
      { status: 500 }
    )
  }
}
