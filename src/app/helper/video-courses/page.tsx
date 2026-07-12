import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { VideoCoursesClient } from './video-courses-client'

export default async function HelperVideoCoursesPage() {
  const session = await getSession()
  if (!session || session.role !== 'helper') {
    redirect('/helper/login')
  }

  const helper = await db.helper.findUnique({ where: { id: session.id } })
  if (!helper) redirect('/helper/login')

  const courses = await db.videoCourse.findMany({
    where: { isPublished: true },
    include: {
      progress: {
        where: { userId: session.id },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Serialize dates for client component
  const serializedCourses = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    videoUrl: c.videoUrl,
    thumbnail: c.thumbnail,
    category: c.category,
    durationMinutes: c.durationMinutes,
    isPublished: c.isPublished,
    progress: c.progress.map((p) => ({
      id: p.id,
      userId: p.userId,
      courseId: p.courseId,
      watchedPercent: p.watchedPercent,
      completed: p.completed,
    })),
  }))

  return (
    <DashboardShell role="helper" user={{ name: helper.fullName, email: helper.email || '' }}>
      <VideoCoursesClient courses={serializedCourses} userId={session.id} helperName={helper.fullName} />
    </DashboardShell>
  )
}
