'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { Loader2, Plus, MessageCircle, Send } from 'lucide-react'

type Helper = { id: string; fullName: string; phone: string | null }
type Employer = { id: string; fullName: string; phone: string | null }
type Message = {
  id: string
  subject: string | null
  body: string
  createdAt: string
  helperId: string | null
  employerId: string | null
  helperName?: string | null
  employerName?: string | null
}

export function MessagesClient({
  helpers,
  employers,
  messages,
}: {
  helpers: Helper[]
  employers: Employer[]
  messages: Message[]
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recipientType, setRecipientType] = useState<'helper' | 'employer'>('helper')
  const [recipientId, setRecipientId] = useState('')
  const [form, setForm] = useState({
    subject: '',
    body: '',
  })

  const currentList = recipientType === 'helper' ? helpers : employers

  const submit = async () => {
    if (!recipientId || !form.body) {
      toast({
        title: 'Ruangan wajib',
        description: 'Pilih penerima dan tulis mesej.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType,
          recipientId,
          ...form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Mesej Dihantar',
        description: 'Mesej berjaya dihantar kepada pengguna.',
      })
      setOpen(false)
      setForm({ subject: '', body: '' })
      setRecipientId('')
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pusat Mesej</h1>
          <p className="text-muted-foreground mt-1">
            {messages.length} mesej dalam sistem.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Hantar Mesej
        </Button>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-lg border-0 shadow-md bg-card p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Tiada Mesej</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Hantar mesej pertama anda kepada pembantu atau majikan.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border-0 shadow-sm bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {m.subject || '(Tiada subjek)'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Kepada:{' '}
                      {m.helperName || m.employerName || 'Tidak diketahui'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(m.createdAt).toLocaleString('ms-MY')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground bg-muted/30 rounded p-3 mt-2 whitespace-pre-wrap">
                {m.body}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" /> Hantar Mesej
            </DialogTitle>
            <DialogDescription>
              Hantar mesej kepada pembantu atau majikan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="recipientType">Jenis Penerima</Label>
              <Select
                value={recipientType}
                onValueChange={(v) => {
                  setRecipientType(v as 'helper' | 'employer')
                  setRecipientId('')
                }}
              >
                <SelectTrigger id="recipientType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helper">Pembantu</SelectItem>
                  <SelectItem value="employer">Majikan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recipientId">Penerima</Label>
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger id="recipientId">
                  <SelectValue placeholder={`Pilih ${recipientType === 'helper' ? 'pembantu' : 'majikan'}`} />
                </SelectTrigger>
                <SelectContent>
                  {currentList.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName}
                      {u.phone ? ` (${u.phone})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subjek</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="body">Mesej</Label>
              <Textarea
                id="body"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={6}
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghantar...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Hantar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
