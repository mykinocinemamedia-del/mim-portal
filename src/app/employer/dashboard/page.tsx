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
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Video,
  FileText,
  HelpCircle,
  Search,
  Users,
  ClipboardList,
  CreditCard,
  Star,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Clock,
  MessageCircle,
  Sparkles,
  PlayCircle,
} from 'lucide-react'
import {
  getServiceLabel,
  formatDate,
  formatMYR,
  waCompanyLink,
  getInitials,
} from '@/lib/utils'

export default async function EmployerDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    redirect('/employer/login')
  }

  const employer = await db.employer.findUnique({
    where: { id: session.id },
    include: {
      bookings: {
        include: { helper: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      payments: {
        orderBy: { dueDate: 'desc' },
        take: 10,
      },
      contracts: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })

  if (!employer) redirect('/employer/login')

  // Latest video courses (3)
  const latestCourses = await db.videoCourse.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })

  // Latest 4 helpers registered
  const latestHelpers = await db.helper.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  // Alerts
  const alerts: { type: 'warning' | 'info' | 'danger'; message: string; action?: string }[] = []

  // Contract expiry alert
  const now = new Date()
  let contractExpiryStatus: 'ok' | 'soon' | 'expired' | 'none' = 'none'
  if (employer.contractExpiry) {
    const daysToExpiry = Math.ceil(
      (employer.contractExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysToExpiry < 0) {
      contractExpiryStatus = 'expired'
      alerts.push({
        type: 'danger',
        message: `Kontrak anda telah tamat pada ${formatDate(employer.contractExpiry)}. Sila hubungi admin untuk pembaharuan.`,
        action: '/employer/contract',
      })
    } else if (daysToExpiry <= 30) {
      contractExpiryStatus = 'soon'
      alerts.push({
        type: 'warning',
        message: `Kontrak anda akan tamat dalam ${daysToExpiry} hari (${formatDate(employer.contractExpiry)}). Sila hubungi admin untuk pembaharuan.`,
        action: '/employer/contract',
      })
    } else {
      contractExpiryStatus = 'ok'
    }
  }

  // Overdue payment alert
  const overduePayments = employer.payments.filter((p) => p.status === 'overdue')
  if (overduePayments.length > 0) {
    alerts.push({
      type: 'danger',
      message: `Anda mempunyai ${overduePayments.length} pembayaran tertunggak. Sila buat pembayaran segera.`,
      action: '/employer/payments',
    })
  }

  if (employer.isFirstLogin) {
    alerts.push({
      type: 'warning',
      message: 'Sila tukar password anda untuk keselamatan.',
    })
  }

  const quickActions = [
    {
      href: '/employer/find-helper',
      label: 'Cari Pembantu',
      icon: Search,
      color: 'text-emerald-600',
    },
    {
      href: '/employer/my-helper',
      label: 'Pembantu Saya',
      icon: Users,
      color: 'text-amber-600',
    },
    {
      href: '/employer/bookings',
      label: 'Tempahan',
      icon: ClipboardList,
      color: 'text-rose-600',
    },
    {
      href: '/employer/payments',
      label: 'Pembayaran',
      icon: CreditCard,
      color: 'text-slate-600',
    },
    {
      href: '/employer/video-courses',
      label: 'Video Kursus',
      icon: Video,
      color: 'text-emerald-600',
    },
    {
      href: '/employer/contract',
      label: 'Kontrak',
      icon: FileText,
      color: 'text-amber-600',
    },
    {
      href: '/employer/faq',
      label: 'FAQ',
      icon: HelpCircle,
      color: 'text-slate-600',
    },
    {
      href: '/employer/notifications',
      label: 'Notifikasi',
      icon: MessageCircle,
      color: 'text-rose-600',
    },
  ]

  return (
    <DashboardShell
      role="employer"
      user={{ name: employer.fullName, email: employer.email || '' }}
    >
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Selamat Datang, {employer.fullName}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Berikut adalah maklumat dan aktiviti akaun majikan anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <Briefcase className="w-3 h-3 mr-1" />
              {getServiceLabel(employer.serviceType) || 'Majikan'}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {employer.status === 'pending'
                ? 'Menunggu Kelulusan'
                : employer.status === 'active'
                ? 'Aktif'
                : employer.status}
            </Badge>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <Card
                key={i}
                className={
                  a.type === 'danger'
                    ? 'border-rose-300 bg-rose-50/50'
                    : a.type === 'warning'
                    ? 'border-amber-300 bg-amber-50/50'
                    : 'border-emerald-300 bg-emerald-50/50'
                }
              >
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      className={`w-4 h-4 ${
                        a.type === 'danger'
                          ? 'text-rose-600'
                          : a.type === 'warning'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    />
                    <p className="text-sm">{a.message}</p>
                  </div>
                  {a.action && (
                    <Link href={a.action}>
                      <Button size="sm" variant="outline">
                        Lihat
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Account Info + Contract */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Maklumat Akaun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span className="text-xs break-all">{employer.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span className="text-xs">{employer.phone || '-'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span className="text-xs">
                  {employer.addressLine1}
                  {employer.addressLine2 ? `, ${employer.addressLine2}` : ''}
                  {employer.city ? `, ${employer.city}` : ''}
                  {employer.state ? `, ${employer.state}` : ''}
                  {employer.postalCode ? ` ${employer.postalCode}` : ''}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span className="text-xs">
                  {getServiceLabel(employer.serviceType)}
                  {employer.salaryOffered ? ` · ${formatMYR(employer.salaryOffered)}/bln` : ''}
                </span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Tarikh Tamat Kontrak</p>
                {employer.contractExpiry ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formatDate(employer.contractExpiry)}
                    </span>
                    {contractExpiryStatus === 'expired' && (
                      <Badge variant="destructive" className="text-xs">
                        Tamat
                      </Badge>
                    )}
                    {contractExpiryStatus === 'soon' && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                        Hampir Tamat
                      </Badge>
                    )}
                    {contractExpiryStatus === 'ok' && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                        Aktif
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Tiada kontrak aktif</p>
                )}
                {(contractExpiryStatus === 'expired' || contractExpiryStatus === 'soon') && (
                  <a
                    href={waCompanyLink(
                      `Hai, saya ${employer.fullName}. Saya ingin membaharui kontrak saya yang ${
                        contractExpiryStatus === 'expired' ? 'telah tamat' : 'akan tamat'
                      } tidak lama lagi.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2"
                  >
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-3 h-3 mr-1" /> Hubungi Admin untuk Pembaharuan
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <ClipboardList className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-2xl font-bold">{employer.bookings.length}</p>
                  <p className="text-xs text-muted-foreground">Tempahan Terkini</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <CreditCard className="w-5 h-5 text-amber-600 mb-2" />
                  <p className="text-2xl font-bold">{overduePayments.length}</p>
                  <p className="text-xs text-muted-foreground">Bayaran Tertunggak</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <FileText className="w-5 h-5 text-rose-600 mb-2" />
                  <p className="text-2xl font-bold">{employer.contracts.length}</p>
                  <p className="text-xs text-muted-foreground">Kontrak</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <Video className="w-5 h-5 text-slate-600 mb-2" />
                  <p className="text-2xl font-bold">{latestCourses.length}</p>
                  <p className="text-xs text-muted-foreground">Kursus Baru</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Akses Pantas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickActions.map((a) => (
                    <Link key={a.href} href={a.href}>
                      <div className="flex flex-col items-center p-3 rounded-lg border-2 hover:border-primary hover:bg-primary/5 transition cursor-pointer h-full">
                        <a.icon className={`w-6 h-6 mb-2 ${a.color}`} />
                        <span className="text-xs font-medium text-center">{a.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Video Courses Section */}
        {latestCourses.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Kursus Video Terbaru
                </span>
                <Link href="/employer/video-courses">
                  <Button variant="ghost" size="sm">
                    Lihat Semua
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {latestCourses.map((c) => (
                  <Link
                    key={c.id}
                    href="/employer/video-courses"
                    className="group rounded-lg border p-3 hover:border-primary hover:bg-primary/5 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <PlayCircle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                          {c.title}
                        </p>
                        {c.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {c.category}
                          </Badge>
                        )}
                        {c.durationMinutes && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {c.durationMinutes} minit
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Helpers Section */}
        {latestHelpers.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" /> Pembantu Baru
                </span>
                <Link href="/employer/find-helper">
                  <Button variant="ghost" size="sm">
                    Cari Pembantu
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {latestHelpers.map((h) => (
                  <Link
                    key={h.id}
                    href="/employer/find-helper"
                    className="group rounded-lg border p-3 hover:border-primary hover:bg-primary/5 transition"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 overflow-hidden">
                        {h.profilePhoto ? (
                          <img
                            src={h.profilePhoto}
                            alt={h.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold">{getInitials(h.fullName)}</span>
                        )}
                      </div>
                      <p className="font-medium text-sm truncate w-full group-hover:text-primary">
                        {h.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getServiceLabel(h.serviceType)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{h.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Need Help */}
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-emerald-50/50">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Perlukan Bantuan?</h3>
              <p className="text-sm text-muted-foreground">
                Hubungi admin MIM melalui WhatsApp untuk sebarang pertanyaan.
              </p>
            </div>
            <a
              href={waCompanyLink(
                `Hai, saya ${employer.fullName} (majikan). Saya ingin bertanya tentang...`
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
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
