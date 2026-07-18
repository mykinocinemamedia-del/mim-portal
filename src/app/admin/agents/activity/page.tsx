import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Activity, CheckCircle2, AlertCircle, Clock, Zap, TrendingUp,
} from 'lucide-react'
import { ActivityDetail } from './activity-detail'

export const dynamic = 'force-dynamic'

function formatDuration(ms: number | null) {
  if (ms === null) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ agentId?: string; status?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const sp = await searchParams
  const agentId = sp.agentId
  const status = sp.status

  const where: {
    agentId?: string
    status?: string
  } = {}
  if (agentId) where.agentId = agentId
  if (status) where.status = status

  // Get today's range
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  // Single raw SQL for all activity counts
  const statsResult = await db.$queryRaw`
    SELECT
      (SELECT COUNT(*) FROM mim_agent_activities WHERE created_at >= ${startOfToday}) as today_count,
      (SELECT COUNT(*) FROM mim_agent_activities WHERE created_at >= ${startOfToday} AND status = 'success') as today_success,
      (SELECT COUNT(*) FROM mim_agent_activities WHERE created_at >= ${startOfToday} AND status = 'error') as today_error,
      (SELECT COUNT(*) FROM mim_agent_activities WHERE status = 'success') as total_success,
      (SELECT COUNT(*) FROM mim_agent_activities WHERE status = 'error') as total_error
  `.catch(() => null)

  const s = statsResult?.[0] as any
  const todayCount = s ? Number(s.today_count) : 0
  const todaySuccess = s ? Number(s.today_success) : 0
  const todayError = s ? Number(s.today_error) : 0
  const totalSuccess = s ? Number(s.total_success) : 0
  const totalError = s ? Number(s.total_error) : 0

  // Only 2 queries: activities + agents list
  const [activities, agents] = await Promise.all([
    db.agentActivity.findMany({
      where,
      include: { agent: { select: { displayName: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }).catch(() => []),
    db.agent.findMany({
      select: { id: true, displayName: true, name: true },
      orderBy: { displayName: 'asc' },
    }).catch(() => []),
  ])

  const todaySuccessRate = todayCount > 0 ? Math.round((todaySuccess / todayCount) * 100) : 0
  const overallSuccessRate = (totalSuccess + totalError) > 0
    ? Math.round((totalSuccess / (totalSuccess + totalError)) * 100)
    : 0

  return (
    <DashboardShell role="admin" user={{ name: session.name, email: session.email }}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/admin/agents" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Kembali ke AI Agents
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" />
            Log Aktiviti Agents
          </h1>
          <p className="text-muted-foreground mt-1">
            Semua aktiviti yang dilaksanakan oleh AI agents - masa nyata dan sejarah
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Zap className="w-5 h-5 text-slate-600 mb-2" />
              <p className="text-2xl font-bold">{todayCount}</p>
              <p className="text-xs text-muted-foreground">Aktiviti Hari Ini</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">{todaySuccessRate}%</p>
              <p className="text-xs text-muted-foreground">Kadar Berjaya Hari Ini</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">{todaySuccess}</p>
              <p className="text-xs text-muted-foreground">Berjaya Hari Ini</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <AlertCircle className="w-5 h-5 text-rose-600 mb-2" />
              <p className="text-2xl font-bold">{todayError}</p>
              <p className="text-xs text-muted-foreground">Gagal Hari Ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Agent:</span>
                <Link href="/admin/agents/activity">
                  <Button variant={!agentId ? 'default' : 'outline'} size="sm">Semua</Button>
                </Link>
                {agents.map((agent) => (
                  <Link key={agent.id} href={`/admin/agents/activity?agentId=${agent.id}${status ? `&status=${status}` : ''}`}>
                    <Button variant={agentId === agent.id ? 'default' : 'outline'} size="sm">
                      {agent.displayName}
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2 md:ml-auto">
                <span className="text-sm font-medium">Status:</span>
                <Link href={`/admin/agents/activity${agentId ? `?agentId=${agentId}` : ''}`}>
                  <Button variant={!status ? 'default' : 'outline'} size="sm">Semua</Button>
                </Link>
                <Link href={`/admin/agents/activity?status=success${agentId ? `&agentId=${agentId}` : ''}`}>
                  <Button variant={status === 'success' ? 'default' : 'outline'} size="sm" className="text-emerald-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Berjaya
                  </Button>
                </Link>
                <Link href={`/admin/agents/activity?status=error${agentId ? `&agentId=${agentId}` : ''}`}>
                  <Button variant={status === 'error' ? 'default' : 'outline'} size="sm" className="text-rose-600">
                    <AlertCircle className="w-3 h-3 mr-1" /> Gagal
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Timeline Aktiviti
              <Badge variant="outline">{activities.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Tiada aktiviti dijumpai.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {activities.map((act) => {
                  const isError = act.status === 'error'
                  return (
                    <div
                      key={act.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        isError ? 'bg-rose-50/50 border-rose-200' :
                        act.status === 'success' ? 'bg-emerald-50/50 border-emerald-200' :
                        'bg-muted/30 border-border'
                      }`}
                    >
                      <div className={`mt-0.5 ${isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isError ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-sm font-medium">
                              {act.action}
                              {act.agent && (
                                <span className="text-muted-foreground font-normal"> • {act.agent.displayName}</span>
                              )}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(act.createdAt).toLocaleString('ms-MY')}
                              </span>
                              {act.duration !== null && (
                                <span>{formatDuration(act.duration)}</span>
                              )}
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

        {/* Overall Stats */}
        <Card className="border-0 bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-xl">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3">Statistik Keseluruhan</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-3xl font-bold">{totalSuccess + totalError}</p>
                <p className="text-sm opacity-80">Total Aktiviti</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">{overallSuccessRate}%</p>
                <p className="text-sm opacity-80">Kadar Berjaya</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-rose-400">{totalError}</p>
                <p className="text-sm opacity-80">Total Gagal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
