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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Briefcase,
  Plus,
  Phone,
  Mail,
  Search as SearchIcon,
  MessageCircle,
  MapPin,
} from 'lucide-react'
import {
  getServiceLabel,
  formatDate,
  formatMYR,
  getInitials,
  waLink,
} from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'active', label: 'Aktif' },
]

export default async function AdminEmployersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const sp = await searchParams
  const statusFilter = sp.status || 'all'
  const query = (sp.q || '').trim()

  const where: any = {}
  if (statusFilter !== 'all') where.status = statusFilter
  if (query) {
    where.OR = [
      { fullName: { contains: query } },
      { phone: { contains: query } },
      { email: { contains: query } },
    ]
  }

  const employers = await db.employer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
      active: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
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
              Pengurusan Majikan
            </h1>
            <p className="text-muted-foreground mt-1">
              {employers.length} majikan berdaftar di portal MIM.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/employers/new">
              <Plus className="w-4 h-4 mr-2" /> Tambah Majikan
            </Link>
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <form className="flex-1" action="/admin/employers" method="GET">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="q"
                    defaultValue={query}
                    placeholder="Cari nama, telefon, atau email..."
                    className="pl-10"
                  />
                  <input type="hidden" name="status" value={statusFilter} />
                </div>
              </form>
              <div className="flex flex-wrap gap-1">
                {STATUS_FILTERS.map((s) => (
                  <Link
                    key={s.value}
                    href={`/admin/employers?status=${s.value}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
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
            </div>
          </CardContent>
        </Card>

        {employers.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Majikan</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tiada majikan yang sepadan dengan penapis anda.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/employers/new">
                  <Plus className="w-4 h-4 mr-2" /> Tambah Majikan
                </Link>
              </Button>
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
                        <TableHead>Perkhidmatan</TableHead>
                        <TableHead>Gaji Tawaran</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Kontak</TableHead>
                        <TableHead>Daftar</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employers.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold">
                                  {getInitials(e.fullName)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {e.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {e.city ? `${e.city}, ` : ''}
                                  {e.state || '-'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {getServiceLabel(e.serviceType)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {e.salaryOffered ? formatMYR(e.salaryOffered) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusBadge(e.status)}>
                              {e.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{e.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[160px]">
                                {e.email || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(e.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {e.phone && (
                                <a
                                  href={waLink(
                                    e.phone,
                                    `Hai ${e.fullName}, ini admin MIM Portal...`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button size="sm" variant="outline">
                                    <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  </Button>
                                </a>
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
              {employers.map((e) => (
                <Card key={e.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold">
                            {getInitials(e.fullName)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {e.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getServiceLabel(e.serviceType)}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusBadge(e.status)}>{e.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Gaji Tawaran</p>
                        <p className="font-medium">
                          {e.salaryOffered ? formatMYR(e.salaryOffered) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Telefon</p>
                        <p className="font-medium">{e.phone || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium truncate">{e.email || '-'}</p>
                      </div>
                    </div>
                    {e.phone && (
                      <a
                        href={waLink(
                          e.phone,
                          `Hai ${e.fullName}, ini admin MIM Portal...`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <MessageCircle className="w-3 h-3 mr-1 text-emerald-600" />{' '}
                          WhatsApp
                        </Button>
                      </a>
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
