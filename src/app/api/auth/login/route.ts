import { NextRequest, NextResponse } from 'next/server'
import { createSession, authenticate } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, role } = body as {
      email: string
      password: string
      role: 'helper' | 'employer' | 'admin'
    }

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, dan role diperlukan' },
        { status: 400 }
      )
    }

    const user = await authenticate(email, password, role)
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    await createSession(user)
    return NextResponse.json({ success: true, user })
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json(
      { error: 'Ralat semasa log masuk' },
      { status: 500 }
    )
  }
}
