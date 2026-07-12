import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import AdminNotificationsClient from './notifications-client'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const [helpers, employers, recentAdminNotifications] = await Promise.all([
    db.helper.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
    db.employer.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
    db.notification.findMany({
      where: { userType: { in: ['helper', 'employer'] } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ])

  const users = [
    ...helpers.map((h) => ({ id: h.id, fullName: h.fullName, type: 'helper' as const })),
    ...employers.map((e) => ({ id: e.id, fullName: e.fullName, type: 'employer' as const })),
  ]

  const recent = recentAdminNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    userType: n.userType,
  }))

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <AdminNotificationsClient users={users} recent={recent} />
    </DashboardShell>
  )
}
