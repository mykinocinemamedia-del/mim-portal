import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  Video,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { VideoCourseDialog } from './video-courses-client'

export const dynamic = 'force-dynamic'

export default async function AdminVideoCoursesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const courses = await db.videoCourse.findMany({
    orderBy: { createdAt: 'desc' },
    include: { progress: true },
  })

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Kursus Video
            </h1>
            <p className="text-muted-foreground mt-1">
              {courses.length} kursus video dalam sistem.
            </p>
          </div>
          <VideoCourseDialog />
        </div>

        {courses.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Kursus Video</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tambah kursus latihan pertama anda.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => {
              const views = c.progress.length
              const completed = c.progress.filter((p) => p.completed).length
              return (
                <Card key={c.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      {c.isPublished ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                          Diterbitkan
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Draf
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm line-clamp-2">
                        {c.title}
                      </p>
                      {c.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {c.category && (
                        <Badge variant="outline">{c.category}</Badge>
                      )}
                      {c.durationMinutes && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" /> {c.durationMinutes} minit
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      <span className="text-muted-foreground">
                        {completed}/{views} selesai
                      </span>
                      <a
                        href={c.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3 h-3 mr-1" /> Tonton
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
