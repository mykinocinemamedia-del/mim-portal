import { NextRequest, NextResponse } from 'next/server'
import { getSession, createSession } from '@/lib/auth'
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
    const { currentPassword, newPassword } = body as {
      currentPassword: string
      newPassword: string
      confirmPassword?: string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password semasa dan password baharu diperlukan' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password baharu mesti sekurang-kurangnya 8 aksara' },
        { status: 400 }
      )
    }

    const helper = await db.helper.findUnique({ where: { id: session.id } })
    if (!helper) {
      return NextResponse.json({ error: 'Pembantu tidak dijumpai' }, { status: 404 })
    }

    if (helper.password !== currentPassword) {
      return NextResponse.json(
        { error: 'Password semasa tidak betul' },
        { status: 400 }
      )
    }

    if (helper.password === newPassword) {
      return NextResponse.json(
        { error: 'Password baharu tidak boleh sama dengan password semasa' },
        { status: 400 }
      )
    }

    await db.helper.update({
      where: { id: session.id },
      data: {
        password: newPassword,
        isFirstLogin: false,
      },
    })

    // Refresh session to clear isFirstLogin flag
    await createSession({
      id: helper.id,
      email: helper.email || '',
      role: 'helper',
      name: helper.fullName,
      isFirstLogin: false,
    })

    return NextResponse.json({
      success: true,
      message: 'Password berjaya ditukar',
    })
  } catch (e: any) {
    console.error('Change password error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat pelayan' },
      { status: 500 }
    )
  }
}
