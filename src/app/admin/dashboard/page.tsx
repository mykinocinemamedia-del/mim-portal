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
  Users,
  Briefcase,
  FileText,
  Clock,
  AlertCircle,
  UserPlus,
  ClipboardList,
  CalendarClock,
  Plus,
  Search,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  User,
  CreditCard,
  Video,
  Stethoscope,
  GraduationCap,
  Bell,
  Sparkles,
} from 'lucide-react'
import {
  getServiceLabel,
  formatDate,
  formatMYR,
  getInitials,
} from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  // Calculate stats with error handling
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  let helpersTotal = 0, helpersActive = 0, helpersPending = 0, helpersEmployed = 0
  let employersTotal = 0, employersActive = 0, employersPending = 0
  let activeContracts = 0, pendingBookings = 0
  let newHelpersThisWeek = 0, newEmployersThisWeek = 0
  let overduePayments = 0
  let recentHelpers: any[] = []
  let recentEmployers: any[] = []
  let recentBookings: any[] = []

  try {
    // OPTIMIZED: Single raw SQL query for ALL counts (1 query instead of 8)
    const statsResult = await db.$queryRaw`
      SELECT
        (SELECT COUNT(*) FROM mim_helpers) as helpers_total,
        (SELECT COUNT(*) FROM mim_helpers WHERE status = 'active') as helpers_active,
        (SELECT COUNT(*) FROM mim_helpers WHERE status = 'pending') as helpers_pending,
        (SELECT COUNT(*) FROM mim_helpers WHERE status = 'employed') as helpers_employed,
        (SELECT COUNT(*) FROM mim_employers) as employers_total,
        (SELECT COUNT(*) FROM mim_employers WHERE status = 'active') as employers_active,
        (SELECT COUNT(*) FROM mim_employers WHERE status = 'pending') as employers_pending,
        (SELECT COUNT(*) FROM mim_contracts WHERE status = 'active') as active_contracts,
        (SELECT COUNT(*) FROM mim_bookings WHERE status = 'pending') as pending_bookings,
        (SELECT COUNT(*) FROM mim_payments WHERE status = 'overdue') as overdue_payments
    `.catch(() => null)

    if (statsResult && statsResult[0]) {
      const s = statsResult[0] as any
      helpersTotal = Number(s.helpers_total) || 0
      helpersActive = Number(s.helpers_active) || 0
      helpersPending = Number(s.helpers_pending) || 0
      helpersEmployed = Number(s.helpers_employed) || 0
      employersTotal = Number(s.employers_total) || 0
      employersActive = Number(s.employers_active) || 0
      employersPending = Number(s.employers_pending) || 0
      activeContracts = Number(s.active_contracts) || 0
      pendingBookings = Number(s.pending_bookings) || 0
      overduePayments = Number(s.overdue_payments) || 0
    }

    // Fetch recent items (3 queries, but small data)
    const [recentHelpersData, recentEmployersData, recentBookingsData] = await Promise.all([
      db.helper.findMany({ 
        orderBy: { createdAt: 'desc' }, take: 5,
        select: { id: true, fullName: true, serviceType: true, state: true, status: true, createdAt: true }
      }).catch(() => []),
      db.employer.findMany({ 
        orderBy: { createdAt: 'desc' }, take: 5,
        select: { id: true, fullName: true, serviceType: true, salaryOffered: true, status: true, createdAt: true }
      }).catch(() => []),
      db.booking.findMany({
        include: { helper: { select: { fullName: true } }, employer: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }).catch(() => []),
    ])
    recentHelpers = recentHelpersData
    recentEmployers = recentEmployersData
    recentBookings = recentBookingsData
  } catch (e: any) {
    console.error('Dashboard query error:', e.message)
  }

  const stats = [
    {
      label: 'Jumlah Pembantu',
      value: helpersTotal,
      sub: `${helpersActive} aktif · ${helpersPending} menunggu`,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/admin/helpers',
    },
    {
      label: 'Jumlah Majikan',
      value: employersTotal,
      sub: `${employersActive} aktif · ${employersPending} menunggu`,
      icon: Briefcase,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/admin/employers',
    },
    {
      label: 'Kontrak Aktif',
      value: activeContracts,
      sub: `${helpersEmployed} pembantu bekerja`,
      icon: FileText,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      href: '/admin/contracts',
    },
    {
      label: 'Tempahan Menunggu',
      value: pendingBookings,
      sub: 'Perlu tindakan padan',
      icon: Clock,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      href: '/admin/match',
    },
    {
      label: 'Pendaftaran Baru (7 hari)',
      value: newHelpersThisWeek + newEmployersThisWeek,
      sub: `${newHelpersThisWeek} pembantu · ${newEmployersThisWeek} majikan`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/admin/helpers',
    },
    {
      label: 'Pembayaran Tertunggak',
      value: overduePayments,
      sub: 'Perlu diingatkan majikan',
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      href: '/admin/bookings',
    },
  ]

  const quickActions = [
    {
      href: '/admin/helpers/new',
      label: 'Tambah Pembantu',
      icon: UserPlus,
      color: 'text-emerald-600',
    },
    {
      href: '/admin/employers/new',
      label: 'Tambah Majikan',
      icon: Briefcase,
      color: 'text-amber-600',
    },
    {
      href: '/admin/match',
      label: 'Padan & Tempahan',
      icon: Search,
      color: 'text-slate-600',
    },
    {
      href: '/admin/contracts',
      label: 'Jana Kontrak',
      icon: FileText,
      color: 'text-rose-600',
    },
    {
      href: '/admin/interviews',
      label: 'Jadual Temuduga',
      icon: Video,
      color: 'text-emerald-600',
    },
    {
      href: '/admin/whatsapp',
      label: 'Hantar WhatsApp',
      icon: MessageCircle,
      color: 'text-emerald-600',
    },
    {
      href: '/admin/notifications',
      label: 'Hantar Notifikasi',
      icon: Bell,
      color: 'text-amber-600',
    },
    {
      href: '/admin/medical',
      label: 'Rekod Perubatan',
      icon: Stethoscope,
      color: 'text-rose-600',
    },
  ]

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Selamat datang kembali, {session.name}. Berikut adalah gambaran
              keseluruhan portal MIM.
            </p>
          </div>
          <Badge className="bg-slate-700 text-white hover:bg-slate-700 self-start">
            <Sparkles className="w-3 h-3 mr-1" /> MATA Portal
          </Badge>
        </div>

        {/* Alert: pending bookings */}
        {pendingBookings > 0 && (
          <Card className="border-amber-300 bg-amber-50/50">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {pendingBookings} Tempahan Menunggu Padanan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sila semak dan padankan pembantu dengan majikan.
                  </p>
                </div>
              </div>
              <Button asChild size="sm">
                <Link href="/admin/match">
                  <Search className="w-4 h-4 mr-1" /> Padan Sekarang
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="border-0 shadow-sm hover:shadow-md transition h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">
                        {s.label}
                      </p>
                      <p className="text-3xl font-bold mt-1">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.sub}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}
                    >
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Akses Pantas</CardTitle>
            <CardDescription>
              Tindakan pantas untuk pengurusan harian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((a) => (
                <Link key={a.href} href={a.href}>
                  <div className="flex flex-col items-center p-3 rounded-lg border-2 hover:border-primary hover:bg-primary/5 transition cursor-pointer h-full">
                    <a.icon className={`w-6 h-6 mb-2 ${a.color}`} />
                    <span className="text-xs font-medium text-center">
                      {a.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Helpers */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Pembantu Baru
                </span>
                <Link href="/admin/helpers">
                  <Button variant="ghost" size="sm">
                    Lihat Semua
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentHelpers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada pendaftaran pembantu.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentHelpers.map((h) => (
                    <Link
                      key={h.id}
                      href={`/admin/helpers/${h.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center overflow-hidden shrink-0">
                        {h.profilePhoto ? (
                          <img
                            src={h.profilePhoto}
                            alt={h.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold">
                            {getInitials(h.fullName)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {h.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getServiceLabel(h.serviceType)} · {h.state || '-'}
                        </p>
                      </div>
                      <Badge
                        className={
                          h.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs'
                            : h.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-100 text-xs'
                        }
                      >
                        {h.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Employers */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-600" /> Majikan Baru
                </span>
                <Link href="/admin/employers">
                  <Button variant="ghost" size="sm">
                    Lihat Semua
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentEmployers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada pendaftaran majikan.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentEmployers.map((e) => (
                    <Link
                      key={e.id}
                      href={`/admin/employers`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold">
                          {getInitials(e.fullName)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {e.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getServiceLabel(e.serviceType)} ·{' '}
                          {e.salaryOffered
                            ? formatMYR(e.salaryOffered) + '/bln'
                            : '-'}
                        </p>
                      </div>
                      <Badge
                        className={
                          e.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs'
                            : e.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-100 text-xs'
                        }
                      >
                        {e.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings - Match Action */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-slate-600" /> Tempahan Terkini
              </span>
              <Link href="/admin/bookings">
                <Button variant="ghost" size="sm">
                  Lihat Semua
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Belum ada tempahan.
              </p>
            ) : (
              <div className="space-y-2">
                {recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {b.employer.fullName} → {b.helper.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getServiceLabel(b.serviceType)} ·{' '}
                          {b.salary ? formatMYR(b.salary) + '/bln' : '-'} ·{' '}
                          {formatDate(b.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        className={
                          b.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            : b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : b.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                        }
                      >
                        {b.status}
                      </Badge>
                      {b.status === 'pending' && (
                        <Button asChild size="sm">
                          <Link href="/admin/match">
                            <Search className="w-3 h-3 mr-1" /> Padan
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Contracts Overview */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" /> Kontrak Sedang
                Berjalan
              </span>
              <Link href="/admin/contracts">
                <Button variant="ghost" size="sm">
                  Urus Kontrak
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Kontrak Aktif</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {activeContracts}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-xs text-amber-700">Tempahan Menunggu</p>
                <p className="text-2xl font-bold text-amber-700">
                  {pendingBookings}
                </p>
              </div>
              <div className="rounded-lg bg-rose-50 p-3">
                <p className="text-xs text-rose-700">Bayaran Tertunggak</p>
                <p className="text-2xl font-bold text-rose-700">
                  {overduePayments}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3">
                <p className="text-xs text-slate-700">Pembantu Bekerja</p>
                <p className="text-2xl font-bold text-slate-700">
                  {helpersEmployed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
