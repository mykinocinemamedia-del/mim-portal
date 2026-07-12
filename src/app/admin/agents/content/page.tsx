import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Sparkles, FileText, Calendar, CheckCircle2,
  Facebook, Instagram, Music2, Twitter, FileEdit,
} from 'lucide-react'
import { ContentActions } from './content-actions'

export const dynamic = 'force-dynamic'

const platformConfig: Record<string, { label: string; icon: any; color: string }> = {
  facebook: { label: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-50' },
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-600 bg-pink-50' },
  tiktok: { label: 'TikTok', icon: Music2, color: 'text-slate-700 bg-slate-100' },
  twitter: { label: 'Twitter', icon: Twitter, color: 'text-sky-600 bg-sky-50' },
  blog: { label: 'Blog', icon: FileEdit, color: 'text-emerald-600 bg-emerald-50' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draf', color: 'bg-slate-100 text-slate-700' },
  scheduled: { label: 'Dijadualkan', color: 'bg-blue-100 text-blue-700' },
  posted: { label: 'Disiarkan', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Gagal', color: 'bg-rose-100 text-rose-700' },
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; platform?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const sp = await searchParams
  const status = sp.status
  const platform = sp.platform

  const where: {
    status?: string
    platform?: string
  } = {}
  if (status) where.status = status
  if (platform) where.platform = platform

  const [content, totalContent, draftCount, scheduledCount, postedCount] = await Promise.all([
    db.contentQueue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.contentQueue.count(),
    db.contentQueue.count({ where: { status: 'draft' } }),
    db.contentQueue.count({ where: { status: 'scheduled' } }),
    db.contentQueue.count({ where: { status: 'posted' } }),
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
            <Sparkles className="w-7 h-7 text-primary" />
            Content Marketing Queue
          </h1>
          <p className="text-muted-foreground mt-1">
            Kandungan sosial media dijana oleh Content Marketer Agent untuk Facebook, Instagram & TikTok
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <FileText className="w-5 h-5 text-slate-600 mb-2" />
              <p className="text-2xl font-bold">{totalContent}</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <FileEdit className="w-5 h-5 text-slate-500 mb-2" />
              <p className="text-2xl font-bold">{draftCount}</p>
              <p className="text-xs text-muted-foreground">Draf</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Calendar className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{scheduledCount}</p>
              <p className="text-xs text-muted-foreground">Dijadualkan</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">{postedCount}</p>
              <p className="text-xs text-muted-foreground">Disiarkan</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">Platform:</span>
                <Link href="/admin/agents/content">
                  <Button variant={!platform ? 'default' : 'outline'} size="sm">Semua</Button>
                </Link>
                {Object.entries(platformConfig).map(([key, cfg]) => (
                  <Link key={key} href={`/admin/agents/content?platform=${key}${status ? `&status=${status}` : ''}`}>
                    <Button variant={platform === key ? 'default' : 'outline'} size="sm">
                      <cfg.icon className="w-3 h-3 mr-1" /> {cfg.label}
                    </Button>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2 md:ml-auto flex-wrap">
                <span className="text-sm font-medium">Status:</span>
                <Link href={`/admin/agents/content${platform ? `?platform=${platform}` : ''}`}>
                  <Button variant={!status ? 'default' : 'outline'} size="sm">Semua</Button>
                </Link>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <Link key={key} href={`/admin/agents/content?status=${key}${platform ? `&platform=${platform}` : ''}`}>
                    <Button variant={status === key ? 'default' : 'outline'} size="sm">
                      {cfg.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        {content.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Tiada kandungan dijumpai.</p>
              <p className="text-xs mt-1">Jalankan Content Marketer Agent untuk menjana post baharu.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.map((item) => {
              const pCfg = platformConfig[item.platform] || platformConfig.blog
              const sCfg = statusConfig[item.status] || statusConfig.draft
              const Icon = pCfg.icon
              return (
                <Card key={item.id} className="border-0 shadow-md hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg ${pCfg.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">{pCfg.label}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.contentType}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sCfg.color}`}>
                        {sCfg.label}
                      </span>
                    </div>
                    {item.title && (
                      <CardTitle className="text-sm mt-2 line-clamp-2">{item.title}</CardTitle>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-3">
                    {/* Content Preview */}
                    <div className="bg-muted/30 p-3 rounded-lg flex-1">
                      <p className="text-xs whitespace-pre-wrap line-clamp-4">{item.content}</p>
                    </div>

                    {/* Hashtags */}
                    {item.hashtags && (
                      <div className="flex flex-wrap gap-1">
                        {item.hashtags.split(/[\s,]+/).filter(Boolean).slice(0, 5).map((tag, i) => (
                          <span key={i} className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            {tag.startsWith('#') ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Schedule */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      {item.scheduledAt && (
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Dijadualkan: {new Date(item.scheduledAt).toLocaleString('ms-MY')}
                        </p>
                      )}
                      {item.postedAt && (
                        <p className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> Disiarkan: {new Date(item.postedAt).toLocaleString('ms-MY')}
                        </p>
                      )}
                      <p>Dicipta: {new Date(item.createdAt).toLocaleDateString('ms-MY')}</p>
                    </div>

                    {/* Actions */}
                    <ContentActions
                      contentId={item.id}
                      content={item.content}
                      status={item.status}
                      title={item.title}
                    />
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
