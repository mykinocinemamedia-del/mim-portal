'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import {
  Bell,
  Loader2,
  Send,
  Users,
  User as UserIcon,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

type User = { id: string; fullName: string; type: 'helper' | 'employer' }
type RecentNotification = {
  id: string
  title: string
  message: string | null
  createdAt: string
  userType: string
}

export default function AdminNotificationsClient({
  users,
  recent,
}: {
  users: User[]
  recent: RecentNotification[]
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [recipientType, setRecipientType] = useState('all_helpers')
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({
    title: '',
    message: '',
    link: '',
  })

  const submit = async () => {
    if (!form.title || !form.message) {
      toast({
        title: 'Ruangan wajib',
        description: 'Tajuk dan mesej diperlukan.',
        variant: 'destructive',
      })
      return
    }
    if (recipientType === 'specific' && !userId) {
      toast({
        title: 'Ruangan wajib',
        description: 'Pilih pengguna.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType,
          userId: recipientType === 'specific' ? userId : undefined,
          ...form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Notifikasi Dihantar',
        description: data.message,
      })
      setForm({ title: '', message: '', link: '' })
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
          <h1 className="text-2xl md:text-3xl font-bold">Hantar Notifikasi</h1>
          <p className="text-muted-foreground mt-1">
            Hantar notifikasi kepada pembantu atau majikan.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-600" /> Borang Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Penerima</Label>
              <RadioGroup
                value={recipientType}
                onValueChange={setRecipientType}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2"
              >
                <label
                  className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                    recipientType === 'all_helpers'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="all_helpers" id="r1" className="mt-1" />
                  <div>
                    <Label htmlFor="r1" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                      <Users className="w-3 h-3" /> Semua Pembantu
                    </Label>
                    <p className="text-xs text-muted-foreground">Hantar ke semua pembantu</p>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                    recipientType === 'all_employers'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="all_employers" id="r2" className="mt-1" />
                  <div>
                    <Label htmlFor="r2" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                      <Users className="w-3 h-3" /> Semua Majikan
                    </Label>
                    <p className="text-xs text-muted-foreground">Hantar ke semua majikan</p>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                    recipientType === 'specific'
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <RadioGroupItem value="specific" id="r3" className="mt-1" />
                  <div>
                    <Label htmlFor="r3" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                      <UserIcon className="w-3 h-3" /> Pengguna Khusus
                    </Label>
                    <p className="text-xs text-muted-foreground">Pilih seorang</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {recipientType === 'specific' && (
              <div>
                <Label htmlFor="userId">Pilih Pengguna</Label>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger id="userId">
                    <SelectValue placeholder="Pilih pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.fullName} ({u.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="title">Tajuk</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Cth: Peringatan Bayaran"
              />
            </div>
            <div>
              <Label htmlFor="message">Mesej</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                placeholder="Tulis mesej notifikasi..."
              />
            </div>
            <div>
              <Label htmlFor="link">Link (pilihan)</Label>
              <Input
                id="link"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="/employer/payments"
              />
            </div>

            <Button onClick={submit} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghantar...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Hantar Notifikasi
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" /> Notifikasi Terkini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Tiada notifikasi dihantar lagi.
              </p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {recent.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-lg bg-muted/30 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-sm line-clamp-1">
                        {n.title}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {n.userType}
                      </Badge>
                    </div>
                    {n.message && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
