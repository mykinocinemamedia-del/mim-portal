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
    const { recipientType, userId, title, message, link } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title dan message diperlukan' },
        { status: 400 }
      )
    }

    let created = 0

    if (recipientType === 'all_helpers') {
      const helpers = await db.helper.findMany({ select: { id: true } })
      await Promise.all(
        helpers.map((h) =>
          db.notification.create({
            data: {
              userId: h.id,
              userType: 'helper',
              helperId: h.id,
              title,
              message,
              link: link || null,
            },
          })
        )
      )
      created = helpers.length
    } else if (recipientType === 'all_employers') {
      const employers = await db.employer.findMany({ select: { id: true } })
      await Promise.all(
        employers.map((e) =>
          db.notification.create({
            data: {
              userId: e.id,
              userType: 'employer',
              employerId: e.id,
              title,
              message,
              link: link || null,
            },
          })
        )
      )
      created = employers.length
    } else if (recipientType === 'specific' && userId) {
      // Detect user type by querying
      const [helper, employer] = await Promise.all([
        db.helper.findUnique({ where: { id: userId } }),
        db.employer.findUnique({ where: { id: userId } }),
      ])

      if (helper) {
        await db.notification.create({
          data: {
            userId: helper.id,
            userType: 'helper',
            helperId: helper.id,
            title,
            message,
            link: link || null,
          },
        })
        created = 1
      } else if (employer) {
        await db.notification.create({
          data: {
            userId: employer.id,
            userType: 'employer',
            employerId: employer.id,
            title,
            message,
            link: link || null,
          },
        })
        created = 1
      } else {
        return NextResponse.json(
          { error: 'Pengguna tidak dijumpai' },
          { status: 404 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'recipientType atau userId tidak sah' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      sent: created,
      message: `Notifikasi dihantar kepada ${created} pengguna.`,
    })
  } catch (e: any) {
    console.error('Notification send error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa hantar notifikasi' },
      { status: 500 }
    )
  }
}
