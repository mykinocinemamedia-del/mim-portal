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
  Star,
  MapPin,
  Phone,
  Calendar,
  Briefcase,
  MessageCircle,
  Home as HomeIcon,
  Clock,
} from 'lucide-react'
import {
  getServiceLabel,
  formatDate,
  formatMYR,
  waCompanyLink,
  getInitials,
} from '@/lib/utils'

export default async function EmployerMyHelperPage() {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    redirect('/employer/login')
  }

  const employer = await db.employer.findUnique({ where: { id: session.id } })
  if (!employer) redirect('/employer/login')

  // Active bookings with confirmed or completed status
  const bookings = await db.booking.findMany({
    where: {
      employerId: session.id,
      status: { in: ['confirmed', 'completed'] },
    },
    include: { helper: true },
    orderBy: { startDate: 'desc' },
  })

  return (
    <DashboardShell
      role="employer"
      user={{ name: employer.fullName, email: employer.email || '' }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Pembantu Saya</h1>
            <p className="text-muted-foreground mt-1">
              Senarai pembantu yang sedang bekerja dengan anda.
            </p>
          </div>
          <Button asChild>
            <Link href="/employer/find-helper">
              <Users className="w-4 h-4 mr-2" /> Cari Pembantu Baru
            </Link>
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Belum Ada Pembantu</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Belum ada pembantu. Cari pembantu di Find Helper untuk mula
                menempah pembantu yang sesuai.
              </p>
              <Button asChild className="mt-4">
                <Link href="/employer/find-helper">
                  <Users className="w-4 h-4 mr-2" /> Cari Pembantu
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((b) => {
              const h = b.helper
              return (
                <Card key={b.id} className="border-0 shadow-md">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center overflow-hidden shrink-0">
                        {h.profilePhoto ? (
                          <img
                            src={h.profilePhoto}
                            alt={h.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold text-xl">
                            {getInitials(h.fullName)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base truncate">{h.fullName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {getServiceLabel(b.serviceType || h.serviceType)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-medium">
                              {h.rating.toFixed(1)}
                            </span>
                          </div>
                          <Badge
                            variant={b.status === 'confirmed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {b.status === 'confirmed' ? 'Aktif' : 'Selesai'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{h.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {h.city ? `${h.city}, ` : ''}
                          {h.state || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HomeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>
                          {b.liveIn ? 'Live-in' : 'Back & Forth'}
                        </span>
                      </div>
                      {b.salary && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>{formatMYR(b.salary)}/bulan</span>
                        </div>
                      )}
                      {b.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>Mula: {formatDate(b.startDate)}</span>
                        </div>
                      )}
                      {b.durationMonths && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>Tempoh: {b.durationMonths} bulan</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href="/employer/schedule">
                          <Calendar className="w-4 h-4 mr-1" /> Lihat Jadual
                        </Link>
                      </Button>
                      <a
                        href={waCompanyLink(
                          `Hai admin, saya ingin menghubungi pembantu saya, ${h.fullName}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full">
                          <MessageCircle className="w-4 h-4 mr-1" /> Hubungi Pembantu
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Help */}
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-emerald-50/50">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Ada Masalah dengan Pembantu?</h3>
              <p className="text-sm text-muted-foreground">
                Hubungi admin MIM untuk sebarang isu atau pertanyaan tentang pembantu
                anda.
              </p>
            </div>
            <a
              href={waCompanyLink(
                `Hai, saya ${employer.fullName} (majikan). Saya ingin bertanya tentang pembantu saya.`
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Admin
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
