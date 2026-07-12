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

    if (!body.fullName) {
      return NextResponse.json(
        { error: 'Nama penuh diperlukan' },
        { status: 400 }
      )
    }
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email dan password diperlukan' },
        { status: 400 }
      )
    }

    const existing = await db.employer.findUnique({ where: { email: body.email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 400 }
      )
    }

    const employer = await db.employer.create({
      data: {
        fullName: body.fullName,
        ic: body.ic || null,
        phone: body.phone || null,
        email: body.email,
        password: body.password,
        addressLine1: body.addressLine1 || null,
        addressLine2: body.addressLine2 || null,
        city: body.city || null,
        state: body.state || null,
        postalCode: body.postalCode || null,
        country: body.country || 'Malaysia',
        serviceType: body.serviceType || null,
        numKids: body.numKids ? parseInt(body.numKids) : 0,
        kidsAges: body.kidsAges || null,
        salaryOffered: body.salaryOffered ? parseFloat(body.salaryOffered) : null,
        joinDate: body.joinDate ? new Date(body.joinDate) : null,
        criteria: body.criteria || null,
        profileData: JSON.stringify(body),
        status: body.status || 'active',
        isFirstLogin: body.isFirstLogin ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      employer: { id: employer.id, name: employer.fullName, email: employer.email },
    })
  } catch (e: any) {
    console.error('Admin employer create error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa cipta majikan' },
      { status: 500 }
    )
  }
}
