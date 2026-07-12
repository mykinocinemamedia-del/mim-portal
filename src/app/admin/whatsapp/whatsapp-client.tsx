'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/hooks/use-toast'
import {
  MessageCircle,
  Send,
  ExternalLink,
  Smartphone,
} from 'lucide-react'
import { waLink } from '@/lib/utils'

type Helper = { id: string; fullName: string; phone: string | null }
type Employer = { id: string; fullName: string; phone: string | null }

const TEMPLATES = [
  {
    key: 'payment_overdue',
    label: 'Peringatan Bayaran Tertunggak',
    text: (name: string) =>
      `Hai ${name}, ini admin MIM Portal. Anda mempunyai pembayaran tertunggak. Sila buat pembayaran secepat mungkin. Untuk pertanyaan, hubungi admin. Terima kasih.`,
  },
  {
    key: 'schedule_interview',
    label: 'Jadual Temuduga',
    text: (name: string) =>
      `Hai ${name}, ini admin MIM Portal. Temuduga anda telah dijadualkan. Sila semak link Google Meet di portal MIM. Hadir tepat pada masa yang ditetapkan. Terima kasih.`,
  },
  {
    key: 'missing_photo',
    label: 'Muat Naik Gambar Profil',
    text: (name: string) =>
      `Hai ${name}, ini admin MIM Portal. Anda belum memuat naik gambar profil. Sila log masuk ke portal dan muat naik gambar di bahagian Edit Profil. Terima kasih.`,
  },
  {
    key: 'contract_signed',
    label: 'Kontrak Ditandatangani',
    text: (name: string) =>
      `Hai ${name}, ini admin MIM Portal. Kontrak anda telah ditandatangani semua pihak. Sila log masuk ke portal untuk muat turun kontrak. Terima kasih.`,
  },
  {
    key: 'custom',
    label: 'Mesej Tersuai',
    text: () => '',
  },
]

export default function AdminWhatsAppClient({
  helpers,
  employers,
}: {
  helpers: Helper[]
  employers: Employer[]
}) {
  const { toast } = useToast()
  const [recipientType, setRecipientType] = useState<'helper' | 'employer'>('helper')
  const [recipientId, setRecipientId] = useState('')
  const [templateKey, setTemplateKey] = useState('custom')
  const [message, setMessage] = useState('')

  const currentList = recipientType === 'helper' ? helpers : employers
  const recipient = currentList.find((u) => u.id === recipientId)

  const phone = recipient?.phone || ''

  const waUrl = useMemo(() => {
    if (!phone) return ''
    return waLink(phone, message || `Hai ${recipient?.fullName || ''}, ini admin MIM Portal...`)
  }, [phone, message, recipient])

  const applyTemplate = (key: string) => {
    setTemplateKey(key)
    const tpl = TEMPLATES.find((t) => t.key === key)
    if (tpl) {
      setMessage(tpl.text(recipient?.fullName || ''))
    }
  }

  const openWhatsApp = () => {
    if (!phone) {
      toast({
        title: 'Tiada nombor telefon',
        description: 'Penerima tidak mempunyai nombor telefon.',
        variant: 'destructive',
      })
      return
    }
    if (!message) {
      toast({
        title: 'Mesej kosong',
        description: 'Sila tulis mesej sebelum menghantar.',
        variant: 'destructive',
      })
      return
    }
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pusat WhatsApp</h1>
          <p className="text-muted-foreground mt-1">
            Hantar mesej WhatsApp kepada pembantu atau majikan.
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Compose */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" /> Pilih Penerima &amp; Mesej
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                      {u.phone ? ` · ${u.phone}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Templat Mesej</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => applyTemplate(t.key)}
                    className={`text-left p-2 rounded-lg border text-xs transition ${
                      templateKey === t.key
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="message">Mesej WhatsApp</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setTemplateKey('custom')
                }}
                rows={8}
                placeholder="Tulis mesej WhatsApp..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                {message.length} aksara
              </p>
            </div>

            <Button
              onClick={openWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={!phone}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Buka WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Right: Preview */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-600" /> Pratonton
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <p className="text-xs text-muted-foreground mb-1">Penerima</p>
              <p className="font-medium">
                {recipient?.fullName || '(pilih penerima)'}
              </p>
              <p className="text-xs text-muted-foreground">
                {phone || 'Tiada nombor telefon'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Pratonton WhatsApp
              </p>
              <div className="bg-[#e5ddd5] rounded-lg p-3 min-h-[200px]">
                <div className="bg-[#dcf8c6] rounded-lg p-3 max-w-[90%] ml-auto text-sm whitespace-pre-wrap shadow-sm">
                  {message || (
                    <span className="text-muted-foreground italic">
                      Mesej anda akan muncul di sini...
                    </span>
                  )}
                  <div className="text-xs text-muted-foreground text-right mt-1">
                    {new Date().toLocaleTimeString('ms-MY', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!phone}
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Buka wa.me link
                </Button>
              </a>
            )}
            {!phone && recipient && (
              <p className="text-xs text-rose-600 text-center">
                Penerima ini tiada nombor telefon dalam rekod.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
