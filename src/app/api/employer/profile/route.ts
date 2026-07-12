import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json(
        { error: 'Tidak dibenarkan. Sila log masuk sebagai majikan.' },
        { status: 401 }
      )
    }

    const employer = await db.employer.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        fullName: true,
        ic: true,
        phone: true,
        email: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        serviceType: true,
        numKids: true,
        kidsAges: true,
        salaryOffered: true,
        joinDate: true,
        criteria: true,
        contractExpiry: true,
        status: true,
        isFirstLogin: true,
        createdAt: true,
      },
    })

    if (!employer) {
      return NextResponse.json(
        { error: 'Profil majikan tidak dijumpai' },
        { status: 404 }
      )
    }

    return NextResponse.json({ employer })
  } catch (e: any) {
    console.error('Employer profile error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa mendapatkan profil' },
      { status: 500 }
    )
  }
}
