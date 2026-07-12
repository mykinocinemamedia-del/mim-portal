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
import { Loader2, Plus, Stethoscope } from 'lucide-react'

type Helper = { id: string; fullName: string }

export function MedicalDialog({ helpers }: { helpers: Helper[] }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    helperId: '',
    recordType: 'medical_health',
    result: '',
    fileUrl: '',
    notes: '',
    uploadDate: '',
  })

  const submit = async () => {
    if (!form.helperId) {
      toast({
        title: 'Ruangan wajib',
        description: 'Pilih pembantu.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/medical/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          uploadDate: form.uploadDate || new Date().toISOString().slice(0, 10),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Rekod Ditambah',
        description: 'Rekod perubatan berjaya dicipta.',
      })
      setOpen(false)
      setForm({
        helperId: '',
        recordType: 'medical_health',
        result: '',
        fileUrl: '',
        notes: '',
        uploadDate: '',
      })
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
        <Plus className="w-4 h-4 mr-2" /> Tambah Rekod
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-600" /> Tambah Rekod Perubatan
            </DialogTitle>
            <DialogDescription>
              Tambah rekod kesihatan atau vaksinasi pembantu.
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
              <Label htmlFor="recordType">Jenis Rekod</Label>
              <Select value={form.recordType} onValueChange={(v) => setForm({ ...form, recordType: v })}>
                <SelectTrigger id="recordType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical_health">Kesihatan</SelectItem>
                  <SelectItem value="vaccination">Vaksinasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="result">Keputusan / Vaksin</Label>
              <Input
                id="result"
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
                placeholder="Cth: SIHAT, COVID-19 Dose 2, Typhoid"
              />
            </div>
            <div>
              <Label htmlFor="uploadDate">Tarikh Muat Naik</Label>
              <Input
                id="uploadDate"
                type="date"
                value={form.uploadDate}
                onChange={(e) => setForm({ ...form, uploadDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="fileUrl">URL Fail (pilihan)</Label>
              <Input
                id="fileUrl"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                placeholder="https://..."
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
