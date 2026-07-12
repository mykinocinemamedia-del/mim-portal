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
    const { id, title, docType, content, fileUrl, isPublished } = body

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const existing = await db.document.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Dokumen tidak dijumpai' },
        { status: 404 }
      )
    }

    const data: any = {}
    if (title !== undefined) data.title = title
    if (docType !== undefined) data.docType = docType
    if (content !== undefined) data.content = content
    if (fileUrl !== undefined) data.fileUrl = fileUrl
    if (isPublished !== undefined) data.isPublished = !!isPublished

    const updated = await db.document.update({ where: { id }, data })

    return NextResponse.json({ success: true, document: { id: updated.id } })
  } catch (e: any) {
    console.error('Document update error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa kemas kini dokumen' },
      { status: 500 }
    )
  }
}
