import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { agentRegistry } from '@/lib/agents'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft, Bot, Activity, Clock, CheckCircle2, AlertCircle,
  Zap, TrendingUp, Settings, Calendar, Brain, Cpu,
} from 'lucide-react'
import { TriggerButton } from '../trigger-button'
import { ActivityDetail } from '../activity/activity-detail'

export const dynamic = 'force-dynamic'

const categoryConfig: Record<string, { label: string; color: string }> = {
  lead_gen: { label: 'Lead Generation', color: 'bg-emerald-100 text-emerald-700' },
  onboarding: { label: 'Onboarding', color: 'bg-amber-100 text-amber-700' },
  matching: { label: 'Matching', color: 'bg-rose-100 text-rose-700' },
  contract: { label: 'Contract', color: 'bg-blue-100 text-blue-700' },
  operations: { label: 'Operations', color: 'bg-purple-100 text-purple-700' },
  support: { label: 'Support', color: 'bg-cyan-100 text-cyan-700' },
  orchestrator: { label: 'Orchestrator', color: 'bg-slate-100 text-slate-700' },
}

function formatDuration(ms: number | null) {
  if (ms === null) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const { name } = await params

  // Ensure all agents are registered
  for (const agent of agentRegistry.getAll()) {
    await agent.register()
  }

  const agent = await db.agent.findUnique({
    where: { name },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!agent) {
    notFound()
  }

  const successRate = agent.totalRuns > 0
    ? Math.round((agent.successCount / agent.totalRuns) * 100)
    : 0

  const errorRate = agent.totalRuns > 0
    ? Math.round((agent.errorCount / agent.totalRuns) * 100)
    : 0

  // Parse config
  let config: any = null
  try {
    config = agent.config ? JSON.parse(agent.config) : null
  } catch {
    config = agent.config
  }

  // Compute last 10 runs success rate sparkline data
  const lastActivities = [...agent.activities].reverse().slice(-10)
  const sparklineData = lastActivities.map((a) => (a.status === 'success' ? 100 : 0))
  const recentSuccessRate = lastActivities.length > 0
    ? Math.round((lastActivities.filter((a) => a.status === 'success').length / lastActivities.length) * 100)
    : 0

  const cfg = categoryConfig[agent.category] || categoryConfig.orchestrator

  return (
    <DashboardShell role="admin" user={{ name: session.name, email: session.email }}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/admin/agents" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Kembali ke AI Agents
          </Link>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl ${cfg.color} flex items-center justify-center`}>
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  {agent.displayName}
                </h1>
                <p className="text-muted-foreground mt-1">{agent.description}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
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
                  {agent.schedule && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {agent.schedule}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <TriggerButton agentName={agent.name} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Zap className="w-5 h-5 text-slate-600 mb-2" />
              <p className="text-2xl font-bold">{agent.totalRuns}</p>
              <p className="text-xs text-muted-foreground">Total Run</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{successRate}%</p>
              <p className="text-xs text-muted-foreground">Kadar Berjaya</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <AlertCircle className="w-5 h-5 text-rose-600 mb-2" />
              <p className="text-2xl font-bold text-rose-600">{agent.errorCount}</p>
              <p className="text-xs text-muted-foreground">Gagal</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Clock className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-sm font-bold">
                {agent.lastRunAt
                  ? new Date(agent.lastRunAt).toLocaleString('ms-MY', {
                      day: '2-digit', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : 'Belum pernah'}
              </p>
              <p className="text-xs text-muted-foreground">Terakhir Dijalankan</p>
            </CardContent>
          </Card>
        </div>

        {/* Success Rate Visualization */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Visualisasi Kadar Berjaya
              </CardTitle>
              <CardDescription>10 aktiviti terkini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Big number */}
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-3xl font-bold text-emerald-600">{successRate}%</span>
                  <span className="text-sm text-muted-foreground">
                    {agent.successCount}/{agent.totalRuns} berjaya
                  </span>
                </div>
                <Progress value={successRate} className="h-3" />
              </div>

              {/* Sparkline */}
              {sparklineData.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Trend aktiviti terkini ({recentSuccessRate}% berjaya dalam 10 terkini)
                  </p>
                  <div className="flex items-end gap-1 h-16">
                    {sparklineData.map((v, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${v === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ height: `${v === 100 ? '100%' : '40%'}` }}
                        title={v === 100 ? 'Berjaya' : 'Gagal'}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Status breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Berjaya
                    </span>
                    <span className="font-bold">{successRate}%</span>
                  </div>
                  <Progress value={successRate} className="h-2 bg-emerald-100" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Gagal
                    </span>
                    <span className="font-bold">{errorRate}%</span>
                  </div>
                  <Progress value={errorRate} className="h-2 bg-rose-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" /> Konfigurasi Agent
              </CardTitle>
              <CardDescription>Tetapan dan maklumat teknikal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Nama Sistem</p>
                  <p className="text-sm font-mono font-medium">{agent.name}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Kategori</p>
                  <p className="text-sm font-medium">{cfg.label}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Jadual</p>
                  <p className="text-sm font-medium">{agent.schedule || 'Manual'}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium capitalize">{agent.status}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground">Dicipta</p>
                  <p className="text-sm font-medium">
                    {new Date(agent.createdAt).toLocaleDateString('ms-MY')}
                  </p>
                </div>
                {agent.nextRunAt && (
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Jadual Seterusnya</p>
                    <p className="text-sm font-medium">
                      {new Date(agent.nextRunAt).toLocaleString('ms-MY')}
                    </p>
                  </div>
                )}
              </div>

              {config && (
                <div>
                  <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Config JSON
                  </p>
                  <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto max-h-40">
                    {typeof config === 'string' ? config : JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" /> Aktiviti Terkini
              </CardTitle>
              <Link href={`/admin/agents/activity?agentId=${agent.id}`}>
                <Button variant="outline" size="sm">
                  Lihat Semua
                </Button>
              </Link>
            </div>
            <CardDescription>20 aktiviti terkini agent ini</CardDescription>
          </CardHeader>
          <CardContent>
            {agent.activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Agent ini belum pernah dilaksanakan.</p>
                <p className="text-xs mt-1">Klik butang "Run" di atas untuk menjalankan agent secara manual.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {agent.activities.map((act) => {
                  const isError = act.status === 'error'
                  return (
                    <div
                      key={act.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        isError ? 'bg-rose-50/50 border-rose-200' :
                        'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div className={isError ? 'text-rose-600' : 'text-emerald-600'}>
                        {isError ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-sm font-medium">{act.action}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(act.createdAt).toLocaleString('ms-MY')}
                              </span>
                              {act.duration !== null && <span>{formatDuration(act.duration)}</span>}
                              <span className={`capitalize font-medium ${isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {act.status}
                              </span>
                            </div>
                            {isError && act.errorMessage && (
                              <p className="text-xs text-rose-700 mt-1 bg-rose-100/70 p-2 rounded">
                                ⚠ {act.errorMessage}
                              </p>
                            )}
                          </div>
                          <ActivityDetail
                            input={act.input}
                            output={act.output}
                            errorMessage={act.errorMessage}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-xl">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5" /> Tindakan Pantas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href={`/admin/agents/activity?agentId=${agent.id}`} className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Activity className="w-5 h-5 mb-1" />
                <p className="text-sm font-medium">Log Aktiviti</p>
                <p className="text-xs opacity-80">Semua sejarah run</p>
              </Link>
              <Link href="/admin/agents/leads" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Calendar className="w-5 h-5 mb-1" />
                <p className="text-sm font-medium">Leads Dijana</p>
                <p className="text-xs opacity-80">Lead dari agent</p>
              </Link>
              <Link href="/admin/agents/notifications" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <AlertCircle className="w-5 h-5 mb-1" />
                <p className="text-sm font-medium">Notifikasi</p>
                <p className="text-xs opacity-80">Amaran dari agent</p>
              </Link>
              <Link href="/admin/agents" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Bot className="w-5 h-5 mb-1" />
                <p className="text-sm font-medium">Semua Agents</p>
                <p className="text-xs opacity-80">Dashboard utama</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
