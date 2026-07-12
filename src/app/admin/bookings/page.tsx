import { redirect } from 'next/navigation'
import Link from 'next/link'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ClipboardList,
  FileText,
  Eye,
  Search as SearchIcon,
} from 'lucide-react'
import {
  getServiceLabel,
  formatDate,
  formatMYR,
  getInitials,
} from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'confirmed', label: 'Disahkan' },
  { value: 'completed', label: 'Selesai' },
  { value: 'rejected', label: 'Ditolak' },
]

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const sp = await searchParams
  const statusFilter = sp.status || 'all'

  const where: any = {}
  if (statusFilter !== 'all') where.status = statusFilter

  const bookings = await db.booking.findMany({
    where,
    include: { helper: true, employer: true },
    orderBy: { createdAt: 'desc' },
  })

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
      confirmed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
      completed: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
      rejected: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
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
              Pengurusan Tempahan
            </h1>
            <p className="text-muted-foreground mt-1">
              {bookings.length} tempahan dalam sistem.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/match">
              <SearchIcon className="w-4 h-4 mr-2" /> Padan Pembantu
            </Link>
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-1">
              {STATUS_FILTERS.map((s) => (
                <Link
                  key={s.value}
                  href={`/admin/bookings?status=${s.value}`}
                >
                  <Button
                    size="sm"
                    variant={statusFilter === s.value ? 'default' : 'outline'}
                  >
                    {s.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {bookings.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Tempahan</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tiada tempahan dengan status ini.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-0 shadow-md hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Majikan</TableHead>
                        <TableHead>Pembantu</TableHead>
                        <TableHead>Perkhidmatan</TableHead>
                        <TableHead>Gaji</TableHead>
                        <TableHead>Tarikh Mula</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell>
                            <p className="font-medium text-sm">
                              {b.employer.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {b.employer.phone || '-'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center overflow-hidden shrink-0">
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
                              <span className="text-sm">
                                {b.helper.fullName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {getServiceLabel(b.serviceType)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.salary ? formatMYR(b.salary) : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.startDate ? formatDate(b.startDate) : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {b.durationMonths ? `${b.durationMonths} bulan` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusBadge(b.status)}>
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {b.status === 'pending' && (
                                <Button asChild size="sm">
                                  <Link href="/admin/match">
                                    <SearchIcon className="w-3 h-3 mr-1" /> Padan
                                  </Link>
                                </Button>
                              )}
                              {b.status === 'confirmed' && (
                                <Button asChild size="sm" variant="outline">
                                  <Link href="/admin/contracts">
                                    <FileText className="w-3 h-3 mr-1" /> Kontrak
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="md:hidden space-y-3">
              {bookings.map((b) => (
                <Card key={b.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {b.employer.fullName} → {b.helper.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getServiceLabel(b.serviceType)} ·{' '}
                          {b.salary ? formatMYR(b.salary) + '/bln' : '-'}
                        </p>
                      </div>
                      <Badge className={statusBadge(b.status)}>
                        {b.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Tarikh Mula</p>
                        <p className="font-medium">
                          {b.startDate ? formatDate(b.startDate) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Durasi</p>
                        <p className="font-medium">
                          {b.durationMonths ? `${b.durationMonths} bulan` : '-'}
                        </p>
                      </div>
                    </div>
                    {b.status === 'pending' && (
                      <Button asChild size="sm" className="w-full">
                        <Link href="/admin/match">
                          <SearchIcon className="w-3 h-3 mr-1" /> Padan
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}
