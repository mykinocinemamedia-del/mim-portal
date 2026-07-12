import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Calendar, Video, FileText, Settings, KeyRound, HelpCircle,
  Star, MapPin, Phone, Mail, Clock, User, AlertCircle, Camera,
  CheckCircle2, Briefcase
} from 'lucide-react'
import { getServiceLabel, formatDate, waCompanyLink } from '@/lib/utils'

export default async function HelperDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'helper') {
    redirect('/helper/login')
  }

  const helper = await db.helper.findUnique({
    where: { id: session.id },
    include: {
      schedules: { orderBy: { workDate: 'asc' }, take: 7 },
      contracts: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  })

  if (!helper) redirect('/helper/login')

  // Calculate video course progress
  const totalCourses = await db.videoCourse.count({ where: { isPublished: true } })
  const completedCourses = await db.courseProgress.count({
    where: { userId: helper.id, completed: true },
  })
  const courseProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0

  const alerts: { type: string; message: string; action?: string }[] = []
  if (helper.isFirstLogin) {
    alerts.push({ type: 'warning', message: 'Sila tukar password anda untuk keselamatan.', action: '/helper/change-password' })
  }
  if (!helper.profilePhoto) {
    alerts.push({ type: 'info', message: 'Sila muat naik gambar profil anda.', action: '/helper/edit-profile' })
  }
  if (courseProgress < 100) {
    alerts.push({ type: 'info', message: `Tonton ${totalCourses - completedCourses} video kursus lagi untuk lengkap.`, action: '/helper/video-courses' })
  }

  return (
    <DashboardShell role="helper" user={{ name: helper.fullName, email: helper.email || '' }}>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Selamat Datang, {helper.nickname || helper.fullName}!</h1>
            <p className="text-muted-foreground mt-1">Berikut adalah maklumat dan aktiviti akaun anda.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <Briefcase className="w-3 h-3 mr-1" />
              {getServiceLabel(helper.serviceType)}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {helper.status === 'pending' ? 'Menunggu Kelulusan' :
               helper.status === 'active' ? 'Aktif' :
               helper.status === 'matched' ? 'Dipadankan' :
               helper.status === 'employed' ? 'Bekerja' : helper.status}
            </Badge>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <Card key={i} className={a.type === 'warning' ? 'border-amber-300 bg-amber-50/50' : 'border-emerald-300 bg-emerald-50/50'}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${a.type === 'warning' ? 'text-amber-600' : 'text-emerald-600'}`} />
                    <p className="text-sm">{a.message}</p>
                  </div>
                  {a.action && (
                    <Link href={a.action}>
                      <Button size="sm" variant="outline">Lihat</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Profile Card */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Profil Saya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-3">
                  {helper.profilePhoto ? (
                    <img src={helper.profilePhoto} alt={helper.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-semibold">{helper.fullName}</h3>
                <p className="text-xs text-muted-foreground">{helper.nickname}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{helper.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span className="text-xs">{helper.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span className="text-xs">{helper.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span className="text-xs">{helper.city}, {helper.state}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span className="text-xs">
                    {helper.liveIn && 'Live-in'}
                    {helper.liveIn && helper.backAndForth && ' / '}
                    {helper.backAndForth && 'Back & Forth'}
                    {helper.canBoth && 'Boleh kedua-duanya'}
                  </span>
                </div>
              </div>
              <Button asChild className="w-full" variant="outline" size="sm">
                <Link href="/helper/edit-profile">
                  <Settings className="w-4 h-4 mr-2" /> Edit Profil
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <Video className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-2xl font-bold">{completedCourses}/{totalCourses}</p>
                  <p className="text-xs text-muted-foreground">Kursus Selesai</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <Calendar className="w-5 h-5 text-amber-600 mb-2" />
                  <p className="text-2xl font-bold">{helper.schedules.length}</p>
                  <p className="text-xs text-muted-foreground">Jadual Minggu Ini</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <FileText className="w-5 h-5 text-rose-600 mb-2" />
                  <p className="text-2xl font-bold">{helper.contracts.length}</p>
                  <p className="text-xs text-muted-foreground">Kontrak Aktif</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <Star className="w-5 h-5 text-amber-500 mb-2" />
                  <p className="text-2xl font-bold">{helper.rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Penarafan</p>
                </CardContent>
              </Card>
            </div>

            {/* Course Progress */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Progress Latihan Video</span>
                  <Badge variant={courseProgress === 100 ? 'default' : 'secondary'}>
                    {courseProgress === 100 ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Selesai</> : `${courseProgress}%`}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={courseProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {courseProgress === 100
                    ? 'Tahniah! Anda telah menyelesaikan semua kursus latihan.'
                    : `Anda telah melengkapkan ${completedCourses} daripada ${totalCourses} kursus. Sila lengkapkan lagi ${totalCourses - completedCourses} kursus.`}
                </p>
                <Button asChild size="sm">
                  <Link href="/helper/video-courses">
                    <Video className="w-4 h-4 mr-2" /> Tonton Video Kursus
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Akses Pantas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href="/helper/schedule">
                    <div className="flex flex-col items-center p-3 rounded-lg border-2 hover:border-primary hover:bg-primary/5 transition cursor-pointer">
                      <Calendar className="w-6 h-6 text-emerald-600 mb-2" />
                      <span className="text-xs font-medium">Jadual Kerja</span>
                    </div>
                  </Link>
                  <Link href="/helper/video-courses">
                    <div className="flex flex-col items-center p-3 rounded-lg border-2 hover:border-primary hover:bg-primary/5 transition cursor-pointer">
                      <Video className="w-6 h-6 text-amber-600 mb-2" />
                      <span className="text-xs font-medium">Video Kursus</span>
                    </div>
                  </Link>
                  <Link href="/helper/contract">
                    <div className="flex flex-col items-center p-3 rounded-lg border-2 hover:border-primary hover:bg-primary/5 transition cursor-pointer">
                      <FileText className="w-6 h-6 text-rose-600 mb-2" />
                      <span className="text-xs font-medium">Kontrak</span>
                    </div>
                  </Link>
                  <Link href="/helper/faq">
                    <div className="flex flex-col items-center p-3 rounded-lg border-2 hover:border-primary hover:bg-primary/5 transition cursor-pointer">
                      <HelpCircle className="w-6 h-6 text-slate-600 mb-2" />
                      <span className="text-xs font-medium">FAQ</span>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Schedule */}
        {helper.schedules.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Jadual Kerja Akan Datang</span>
                <Link href="/helper/schedule">
                  <Button variant="ghost" size="sm">Lihat Semua</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {helper.schedules.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">{new Date(s.workDate).toLocaleDateString('ms-MY', { month: 'short' })}</div>
                        <div className="text-lg font-bold">{new Date(s.workDate).getDate()}</div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {s.isDayOff ? 'Cuti' : `${s.startTime || '08:00'} - ${s.endTime || '17:00'}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{s.notes || 'Kerja biasa'}</p>
                      </div>
                    </div>
                    {s.isDayOff && <Badge variant="secondary">Cuti</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Need Help */}
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-amber-50/50">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Perlukan Bantuan?</h3>
              <p className="text-sm text-muted-foreground">Hubungi admin MIM melalui WhatsApp untuk sebarang pertanyaan.</p>
            </div>
            <a href={waCompanyLink(`Hai, saya ${helper.fullName} (pembantu). Saya ingin bertanya tentang...`)} target="_blank" rel="noopener noreferrer">
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

function MessageCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}
