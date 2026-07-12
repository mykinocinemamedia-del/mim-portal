import { redirect } from 'next/navigation'
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
  CreditCard,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
} from 'lucide-react'
import {
  formatDate,
  formatMYR,
  waCompanyLink,
  getInitials,
} from '@/lib/utils'

const STATUS_INFO: Record<string, { label: string; className: string; icon: any }> = {
  pending: {
    label: 'Belum Dibayar',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    icon: Clock,
  },
  paid: {
    label: 'Dibayar',
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    icon: CheckCircle2,
  },
  overdue: {
    label: 'Tertunggak',
    className: 'bg-rose-100 text-rose-700 hover:bg-rose-100',
    icon: AlertCircle,
  },
}

export default async function EmployerPaymentsPage() {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    redirect('/employer/login')
  }

  const employer = await db.employer.findUnique({ where: { id: session.id } })
  if (!employer) redirect('/employer/login')

  const payments = await db.payment.findMany({
    where: { employerId: session.id },
    include: { helper: true },
    orderBy: { dueDate: 'desc' },
  })

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payments
    .filter((p) => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <DashboardShell
      role="employer"
      user={{ name: employer.fullName, email: employer.email || '' }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Sejarah Pembayaran</h1>
            <p className="text-muted-foreground mt-1">
              Senarai semua pembayaran gaji pembantu.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Dibayar
                </Badge>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{formatMYR(totalPaid)}</p>
              <p className="text-xs text-muted-foreground">Jumlah Dibayar</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <Clock className="w-5 h-5 text-amber-600" />
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  Menunggu
                </Badge>
              </div>
              <p className="text-2xl font-bold text-amber-700">{formatMYR(totalPending)}</p>
              <p className="text-xs text-muted-foreground">Jumlah Belum Dibayar</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-rose-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                  Tertunggak
                </Badge>
              </div>
              <p className="text-2xl font-bold text-rose-700">{formatMYR(totalOverdue)}</p>
              <p className="text-xs text-muted-foreground">Jumlah Tertunggak</p>
            </CardContent>
          </Card>
        </div>

        {payments.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Pembayaran</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Anda belum mempunyai sebarang rekod pembayaran. Pembayaran akan
                dipaparkan di sini apabila pembantu anda mula bekerja.
              </p>
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
                      <TableHead>Tarikh Akhir</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Pembantu</TableHead>
                      <TableHead>Kaedah</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => {
                      const status = STATUS_INFO[p.status] || {
                        label: p.status,
                        className: 'bg-muted text-muted-foreground',
                        icon: Clock,
                      }
                      const needsPayment = p.status === 'pending' || p.status === 'overdue'
                      const waMessage = `Hai admin, saya ${employer.fullName}. Saya ingin membuat pembayaran gaji ${formatMYR(p.amount)} untuk ${p.helper?.fullName || 'pembantu'} (tarikh akhir: ${formatDate(p.dueDate)}).`
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm">
                            {formatDate(p.dueDate)}
                          </TableCell>
                          <TableCell className="text-sm font-semibold">
                            {formatMYR(p.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center overflow-hidden shrink-0">
                                {p.helper?.profilePhoto ? (
                                  <img
                                    src={p.helper.profilePhoto}
                                    alt={p.helper.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-semibold">
                                    {getInitials(p.helper?.fullName || '?')}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm">
                                {p.helper?.fullName || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {p.method || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={status.className}>
                              <status.icon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {needsPayment ? (
                              <a
                                href={waCompanyLink(waMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="default">
                                  <MessageCircle className="w-3 h-3 mr-1" /> Bayar Sekarang
                                </Button>
                              </a>
                            ) : p.paidDate ? (
                              <span className="text-xs text-muted-foreground">
                                Dibayar: {formatDate(p.paidDate)}
                              </span>
                            ) : null}
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
              {payments.map((p) => {
                const status = STATUS_INFO[p.status] || {
                  label: p.status,
                  className: 'bg-muted text-muted-foreground',
                  icon: Clock,
                }
                const needsPayment = p.status === 'pending' || p.status === 'overdue'
                const waMessage = `Hai admin, saya ${employer.fullName}. Saya ingin membuat pembayaran gaji ${formatMYR(p.amount)} untuk ${p.helper?.fullName || 'pembantu'} (tarikh akhir: ${formatDate(p.dueDate)}).`
                return (
                  <Card key={p.id} className="border-0 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {formatMYR(p.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tarikh akhir: {formatDate(p.dueDate)}
                          </p>
                        </div>
                        <Badge className={status.className}>
                          <status.icon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center overflow-hidden shrink-0">
                          {p.helper?.profilePhoto ? (
                            <img
                              src={p.helper.profilePhoto}
                              alt={p.helper.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-semibold">
                              {getInitials(p.helper?.fullName || '?')}
                            </span>
                          )}
                        </div>
                        <span className="text-sm">{p.helper?.fullName || '-'}</span>
                      </div>
                      {needsPayment && (
                        <a
                          href={waCompanyLink(waMessage)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="w-full">
                            <MessageCircle className="w-3 h-3 mr-1" /> Bayar Sekarang
                          </Button>
                        </a>
                      )}
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
              <h3 className="font-semibold mb-1">Ada Soalan tentang Pembayaran?</h3>
              <p className="text-sm text-muted-foreground">
                Hubungi admin MIM untuk pertanyaan tentang pembayaran gaji pembantu.
              </p>
            </div>
            <a
              href={waCompanyLink(
                `Hai, saya ${employer.fullName} (majikan). Saya ingin bertanya tentang pembayaran saya.`
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
