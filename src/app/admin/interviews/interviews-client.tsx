'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Loader2, Plus, Video, Upload, ExternalLink } from 'lucide-react'

type Helper = { id: string; fullName: string }
type Employer = { id: string; fullName: string }

export function InterviewDialog({
  helpers,
  employers,
}: {
  helpers: Helper[]
  employers: Employer[]
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    helperId: '',
    employerId: '',
    scheduledAt: '',
    meetUrl: '',
    notes: '',
  })

  const submit = async () => {
    if (!form.scheduledAt || (!form.helperId && !form.employerId)) {
      toast({
        title: 'Ruangan wajib',
        description: 'Pilih pembantu/majikan dan tarikh temuduga.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/interviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Temuduga Dijadualkan',
        description: `Google Meet: ${data.interview.meetUrl}`,
      })
      setOpen(false)
      setForm({ helperId: '', employerId: '', scheduledAt: '', meetUrl: '', notes: '' })
      if (typeof window !== 'undefined') window.location.reload()
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

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Jadual Temuduga
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-600" /> Jadual Temuduga Baru
            </DialogTitle>
            <DialogDescription>
              Pilih pembantu dan majikan, tarikh &amp; masa. Link Google Meet
              akan dijana secara automatik jika tidak diisi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="helperId">Pembantu</Label>
              <Select value={form.helperId} onValueChange={(v) => setForm({ ...form, helperId: v })}>
                <SelectTrigger id="helperId">
                  <SelectValue placeholder="Pilih pembantu" />
                </SelectTrigger>
                <SelectContent>
                  {helpers.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="employerId">Majikan</Label>
              <Select value={form.employerId} onValueChange={(v) => setForm({ ...form, employerId: v })}>
                <SelectTrigger id="employerId">
                  <SelectValue placeholder="Pilih majikan" />
                </SelectTrigger>
                <SelectContent>
                  {employers.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scheduledAt">Tarikh &amp; Masa Temuduga</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="meetUrl">Google Meet URL (pilihan)</Label>
              <Input
                id="meetUrl"
                value={form.meetUrl}
                onChange={(e) => setForm({ ...form, meetUrl: e.target.value })}
                placeholder="https://meet.google.com/xxx (auto-jana jika kosong)"
              />
            </div>
            <div>
              <Label htmlFor="notes">Nota</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menjadual...
                </>
              ) : (
                'Jadual'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function RecordingDialog({
  interviewId,
  currentUrl,
}: {
  interviewId: string
  currentUrl: string | null
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState(currentUrl || '')

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/interviews/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: interviewId, recordingUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Rakaman Disimpan',
        description: 'URL rakaman temuduga dikemas kini.',
      })
      setOpen(false)
      if (typeof window !== 'undefined') window.location.reload()
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

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Upload className="w-3 h-3 mr-1" /> Rakaman
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" /> Muat Naik Rakaman
            </DialogTitle>
            <DialogDescription>
              Tampal URL rakaman temuduga (Google Drive, YouTube, dll).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="recordingUrl">URL Rakaman</Label>
              <Input
                id="recordingUrl"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
