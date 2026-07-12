import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MessageCircle, CalendarDays, Sun, Moon } from 'lucide-react'
import { waCompanyLink, formatDate } from '@/lib/utils'

export default async function HelperSchedulePage() {
  const session = await getSession()
  if (!session || session.role !== 'helper') {
    redirect('/helper/login')
  }

  const helper = await db.helper.findUnique({
    where: { id: session.id },
    include: {
      schedules: {
        orderBy: { workDate: 'asc' },
      },
    },
  })

  if (!helper) redirect('/helper/login')

  // Filter only upcoming schedules (today onwards)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingSchedules = helper.schedules.filter(
    (s) => new Date(s.workDate) >= today
  )

  const totalDays = upcomingSchedules.length
  const dayOffCount = upcomingSchedules.filter((s) => s.isDayOff).length
  const workDayCount = totalDays - dayOffCount

  // Group schedules by month
  const byMonth: Record<string, typeof upcomingSchedules> = {}
  for (const s of upcomingSchedules) {
    const key = new Date(s.workDate).toLocaleDateString('ms-MY', {
      month: 'long',
      year: 'numeric',
    })
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(s)
  }

  return (
    <DashboardShell role="helper" user={{ name: helper.fullName, email: helper.email || '' }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Jadual Kerja Saya</h1>
            <p className="text-muted-foreground mt-1">
              Lihat jadual kerja anda yang telah ditetapkan oleh majikan.
            </p>
          </div>
          <a href={waCompanyLink('Saya ingin bertanya tentang jadual kerja saya.')} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Admin
            </Button>
          </a>
        </div>

        {/* Stats */}
        {totalDays > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <CalendarDays className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">{totalDays}</p>
                <p className="text-xs text-muted-foreground">Jumlah Hari</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">{workDayCount}</p>
                <p className="text-xs text-muted-foreground">Hari Bekerja</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Sun className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">{dayOffCount}</p>
                <p className="text-xs text-muted-foreground">Hari Cuti</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule List */}
        {upcomingSchedules.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Jadual Belum Disediakan</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Jadual kerja belum disediakan. Sila hubungi majikan atau admin.
              </p>
              <a href={waCompanyLink('Saya ingin bertanya tentang jadual kerja saya.')} target="_blank" rel="noopener noreferrer" className="inline-block mt-4">
                <Button>
                  <MessageCircle className="w-4 h-4 mr-2" /> Hubungi Admin
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(byMonth).map(([month, items]) => (
              <div key={month}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {month}
                </h2>
                <div className="space-y-2">
                  {items.map((s) => {
                    const date = new Date(s.workDate)
                    const isPast = false // all upcoming
                    return (
                      <Card key={s.id} className={`border-0 shadow-sm ${s.isDayOff ? 'bg-amber-50/50' : 'bg-emerald-50/30'}`}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg shrink-0 ${s.isDayOff ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            <span className="text-[10px] uppercase font-medium leading-none">
                              {date.toLocaleDateString('ms-MY', { weekday: 'short' })}
                            </span>
                            <span className="text-xl font-bold leading-none mt-0.5">
                              {date.getDate()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm">
                                {formatDate(s.workDate)}
                              </p>
                              {s.isDayOff ? (
                                <Badge variant="secondary" className="bg-amber-200 text-amber-800 hover:bg-amber-200">
                                  <Sun className="w-3 h-3 mr-1" /> Cuti
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-emerald-200 text-emerald-800 hover:bg-emerald-200">
                                  <Moon className="w-3 h-3 mr-1" /> Bekerja
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {!s.isDayOff && (
                                <span className="inline-flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {s.startTime || '08:00'} - {s.endTime || '17:00'}
                                </span>
                              )}
                              <span>{date.toLocaleDateString('ms-MY', { weekday: 'long' })}</span>
                            </div>
                            {s.notes && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {s.notes}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help card */}
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-amber-50/50">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Ada Pertanyaan Tentang Jadual?</h3>
              <p className="text-sm text-muted-foreground">Hubungi admin MIM melalui WhatsApp untuk pertanyaan jadual kerja.</p>
            </div>
            <a href={waCompanyLink('Saya ingin bertanya tentang jadual kerja saya.')} target="_blank" rel="noopener noreferrer">
              <Button variant="default">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Admin
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
