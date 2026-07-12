'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Upload,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Download,
  FileUp,
  Users,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ParsedMaid = {
  fullName: string
  phone: string
  age: string
  religion: string
  maritalStatus: string
  serviceType: string
  skills: string
  city: string
  state: string
}

type ImportError = { row: number; fullName?: string; error: string }

// ---------------------------------------------------------------------------
// CSV parser (handles quoted fields with embedded commas)
// ---------------------------------------------------------------------------

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
  }
  result.push(cur)
  return result.map((s) => s.trim())
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  // Normalize line endings, strip BOM
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = clean.split('\n').filter((l) => l.trim() !== '')
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim())
  const rows = lines.slice(1).map((l) => parseCSVLine(l))
  return { headers, rows }
}

function rowsToMaids(headers: string[], rows: string[][]): ParsedMaid[] {
  const findIdx = (...names: string[]) => {
    for (const n of names) {
      const idx = headers.indexOf(n.toLowerCase())
      if (idx >= 0) return idx
    }
    return -1
  }

  const idx = {
    fullName: findIdx('fullname', 'full_name', 'name', 'nama'),
    phone: findIdx('phone', 'tel', 'telefon', 'whatsapp', 'no_telefon'),
    age: findIdx('age', 'umur'),
    religion: findIdx('religion', 'agama'),
    maritalStatus: findIdx('maritalstatus', 'marital_status', 'status_perkahwinan'),
    serviceType: findIdx('servicetype', 'service_type', 'perkhidmatan'),
    skills: findIdx('skills', 'kemahiran'),
    city: findIdx('city', 'bandar'),
    state: findIdx('state', 'negeri'),
  }

  return rows.map((r) => ({
    fullName: idx.fullName >= 0 ? r[idx.fullName] || '' : '',
    phone: idx.phone >= 0 ? r[idx.phone] || '' : '',
    age: idx.age >= 0 ? r[idx.age] || '' : '',
    religion: idx.religion >= 0 ? r[idx.religion] || '' : '',
    maritalStatus: idx.maritalStatus >= 0 ? r[idx.maritalStatus] || '' : '',
    serviceType: idx.serviceType >= 0 ? r[idx.serviceType] || '' : '',
    skills: idx.skills >= 0 ? r[idx.skills] || '' : '',
    city: idx.city >= 0 ? r[idx.city] || '' : '',
    state: idx.state >= 0 ? r[idx.state] || '' : '',
  }))
}

// ---------------------------------------------------------------------------
// Sample CSV for download
// ---------------------------------------------------------------------------

const SAMPLE_CSV = `fullName,phone,age,religion,maritalStatus,serviceType,skills,city,state
Siti Aminah,+60123456789,28,Islam,Berkahwin,maid,"cooking,cleaning",Kuala Lumpur,Kuala Lumpur
Noraini Binti Yusof,+60198765432,32,Islam,Berkahwin,babysitter,"baby_care,child_care",Shah Alam,Selangor
Lim Mei Ling,+60123498765,35,Buddha,Bujang,caregiver,"cooking,cleaning",Petaling Jaya,Selangor
Kavitha a/p Raju,+60125678901,26,Hindu,Bujang,maid,"washing,cleaning",Ipoh,Perak
Fatimah Binti Hassan,+60171234567,30,Islam,Duda/Janda,babysitter,"baby_care,educating",Johor Bahru,Johor`

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AdminUploadMaidsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [authChecked, setAuthChecked] = useState(false)
  const [sessionUser, setSessionUser] = useState<{ name: string; email: string } | null>(null)

  const [fileName, setFileName] = useState<string>('')
  const [fileType, setFileType] = useState<'csv' | 'pdf' | ''>('')
  const [parsedMaids, setParsedMaids] = useState<ParsedMaid[]>([])
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    imported: number
    total: number
    errors: ImportError[]
  } | null>(null)

  // Auth check on mount - redirect non-admins
  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const u = d?.user
        if (!u || u.role !== 'admin') {
          router.replace('/admin/login')
          return
        }
        setSessionUser({ name: u.name, email: u.email })
        setAuthChecked(true)
      })
      .catch(() => {
        if (!cancelled) router.replace('/admin/login')
      })
    return () => {
      cancelled = true
    }
  }, [router])

  const reset = useCallback(() => {
    setFileName('')
    setFileType('')
    setParsedMaids([])
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      setImportResult(null)
      setParsedMaids([])

      const ext = file.name.toLowerCase().split('.').pop() || ''
      if (ext === 'pdf') {
        setFileName(file.name)
        setFileType('pdf')
        toast({
          title: 'PDF belum disokong',
          description: 'PDF upload coming soon - please use CSV format for now.',
        })
        return
      }

      if (ext !== 'csv') {
        toast({
          title: 'Format tidak disokong',
          description: 'Sila pilih fail .csv atau .pdf sahaja.',
          variant: 'destructive',
        })
        return
      }

      setFileName(file.name)
      setFileType('csv')
      setParsing(true)
      try {
        const text = await file.text()
        const { headers, rows } = parseCSV(text)
        if (rows.length === 0) {
          toast({
            title: 'CSV kosong',
            description: 'Fail CSV tidak mengandungi data row.',
            variant: 'destructive',
          })
          setParsing(false)
          return
        }
        if (!headers.some((h) => ['fullname', 'full_name', 'name', 'nama'].includes(h))) {
          toast({
            title: 'Format CSV salah',
            description: 'Header mesti ada lajur "fullName" (atau "name").',
            variant: 'destructive',
          })
          setParsing(false)
          return
        }
        const maids = rowsToMaids(headers, rows)
        setParsedMaids(maids)
        toast({
          title: 'CSV dihuraikan',
          description: `${maids.length} pembantu berjaya dihuraikan.`,
        })
      } catch (e: any) {
        toast({
          title: 'Gagal huraikan CSV',
          description: e.message || 'Ralat semasa membaca fail.',
          variant: 'destructive',
        })
      } finally {
        setParsing(false)
      }
    },
    [toast]
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const importAll = async () => {
    if (parsedMaids.length === 0) return
    setImporting(true)
    setImportResult(null)
    try {
      const res = await fetch('/api/admin/helpers/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maids: parsedMaids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal import')

      setImportResult({
        imported: data.imported || 0,
        total: data.total || parsedMaids.length,
        errors: data.errors || [],
      })

      toast({
        title: 'Import Selesai',
        description: `${data.imported} pembantu berjaya diimport dari ${data.total} row.`,
      })
    } catch (e: any) {
      toast({
        title: 'Import Gagal',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contoh-pembantu.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Show loading screen while auth is being checked
  if (!authChecked || !sessionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1f33] text-slate-100">
        <Loader2 className="w-6 h-6 animate-spin text-[#00bcd4]" />
      </div>
    )
  }

  const validCount = parsedMaids.filter((m) => m.fullName.trim()).length
  const serviceLabel = (s: string) => {
    if (!s) return '-'
    if (s === 'maid') return 'Pembantu Rumah'
    if (s === 'babysitter') return 'Pengasuh'
    if (s === 'caregiver') return 'Penjaga Orang Tua'
    return s
  }

  return (
    <DashboardShell role="admin" user={sessionUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <Upload className="w-7 h-7 text-[#00bcd4]" />
              Upload Pembantu
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Muat naik fail CSV/PDF untuk tambah pembantu secara pukal ke pangkalan data.
            </p>
          </div>
          <Badge className="bg-[#00bcd4]/15 text-[#00bcd4] hover:bg-[#00bcd4]/15">
            <Users className="w-3 h-3 mr-1" /> Import Pukal
          </Badge>
        </div>

        {/* File Upload Card */}
        <div className="glass-dark rounded-2xl p-6">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center hover:border-[#00bcd4]/50 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf"
              onChange={onInputChange}
              className="hidden"
            />
            <div className="w-16 h-16 mx-auto rounded-full bg-[#00bcd4]/15 flex items-center justify-center mb-4">
              {fileType === 'csv' ? (
                <FileSpreadsheet className="w-8 h-8 text-[#00bcd4]" />
              ) : fileType === 'pdf' ? (
                <FileText className="w-8 h-8 text-[#00bcd4]" />
              ) : (
                <FileUp className="w-8 h-8 text-[#00bcd4]" />
              )}
            </div>
            {parsing ? (
              <>
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-[#00bcd4]" />
                <p className="text-sm text-slate-300">Menghuraikan fail...</p>
              </>
            ) : fileName ? (
              <>
                <p className="font-semibold text-white text-sm">{fileName}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Klik untuk pilih fail lain
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-white">
                  Seret &amp; lepas fail di sini, atau klik untuk pilih
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Sokongan: .csv (penuh) · .pdf (akan datang)
                </p>
              </>
            )}
          </div>

          {/* Helper buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSample}
              className="border-white/15 text-slate-200 hover:bg-white/5 hover:text-white"
            >
              <Download className="w-4 h-4 mr-1" /> Muat Turun Contoh CSV
            </Button>
            {(fileName || parsedMaids.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="border-white/15 text-slate-200 hover:bg-white/5 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Reset
              </Button>
            )}
          </div>

          {/* CSV Format Help */}
          <div className="mt-4 rounded-lg bg-[#0a1828]/60 border border-white/5 p-4">
            <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Format CSV yang Diperlukan
            </p>
            <p className="text-xs text-slate-400 mb-2">
              Baris pertama mesti header. Lajur wajib:{' '}
              <code className="text-[#00bcd4]">fullName</code>. Lajur lain pilihan.
            </p>
            <pre className="text-[11px] text-slate-300 bg-black/40 rounded p-3 overflow-x-auto">
{`fullName,phone,age,religion,maritalStatus,serviceType,skills,city,state
Siti Aminah,+60123456789,28,Islam,Berkahwin,maid,"cooking,cleaning",Kuala Lumpur,Kuala Lumpur`}
            </pre>
            <p className="text-[11px] text-slate-500 mt-2">
              Nilai <code className="text-[#00bcd4]">serviceType</code>:{' '}
              <code>maid</code> (Pembantu Rumah), <code>babysitter</code> (Pengasuh),{' '}
              <code>caregiver</code> (Penjaga Orang Tua).
            </p>
          </div>
        </div>

        {/* PDF notice */}
        {fileType === 'pdf' && (
          <div className="glass-dark rounded-2xl p-6 border-l-4 border-amber-400">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-sm">
                  PDF upload coming soon - please use CSV format for now
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Sokongan PDF (dengan OCR &amp; AI extraction) akan ditambah tidak lama lagi.
                  Buat masa ini, sila tukar fail PDF anda ke format CSV menggunakan Excel / Google Sheets,
                  kemudian muat naik fail CSV tersebut.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {parsedMaids.length > 0 && fileType === 'csv' && (
          <div className="glass-dark rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Pratonton Pembantu
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {parsedMaids.length} row dihuraikan · {validCount} sah · {' '}
                  {parsedMaids.length - validCount} row kosong
                </p>
              </div>
              <Button
                onClick={importAll}
                disabled={importing || validCount === 0}
                className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Mengimport...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1" /> Import Semua ({validCount})
                  </>
                )}
              </Button>
            </div>

            {/* Scrollable table */}
            <div className="max-h-96 overflow-y-auto rounded-lg border border-white/5">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#0a1828] text-slate-400">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-xs">#</th>
                    <th className="text-left px-3 py-2 font-medium text-xs">Nama</th>
                    <th className="text-left px-3 py-2 font-medium text-xs">Phone</th>
                    <th className="text-left px-3 py-2 font-medium text-xs">Umur</th>
                    <th className="text-left px-3 py-2 font-medium text-xs">Perkhidmatan</th>
                    <th className="text-left px-3 py-2 font-medium text-xs">Bandar</th>
                    <th className="text-left px-3 py-2 font-medium text-xs">Negeri</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedMaids.map((m, i) => (
                    <tr
                      key={i}
                      className="border-t border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-2 text-slate-500 text-xs">{i + 1}</td>
                      <td className="px-3 py-2 text-white">
                        {m.fullName || (
                          <span className="text-rose-400 italic text-xs">kosong</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-300">{m.phone || '-'}</td>
                      <td className="px-3 py-2 text-slate-300">{m.age || '-'}</td>
                      <td className="px-3 py-2 text-slate-300">
                        {serviceLabel(m.serviceType)}
                      </td>
                      <td className="px-3 py-2 text-slate-300">{m.city || '-'}</td>
                      <td className="px-3 py-2 text-slate-300">{m.state || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className="glass-dark rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Keputusan Import
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <p className="text-xs text-emerald-400">Berjaya</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {importResult.imported}
                </p>
              </div>
              <div className="rounded-lg bg-slate-500/10 border border-slate-500/20 p-3">
                <p className="text-xs text-slate-400">Jumlah Row</p>
                <p className="text-2xl font-bold text-slate-200">
                  {importResult.total}
                </p>
              </div>
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
                <p className="text-xs text-rose-400">Gagal</p>
                <p className="text-2xl font-bold text-rose-400">
                  {importResult.errors.length}
                </p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="max-h-60 overflow-y-auto rounded-lg border border-rose-500/15">
                <table className="w-full text-xs">
                  <thead className="bg-[#0a1828] text-slate-400 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2">Row</th>
                      <th className="text-left px-3 py-2">Nama</th>
                      <th className="text-left px-3 py-2">Ralat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.errors.map((err, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-3 py-2 text-slate-500">{err.row}</td>
                        <td className="px-3 py-2 text-slate-300">
                          {err.fullName || '-'}
                        </td>
                        <td className="px-3 py-2 text-rose-300">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => router.push('/admin/helpers')}
                className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0"
              >
                Lihat Senarai Pembantu
              </Button>
              <Button
                variant="outline"
                onClick={reset}
                className="border-white/15 text-slate-200 hover:bg-white/5 hover:text-white btn-rounded"
              >
                Import Lagi
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
