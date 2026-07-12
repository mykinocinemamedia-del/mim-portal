'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  FileText,
  Loader2,
  Save,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
} from 'lucide-react'

type Helper = { id: string; fullName: string; serviceType: string | null }
type Employer = { id: string; fullName: string; serviceType: string | null }
type Booking = {
  id: string
  helper: { fullName: string }
  employer: { fullName: string }
  serviceType: string | null
}

const CONTRACT_TYPES = [
  {
    value: 'agency_helper',
    label: 'Agensi - Pembantu',
    desc: 'Kontrak antara MIM Agency dan Pembantu',
  },
  {
    value: 'agency_employer',
    label: 'Agensi - Majikan',
    desc: 'Kontrak antara MIM Agency dan Majikan',
  },
  {
    value: 'employer_helper',
    label: 'Majikan - Pembantu',
    desc: 'Kontrak antara Majikan dan Pembantu',
  },
]

export function GenerateContractDialog({
  open,
  onOpenChange,
  helpers,
  employers,
  bookings,
  onGenerated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  helpers: Helper[]
  employers: Employer[]
  bookings: Booking[]
  onGenerated?: () => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [contractType, setContractType] = useState('agency_helper')
  const [helperId, setHelperId] = useState('')
  const [employerId, setEmployerId] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [content, setContent] = useState('')
  const [showContent, setShowContent] = useState(false)

  const generate = async () => {
    if (contractType === 'agency_helper' && !helperId) {
      toast({
        title: 'Ruangan wajib',
        description: 'Pilih pembantu.',
        variant: 'destructive',
      })
      return
    }
    if (contractType === 'agency_employer' && !employerId) {
      toast({
        title: 'Ruangan wajib',
        description: 'Pilih majikan.',
        variant: 'destructive',
      })
      return
    }
    if (contractType === 'employer_helper' && (!helperId || !employerId)) {
      toast({
        title: 'Ruangan wajib',
        description: 'Pilih pembantu dan majikan.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/contracts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractType,
          helperId: helperId || undefined,
          employerId: employerId || undefined,
          bookingId: bookingId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setContent(data.contract.content)
      setShowContent(true)
      toast({
        title: 'Kontrak Dijana',
        description: 'Sila semak kandungan kontrak.',
      })
    } catch (e: any) {
      toast({
        title: 'Ralat',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kontrak-${contractType}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const close = () => {
    onOpenChange(false)
    if (showContent) {
      onGenerated?.()
    }
    setShowContent(false)
    setContent('')
    setContractType('agency_helper')
    setHelperId('')
    setEmployerId('')
    setBookingId('')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-600" /> Jana Kontrak Baru
          </DialogTitle>
          <DialogDescription>
            Pilih jenis kontrak dan pihak-pihak yang terlibat.
          </DialogDescription>
        </DialogHeader>

        {!showContent ? (
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">Jenis Kontrak</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {CONTRACT_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                      contractType === t.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <Checkbox
                      checked={contractType === t.value}
                      onCheckedChange={() => setContractType(t.value)}
                    />
                    <div>
                      <span className="text-sm font-medium">{t.label}</span>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {(contractType === 'agency_helper' ||
              contractType === 'employer_helper') && (
              <div>
                <Label htmlFor="helperId">Pembantu</Label>
                <Select value={helperId} onValueChange={setHelperId}>
                  <SelectTrigger id="helperId">
                    <SelectValue placeholder="Pilih pembantu" />
                  </SelectTrigger>
                  <SelectContent>
                    {helpers.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.fullName} {h.serviceType ? `(${h.serviceType})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(contractType === 'agency_employer' ||
              contractType === 'employer_helper') && (
              <div>
                <Label htmlFor="employerId">Majikan</Label>
                <Select value={employerId} onValueChange={setEmployerId}>
                  <SelectTrigger id="employerId">
                    <SelectValue placeholder="Pilih majikan" />
                  </SelectTrigger>
                  <SelectContent>
                    {employers.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.fullName} {e.serviceType ? `(${e.serviceType})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="bookingId">Tempahan (pilihan)</Label>
              <Select value={bookingId} onValueChange={setBookingId}>
                <SelectTrigger id="bookingId">
                  <SelectValue placeholder="Pilih tempahan (jika ada)" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.employer.fullName} → {b.helper.fullName} (
                      {b.serviceType || '-'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <Label htmlFor="content">Kandungan Kontrak (boleh edit)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="font-mono text-xs"
            />
            <Button onClick={download} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" /> Muat Turun Kontrak (.txt)
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close}>
            {showContent ? 'Tutup' : 'Batal'}
          </Button>
          {!showContent && (
            <Button onClick={generate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menjana...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" /> Jana Kontrak
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

export function GenerateContractButton({
  helpers,
  employers,
  bookings,
}: {
  helpers: Helper[]
  employers: Employer[]
  bookings: Booking[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Jana Kontrak
      </Button>
      <GenerateContractDialog
        open={open}
        onOpenChange={setOpen}
        helpers={helpers}
        employers={employers}
        bookings={bookings}
        onGenerated={() => {
          if (typeof window !== 'undefined') window.location.reload()
        }}
      />
    </>
  )
}

export function ContractCard({
  contract,
}: {
  contract: {
    id: string
    contractType: string
    status: string
    content: string | null
    signedHelper: boolean
    signedEmployer: boolean
    signedAdmin: boolean
    createdAt: Date
    helper: { fullName: string } | null
    employer: { fullName: string } | null
  }
}) {
  const { toast } = useToast()
  const [signed, setSigned] = useState({
    helper: contract.signedHelper,
    employer: contract.signedEmployer,
    admin: contract.signedAdmin,
  })
  const [content, setContent] = useState(contract.content || '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState(false)

  const toggleSign = async (party: 'helper' | 'employer' | 'admin') => {
    const newVal = !signed[party]
    setSigned({ ...signed, [party]: newVal })
    try {
      const res = await fetch('/api/admin/contracts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contract.id,
          [`signed${party.charAt(0).toUpperCase() + party.slice(1)}`]: newVal,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Dikemas kini',
        description: `Tandatangan ${party} ${newVal ? 'ditambah' : 'dikeluarkan'}.`,
      })
    } catch (e: any) {
      setSigned({ ...signed, [party]: !newVal })
      toast({
        title: 'Ralat',
        description: e.message,
        variant: 'destructive',
      })
    }
  }

  const saveContent = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/contracts/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contract.id, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Disimpan', description: 'Kandungan kontrak dikemas kini.' })
      setEditing(false)
    } catch (e: any) {
      toast({
        title: 'Ralat',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const download = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kontrak-${contract.contractType}-${contract.id.slice(-6)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const typeLabel: Record<string, string> = {
    agency_helper: 'Agensi - Pembantu',
    agency_employer: 'Agensi - Majikan',
    employer_helper: 'Majikan - Pembantu',
  }

  return (
    <div className="rounded-lg border-0 shadow-md bg-card p-5">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h3 className="font-semibold text-base">
                {typeLabel[contract.contractType] || contract.contractType}
              </h3>
              <p className="text-xs text-muted-foreground">
                Dibuat: {new Date(contract.createdAt).toLocaleDateString('ms-MY')}
              </p>
            </div>
            <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
              {contract.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {contract.helper && (
              <div>
                <p className="text-xs text-muted-foreground">Pembantu</p>
                <p className="font-medium">{contract.helper.fullName}</p>
              </div>
            )}
            {contract.employer && (
              <div>
                <p className="text-xs text-muted-foreground">Majikan</p>
                <p className="font-medium">{contract.employer.fullName}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer">
              <Checkbox
                checked={signed.helper}
                onCheckedChange={() => toggleSign('helper')}
              />
              <span className="text-xs">Pembantu</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <Checkbox
                checked={signed.employer}
                onCheckedChange={() => toggleSign('employer')}
              />
              <span className="text-xs">Majikan</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <Checkbox
                checked={signed.admin}
                onCheckedChange={() => toggleSign('admin')}
              />
              <span className="text-xs">Admin</span>
            </label>
            <div className="flex flex-wrap gap-2 ml-auto">
              <SignBadge label="Pembantu" signed={signed.helper} />
              <SignBadge label="Majikan" signed={signed.employer} />
              <SignBadge label="Admin" signed={signed.admin} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setViewing(!viewing)}>
              {viewing ? 'Tutup' : 'Lihat Kandungan'}
            </Button>
            <Button size="sm" variant="outline" onClick={download}>
              <Download className="w-3 h-3 mr-1" /> Muat Turun
            </Button>
            {editing ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  Batal
                </Button>
                <Button size="sm" onClick={saveContent} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3 mr-1" />
                  )}{' '}
                  Simpan
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Edit Kandungan
              </Button>
            )}
          </div>

          {(viewing || editing) && (
            <div className="mt-2">
              {editing ? (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="font-mono text-xs"
                />
              ) : (
                <pre className="bg-muted/30 rounded-lg p-4 text-xs whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                  {content}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
