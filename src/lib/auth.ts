/**
 * Authentication utilities for MIM Portal
 * Uses simple JWT-like tokens (base64) for session management.
 */

import { cookies } from 'next/headers'
import { db } from './db'

const SESSION_COOKIE = 'mim_session'
const SESSION_SECRET = process.env.JWT_SECRET || 'mim-portal-secret-2026'

export type SessionUser = {
  id: string
  email: string
  role: 'helper' | 'employer' | 'admin'
  name: string
  isFirstLogin?: boolean
}

/**
 * Encode a session payload (base64 only - not cryptographically secure,
 * but sufficient for this demo. In production, use proper JWT library).
 */
function encodeSession(user: SessionUser): string {
  const payload = {
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    secret: SESSION_SECRET,
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

function decodeSession(token: string): SessionUser | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    if (decoded.exp < Date.now()) return null
    if (decoded.secret !== SESSION_SECRET) return null
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      isFirstLogin: decoded.isFirstLogin,
    }
  } catch {
    return null
  }
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies()
  const token = encodeSession(user)
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return decodeSession(token)
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Authenticate helper/employer/admin by email & password.
 */
export async function authenticate(
  email: string,
  password: string,
  role: 'helper' | 'employer' | 'admin'
): Promise<SessionUser | null> {
  if (role === 'admin') {
    const admin = await db.admin.findUnique({ where: { email } })
    if (!admin || admin.password !== password) return null
    return {
      id: admin.id,
      email: admin.email,
      role: 'admin',
      name: admin.fullName || 'Admin',
    }
  }

  if (role === 'helper') {
    const helper = await db.helper.findUnique({ where: { email } })
    if (!helper || helper.password !== password) return null
    return {
      id: helper.id,
      email: helper.email!,
      role: 'helper',
      name: helper.fullName,
      isFirstLogin: helper.isFirstLogin,
    }
  }

  if (role === 'employer') {
    const employer = await db.employer.findUnique({ where: { email } })
    if (!employer || employer.password !== password) return null
    return {
      id: employer.id,
      email: employer.email!,
      role: 'employer',
      name: employer.fullName,
      isFirstLogin: employer.isFirstLogin,
    }
  }

  return null
}

/**
 * Generate auto credentials (email + password) for new users.
 */
export function generateCredentials(
  fullName: string,
  role: 'helper' | 'employer'
): { email: string; password: string } {
  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)
  const random = Math.random().toString(36).slice(2, 8)
  const email = `${cleanName}.${random}@mim.com.my`
  const password = `MIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`
  return { email, password }
}
