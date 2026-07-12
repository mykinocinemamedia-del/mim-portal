import { NextRequest, NextResponse } from 'next/server'
import { getSession, generateCredentials } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * POST /api/admin/helpers/bulk-import
 * ----------------------------------
 * Bulk-import helpers from a parsed CSV (or future PDF extract).
 *
 * Body: { maids: Array<{ fullName, phone, age?, religion?, maritalStatus?,
 *                       serviceType?, skills?, city?, state?, ... }> }
 *
 * For each entry:
 *   1. Generate auto email + password (generateCredentials from lib/auth.ts)
 *   2. Insert via db.helper.create()
 *   3. Track per-row errors so a single bad row doesn't abort the whole batch
 *
 * Returns: { success: boolean, imported: number, errors: Array<{ row, error }> }
 */
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
    const maids: any[] = Array.isArray(body?.maids) ? body.maids : []

    if (maids.length === 0) {
      return NextResponse.json(
        { error: 'Tiada data pembantu untuk diimport.' },
        { status: 400 }
      )
    }

    if (maids.length > 1000) {
      return NextResponse.json(
        { error: 'Terlalu banyak row. Maksimum 1000 pembantu sekali import.' },
        { status: 400 }
      )
    }

    let imported = 0
    const errors: { row: number; fullName?: string; error: string }[] = []

    for (let i = 0; i < maids.length; i++) {
      const m = maids[i] || {}
      const rowNo = i + 1

      // Skip empty rows
      if (!m.fullName || String(m.fullName).trim() === '') {
        errors.push({ row: rowNo, error: 'Nama penuh kosong.' })
        continue
      }

      const fullName = String(m.fullName).trim()

      try {
        // Generate unique email + password
        // If duplicate email collision happens, regenerate (max 3 attempts)
        let email = ''
        let password = ''
        let attempts = 0
        let created = false
        let lastErr: any = null

        while (attempts < 3 && !created) {
          attempts++
          const creds = generateCredentials(fullName, 'helper')
          email = creds.email
          password = creds.password

          try {
            // Parse skills - if string with commas, keep as JSON array string
            let skillsJson: string | null = null
            if (m.skills) {
              const arr = String(m.skills)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
              skillsJson = JSON.stringify(arr)
            }

            await db.helper.create({
              data: {
                fullName,
                nickname: null,
                phone: m.phone ? String(m.phone).trim() : null,
                age: m.age ? parseInt(String(m.age), 10) || null : null,
                religion: m.religion ? String(m.religion).trim() : null,
                maritalStatus: m.maritalStatus
                  ? String(m.maritalStatus).trim()
                  : null,
                serviceType: m.serviceType ? String(m.serviceType).trim() : null,
                desiredJob: m.serviceType ? String(m.serviceType).trim() : null,
                skills: skillsJson,
                city: m.city ? String(m.city).trim() : null,
                state: m.state ? String(m.state).trim() : null,
                residencyState: m.state ? String(m.state).trim() : null,
                country: 'Malaysia',
                email,
                password,
                status: 'active',
                isFirstLogin: true,
                rating: 5.0,
              },
            })
            created = true
            imported++
          } catch (e: any) {
            lastErr = e
            // If email collision, retry; otherwise break
            const isUniqueViolation =
              e?.code === 'P2002' ||
              /unique/i.test(e?.message || '') ||
              /already exists/i.test(e?.message || '')
            if (!isUniqueViolation) break
          }
        }

        if (!created) {
          errors.push({
            row: rowNo,
            fullName,
            error:
              lastErr?.message || 'Gagal cipta pembantu (kemungkinan email duplikat).',
          })
        }
      } catch (e: any) {
        errors.push({ row: rowNo, fullName, error: e.message || String(e) })
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      total: maids.length,
      errors,
    })
  } catch (e: any) {
    console.error('Bulk import error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa import pembantu' },
      { status: 500 }
    )
  }
}
