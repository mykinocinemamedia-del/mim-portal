import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Stethoscope,
  Syringe,
  ExternalLink,
  FileText,
  User,
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { MedicalDialog } from './medical-dialog'

export const dynamic = 'force-dynamic'

export default async function AdminMedicalPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const [helpers, allRecords] = await Promise.all([
    db.helper.findMany({
      select: { id: true, fullName: true, phone: true },
      orderBy: { fullName: 'asc' },
    }),
    db.medicalRecord.findMany({
      include: { helper: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Group records by helper
  const byHelper: Record<string, { helper: any; records: any[] }> = {}
  for (const r of allRecords) {
    const hid = r.helperId
    if (!byHelper[hid]) {
      byHelper[hid] = { helper: r.helper, records: [] }
    }
    byHelper[hid].records.push(r)
  }
  const helperList = Object.values(byHelper)

  const helpersData = helpers.map((h) => ({ id: h.id, fullName: h.fullName }))

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Rekod Perubatan
            </h1>
            <p className="text-muted-foreground mt-1">
              {allRecords.length} rekod untuk {helperList.length} pembantu.
            </p>
          </div>
          <MedicalDialog helpers={helpersData} />
        </div>

        {helperList.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Rekod Perubatan</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tambah rekod kesihatan atau vaksinasi untuk pembantu.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
            {helperList.map(({ helper, records }) => (
              <Card key={helper.id} className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <Link
                      href={`/admin/helpers/${helper.id}`}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold">
                          {getInitials(helper.fullName)}
                        </span>
                      </div>
                      <span>{helper.fullName}</span>
                    </Link>
                    <Badge variant="outline">{records.length} rekod</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {records.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            r.recordType === 'vaccination'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {r.recordType === 'vaccination' ? (
                            <Syringe className="w-4 h-4" />
                          ) : (
                            <Stethoscope className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">
                            {r.recordType === 'vaccination'
                              ? 'Vaksinasi'
                              : 'Kesihatan'}
                            {r.result ? `: ${r.result}` : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.uploadDate ? formatDate(r.uploadDate) : '-'}
                            {r.notes ? ` · ${r.notes}` : ''}
                          </p>
                        </div>
                      </div>
                      {r.fileUrl && (
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-3 h-3 mr-1" /> Fail
                          </Button>
                        </a>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
