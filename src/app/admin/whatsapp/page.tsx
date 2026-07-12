import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import AdminWhatsAppClient from './whatsapp-client'

export const dynamic = 'force-dynamic'

export default async function AdminWhatsAppPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const [helpers, employers] = await Promise.all([
    db.helper.findMany({
      select: { id: true, fullName: true, phone: true },
      orderBy: { fullName: 'asc' },
    }),
    db.employer.findMany({
      select: { id: true, fullName: true, phone: true },
      orderBy: { fullName: 'asc' },
    }),
  ])

  const helpersData = helpers.map((h) => ({
    id: h.id,
    fullName: h.fullName,
    phone: h.phone,
  }))
  const employersData = employers.map((e) => ({
    id: e.id,
    fullName: e.fullName,
    phone: e.phone,
  }))

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <AdminWhatsAppClient helpers={helpersData} employers={employersData} />
    </DashboardShell>
  )
}
