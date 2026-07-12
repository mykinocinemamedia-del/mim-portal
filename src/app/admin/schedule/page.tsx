import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Coffee, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ScheduleDialog } from './schedule-dialog'

export const dynamic = 'force-dynamic'

export default async function AdminSchedulePage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const [schedules, helpers, employers] = await Promise.all([
    db.schedule.findMany({
      include: { helper: true, employer: true },
      orderBy: { workDate: 'desc' },
      take: 200,
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

  // Group by date (YYYY-MM-DD)
  const grouped: Record<string, typeof schedules> = {}
  for (const s of schedules) {
    const key = new Date(s.workDate).toISOString().slice(0, 10)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1))

  const helpersData = helpers.map((h) => ({ id: h.id, fullName: h.fullName }))
  const employersData = employers.map((e) => ({ id: e.id, fullName: e.fullName }))

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Pengurusan Jadual
            </h1>
            <p className="text-muted-foreground mt-1">
              {schedules.length} jadual kerja dalam sistem.
            </p>
          </div>
          <ScheduleDialog helpers={helpersData} employers={employersData} />
        </div>

        {schedules.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Jadual</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tambah jadual kerja untuk pembantu.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {sortedDates.map((dateKey) => {
              const daySchedules = grouped[dateKey]
              const dateObj = new Date(dateKey)
              return (
                <Card key={dateKey} className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      {dateObj.toLocaleDateString('ms-MY', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {daySchedules.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {s.helper.fullName}
                            </p>
                            {s.employer && (
                              <p className="text-xs text-muted-foreground truncate">
                                Majikan: {s.employer.fullName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {s.isDayOff ? (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                              <Coffee className="w-3 h-3 mr-1" /> Cuti
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {s.startTime || '08:00'} - {s.endTime || '17:00'}
                            </Badge>
                          )}
                          {s.notes && (
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                              {s.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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
