import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarkReadButton } from './mark-read-button'
import { Bell, BellOff, CheckCheck, MessageCircle, Inbox } from 'lucide-react'
import { formatDateTime, waCompanyLink } from '@/lib/utils'

export default async function HelperNotificationsPage() {
  const session = await getSession()
  if (!session || session.role !== 'helper') {
    redirect('/helper/login')
  }

  const helper = await db.helper.findUnique({ where: { id: session.id } })
  if (!helper) redirect('/helper/login')

  const notifications = await db.notification.findMany({
    where: {
      OR: [{ helperId: session.id }, { userId: session.id, userType: 'helper' }],
    },
    orderBy: { createdAt: 'desc' },
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <DashboardShell role="helper" user={{ name: helper.fullName, email: helper.email || '' }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Notifikasi</h1>
            <p className="text-muted-foreground mt-1">
              Semua notifikasi dan pengumuman untuk anda.
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="self-start">
              <Bell className="w-3 h-3 mr-1" /> {unreadCount} belum dibaca
            </Badge>
          )}
        </div>

        {/* Notifications */}
        {notifications.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Notifikasi</h3>
              <p className="text-sm text-muted-foreground">
                Anda belum mempunyai sebarang notifikasi. Notifikasi akan muncul di sini apabila ada maklumat baru.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`border-0 shadow-sm transition ${
                  n.isRead ? 'bg-background' : 'bg-emerald-50/30 ring-1 ring-emerald-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${
                        n.isRead
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {n.isRead ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm leading-snug">{n.title}</h3>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" aria-label="Belum dibaca" />
                        )}
                      </div>
                      {n.message && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(n.createdAt)}
                        </p>
                        <div className="flex items-center gap-2">
                          {n.link && (
                            <Button asChild size="sm" variant="outline">
                              <a href={n.link}>Lihat</a>
                            </Button>
                          )}
                          {!n.isRead && (
                            <MarkReadButton notificationId={n.id} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help */}
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-amber-50/50">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Perlu Bantuan Lanjut?</h3>
                <p className="text-sm text-muted-foreground">
                  Hubungi admin MIM melalui WhatsApp untuk pertanyaan.
                </p>
              </div>
            </div>
            <a
              href={waCompanyLink('Saya ingin bertanya tentang notifikasi saya.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" /> Hubungi Admin
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
