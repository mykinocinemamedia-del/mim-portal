import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Bell, BellOff, AlertCircle, Info, AlertTriangle, CheckCheck,
} from 'lucide-react'
import { NotificationActions } from './notification-actions'

export const dynamic = 'force-dynamic'

const severityConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  info: { label: 'Info', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Info },
  warning: { label: 'Amaran', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle },
  critical: { label: 'Kritikal', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: AlertCircle },
}

const categoryLabel: Record<string, string> = {
  match: 'Padanan',
  lead: 'Lead',
  payment: 'Pembayaran',
  contract: 'Kontrak',
  alert: 'Amaran',
  summary: 'Ringkasan',
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ severity?: string; read?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const sp = await searchParams
  const severity = sp.severity
  const readFilter = sp.read

  const where: {
    severity?: string
    isRead?: boolean
  } = {}
  if (severity) where.severity = severity
  if (readFilter === 'unread') where.isRead = false
  if (readFilter === 'read') where.isRead = true

  const [
    notifications, totalCount, unreadCount, infoCount, warningCount, criticalCount,
  ] = await Promise.all([
    db.agentNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.agentNotification.count(),
    db.agentNotification.count({ where: { isRead: false } }),
    db.agentNotification.count({ where: { severity: 'info' } }),
    db.agentNotification.count({ where: { severity: 'warning' } }),
    db.agentNotification.count({ where: { severity: 'critical' } }),
  ])

  return (
    <DashboardShell role="admin" user={{ name: session.name, email: session.email }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <Link href="/admin/agents" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3 h-3" /> Kembali ke AI Agents
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Bell className="w-7 h-7 text-primary" />
              Notifikasi Agents
            </h1>
            <p className="text-muted-foreground mt-1">
              Amaran dan maklumat yang dihantar oleh AI agents kepada admin
            </p>
          </div>
          {unreadCount > 0 && <NotificationActions mode="markAll" />}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Bell className="w-5 h-5 text-slate-600 mb-2" />
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Total Notifikasi</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <BellOff className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-xs text-muted-foreground">Belum Dibaca</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-2xl font-bold">{warningCount}</p>
              <p className="text-xs text-muted-foreground">Amaran</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <AlertCircle className="w-5 h-5 text-rose-600 mb-2" />
              <p className="text-2xl font-bold">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">Kritikal</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Keterukan:</span>
                <Link href="/admin/agents/notifications">
                  <Button variant={!severity ? 'default' : 'outline'} size="sm">Semua</Button>
                </Link>
                {Object.entries(severityConfig).map(([key, cfg]) => (
                  <Link key={key} href={`/admin/agents/notifications?severity=${key}${readFilter ? `&read=${readFilter}` : ''}`}>
                    <Button variant={severity === key ? 'default' : 'outline'} size="sm">
                      <cfg.icon className="w-3 h-3 mr-1" /> {cfg.label}
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2 md:ml-auto">
                <span className="text-sm font-medium">Status:</span>
                <Link href={`/admin/agents/notifications${severity ? `?severity=${severity}` : ''}`}>
                  <Button variant={!readFilter ? 'default' : 'outline'} size="sm">Semua</Button>
                </Link>
                <Link href={`/admin/agents/notifications?read=unread${severity ? `&severity=${severity}` : ''}`}>
                  <Button variant={readFilter === 'unread' ? 'default' : 'outline'} size="sm">
                    Belum Dibaca
                  </Button>
                </Link>
                <Link href={`/admin/agents/notifications?read=read${severity ? `&severity=${severity}` : ''}`}>
                  <Button variant={readFilter === 'read' ? 'default' : 'outline'} size="sm">
                    Sudah Dibaca
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Senarai Notifikasi
              <Badge variant="outline">{notifications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Semua notifikasi telah dibaca. Tiada notifikasi baharu.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {notifications.map((n) => {
                  const cfg = severityConfig[n.severity] || severityConfig.info
                  const Icon = cfg.icon
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${
                        n.isRead ? 'opacity-60' : ''
                      }`}
                    >
                      <div className={cfg.color}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" title="Belum dibaca" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
                          {n.agentName && (
                            <span className="font-medium text-foreground">{n.agentName}</span>
                          )}
                          <span>•</span>
                          <span>{categoryLabel[n.category] || n.category}</span>
                          <span>•</span>
                          <span>{new Date(n.createdAt).toLocaleString('ms-MY')}</span>
                          <Badge variant="outline" className={`text-xs ${cfg.color} border-current`}>
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {!n.isRead && <NotificationActions mode="single" notificationId={n.id} />}
                          {n.actionUrl && (
                            <Link href={n.actionUrl}>
                              <Button size="sm" variant="outline">
                                Lihat Detail
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
