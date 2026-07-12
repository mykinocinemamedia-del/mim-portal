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
    const { helperId, recordType, result, fileUrl, notes, uploadDate } = body

    if (!helperId || !recordType) {
      return NextResponse.json(
        { error: 'helperId dan recordType diperlukan' },
        { status: 400 }
      )
    }

    const record = await db.medicalRecord.create({
      data: {
        helperId,
        recordType,
        result: result || null,
        fileUrl: fileUrl || null,
        notes: notes || null,
        uploadDate: uploadDate ? new Date(uploadDate) : new Date(),
      },
    })

    // Notify helper
    await db.notification.create({
      data: {
        userId: helperId,
        userType: 'helper',
        helperId,
        title: 'Rekod Perubatan Baru',
        message: `Rekod ${recordType === 'vaccination' ? 'vaksinasi' : 'kesihatan'} telah dimuat naik oleh admin.`,
        link: '/helper/dashboard',
      },
    })

    return NextResponse.json({
      success: true,
      record: { id: record.id },
    })
  } catch (e: any) {
    console.error('Medical create error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa cipta rekod perubatan' },
      { status: 500 }
    )
  }
}
