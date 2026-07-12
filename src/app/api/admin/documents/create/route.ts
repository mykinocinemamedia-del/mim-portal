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
    const { title, docType, content, fileUrl, isPublished } = body

    if (!title || !docType) {
      return NextResponse.json(
        { error: 'title dan docType diperlukan' },
        { status: 400 }
      )
    }

    const doc = await db.document.create({
      data: {
        title,
        docType,
        content: content || null,
        fileUrl: fileUrl || null,
        isPublished: isPublished !== false,
      },
    })

    return NextResponse.json({ success: true, document: { id: doc.id } })
  } catch (e: any) {
    console.error('Document create error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa cipta dokumen' },
      { status: 500 }
    )
  }
}
