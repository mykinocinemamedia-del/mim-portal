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
    const {
      id,
      content,
      signedHelper,
      signedEmployer,
      signedAdmin,
      status,
      pdfUrl,
    } = body as {
      id: string
      content?: string
      signedHelper?: boolean
      signedEmployer?: boolean
      signedAdmin?: boolean
      status?: string
      pdfUrl?: string
    }

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const existing = await db.contract.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Kontrak tidak dijumpai' },
        { status: 404 }
      )
    }

    const data: any = {}
    if (content !== undefined) data.content = content
    if (signedHelper !== undefined) data.signedHelper = !!signedHelper
    if (signedEmployer !== undefined) data.signedEmployer = !!signedEmployer
    if (signedAdmin !== undefined) data.signedAdmin = !!signedAdmin
    if (status !== undefined) data.status = status
    if (pdfUrl !== undefined) data.pdfUrl = pdfUrl

    // Auto-update status to 'active' if all signed
    if (
      data.signedHelper &&
      data.signedEmployer &&
      data.signedAdmin &&
      existing.status === 'draft'
    ) {
      data.status = 'active'
    }

    const updated = await db.contract.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      success: true,
      contract: {
        id: updated.id,
        status: updated.status,
        signedHelper: updated.signedHelper,
        signedEmployer: updated.signedEmployer,
        signedAdmin: updated.signedAdmin,
      },
    })
  } catch (e: any) {
    console.error('Contract update error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa kemas kini kontrak' },
      { status: 500 }
    )
  }
}
