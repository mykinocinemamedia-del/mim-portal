import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  Handshake,
  Calendar,
  MessageCircle,
} from 'lucide-react'
import { formatDate, waCompanyLink } from '@/lib/utils'

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  agency_helper: 'Agensi - Pembantu',
  agency_employer: 'Agensi - Majikan',
  employer_helper: 'Majikan - Pembantu',
}

const CONTRACT_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draf', variant: 'secondary' },
  pending: { label: 'Menunggu', variant: 'secondary' },
  active: { label: 'Aktif', variant: 'default' },
  completed: { label: 'Selesai', variant: 'outline' },
  terminated: { label: 'Ditamatkan', variant: 'destructive' },
}

function ContractIcon({ type }: { type: string }) {
  if (type === 'agency_helper') return <Building2 className="w-5 h-5 text-emerald-600" />
  if (type === 'agency_employer') return <User className="w-5 h-5 text-amber-600" />
  return <Handshake className="w-5 h-5 text-rose-600" />
}

export default async function HelperContractPage() {
  const session = await getSession()
  if (!session || session.role !== 'helper') {
    redirect('/helper/login')
  }

  const helper = await db.helper.findUnique({
    where: { id: session.id },
    include: {
      contracts: {
        include: {
          employer: true,
          booking: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!helper) redirect('/helper/login')

  return (
    <DashboardShell role="helper" user={{ name: helper.fullName, email: helper.email || '' }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Kontrak Saya</h1>
            <p className="text-muted-foreground mt-1">
              Semua kontrak yang berkaitan dengan anda.
            </p>
          </div>
          <a href={waCompanyLink('Saya ingin bertanya tentang kontrak saya.')} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Admin
            </Button>
          </a>
        </div>

        {/* Legend */}
        {helper.contracts.length > 0 && (
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="font-medium text-muted-foreground">Jenis Kontrak:</span>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-emerald-600" /> Agensi - Pembantu
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-600" /> Agensi - Majikan
                </span>
                <span className="inline-flex items-center gap-1">
                  <Handshake className="w-3 h-3 text-rose-600" /> Majikan - Pembantu
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contracts List */}
        {helper.contracts.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Belum Ada Kontrak</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Belum ada kontrak. Kontrak akan dijana setelah anda dipadankan dengan majikan.
              </p>
              <a
                href={waCompanyLink('Saya ingin bertanya tentang status kontrak saya.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4"
              >
                <Button>
                  <MessageCircle className="w-4 h-4 mr-2" /> Hubungi Admin
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {helper.contracts.map((c) => {
              const statusInfo = CONTRACT_STATUS_LABELS[c.status] || {
                label: c.status,
                variant: 'secondary' as const,
              }
              const allSigned = c.signedHelper && c.signedEmployer && c.signedAdmin
              return (
                <Card key={c.id} className="border-0 shadow-md">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <ContractIcon type={c.contractType} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div>
                            <h3 className="font-semibold text-base">
                              {CONTRACT_TYPE_LABELS[c.contractType] || c.contractType}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Dibuat: {formatDate(c.createdAt)}
                            </p>
                          </div>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>

                        {/* Parties */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Pembantu</p>
                              <p className="font-medium truncate">{helper.fullName}</p>
                            </div>
                          </div>
                          {c.employer && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Majikan</p>
                                <p className="font-medium truncate">{c.employer.fullName}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Dates */}
                        {(c.startDate || c.endDate) && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            {c.startDate && (
                              <span className="inline-flex items-center">
                                <Calendar className="w-3 h-3 mr-1" /> Mula: {formatDate(c.startDate)}
                              </span>
                            )}
                            {c.endDate && (
                              <span className="inline-flex items-center">
                                <Calendar className="w-3 h-3 mr-1" /> Tamat: {formatDate(c.endDate)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Signing status */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <SignBadge
                            label="Pembantu"
                            signed={c.signedHelper}
                          />
                          <SignBadge
                            label="Majikan"
                            signed={c.signedEmployer}
                          />
                          <SignBadge
                            label="Admin"
                            signed={c.signedAdmin}
                          />
                          {allSigned && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Kontrak Aktif
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        {c.pdfUrl && (
                          <Button asChild size="sm" variant="outline">
                            <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" /> Muat Turun PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Help */}
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-amber-50/50">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold mb-1">Ada Soalan Tentang Kontrak?</h3>
              <p className="text-sm text-muted-foreground">Hubungi admin MIM untuk pertanyaan kontrak.</p>
            </div>
            <a href={waCompanyLink('Saya ingin bertanya tentang kontrak saya.')} target="_blank" rel="noopener noreferrer">
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Admin
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

function SignBadge({ label, signed }: { label: string; signed: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${
        signed
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {signed ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      {label}: {signed ? 'Ditandatangani' : 'Belum'}
    </span>
  )
}
