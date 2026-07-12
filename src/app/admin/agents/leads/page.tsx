import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft, Target, User, Briefcase, Users, CheckCircle2,
  MessageCircle, Sparkles,
} from 'lucide-react'
import { LeadDetailDialog } from './lead-detail-dialog'

export const dynamic = 'force-dynamic'

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'Baru', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Dihubungi', color: 'bg-amber-100 text-amber-700' },
  qualified: { label: 'Layak', color: 'bg-purple-100 text-purple-700' },
  converted: { label: 'Berjaya', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700' },
}

const sourceLabel: Record<string, string> = {
  facebook: 'Facebook',
  referral: 'Rujukan',
  content: 'Kandungan',
  ads: 'Iklan',
  manual: 'Manual',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

function getScoreColor(score: number | null) {
  if (score === null) return 'text-muted-foreground'
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-rose-600'
}

function getScoreLabel(score: number | null) {
  if (score === null) return '-'
  if (score >= 80) return 'Kualiti Tinggi'
  if (score >= 60) return 'Kualiti Sederhana'
  return 'Kualiti Rendah'
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const sp = await searchParams
  const status = sp.status
  const type = sp.type

  const where: {
    status?: string
    leadType?: string
  } = {}
  if (status) where.status = status
  if (type) where.leadType = type

  const [leads, totalLeads, newLeads, contactedLeads, qualifiedLeads, convertedLeads] =
    await Promise.all([
      db.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      db.lead.count(),
      db.lead.count({ where: { status: 'new' } }),
      db.lead.count({ where: { status: 'contacted' } }),
      db.lead.count({ where: { status: 'qualified' } }),
      db.lead.count({ where: { status: 'converted' } }),
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
              <Target className="w-7 h-7 text-primary" />
              Pengurusan Leads
            </h1>
            <p className="text-muted-foreground mt-1">
              Leads dijana oleh AI agents (Helper Recruiter, Employer Hunter, Referral Engine)
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Users className="w-5 h-5 text-slate-600 mb-2" />
              <p className="text-2xl font-bold">{totalLeads}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Target className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{newLeads}</p>
              <p className="text-xs text-muted-foreground">Baru</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <MessageCircle className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-2xl font-bold">{contactedLeads}</p>
              <p className="text-xs text-muted-foreground">Dihubungi</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{qualifiedLeads}</p>
              <p className="text-xs text-muted-foreground">Layak</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">{convertedLeads}</p>
              <p className="text-xs text-muted-foreground">Berjaya</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex flex-wrap gap-1">
                  <Link href="/admin/agents/leads">
                    <Button variant={!status ? 'default' : 'outline'} size="sm">Semua</Button>
                  </Link>
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <Link key={key} href={`/admin/agents/leads?status=${key}${type ? `&type=${type}` : ''}`}>
                      <Button variant={status === key ? 'default' : 'outline'} size="sm">
                        {cfg.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 md:ml-auto">
                <span className="text-sm font-medium">Jenis:</span>
                <div className="flex gap-1">
                  <Link href={`/admin/agents/leads${status ? `?status=${status}` : ''}`}>
                    <Button variant={!type ? 'default' : 'outline'} size="sm">Semua</Button>
                  </Link>
                  <Link href={`/admin/agents/leads?type=helper${status ? `&status=${status}` : ''}`}>
                    <Button variant={type === 'helper' ? 'default' : 'outline'} size="sm">
                      <Briefcase className="w-3 h-3 mr-1" /> Pembantu
                    </Button>
                  </Link>
                  <Link href={`/admin/agents/leads?type=employer${status ? `&status=${status}` : ''}`}>
                    <Button variant={type === 'employer' ? 'default' : 'outline'} size="sm">
                      <User className="w-3 h-3 mr-1" /> Majikan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Senarai Leads
              <Badge variant="outline">{leads.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Tiada leads dijumpai.</p>
                <p className="text-xs mt-1">Jalankan Helper Recruiter atau Employer Hunter agent untuk menjana leads.</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Skor AI</TableHead>
                      <TableHead>Kualiti</TableHead>
                      <TableHead>Dicipta</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => {
                      const score = lead.score ?? null
                      const cfg = statusConfig[lead.status] || statusConfig.new
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">
                            {lead.contactName || 'Tiada nama'}
                            {lead.contactPhone && (
                              <p className="text-xs text-muted-foreground">{lead.contactPhone}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              {lead.leadType === 'helper' ? (
                                <><Briefcase className="w-3 h-3" /> Pembantu</>
                              ) : (
                                <><User className="w-3 h-3" /> Majikan</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {sourceLabel[lead.source] || lead.source}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </TableCell>
                          <TableCell className={`font-bold ${getScoreColor(score)}`}>
                            {score !== null ? Math.round(score) : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs ${getScoreColor(score)}`}>
                              {getScoreLabel(score)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(lead.createdAt).toLocaleDateString('ms-MY', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <LeadDetailDialog lead={lead} />
                              {lead.contactPhone && (
                                <a
                                  href={`https://wa.me/${lead.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Helo ${lead.contactName || ''}, saya dari MIM Portal. Kami mendapati profil anda sesuai untuk perkhidmatan kami. Boleh saya kongsi maklumat lanjut?`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button size="sm" variant="outline" className="text-emerald-600">
                                    <MessageCircle className="w-3 h-3" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
