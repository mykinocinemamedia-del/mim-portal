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
import { Loader2, Plus, FileText, Save, Pencil } from 'lucide-react'

type DocType = 'faq' | 'price' | 'process' | 'contract' | 'medical' | 'general'

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'faq', label: 'FAQ' },
  { value: 'price', label: 'Harga' },
  { value: 'process', label: 'Proses' },
  { value: 'contract', label: 'Kontrak' },
  { value: 'medical', label: 'Perubatan' },
  { value: 'general', label: 'Umum' },
]

export function DocumentDialog({
  doc,
  triggerVariant = 'create',
}: {
  doc?: {
    id: string
    title: string
    docType: string
    content: string | null
    fileUrl: string | null
    isPublished: boolean
  }
  triggerVariant?: 'create' | 'edit'
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: doc?.title || '',
    docType: doc?.docType || 'faq',
    content: doc?.content || '',
    fileUrl: doc?.fileUrl || '',
    isPublished: doc?.isPublished ?? true,
  })

  const submit = async () => {
    if (!form.title) {
      toast({
        title: 'Ruangan wajib',
        description: 'Tajuk diperlukan.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const url = doc
        ? '/api/admin/documents/update'
        : '/api/admin/documents/create'
      const body = doc ? { id: doc.id, ...form } : form
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: doc ? 'Dokumen Dikemas Kini' : 'Dokumen Dicipta',
        description: form.title,
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
      <Button
        variant={triggerVariant === 'edit' ? 'outline' : 'default'}
        size={triggerVariant === 'edit' ? 'sm' : 'default'}
        onClick={() => setOpen(true)}
      >
        {triggerVariant === 'edit' ? (
          <>
            <Pencil className="w-3 h-3 mr-1" /> Edit
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" /> Tambah Dokumen
          </>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              {doc ? 'Edit Dokumen' : 'Tambah Dokumen Baru'}
            </DialogTitle>
            <DialogDescription>
              Dokumen seperti FAQ, senarai harga, proses, dll.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="title">Tajuk</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Cth: Soalan Lazim - Pembayaran"
              />
            </div>
            <div>
              <Label htmlFor="docType">Jenis Dokumen</Label>
              <Select
                value={form.docType}
                onValueChange={(v) => setForm({ ...form, docType: v })}
              >
                <SelectTrigger id="docType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Kandungan</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                placeholder="Kandungan dokumen..."
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
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.isPublished}
                onCheckedChange={(v) => setForm({ ...form, isPublished: v === true })}
              />
              <span className="text-sm">Diterbitkan (visible to users)</span>
            </label>
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
                <>
                  <Save className="w-4 h-4 mr-2" /> Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
