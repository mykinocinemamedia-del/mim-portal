'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, User, Briefcase, Save, Lock } from 'lucide-react'
import {
  SERVICE_TYPES,
  MALAYSIAN_STATES,
  getServiceSalaryRange,
  formatMYR,
} from '@/lib/utils'

export default function AdminNewEmployerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    status: 'active',
    fullName: '',
    ic: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Malaysia',
    serviceType: '',
    numKids: '',
    kidsAges: '',
    salaryOffered: '',
    joinDate: '',
    criteria: '',
  })

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const salaryRange = getServiceSalaryRange(form.serviceType)

  const generatePassword = () => {
    const pwd = `MIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`
    set('password', pwd)
  }

  const submit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      toast({
        title: 'Ruangan wajib',
        description: 'Nama, email dan password diperlukan.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/employers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: 'Majikan Ditambah',
        description: `${data.employer.name} telah ditambahkan ke portal.`,
      })
      router.push('/admin/employers')
    } catch (e: any) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 to-amber-50/30">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/admin/employers"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Senarai
          </Link>
          <div className="text-sm font-medium">Tambah Majikan Baru</div>
          <Badge variant="outline">Admin</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Akaun &amp; Kredensial</CardTitle>
                <CardDescription>
                  Email dan password untuk log masuk majikan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="nama@mim.com.my"
                />
              </div>
              <div>
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="••••••••"
                  />
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    Auto
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status Akaun</Label>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Maklumat Diri Majikan</CardTitle>
                <CardDescription>Identiti majikan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">
                  Nama Penuh <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="Cth: Ahmad bin Abdullah"
                />
              </div>
              <div>
                <Label htmlFor="ic">No. Kad Pengenalan (IC)</Label>
                <Input
                  id="ic"
                  value={form.ic}
                  onChange={(e) => set('ic', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">No. Telefon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+60123456789"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="addressLine1">Alamat (Baris 1)</Label>
                <Input
                  id="addressLine1"
                  value={form.addressLine1}
                  onChange={(e) => set('addressLine1', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="addressLine2">Alamat (Baris 2)</Label>
                <Input
                  id="addressLine2"
                  value={form.addressLine2}
                  onChange={(e) => set('addressLine2', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">Bandar</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">Negeri</Label>
                <Select value={form.state} onValueChange={(v) => set('state', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih negeri" />
                  </SelectTrigger>
                  <SelectContent>
                    {MALAYSIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="postalCode">Poskod</Label>
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(e) => set('postalCode', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="country">Negara</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Keperluan Perkhidmatan</CardTitle>
                <CardDescription>Butiran pembantu yang diperlukan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Jenis Perkhidmatan</Label>
              <RadioGroup
                value={form.serviceType}
                onValueChange={(v) => set('serviceType', v)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2"
              >
                {SERVICE_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                      form.serviceType === t.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <RadioGroupItem
                      value={t.value}
                      id={`st-${t.value}`}
                      className="mt-1"
                    />
                    <div>
                      <Label
                        htmlFor={`st-${t.value}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {t.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {formatMYR(t.salaryMin)} - {formatMYR(t.salaryMax)}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
              {salaryRange && (
                <p className="text-xs text-muted-foreground mt-2">
                  Julat gaji: {formatMYR(salaryRange.min)} -{' '}
                  {formatMYR(salaryRange.max)} sebulan
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numKids">Bilangan Anak</Label>
                <Input
                  id="numKids"
                  type="number"
                  min={0}
                  value={form.numKids}
                  onChange={(e) => set('numKids', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="kidsAges">Umur Anak-anak</Label>
                <Input
                  id="kidsAges"
                  value={form.kidsAges}
                  onChange={(e) => set('kidsAges', e.target.value)}
                  placeholder="Cth: 3 tahun, 7 tahun"
                />
              </div>
              <div>
                <Label htmlFor="salaryOffered">Tawaran Gaji (RM/sebulan)</Label>
                <Input
                  id="salaryOffered"
                  type="number"
                  value={form.salaryOffered}
                  onChange={(e) => set('salaryOffered', e.target.value)}
                  placeholder={
                    salaryRange ? `${salaryRange.min} - ${salaryRange.max}` : ''
                  }
                />
              </div>
              <div>
                <Label htmlFor="joinDate">Tarikh Mula Kerja</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={form.joinDate}
                  onChange={(e) => set('joinDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="criteria">Kriteria / Keperluan Khas</Label>
              <Textarea
                id="criteria"
                value={form.criteria}
                onChange={(e) => set('criteria', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => router.push('/admin/employers')}>
              Batal
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Simpan Majikan
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
