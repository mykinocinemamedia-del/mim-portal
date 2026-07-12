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
    const { title, description, videoUrl, thumbnail, category, durationMinutes, isPublished } = body

    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: 'title dan videoUrl diperlukan' },
        { status: 400 }
      )
    }

    const course = await db.videoCourse.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        thumbnail: thumbnail || null,
        category: category || null,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        isPublished: isPublished !== false,
      },
    })

    return NextResponse.json({ success: true, course: { id: course.id } })
  } catch (e: any) {
    console.error('Video course create error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa cipta kursus video' },
      { status: 500 }
    )
  }
}
