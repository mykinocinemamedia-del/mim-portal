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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const existing = await db.employer.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Majikan tidak dijumpai' },
        { status: 404 }
      )
    }

    const allowed: Record<string, any> = {}
    const stringFields = [
      'fullName', 'ic', 'phone', 'email', 'password', 'addressLine1',
      'addressLine2', 'city', 'state', 'postalCode', 'country', 'serviceType',
      'kidsAges', 'criteria', 'status',
    ]
    const intFields = ['numKids']
    const floatFields = ['salaryOffered']
    const boolFields = ['isFirstLogin']
    const dateFields = ['joinDate', 'contractExpiry']

    for (const f of stringFields) {
      if (f in updates) allowed[f] = updates[f] ?? null
    }
    for (const f of intFields) {
      if (f in updates && updates[f] !== '' && updates[f] != null)
        allowed[f] = parseInt(updates[f])
    }
    for (const f of floatFields) {
      if (f in updates && updates[f] !== '' && updates[f] != null)
        allowed[f] = parseFloat(updates[f])
    }
    for (const f of boolFields) {
      if (f in updates) allowed[f] = !!updates[f]
    }
    for (const f of dateFields) {
      if (f in updates && updates[f]) allowed[f] = new Date(updates[f])
    }

    if (allowed.email && allowed.email !== existing.email) {
      const dup = await db.employer.findUnique({ where: { email: allowed.email } })
      if (dup) {
        return NextResponse.json(
          { error: 'Email sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const updated = await db.employer.update({
      where: { id },
      data: allowed,
    })

    return NextResponse.json({
      success: true,
      employer: { id: updated.id, name: updated.fullName },
    })
  } catch (e: any) {
    console.error('Admin employer update error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa kemas kini majikan' },
      { status: 500 }
    )
  }
}
