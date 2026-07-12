import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateCredentials, createSession } from '@/lib/auth'
import { waLink } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Required fields
    const required = ['fullName', 'phone']
    for (const f of required) {
      if (!body[f]) {
        return NextResponse.json(
          { error: `Field ${f} diperlukan` },
          { status: 400 }
        )
      }
    }

    // Auto-generate credentials
    const creds = generateCredentials(body.fullName, 'helper')

    // Create helper record
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
        phone: body.phone,
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
        skills: body.skills ? JSON.stringify(body.skills) : null,
        childAges: body.childAges ? JSON.stringify(body.childAges) : null,
        otherSkills: body.otherSkills || null,
        motivation: body.motivation || null,
        experience: body.experience || null,
        email: creds.email,
        password: creds.password,
        status: 'pending',
        isFirstLogin: true,
      },
    })

    // Create notification for admin
    await db.notification.create({
      data: {
        userId: 'admin',
        userType: 'admin',
        title: 'Pembantu Baru Berdaftar',
        message: `${helper.fullName} telah mendaftar sebagai pembantu. Sila semak profil untuk kelulusan.`,
        link: `/admin/helpers`,
      },
    })

    // Create session
    await createSession({
      id: helper.id,
      email: creds.email,
      role: 'helper',
      name: helper.fullName,
      isFirstLogin: true,
    })

    // Generate WhatsApp message with credentials
    const waMessage = `Selamat datang ke MIM Portal!

Email: ${creds.email}
Password: ${creds.password}

Sila log masuk di ${process.env.NEXT_PUBLIC_SITE_URL || 'https://mim-portal.vercel.app'}/helper/login

Selepas log masuk, sila:
1. Tukar password anda
2. Lengkapkan profil
3. Muat naik gambar profil
4. Tonton video kursus

Terima kasih kerana menyertai MIM Portal.`

    const waUrl = waLink(body.phone, waMessage)

    return NextResponse.json({
      success: true,
      helper: {
        id: helper.id,
        name: helper.fullName,
        email: creds.email,
        password: creds.password,
      },
      whatsappUrl: waUrl,
      message: 'Pendaftaran berjaya! Kredensial telah dihantar melalui WhatsApp.',
    })
  } catch (e: any) {
    console.error('Helper register error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa pendaftaran' },
      { status: 500 }
    )
  }
}
