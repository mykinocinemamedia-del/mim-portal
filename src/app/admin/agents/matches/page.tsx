import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft, Heart, TrendingUp, CheckCircle2, Sparkles, Users, Brain,
} from 'lucide-react'
import { MatchActions } from './match-actions'

export const dynamic = 'force-dynamic'

const statusConfig: Record<string, { label: string; color: string }> = {
  suggested: { label: 'Dicadang', color: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Dilihat', color: 'bg-slate-100 text-slate-700' },
  accepted: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700' },
  matched: { label: 'Dipadankan', color: 'bg-purple-100 text-purple-700' },
}

function getScoreColor(score: number) {
  if (score >= 85) return { text: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Sangat Sesuai' }
  if (score >= 70) return { text: 'text-amber-600', bg: 'bg-amber-500', label: 'Sesuai' }
  return { text: 'text-rose-600', bg: 'bg-rose-500', label: 'Kurang Sesuai' }
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; minScore?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const sp = await searchParams
  const status = sp.status
  const minScore = sp.minScore

  const where: {
    status?: string
    score?: { gte: number }
  } = {}
  if (status) where.status = status
  if (minScore) where.score = { gte: parseFloat(minScore) }

  const [matches, totalMatches, highScoreMatches, suggestedMatches, acceptedMatches, matchedMatches] =
    await Promise.all([
      db.matchScore.findMany({
        where,
        include: {
          helper: {
            select: {
              id: true, fullName: true, phone: true, serviceType: true,
              rating: true, city: true, state: true, profilePhoto: true,
            },
          },
          employer: {
            select: {
              id: true, fullName: true, phone: true, serviceType: true,
              city: true, state: true, salaryOffered: true,
            },
          },
          agent: { select: { displayName: true } },
        },
        orderBy: { score: 'desc' },
        take: 100,
      }),
      db.matchScore.count(),
      db.matchScore.count({ where: { score: { gte: 85 } } }),
      db.matchScore.count({ where: { status: 'suggested' } }),
      db.matchScore.count({ where: { status: 'accepted' } }),
      db.matchScore.count({ where: { status: 'matched' } }),
    ])

  return (
    <DashboardShell role="admin" user={{ name: session.name, email: session.email }}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/admin/agents" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Kembali ke AI Agents
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Heart className="w-7 h-7 text-primary" />
            AI Match Scores
          </h1>
          <p className="text-muted-foreground mt-1">
            Padanan helper-majikan dijana oleh Matchmaker Agent menggunakan algoritma AI
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Heart className="w-5 h-5 text-rose-600 mb-2" />
              <p className="text-2xl font-bold">{totalMatches}</p>
              <p className="text-xs text-muted-foreground">Total Padanan</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">{highScoreMatches}</p>
              <p className="text-xs text-muted-foreground">Skor Tinggi (≥85)</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Sparkles className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{suggestedMatches}</p>
              <p className="text-xs text-muted-foreground">Dicadang</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">{acceptedMatches}</p>
              <p className="text-xs text-muted-foreground">Diterima</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Users className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{matchedMatches}</p>
              <p className="text-xs text-muted-foreground">Dipadankan</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Status:</span>
                <Link href="/admin/agents/matches">
                  <Button variant={!status ? 'default' : 'outline'} size="sm">Semua</Button>
                </Link>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <Link key={key} href={`/admin/agents/matches?status=${key}${minScore ? `&minScore=${minScore}` : ''}`}>
                    <Button variant={status === key ? 'default' : 'outline'} size="sm">
                      {cfg.label}
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2 md:ml-auto flex-wrap">
                <span className="text-sm font-medium">Skor Min:</span>
                <Link href={`/admin/agents/matches${status ? `?status=${status}` : ''}`}>
                  <Button variant={!minScore ? 'default' : 'outline'} size="sm">Semua</Button>
                </Link>
                {[{ v: '85', l: '≥85' }, { v: '70', l: '≥70' }, { v: '50', l: '≥50' }].map((m) => (
                  <Link key={m.v} href={`/admin/agents/matches?minScore=${m.v}${status ? `&status=${status}` : ''}`}>
                    <Button variant={minScore === m.v ? 'default' : 'outline'} size="sm">
                      {m.l}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches List */}
        {matches.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-12 text-muted-foreground">
              <Heart className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Tiada padanan dijumpai.</p>
              <p className="text-xs mt-1">Jalankan Matchmaker Agent untuk menjana padanan baru.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map((match) => {
              const score = Math.round(match.score)
              const scoreColor = getScoreColor(match.score)
              const cfg = statusConfig[match.status] || statusConfig.suggested

              let factors: { factor: string; score: number; weight: string }[] = []
              try {
                if (match.factors) {
                  const parsed = JSON.parse(match.factors)
                  factors = Array.isArray(parsed) ? parsed : Object.entries(parsed).map(([k, v]: [string, any]) => ({
                    factor: k,
                    score: typeof v === 'number' ? v : (v?.score ?? 0),
                    weight: typeof v === 'object' ? v?.weight ?? '-' : '-',
                  }))
                }
              } catch {
                factors = []
              }

              return (
                <Card key={match.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-600" />
                          {match.helper.fullName}
                          <span className="text-muted-foreground text-xs font-normal">↔</span>
                          {match.employer.fullName}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {match.helper.city || '-'}, {match.helper.state || '-'} ↔ {match.employer.city || '-'}, {match.employer.state || '-'}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Score */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Skor Keserasian</span>
                        <span className={`text-2xl font-bold ${scoreColor.text}`}>{score}</span>
                      </div>
                      <Progress value={score} className={`h-2 ${scoreColor.bg}`} />
                      <p className={`text-xs mt-1 ${scoreColor.text}`}>{scoreColor.label}</p>
                    </div>

                    {/* Helper & Employer Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/30 rounded-lg p-2">
                        <p className="font-medium">{match.helper.fullName}</p>
                        <p className="text-muted-foreground">⭐ {match.helper.rating.toFixed(1)}</p>
                        <p className="text-muted-foreground">{match.helper.serviceType || '-'}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2">
                        <p className="font-medium">{match.employer.fullName}</p>
                        <p className="text-muted-foreground">
                          {match.employer.salaryOffered ? `RM ${match.employer.salaryOffered}` : '-'}
                        </p>
                        <p className="text-muted-foreground">{match.employer.serviceType || '-'}</p>
                      </div>
                    </div>

                    {/* Reasoning */}
                    {match.reasoning && (
                      <div>
                        <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Analisis AI
                        </p>
                        <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded line-clamp-3">
                          {match.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Factors */}
                    {factors.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1">Faktor Skor</p>
                        <div className="space-y-1">
                          {factors.slice(0, 4).map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="flex-1 truncate">{f.factor}</span>
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${typeof f.score === 'number' && f.score >= 80 ? 'bg-emerald-500' : typeof f.score === 'number' && f.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                  style={{ width: `${Math.min(100, typeof f.score === 'number' ? f.score : 0)}%` }}
                                />
                              </div>
                              <span className="w-8 text-right font-medium">
                                {typeof f.score === 'number' ? Math.round(f.score) : '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Agent */}
                    {match.agent && (
                      <p className="text-xs text-muted-foreground">
                        Dijana oleh: {match.agent.displayName}
                      </p>
                    )}

                    {/* Actions */}
                    {(match.status === 'suggested' || match.status === 'viewed') && (
                      <MatchActions matchId={match.id} />
                    )}
                    {(match.status === 'accepted' || match.status === 'rejected' || match.status === 'matched') && (
                      <div className="text-xs text-muted-foreground text-center pt-1">
                        Status: <span className="font-medium">{cfg.label}</span> • Dicipta {new Date(match.createdAt).toLocaleDateString('ms-MY')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
