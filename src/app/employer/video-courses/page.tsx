import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { VideoCoursesClient } from './video-courses-client'

export default async function EmployerVideoCoursesPage() {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    redirect('/employer/login')
  }

  const employer = await db.employer.findUnique({ where: { id: session.id } })
  if (!employer) redirect('/employer/login')

  const courses = await db.videoCourse.findMany({
    where: { isPublished: true },
    include: {
      progress: {
        where: { userId: session.id },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

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
    <DashboardShell
      role="employer"
      user={{ name: employer.fullName, email: employer.email || '' }}
    >
      <VideoCoursesClient
        courses={serializedCourses}
        userId={session.id}
        employerName={employer.fullName}
      />
    </DashboardShell>
  )
}
