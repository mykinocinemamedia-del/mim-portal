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
  Video,
  ExternalLink,
  Calendar,
  User,
  Briefcase,
  CheckCircle2,
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { InterviewDialog, RecordingDialog } from './interviews-client'

export const dynamic = 'force-dynamic'

export default async function AdminInterviewsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const [interviews, helpers, employers] = await Promise.all([
    db.interview.findMany({
      include: { helper: true, employer: true },
      orderBy: { scheduledAt: 'desc' },
    }),
    db.helper.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
    db.employer.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
  ])

  const helpersData = helpers.map((h) => ({ id: h.id, fullName: h.fullName }))
  const employersData = employers.map((e) => ({ id: e.id, fullName: e.fullName }))

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      scheduled: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
      completed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
      cancelled: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
    }
    return map[s] || 'bg-muted text-muted-foreground'
  }

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Pengurusan Temuduga
            </h1>
            <p className="text-muted-foreground mt-1">
              {interviews.length} temuduga dalam sistem.
            </p>
          </div>
          <InterviewDialog helpers={helpersData} employers={employersData} />
        </div>

        {interviews.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Temuduga</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Jadual temuduga pertama anda dengan mengklik butang di atas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map((iv) => (
              <Card key={iv.id} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {iv.helper?.fullName || 'Pembantu dibuang'} ×{' '}
                          {iv.employer?.fullName || 'Majikan dibuang'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {iv.scheduledAt ? formatDateTime(iv.scheduledAt) : '-'}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusBadge(iv.status)}>{iv.status}</Badge>
                  </div>

                  {iv.meetUrl && (
                    <a
                      href={iv.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        <ExternalLink className="w-3 h-3 mr-1" /> Buka Google Meet
                      </Button>
                    </a>
                  )}

                  {iv.recordingUrl && (
                    <a
                      href={iv.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        <Video className="w-3 h-3 mr-1" /> Tonton Rakaman
                      </Button>
                    </a>
                  )}

                  {iv.notes && (
                    <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                      {iv.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Dibuat: {formatDate(iv.createdAt)}
                    </span>
                    <RecordingDialog
                      interviewId={iv.id}
                      currentUrl={iv.recordingUrl}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
