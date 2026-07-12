import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateCredentials, createSession } from '@/lib/auth'
import { waLink } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.fullName || !body.phone) {
      return NextResponse.json(
        { error: 'Nama penuh dan nombor telefon diperlukan' },
        { status: 400 }
      )
    }

    const creds = generateCredentials(body.fullName, 'employer')

    const employer = await db.employer.create({
      data: {
        fullName: body.fullName,
        ic: body.ic || null,
        phone: body.phone,
        email: creds.email,
        password: creds.password,
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
        status: 'pending',
        isFirstLogin: true,
      },
    })

    // Notify admin
    await db.notification.create({
      data: {
        userId: 'admin',
        userType: 'admin',
        title: 'Majikan Baru Berdaftar',
        message: `${employer.fullName} telah mendaftar sebagai majikan.`,
        link: `/admin/employers`,
      },
    })

    await createSession({
      id: employer.id,
      email: creds.email,
      role: 'employer',
      name: employer.fullName,
      isFirstLogin: true,
    })

    const waMessage = `Selamat datang ke MIM Portal!

Akaun Majikan Anda telah dicipta.

Email: ${creds.email}
Password: ${creds.password}

Sila log masuk di ${process.env.NEXT_PUBLIC_SITE_URL || 'https://mim-portal.vercel.app'}/employer/login

Selepas log masuk, sila:
1. Tukar password anda
2. Cari pembantu yang sesuai di "Find Helper"
3. Buat booking pembantu pilihan anda

Terima kasih kerana memilih MIM Portal.`

    const waUrl = waLink(body.phone, waMessage)

    return NextResponse.json({
      success: true,
      employer: {
        id: employer.id,
        name: employer.fullName,
        email: creds.email,
        password: creds.password,
      },
      whatsappUrl: waUrl,
      message: 'Pendaftaran berjaya! Kredensial telah dihantar melalui WhatsApp.',
    })
  } catch (e: any) {
    console.error('Employer register error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa pendaftaran' },
      { status: 500 }
    )
  }
}
