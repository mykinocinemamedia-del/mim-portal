import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { MessagesClient } from './messages-client'

export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const [messages, helpers, employers] = await Promise.all([
    db.message.findMany({
      where: { fromAdmin: true },
      include: { helper: true, employer: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.helper.findMany({
      select: { id: true, fullName: true, phone: true },
      orderBy: { fullName: 'asc' },
    }),
    db.employer.findMany({
      select: { id: true, fullName: true, phone: true },
      orderBy: { fullName: 'asc' },
    }),
  ])

  const messagesData = messages.map((m) => ({
    id: m.id,
    subject: m.subject,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    helperId: m.helperId,
    employerId: m.employerId,
    helperName: m.helper?.fullName || null,
    employerName: m.employer?.fullName || null,
  }))

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
      <MessagesClient
        helpers={helpersData}
        employers={employersData}
        messages={messagesData}
      />
    </DashboardShell>
  )
}
