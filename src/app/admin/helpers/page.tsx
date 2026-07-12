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
  Users,
  Plus,
  Eye,
  Pencil,
  MessageCircle,
  Phone,
  Mail,
  Star,
  Search as SearchIcon,
  Briefcase,
} from 'lucide-react'
import {
  getServiceLabel,
  formatDate,
  getInitials,
  waLink,
} from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'active', label: 'Aktif' },
  { value: 'matched', label: 'Dipadankan' },
  { value: 'employed', label: 'Bekerja' },
]

export default async function AdminHelpersPage({
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
      { nickname: { contains: query } },
    ]
  }

  const helpers = await db.helper.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50, // Limit to 50 per page for performance
    select: {
      id: true, fullName: true, serviceType: true, status: true,
      rating: true, city: true, state: true, phone: true, email: true,
      createdAt: true, _count: { select: { bookings: true } },
    },
  })

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
      active: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
      matched: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
      employed: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
    }
    return map[s] || 'bg-muted text-muted-foreground'
  }

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Pengurusan Pembantu
            </h1>
            <p className="text-muted-foreground mt-1">
              {helpers.length} pembantu berdaftar di portal MIM.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/helpers/new">
              <Plus className="w-4 h-4 mr-2" /> Tambah Pembantu
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <form className="flex-1" action="/admin/helpers" method="GET">
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
                  <Link key={s.value} href={`/admin/helpers?status=${s.value}${query ? `&q=${encodeURIComponent(query)}` : ''}`}>
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

        {/* Helpers Table */}
        {helpers.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                Tiada Pembantu Dijumpai
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tiada pembantu yang sepadan dengan penapis anda. Tambah pembantu
                baru secara manual atau ubah penapis.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/helpers/new">
                  <Plus className="w-4 h-4 mr-2" /> Tambah Pembantu
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <Card className="border-0 shadow-md hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Pembantu</TableHead>
                        <TableHead>Perkhidmatan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Penarafan</TableHead>
                        <TableHead>Kawasan</TableHead>
                        <TableHead>Kontak</TableHead>
                        <TableHead>Daftar</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {helpers.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {h.fullName}
                                </p>
                                {h.nickname && (
                                  <p className="text-xs text-muted-foreground">
                                    {h.nickname}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {getServiceLabel(h.serviceType)}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusBadge(h.status)}>
                              {h.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-medium">
                                {h.rating.toFixed(1)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {h.city ? `${h.city}, ` : ''}
                            {h.state || h.workArea || '-'}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span>{h.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[160px]">
                                {h.email || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(h.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/helpers/${h.id}`}>
                                  <Eye className="w-3 h-3" />
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/helpers/${h.id}?edit=1`}>
                                  <Pencil className="w-3 h-3" />
                                </Link>
                              </Button>
                              {h.phone && (
                                <a
                                  href={waLink(
                                    h.phone,
                                    `Hai ${h.fullName}, ini admin MIM Portal. Saya ingin menghubungi anda tentang...`
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {helpers.map((h) => (
                <Card key={h.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center overflow-hidden shrink-0">
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
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {h.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getServiceLabel(h.serviceType)}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusBadge(h.status)}>{h.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Telefon</p>
                        <p className="font-medium">{h.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Penarafan</p>
                        <p className="font-medium">
                          ⭐ {h.rating.toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Kawasan</p>
                        <p className="font-medium">
                          {h.city ? `${h.city}, ` : ''}
                          {h.state || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Daftar</p>
                        <p className="font-medium">
                          {formatDate(h.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/admin/helpers/${h.id}`}>
                          <Eye className="w-3 h-3 mr-1" /> Lihat
                        </Link>
                      </Button>
                      {h.phone && (
                        <a
                          href={waLink(
                            h.phone,
                            `Hai ${h.fullName}, ini admin MIM Portal...`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <MessageCircle className="w-3 h-3 mr-1 text-emerald-600" />{' '}
                            WhatsApp
                          </Button>
                        </a>
                      )}
                    </div>
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
