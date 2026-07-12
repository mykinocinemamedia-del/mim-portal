'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Loader2, Plus, Calendar } from 'lucide-react'

type Helper = { id: string; fullName: string }
type Employer = { id: string; fullName: string }

export function ScheduleDialog({
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
    workDate: '',
    startTime: '',
    endTime: '',
    isDayOff: false,
    notes: '',
  })

  const submit = async () => {
    if (!form.helperId || !form.workDate) {
      toast({
        title: 'Ruangan wajib',
        description: 'Pilih pembantu dan tarikh.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/schedule/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: 'Jadual Ditambah', description: 'Jadual kerja berjaya dicipta.' })
      setOpen(false)
      setForm({
        helperId: '',
        employerId: '',
        workDate: '',
        startTime: '',
        endTime: '',
        isDayOff: false,
        notes: '',
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
        <Plus className="w-4 h-4 mr-2" /> Tambah Jadual
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" /> Tambah Jadual Kerja
            </DialogTitle>
            <DialogDescription>
              Cipta jadual kerja baru untuk pembantu.
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
              <Label htmlFor="employerId">Majikan (pilihan)</Label>
              <Select value={form.employerId} onValueChange={(v) => setForm({ ...form, employerId: v })}>
                <SelectTrigger id="employerId">
                  <SelectValue placeholder="Pilih majikan (pilihan)" />
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
              <Label htmlFor="workDate">Tarikh Kerja</Label>
              <Input
                id="workDate"
                type="date"
                value={form.workDate}
                onChange={(e) => setForm({ ...form, workDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startTime">Masa Mula</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Masa Tamat</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.isDayOff}
                onCheckedChange={(v) => setForm({ ...form, isDayOff: v === true })}
              />
              <span className="text-sm">Hari Cuti</span>
            </label>
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
