import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'helper') {
      return NextResponse.json(
        { error: 'Tidak dibenarkan' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Only allow safe fields to be updated
    const allowedFields = [
      'nickname',
      'phone',
      'familyPhone',
      'addressLine1',
      'addressLine2',
      'city',
      'state',
      'postalCode',
      'country',
      'profilePhoto',
      'workArea',
      'motivation',
      'experience',
      'otherSkills',
    ]

    const data: Record<string, any> = {}
    for (const f of allowedFields) {
      if (f in body) {
        data[f] = body[f] === '' ? null : body[f]
      }
    }

    const updated = await db.helper.update({
      where: { id: session.id },
      data,
      select: {
        id: true,
        fullName: true,
        nickname: true,
        phone: true,
        profilePhoto: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, helper: updated })
  } catch (e: any) {
    console.error('Update helper profile error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat pelayan' },
      { status: 500 }
    )
  }
}
