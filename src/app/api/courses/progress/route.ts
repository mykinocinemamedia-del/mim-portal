import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { courseId, userId, watchedPercent, completed } = body as {
      courseId: string
      userId: string
      watchedPercent?: number
      completed?: boolean
    }

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'courseId dan userId diperlukan' },
        { status: 400 }
      )
    }

    const pct = Math.min(100, Math.max(0, watchedPercent ?? 0))
    const isCompleted = completed ?? pct >= 100

    const progress = await db.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      create: {
        userId,
        courseId,
        userType: 'helper',
        watchedPercent: pct,
        completed: isCompleted,
        lastWatchedAt: new Date(),
      },
      update: {
        watchedPercent: pct,
        completed: isCompleted,
        lastWatchedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, progress })
  } catch (e: any) {
    console.error('Course progress error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa menyimpan progress' },
      { status: 500 }
    )
  }
}
