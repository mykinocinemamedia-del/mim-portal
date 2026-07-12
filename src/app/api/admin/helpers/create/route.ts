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

    // Check email uniqueness
    const existing = await db.helper.findUnique({
      where: { email: body.email },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 400 }
      )
    }

    const helper = await db.helper.create({
      data: {
        fullName: body.fullName,
        nickname: body.nickname || null,
        ic: body.ic || null,
        age: body.age ? parseInt(body.age) : null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        religion: body.religion || null,
        maritalStatus: body.maritalStatus || null,
        education: body.education || null,
        phone: body.phone || null,
        familyPhone: body.familyPhone || null,
        addressLine1: body.addressLine1 || null,
        addressLine2: body.addressLine2 || null,
        city: body.city || null,
        state: body.state || null,
        postalCode: body.postalCode || null,
        country: body.country || 'Malaysia',
        residencyState: body.residencyState || body.state || null,
        workArea: body.workArea || null,
        canRelocate: body.canRelocate === true || body.canRelocate === 'yes',
        serviceType: body.serviceType || null,
        liveIn: body.workTime === 'live_in' || body.workTime === 'both',
        backAndForth: body.workTime === 'back_forth' || body.workTime === 'both',
        canBoth: body.workTime === 'both',
        desiredJob: body.desiredJob || body.serviceType || null,
        skills: body.skills
          ? typeof body.skills === 'string'
            ? body.skills
            : JSON.stringify(body.skills)
          : null,
        childAges: body.childAges
          ? typeof body.childAges === 'string'
            ? body.childAges
            : JSON.stringify(body.childAges)
          : null,
        otherSkills: body.otherSkills || null,
        motivation: body.motivation || null,
        experience: body.experience || null,
        profilePhoto: body.profilePhoto || null,
        email: body.email,
        password: body.password,
        status: body.status || 'active',
        isFirstLogin: body.isFirstLogin ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      helper: { id: helper.id, name: helper.fullName, email: helper.email },
    })
  } catch (e: any) {
    console.error('Admin helper create error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa cipta pembantu' },
      { status: 500 }
    )
  }
}
