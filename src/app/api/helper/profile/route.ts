import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'helper') {
      return NextResponse.json(
        { error: 'Tidak dibenarkan' },
        { status: 401 }
      )
    }

    const helper = await db.helper.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        fullName: true,
        nickname: true,
        phone: true,
        familyPhone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        profilePhoto: true,
        workArea: true,
        motivation: true,
        experience: true,
        otherSkills: true,
        email: true,
        ic: true,
      },
    })

    if (!helper) {
      return NextResponse.json({ error: 'Pembantu tidak dijumpai' }, { status: 404 })
    }

    return NextResponse.json({ helper })
  } catch (e: any) {
    console.error('Get helper profile error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat pelayan' },
      { status: 500 }
    )
  }
}
