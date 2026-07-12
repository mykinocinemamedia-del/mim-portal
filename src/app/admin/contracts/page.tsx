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
import { FileText } from 'lucide-react'
import {
  GenerateContractDialog,
  ContractCard,
  GenerateContractButton,
} from './contracts-client'

export const dynamic = 'force-dynamic'

const CONTRACT_TYPES = [
  {
    value: 'agency_helper',
    label: 'Agensi - Pembantu',
    desc: 'Kontrak antara MIM Agency dan Pembantu',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    value: 'agency_employer',
    label: 'Agensi - Majikan',
    desc: 'Kontrak antara MIM Agency dan Majikan',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    value: 'employer_helper',
    label: 'Majikan - Pembantu',
    desc: 'Kontrak antara Majikan dan Pembantu',
    color: 'bg-rose-100 text-rose-700',
  },
]

export default async function AdminContractsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const [contracts, helpers, employers, bookings] = await Promise.all([
    db.contract.findMany({
      include: { helper: true, employer: true, booking: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.helper.findMany({
      where: { status: { in: ['active', 'matched', 'employed'] } },
      select: { id: true, fullName: true, serviceType: true },
      orderBy: { fullName: 'asc' },
    }),
    db.employer.findMany({
      where: { status: { in: ['active', 'pending'] } },
      select: { id: true, fullName: true, serviceType: true },
      orderBy: { fullName: 'asc' },
    }),
    db.booking.findMany({
      where: { status: { in: ['confirmed', 'pending'] } },
      include: { helper: true, employer: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  // Serialize for client component
  const helpersData = helpers.map((h) => ({
    id: h.id,
    fullName: h.fullName,
    serviceType: h.serviceType,
  }))
  const employersData = employers.map((e) => ({
    id: e.id,
    fullName: e.fullName,
    serviceType: e.serviceType,
  }))
  const bookingsData = bookings.map((b) => ({
    id: b.id,
    helper: { fullName: b.helper.fullName },
    employer: { fullName: b.employer.fullName },
    serviceType: b.serviceType,
  }))
  const contractsData = contracts.map((c) => ({
    id: c.id,
    contractType: c.contractType,
    status: c.status,
    content: c.content,
    signedHelper: c.signedHelper,
    signedEmployer: c.signedEmployer,
    signedAdmin: c.signedAdmin,
    createdAt: c.createdAt,
    helper: c.helper ? { fullName: c.helper.fullName } : null,
    employer: c.employer ? { fullName: c.employer.fullName } : null,
  }))

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Pengurusan Kontrak
            </h1>
            <p className="text-muted-foreground mt-1">
              {contracts.length} kontrak dalam sistem. Jana, edit &amp; urus
              tandatangan.
            </p>
          </div>
          <GenerateContractButton
            helpers={helpersData}
            employers={employersData}
            bookings={bookingsData}
          />
        </div>

        {/* Contract Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CONTRACT_TYPES.map((t) => {
            const count = contracts.filter(
              (c) => c.contractType === t.value
            ).length
            return (
              <Card key={t.value} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <Badge className={t.color}>{count} kontrak</Badge>
                  <p className="font-semibold text-sm mt-2">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {contracts.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Kontrak</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Jana kontrak pertama anda dengan mengklik butang Jana Kontrak.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contractsData.map((c) => (
              <ContractCard key={c.id} contract={c} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
