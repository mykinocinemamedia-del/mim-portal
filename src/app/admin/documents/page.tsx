import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DocumentDialog } from './documents-client'

export const dynamic = 'force-dynamic'

const DOC_TYPE_LABELS: Record<string, string> = {
  faq: 'FAQ',
  price: 'Harga',
  process: 'Proses',
  contract: 'Kontrak',
  medical: 'Perubatan',
  general: 'Umum',
}

export default async function AdminDocumentsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const documents = await db.document.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Pengurusan Dokumen
            </h1>
            <p className="text-muted-foreground mt-1">
              {documents.length} dokumen dalam sistem (FAQ, harga, proses, dll).
            </p>
          </div>
          <DocumentDialog triggerVariant="create" />
        </div>

        {documents.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Tiada Dokumen</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tambah dokumen seperti FAQ, senarai harga, atau proses pendaftaran.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((d) => (
              <Card key={d.id} className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{d.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(d.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline">
                        {DOC_TYPE_LABELS[d.docType || ''] || d.docType}
                      </Badge>
                      {d.isPublished ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                          Diterbitkan
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Draf
                        </Badge>
                      )}
                    </div>
                  </div>
                  {d.content && (
                    <p className="text-xs text-muted-foreground line-clamp-3 bg-muted/30 rounded p-2">
                      {d.content}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <DocumentDialog
                      doc={{
                        id: d.id,
                        title: d.title,
                        docType: d.docType || 'faq',
                        content: d.content,
                        fileUrl: d.fileUrl,
                        isPublished: d.isPublished,
                      }}
                      triggerVariant="edit"
                    />
                    {d.fileUrl && (
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Lihat Fail
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
