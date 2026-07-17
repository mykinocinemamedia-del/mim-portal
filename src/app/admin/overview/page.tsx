import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users, Briefcase, FileText, CreditCard, Bot, AlertCircle,
  CheckCircle2, Clock, TrendingUp, Search, ArrowRight,
  UserCheck, UserPlus, Calendar, Zap, MessageCircle
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  let stats: any = {}
  try {
    const result = await db.$queryRaw`
      SELECT
        (SELECT COUNT(*) FROM mim_helpers) as helpers_total,
        (SELECT COUNT(*) FROM mim_helpers WHERE status = 'active') as helpers_active,
        (SELECT COUNT(*) FROM mim_helpers WHERE status = 'pending') as helpers_pending,
        (SELECT COUNT(*) FROM mim_helpers WHERE status = 'employed') as helpers_employed,
        (SELECT COUNT(*) FROM mim_employers) as employers_total,
        (SELECT COUNT(*) FROM mim_employers WHERE status = 'active') as employers_active,
        (SELECT COUNT(*) FROM mim_employers WHERE status = 'pending') as employers_pending,
        (SELECT COUNT(*) FROM mim_bookings WHERE status = 'pending') as bookings_pending,
        (SELECT COUNT(*) FROM mim_bookings WHERE status = 'confirmed') as bookings_confirmed,
        (SELECT COUNT(*) FROM mim_contracts WHERE status = 'active') as contracts_active,
        (SELECT COUNT(*) FROM mim_contracts WHERE status = 'draft') as contracts_draft,
        (SELECT COUNT(*) FROM mim_payments WHERE status = 'pending') as payments_pending,
        (SELECT COUNT(*) FROM mim_payments WHERE status = 'overdue') as payments_overdue,
        (SELECT COUNT(*) FROM mim_payments WHERE status = 'paid') as payments_paid,
        (SELECT COUNT(*) FROM mim_leads) as leads_total,
        (SELECT COUNT(*) FROM mim_leads WHERE status = 'new') as leads_new,
        (SELECT COUNT(*) FROM mim_match_scores WHERE score >= 85) as matches_high,
        (SELECT COUNT(*) FROM mim_agent_notifications WHERE is_read = false) as unread_alerts
    `.catch(() => null)
    if (result && result[0]) {
      const s = result[0] as any
      stats = {
        helpers: { total: Number(s.helpers_total), active: Number(s.helpers_active), pending: Number(s.helpers_pending), employed: Number(s.helpers_employed) },
        employers: { total: Number(s.employers_total), active: Number(s.employers_active), pending: Number(s.employers_pending) },
        bookings: { pending: Number(s.bookings_pending), confirmed: Number(s.bookings_confirmed) },
        contracts: { active: Number(s.contracts_active), draft: Number(s.contracts_draft) },
        payments: { pending: Number(s.payments_pending), overdue: Number(s.payments_overdue), paid: Number(s.payments_paid) },
        leads: { total: Number(s.leads_total), new: Number(s.leads_new) },
        matches: { high: Number(s.matches_high) },
        alerts: Number(s.unread_alerts),
      }
    }
  } catch (e) {}

  const kanbanColumns = [
    {
      title: 'Pendaftaran Baru',
      icon: UserPlus,
      color: 'border-blue-500/30 bg-blue-500/5',
      iconColor: 'text-blue-400',
      items: [
        { label: 'Pembantu Pending', value: stats.helpers?.pending || 0, link: '/admin/helpers?status=pending' },
        { label: 'Majikan Pending', value: stats.employers?.pending || 0, link: '/admin/employers?status=pending' },
        { label: 'Leads Baru', value: stats.leads?.new || 0, link: '/admin/agents/leads?status=new' },
      ]
    },
    {
      title: 'Matching',
      icon: Search,
      color: 'border-cyan-500/30 bg-cyan-500/5',
      iconColor: 'text-cyan-400',
      items: [
        { label: 'Bookings Pending', value: stats.bookings?.pending || 0, link: '/admin/bookings?status=pending' },
        { label: 'High Score Matches', value: stats.matches?.high || 0, link: '/admin/agents/matches?minScore=85' },
        { label: 'Perlu Padan', value: stats.bookings?.pending || 0, link: '/admin/match' },
      ]
    },
    {
      title: 'Kontrak',
      icon: FileText,
      color: 'border-amber-500/30 bg-amber-500/5',
      iconColor: 'text-amber-400',
      items: [
        { label: 'Kontrak Draft', value: stats.contracts?.draft || 0, link: '/admin/contracts' },
        { label: 'Kontrak Aktif', value: stats.contracts?.active || 0, link: '/admin/contracts' },
        { label: 'Bookings Confirmed', value: stats.bookings?.confirmed || 0, link: '/admin/bookings' },
      ]
    },
    {
      title: 'Pembayaran',
      icon: CreditCard,
      color: 'border-rose-500/30 bg-rose-500/5',
      iconColor: 'text-rose-400',
      items: [
        { label: 'Pending Payment', value: stats.payments?.pending || 0, link: '/admin/bookings' },
        { label: 'Overdue', value: stats.payments?.overdue || 0, link: '/admin/bookings' },
        { label: 'Paid', value: stats.payments?.paid || 0, link: '/admin/bookings' },
      ]
    },
  ]

  const quickStats = [
    { label: 'Total Pembantu', value: stats.helpers?.total || 0, sub: `${stats.helpers?.active || 0} aktif`, icon: Users, color: 'text-emerald-400', link: '/admin/helpers' },
    { label: 'Total Majikan', value: stats.employers?.total || 0, sub: `${stats.employers?.active || 0} aktif`, icon: Briefcase, color: 'text-amber-400', link: '/admin/employers' },
    { label: 'Kontrak Aktif', value: stats.contracts?.active || 0, sub: `${stats.contracts?.draft || 0} draft`, icon: FileText, color: 'text-rose-400', link: '/admin/contracts' },
    { label: 'AI Alerts', value: stats.alerts || 0, sub: 'unread', icon: Bot, color: 'text-cyan-400', link: '/admin/agents/notifications' },
  ]

  // Fetch recent alerts
  let recentAlerts: any[] = []
  try {
    recentAlerts = await db.agentNotification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
  } catch {}

  return (
    <DashboardShell role="admin" user={{ name: session.name, email: session.email }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Zap className="w-7 h-7 text-[#00bcd4]" />
              Overview Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Kanban view of entire platform - AI automated pipeline</p>
          </div>
          <Link href="/admin/agents">
            <Button variant="outline" size="sm" className="border-[#00bcd4]/30 text-[#00bcd4] hover:bg-[#00bcd4]/10">
              <Bot className="w-4 h-4 mr-1" /> AI Agents
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((s, i) => (
            <Link key={i} href={s.link}>
              <Card className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                  </div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Kanban Pipeline */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00bcd4]" />
            Pipeline Overview (Kanban)
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
            {kanbanColumns.map((col, i) => (
              <div key={i} className={`rounded-xl border ${col.color} p-4 min-w-[250px]`}>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                  <col.icon className={`w-5 h-5 ${col.iconColor}`} />
                  <h3 className="font-semibold text-white text-sm">{col.title}</h3>
                </div>
                <div className="space-y-2">
                  {col.items.map((item, j) => (
                    <Link key={j} href={item.link}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
                        <p className="text-sm text-slate-300">{item.label}</p>
                        <Badge variant="outline" className="text-lg font-bold border-white/20 text-white">
                          {item.value}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border border-white/10 glass-dark">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Recent AI Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAlerts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No unread alerts</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentAlerts.map((n) => (
                    <div key={n.id} className={`p-3 rounded-lg ${
                      n.severity === 'critical' ? 'bg-rose-500/10 border border-rose-500/20' :
                      n.severity === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
                      'bg-white/5 border border-white/10'
                    }`}>
                      <p className="text-sm text-white font-medium">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{(n.message || '').slice(0, 100)}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {n.agentName} • {new Date(n.createdAt).toLocaleString('ms-MY', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-white/10 glass-dark">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00bcd4]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Link href="/admin/helpers/new">
                <Button variant="outline" size="sm" className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5">
                  <UserPlus className="w-4 h-4 mr-2" /> Add Helper
                </Button>
              </Link>
              <Link href="/admin/employers/new">
                <Button variant="outline" size="sm" className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5">
                  <Briefcase className="w-4 h-4 mr-2" /> Add Employer
                </Button>
              </Link>
              <Link href="/admin/match">
                <Button variant="outline" size="sm" className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5">
                  <Search className="w-4 h-4 mr-2" /> Match
                </Button>
              </Link>
              <Link href="/admin/contracts">
                <Button variant="outline" size="sm" className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5">
                  <FileText className="w-4 h-4 mr-2" /> Contracts
                </Button>
              </Link>
              <Link href="/admin/upload-maids">
                <Button variant="outline" size="sm" className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5">
                  <UserPlus className="w-4 h-4 mr-2" /> Upload CSV
                </Button>
              </Link>
              <Link href="/admin/whatsapp">
                <Button variant="outline" size="sm" className="w-full justify-start border-white/10 text-slate-300 hover:bg-white/5">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
