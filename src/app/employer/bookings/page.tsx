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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ClipboardList,
  Plus,
  Calendar,
  Briefcase,
  MessageCircle,
  Search as SearchIcon,
} from 'lucide-react'
import {
  getServiceLabel,
  formatDate,
  formatMYR,
  waCompanyLink,
  getInitials,
} from '@/lib/utils'

const STATUS_INFO: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: 'Menunggu',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  confirmed: {
    label: 'Disahkan',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
  },
  completed: {
    label: 'Selesai',
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
}

export default async function EmployerBookingsPage() {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    redirect('/employer/login')
  }

  const employer = await db.employer.findUnique({ where: { id: session.id } })
  if (!employer) redirect('/employer/login')

  const bookings = await db.booking.findMany({
    where: { employerId: session.id },
    include: { helper: true },
    orderBy: { createdAt: 'desc' },
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
            <h1 className="text-2xl md:text-3xl font-bold">Tempahan Saya</h1>
            <p className="text-muted-foreground mt-1">
              Senarai semua tempahan pembantu yang anda buat.
            </p>
          </div>
          <Button asChild>
            <Link href="/employer/find-helper">
              <Plus className="w-4 h-4 mr-2" /> Buat Tempahan Baru
            </Link>
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Belum Ada Tempahan</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Anda belum membuat sebarang tempahan. Cari pembantu yang sesuai dan
                buat tempahan pertama anda.
              </p>
              <Button asChild className="mt-4">
                <Link href="/employer/find-helper">
                  <SearchIcon className="w-4 h-4 mr-2" /> Cari Pembantu
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <Card className="border-0 shadow-md hidden md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pembantu</TableHead>
                      <TableHead>Perkhidmatan</TableHead>
                      <TableHead>Gaji/Bulan</TableHead>
                      <TableHead>Tarikh Mula</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => {
                      const status = STATUS_INFO[b.status] || {
                        label: b.status,
                        className: 'bg-muted text-muted-foreground',
                      }
                      return (
                        <TableRow key={b.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center overflow-hidden shrink-0">
                                {b.helper.profilePhoto ? (
                                  <img
                                    src={b.helper.profilePhoto}
                                    alt={b.helper.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold">
                                    {getInitials(b.helper.fullName)}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium text-sm">
                                {b.helper.fullName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {getServiceLabel(b.serviceType || b.helper.serviceType)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.salary ? formatMYR(b.salary) : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.startDate ? formatDate(b.startDate) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={status.className}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <a
                              href={waCompanyLink(
                                `Hai admin, saya ingin bertanya tentang tempahan saya untuk ${b.helper.fullName}.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline">
                                <MessageCircle className="w-3 h-3 mr-1" /> Pertanyaan
                              </Button>
                            </a>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {bookings.map((b) => {
                const status = STATUS_INFO[b.status] || {
                  label: b.status,
                  className: 'bg-muted text-muted-foreground',
                }
                return (
                  <Card key={b.id} className="border-0 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center overflow-hidden shrink-0">
                            {b.helper.profilePhoto ? (
                              <img
                                src={b.helper.profilePhoto}
                                alt={b.helper.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold">
                                {getInitials(b.helper.fullName)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{b.helper.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {getServiceLabel(b.serviceType || b.helper.serviceType)}
                            </p>
                          </div>
                        </div>
                        <Badge className={status.className}>{status.label}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Gaji</p>
                          <p className="font-medium">
                            {b.salary ? formatMYR(b.salary) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tarikh Mula</p>
                          <p className="font-medium">
                            {b.startDate ? formatDate(b.startDate) : '-'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Help */}
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-emerald-50/50">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Ada Soalan tentang Tempahan?</h3>
              <p className="text-sm text-muted-foreground">
                Hubungi admin MIM untuk pertanyaan tentang status tempahan anda.
              </p>
            </div>
            <a
              href={waCompanyLink(
                `Hai, saya ${employer.fullName} (majikan). Saya ingin bertanya tentang tempahan saya.`
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
