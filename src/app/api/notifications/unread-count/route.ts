import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ count: 0 })
    }

    // For helpers and employers, we check helperId/employerId or userId+userType
    let count = 0

    if (session.role === 'helper') {
      count = await db.notification.count({
        where: {
          AND: [
            { isRead: false },
            {
              OR: [
                { helperId: session.id },
                { userId: session.id, userType: 'helper' },
              ],
            },
          ],
        },
      })
    } else if (session.role === 'employer') {
      count = await db.notification.count({
        where: {
          AND: [
            { isRead: false },
            {
              OR: [
                { employerId: session.id },
                { userId: session.id, userType: 'employer' },
              ],
            },
          ],
        },
      })
    } else if (session.role === 'admin') {
      count = await db.notification.count({
        where: {
          isRead: false,
          userId: 'admin',
          userType: 'admin',
        },
      })
    }

    return NextResponse.json({ count })
  } catch (e: any) {
    console.error('Unread count error:', e)
    return NextResponse.json({ count: 0 })
  }
}
