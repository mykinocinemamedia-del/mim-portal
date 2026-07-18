import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { agentRegistry } from '@/lib/agents'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Bot, Play, Activity, Bell, Users, Briefcase, Heart, FileText,
  CreditCard, Calendar, MessageSquare, Sparkles, TrendingUp,
  AlertCircle, CheckCircle2, Clock, Zap, Brain, Target
} from 'lucide-react'
import { TriggerButton } from './trigger-button'

const categoryConfig: Record<string, { label: string; color: string; icon: any }> = {
  lead_gen: { label: 'Lead Generation', color: 'bg-emerald-100 text-emerald-700', icon: Target },
  onboarding: { label: 'Onboarding', color: 'bg-amber-100 text-amber-700', icon: Users },
  matching: { label: 'Matching', color: 'bg-rose-100 text-rose-700', icon: Heart },
  contract: { label: 'Contract', color: 'bg-blue-100 text-blue-700', icon: FileText },
  operations: { label: 'Operations', color: 'bg-purple-100 text-purple-700', icon: Calendar },
  support: { label: 'Support', color: 'bg-cyan-100 text-cyan-700', icon: MessageSquare },
  orchestrator: { label: 'Orchestrator', color: 'bg-slate-100 text-slate-700', icon: Brain },
}

export default async function AdminAgentsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  // Use static agent definitions from registry - NO DB queries for agent list
  const registryAgents = agentRegistry.getAll()

  // Start with registry data immediately (instant)
  let agents: any[] = registryAgents.map(a => ({
    id: a.name,
    name: a.name,
    displayName: a.displayName,
    description: a.description,
    category: a.category,
    status: 'idle' as string,
    schedule: a.schedule,
    lastRunAt: null as Date | null,
    nextRunAt: null as Date | null,
    totalRuns: 0,
    successCount: 0,
    errorCount: 0,
    activities: [] as any[],
    canRunManually: true,
  }))

  let totalLeads = 0, unreadNotifications = 0, pendingContracts = 0, overduePayments = 0
  let totalMatches = 0
  let newLeads = 0
  let highScoreMatches = 0
  let activeConversations = 0
  let convertedLeads = 0
  let contentDrafts = 0
  let notifications: any[] = []

  try {
    // SINGLE raw SQL for ALL counts (1 query instead of 11)
    const statsResult = await db.$queryRaw`
      SELECT
        (SELECT COUNT(*) FROM mim_leads) as total_leads,
        (SELECT COUNT(*) FROM mim_leads WHERE status = 'new') as new_leads,
        (SELECT COUNT(*) FROM mim_leads WHERE status = 'converted') as converted_leads,
        (SELECT COUNT(*) FROM mim_agent_notifications WHERE is_read = false) as unread_notifs,
        (SELECT COUNT(*) FROM mim_match_scores) as total_matches,
        (SELECT COUNT(*) FROM mim_match_scores WHERE score >= 85) as high_score_matches,
        (SELECT COUNT(*) FROM mim_conversations WHERE status = 'active') as active_convs,
        (SELECT COUNT(*) FROM mim_content_queue WHERE status = 'draft') as content_drafts,
        (SELECT COUNT(*) FROM mim_contracts WHERE status IN ('draft', 'pending')) as pending_contracts,
        (SELECT COUNT(*) FROM mim_payments WHERE status = 'overdue') as overdue_payments
    `.catch(() => null)

    if (statsResult && statsResult[0]) {
      const s = statsResult[0] as any
      totalLeads = Number(s.total_leads) || 0
      newLeads = Number(s.new_leads) || 0
      convertedLeads = Number(s.converted_leads) || 0
      unreadNotifications = Number(s.unread_notifs) || 0
      totalMatches = Number(s.total_matches) || 0
      highScoreMatches = Number(s.high_score_matches) || 0
      activeConversations = Number(s.active_convs) || 0
      contentDrafts = Number(s.content_drafts) || 0
      pendingContracts = Number(s.pending_contracts) || 0
      overduePayments = Number(s.overdue_payments) || 0
    }

    // Only 2 more queries: agents + notifications
    const [dbAgents, notifs] = await Promise.all([
      db.agent.findMany({
        select: { 
          id: true, name: true, displayName: true, description: true, category: true,
          status: true, schedule: true, lastRunAt: true, totalRuns: true,
          successCount: true, errorCount: true,
        },
        orderBy: { category: 'asc' },
      }).catch(() => []),
      db.agentNotification.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, message: true, agentName: true, severity: true, createdAt: true, actionUrl: true }
      }).catch(() => []),
    ])

    // Merge DB stats into registry agents if DB has data
    if (dbAgents.length > 0) {
      const dbMap = new Map<string, typeof dbAgents[number]>(
        dbAgents.map(a => [a.name, a] as const)
      )
      agents = agents.map(a => {
        const dbData = dbMap.get(a.name)
        return dbData ? { ...a, ...dbData, activities: [] } : a
      })
    }

    totalLeads = leadCount
    newLeads = newLeadsCount
    convertedLeads = convertedLeadsCount
    unreadNotifications = unreadNotifCount
    totalMatches = totalMatchCount
    highScoreMatches = highScoreMatchCount
    activeConversations = activeConvCount
    contentDrafts = contentDraftCount
    pendingContracts = pendingContractCount
    overduePayments = overduePaymentCount
    notifications = notifs
  } catch (e: any) {
    console.error('Agents page error:', e.message)
  }

  // Group agents by category
  const agentsByCategory = agents.reduce((acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = []
    acc[agent.category].push(agent)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <DashboardShell role="admin" user={{ name: session.name, email: session.email }}>
      <div className="space-y-6">
        {/* AI Agents Banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/images/about/ai-agents.png"
            alt="AI Agents"
            width={1344}
            height={768}
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="p-6 md:p-10 text-white max-w-lg">
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 mb-2">
                <Bot className="w-3 h-3 mr-1" /> Fully Autonomous
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Brain className="w-7 h-7 text-emerald-400" />
                AI Agents Dashboard
              </h1>
              <p className="text-slate-200 mt-1 text-sm md:text-base">
                {agents.length} AI agents berjalan secara autonomi untuk automate seluruh platform MIM Portal
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="gap-1">
                <Bell className="w-3 h-3" /> {unreadNotifications} notifikasi
              </Badge>
            )}
            <Link href="/admin/agents/notifications">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-1" /> Notifikasi
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Target className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">{totalLeads}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
              <p className="text-xs text-emerald-600 mt-1">{newLeads} baru</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Heart className="w-5 h-5 text-rose-600 mb-2" />
              <p className="text-2xl font-bold">{totalMatches}</p>
              <p className="text-xs text-muted-foreground">AI Matches</p>
              <p className="text-xs text-rose-600 mt-1">{highScoreMatches} score tinggi</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <FileText className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{pendingContracts}</p>
              <p className="text-xs text-muted-foreground">Kontrak Pending</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <CreditCard className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{overduePayments}</p>
              <p className="text-xs text-muted-foreground">Pembayaran Tertunggak</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <MessageSquare className="w-5 h-5 text-cyan-600 mb-2" />
              <p className="text-2xl font-bold">{activeConversations}</p>
              <p className="text-xs text-muted-foreground">Sembang Aktif</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" /> Notifikasi Terkini dari Agents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                  n.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                  n.severity === 'warning' ? 'bg-amber-50 border border-amber-200' :
                  'bg-muted/30'
                }`}>
                  {n.severity === 'critical' ? <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" /> :
                   n.severity === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" /> :
                   <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.agentName} • {new Date(n.createdAt).toLocaleString('ms-MY')}
                    </p>
                  </div>
                  {n.actionUrl && (
                    <Link href={n.actionUrl}>
                      <Button size="sm" variant="outline">Lihat</Button>
                    </Link>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Agents by Category */}
        {(Object.entries(agentsByCategory) as [string, any[]][]).map(([category, categoryAgents]) => {
          const config = categoryConfig[category] || categoryConfig.orchestrator
          const Icon = config.icon
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-semibold">{config.label}</h2>
                <Badge variant="outline">{categoryAgents.length} agents</Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAgents.map((agent) => {
                  const successRate = agent.totalRuns > 0
                    ? Math.round((agent.successCount / agent.totalRuns) * 100)
                    : 0
                  return (
                    <Card key={agent.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Bot className="w-4 h-4 text-primary" />
                              {agent.displayName}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {agent.description}
                            </CardDescription>
                          </div>
                          <Badge variant={
                            agent.status === 'running' ? 'default' :
                            agent.status === 'error' ? 'destructive' :
                            agent.status === 'paused' ? 'secondary' :
                            'outline'
                          }>
                            {agent.status === 'running' ? 'Berjalan' :
                             agent.status === 'error' ? 'Error' :
                             agent.status === 'paused' ? 'Paused' :
                             'Idle'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <p className="font-bold text-base">{agent.totalRuns}</p>
                            <p className="text-muted-foreground">Total Run</p>
                          </div>
                          <div>
                            <p className="font-bold text-base text-emerald-600">{successRate}%</p>
                            <p className="text-muted-foreground">Berjaya</p>
                          </div>
                          <div>
                            <p className="font-bold text-base text-rose-600">{agent.errorCount}</p>
                            <p className="text-muted-foreground">Gagal</p>
                          </div>
                        </div>

                        {/* Schedule */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{agent.schedule || 'Manual'}</span>
                        </div>

                        {/* Last run */}
                        {agent.lastRunAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Activity className="w-3 h-3" />
                            <span>Terakhir: {new Date(agent.lastRunAt).toLocaleString('ms-MY')}</span>
                          </div>
                        )}

                        {/* Recent activities */}
                        {agent.activities.length > 0 && (
                          <div className="pt-2 border-t space-y-1">
                            {agent.activities.slice(0, 2).map((a) => (
                              <div key={a.id} className="flex items-center gap-2 text-xs">
                                {a.status === 'success' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                )}
                                <span className="text-muted-foreground truncate">{a.action}</span>
                                <span className="text-muted-foreground ml-auto">
                                  {new Date(a.createdAt).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <TriggerButton agentName={agent.name} />
                          <Link href={`/admin/agents/${agent.name}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Activity className="w-3 h-3 mr-1" /> Detail
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Quick Links */}
        <Card className="border-0 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-xl">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Pantau & Kawal Agents
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/agents/leads" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Target className="w-5 h-5 mb-1" />
                <p className="text-sm font-medium">Leads</p>
                <p className="text-xs opacity-80">{totalLeads} total • {convertedLeads} converted</p>
              </Link>
              <Link href="/admin/agents/matches" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Heart className="w-5 h-5 mb-1" />
                <p className="text-sm font-medium">AI Matches</p>
                <p className="text-xs opacity-80">{highScoreMatches} high score</p>
              </Link>
              <Link href="/admin/agents/content" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Sparkles className="w-5 h-5 mb-1" />
                <p className="text-sm font-medium">Content</p>
                <p className="text-xs opacity-80">{contentDrafts} draft posts</p>
              </Link>
              <Link href="/admin/agents/activity" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Activity className="w-5 h-5 mb-1" />
                <p className="text-sm font-medium">Activity Log</p>
                <p className="text-xs opacity-80">Semua aktiviti agents</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
