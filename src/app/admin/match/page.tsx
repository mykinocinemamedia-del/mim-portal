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
import {
  Search as SearchIcon,
  Briefcase,
  User,
  MapPin,
  Star,
  Banknote,
  Calendar,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import {
  getServiceLabel,
  formatDate,
  formatMYR,
  getInitials,
  waLink,
} from '@/lib/utils'
import { MatchButton } from './match-button'

export const dynamic = 'force-dynamic'

export default async function AdminMatchPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  // Fetch pending bookings with employer & helper (LIMIT to 10 for performance)
  const pendingBookings = await db.booking.findMany({
    where: { status: 'pending' },
    include: { 
      employer: { select: { id: true, fullName: true, phone: true, state: true, serviceType: true, salaryOffered: true, city: true, numKids: true, kidsAges: true, criteria: true } },
      helper: { select: { id: true, fullName: true, serviceType: true, rating: true, city: true, state: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  }).catch(() => [])

  // Fetch ALL active helpers ONCE (instead of per-booking N+1 queries)
  const allActiveHelpers = await db.helper.findMany({
    where: { status: 'active' },
    select: { id: true, fullName: true, nickname: true, serviceType: true, desiredJob: true, rating: true, city: true, state: true, phone: true, liveIn: true, backAndForth: true, canBoth: true, age: true, religion: true, skills: true },
    orderBy: { rating: 'desc' },
    take: 50,
  }).catch(() => [])

  // Match helpers to bookings in memory (no DB queries)
  const bookingsWithMatches = pendingBookings.map((b) => {
    const serviceType = b.serviceType || b.employer?.serviceType
    const candidates = allActiveHelpers
      .filter(h => !serviceType || h.serviceType === serviceType || h.desiredJob === serviceType)
      .slice(0, 8)

    return {
      booking: b,
      matches: candidates,
    }
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
              Padan Pembantu &amp; Majikan
            </h1>
            <p className="text-muted-foreground mt-1">
              {pendingBookings.length} tempahan menunggu padanan.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/bookings">
              <ClipboardList className="w-4 h-4 mr-2" /> Semua Tempahan
            </Link>
          </Button>
        </div>

        {pendingBookings.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                Tiada Tempahan Menunggu
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Semua tempahan telah diproses. Semak halaman Tempahan untuk
                sejarah.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookingsWithMatches.map(({ booking: b, matches }) => (
              <Card key={b.id} className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Tempahan #{b.id.slice(-6)}
                    </span>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      Menunggu Padanan
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Employer info */}
                  <div className="rounded-lg bg-amber-50/50 border border-amber-100 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold">
                          {getInitials(b.employer.fullName)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {b.employer.fullName}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Briefcase className="w-3 h-3" />
                            {getServiceLabel(b.serviceType || b.employer.serviceType)}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Banknote className="w-3 h-3" />
                            {b.salary ? formatMYR(b.salary) + '/bln' : '-'}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {b.employer.city ? `${b.employer.city}, ` : ''}
                            {b.employer.state || '-'}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {b.startDate ? formatDate(b.startDate) : '-'}
                          </div>
                        </div>
                        {b.specialRequests && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Permintaan khas:</strong> {b.specialRequests}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Currently booked helper (if any) */}
                  {b.helper && (
                    <div className="rounded-lg bg-muted/30 p-3 flex items-center justify-between">
                      <div className="text-xs">
                        <p className="text-muted-foreground">
                          Pembantu Asal Tempahan
                        </p>
                        <p className="font-medium">
                          {b.helper.fullName} ·{' '}
                          {getServiceLabel(b.helper.serviceType)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Matching helpers */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <SearchIcon className="w-4 h-4 text-emerald-600" />
                      Pembantu Sepadan ({matches.length})
                    </h4>
                    {matches.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                        Tiada pembantu aktif yang sepadan dengan kriteria
                        perkhidmatan ini.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {matches.map((h) => (
                          <div
                            key={h.id}
                            className="rounded-lg border p-3 flex flex-col gap-2"
                          >
                            <div className="flex items-start gap-2">
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
                                  {getServiceLabel(h.serviceType)}
                                </p>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-medium">
                                  {h.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {h.city ? `${h.city}, ` : ''}
                              {h.state || h.workArea || '-'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {h.canBoth
                                  ? 'Kedua-duanya'
                                  : h.liveIn
                                  ? 'Live-in'
                                  : 'Back & Forth'}
                              </Badge>
                              {h.canRelocate && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  Boleh pindah
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="flex-1"
                              >
                                <Link href={`/admin/helpers/${h.id}`}>
                                  Lihat
                                </Link>
                              </Button>
                              <div className="flex-1">
                                <MatchButton
                                  bookingId={b.id}
                                  helperId={h.id}
                                  helperName={h.fullName}
                                  employerName={b.employer.fullName}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
