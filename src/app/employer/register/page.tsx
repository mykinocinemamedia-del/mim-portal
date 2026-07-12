'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Briefcase,
  Sparkles,
  Info,
  Home,
  Search,
  Calendar,
  PenTool,
  Rocket,
} from 'lucide-react'
import {
  SERVICE_TYPES,
  MALAYSIAN_STATES,
  getServiceSalaryRange,
  formatMYR,
} from '@/lib/utils'

const JOURNEY = [
  { icon: User, title: 'Daftar', desc: 'Isi borang', active: true },
  { icon: Search, title: 'Cari', desc: 'Pilih pembantu' },
  { icon: Calendar, title: 'Temuduga', desc: 'Google Meet' },
  { icon: PenTool, title: 'Kontrak', desc: 'Tandatangan' },
  { icon: Rocket, title: 'Mula', desc: 'Pembantu datang' },
]

const inputCls = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
const labelCls = 'text-slate-300'

export default function EmployerRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    email: string
    password: string
    whatsappUrl: string
    name: string
  } | null>(null)

  const [form, setForm] = useState({
    // Identity
    fullName: '',
    ic: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Malaysia',
    // Service needs
    serviceType: '',
    numKids: '',
    kidsAges: '',
    salaryOffered: '',
    joinDate: '',
    criteria: '',
  })

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const salaryRange = getServiceSalaryRange(form.serviceType)
  const salaryNum = form.salaryOffered ? parseFloat(form.salaryOffered) : NaN

  const validate = () => {
    if (!form.fullName || !form.phone) {
      toast({
        title: 'Ruangan wajib',
        description: 'Nama penuh dan nombor telefon diperlukan.',
        variant: 'destructive',
      })
      return false
    }
    if (!form.serviceType) {
      toast({
        title: 'Ruangan wajib',
        description: 'Sila pilih jenis perkhidmatan.',
        variant: 'destructive',
      })
      return false
    }
    if (salaryRange && (!isNaN(salaryNum)) && (salaryNum < salaryRange.min || salaryNum > salaryRange.max)) {
      toast({
        title: 'Gaji di luar julat',
        description: `Gaji mesti antara ${formatMYR(salaryRange.min)} - ${formatMYR(salaryRange.max)} untuk jenis perkhidmatan ini.`,
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/employer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult({
        email: data.employer.email,
        password: data.employer.password,
        whatsappUrl: data.whatsappUrl,
        name: data.employer.name,
      })
      toast({
        title: 'Pendaftaran Berjaya!',
        description: 'Kredensial anda telah dijana.',
      })
    } catch (e: any) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0d1f33] to-[#0a1828] p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00bcd4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2d5a7c]/20 rounded-full blur-3xl" />
        <Card className="w-full max-w-md border border-white/10 glass-dark text-white shadow-2xl relative">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-2">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <CardTitle className="text-2xl text-white">Pendaftaran Berjaya!</CardTitle>
            <CardDescription className="text-slate-400">
              Akaun majikan anda telah dicipta. Kredensial dihantar melalui WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#00bcd4]/10 border border-[#00bcd4]/20 text-[#00bcd4] rounded-lg p-4 space-y-2">
              <div>
                <Label className="text-xs opacity-80">Email</Label>
                <p className="font-mono font-semibold break-all">{result.email}</p>
              </div>
              <div>
                <Label className="text-xs opacity-80">Password</Label>
                <p className="font-mono font-semibold">{result.password}</p>
              </div>
            </div>
            <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full btn-rounded bg-transparent border border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                Buka WhatsApp untuk Lihat Kredensial
              </Button>
            </a>
            <Button onClick={() => router.push('/employer/login')} className="w-full btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
              Log Masuk Sekarang
            </Button>
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full text-slate-300 hover:text-white hover:bg-white/5">
                Kembali ke Laman Utama
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1f33] text-slate-100 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00bcd4]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2d5a7c]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d1f33]/80 backdrop-blur sticky top-0 z-40 relative">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-[#00bcd4] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00bcd4] to-[#2d5a7c] flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            Daftar Sebagai Majikan
          </div>
          <Badge variant="outline" className="bg-[#00bcd4]/10 text-[#00bcd4] border-[#00bcd4]/20">Borang Pendaftaran</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl relative">
        {/* Hero image - step 1 register */}
        <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden border border-white/10 mb-6">
          <Image
            src="/images/how-it-works/step1-register.png"
            alt="Daftar Sebagai Majikan"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f33] via-[#0d1f33]/60 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6">
            <div>
              <Badge variant="secondary" className="mb-2 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />Langkah 1 - Daftar
              </Badge>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Mula Perjalanan Anda</h1>
              <p className="text-sm text-slate-300">Isi borang di bawah untuk mendaftar sebagai majikan.</p>
            </div>
          </div>
        </div>

        {/* Journey step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {JOURNEY.map((j, i) => {
              const Icon = j.icon
              const active = j.active
              return (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center text-center gap-1 min-w-0">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        active
                          ? 'border-[#00bcd4] bg-[#00bcd4]/15 text-[#00bcd4]'
                          : 'border-white/10 bg-white/5 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-white truncate w-full">{j.title}</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block truncate w-full">{j.desc}</div>
                  </div>
                  {i < JOURNEY.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${active ? 'bg-[#00bcd4]/40' : 'bg-white/10'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Card className="border border-white/10 glass-dark text-white shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">Maklumat Diri Majikan</CardTitle>
                <CardDescription className="text-slate-400">Seksyen 1: Identiti Majikan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className={labelCls}>
                  Nama Penuh <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="fullName"
                  className={inputCls}
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="Cth: Ahmad bin Abdullah"
                />
              </div>
              <div>
                <Label htmlFor="ic" className={labelCls}>No. Kad Pengenalan (IC)</Label>
                <Input
                  id="ic"
                  className={inputCls}
                  value={form.ic}
                  onChange={(e) => set('ic', e.target.value)}
                  placeholder="XXXXXX-XX-XXXX"
                />
              </div>
              <div>
                <Label htmlFor="phone" className={labelCls}>
                  No. Telefon <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="phone"
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+60123456789"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Kredensial akan dihantar ke nombor ini.
                </p>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="addressLine1" className={labelCls}>Alamat (Baris 1)</Label>
                <Input
                  id="addressLine1"
                  className={inputCls}
                  value={form.addressLine1}
                  onChange={(e) => set('addressLine1', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="addressLine2" className={labelCls}>Alamat (Baris 2)</Label>
                <Input
                  id="addressLine2"
                  className={inputCls}
                  value={form.addressLine2}
                  onChange={(e) => set('addressLine2', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city" className={labelCls}>Bandar</Label>
                <Input
                  id="city"
                  className={inputCls}
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state" className={labelCls}>Negeri</Label>
                <Select value={form.state} onValueChange={(v) => set('state', v)}>
                  <SelectTrigger className={inputCls}>
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
                <Label htmlFor="postalCode" className={labelCls}>Poskod</Label>
                <Input
                  id="postalCode"
                  className={inputCls}
                  value={form.postalCode}
                  onChange={(e) => set('postalCode', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="country" className={labelCls}>Negara</Label>
                <Input
                  id="country"
                  className={inputCls}
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/10 glass-dark text-white shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">Keperluan Perkhidmatan</CardTitle>
                <CardDescription className="text-slate-400">
                  Seksyen 2: Butiran pembantu yang diperlukan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className={`text-sm font-medium ${labelCls}`}>
                Jenis Perkhidmatan <span className="text-rose-400">*</span>
              </Label>
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
                        ? 'border-[#00bcd4] bg-[#00bcd4]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <RadioGroupItem value={t.value} id={`st-${t.value}`} className="mt-1" />
                    <div>
                      <Label htmlFor={`st-${t.value}`} className="text-sm font-medium cursor-pointer text-slate-200">
                        {t.label}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {formatMYR(t.salaryMin)} - {formatMYR(t.salaryMax)}
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {salaryRange && (
              <div className="bg-[#00bcd4]/10 border border-[#00bcd4]/20 rounded-lg p-3 text-xs text-[#00bcd4] flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  Julat gaji untuk jenis perkhidmatan ini ialah{' '}
                  <strong>
                    {formatMYR(salaryRange.min)} - {formatMYR(salaryRange.max)}
                  </strong>{' '}
                  sebulan. Sila masukkan tawaran gaji dalam julat ini.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numKids" className={labelCls}>Bilangan Anak</Label>
                <Input
                  id="numKids"
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.numKids}
                  onChange={(e) => set('numKids', e.target.value)}
                  placeholder="Cth: 2"
                />
              </div>
              <div>
                <Label htmlFor="kidsAges" className={labelCls}>Umur Anak-anak</Label>
                <Input
                  id="kidsAges"
                  className={inputCls}
                  value={form.kidsAges}
                  onChange={(e) => set('kidsAges', e.target.value)}
                  placeholder="Cth: 3 tahun, 7 tahun"
                />
              </div>
              <div>
                <Label htmlFor="salaryOffered" className={labelCls}>
                  Tawaran Gaji (RM/sebulan)
                </Label>
                <Input
                  id="salaryOffered"
                  type="number"
                  className={inputCls}
                  value={form.salaryOffered}
                  onChange={(e) => set('salaryOffered', e.target.value)}
                  placeholder={salaryRange ? `${salaryRange.min} - ${salaryRange.max}` : 'Cth: 1800'}
                />
                {salaryRange && (
                  <p className="text-xs text-slate-500 mt-1">
                    Julat: {formatMYR(salaryRange.min)} - {formatMYR(salaryRange.max)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="joinDate" className={labelCls}>Tarikh Mula Kerja</Label>
                <Input
                  id="joinDate"
                  type="date"
                  className={`${inputCls} [color-scheme:dark]`}
                  value={form.joinDate}
                  onChange={(e) => set('joinDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="criteria" className={labelCls}>Kriteria / Keperluan Khas</Label>
              <Textarea
                id="criteria"
                className={inputCls}
                value={form.criteria}
                onChange={(e) => set('criteria', e.target.value)}
                placeholder="Cth: Boleh memasak, berpengalaman menjaga bayi, boleh bercakap Bahasa Melayu..."
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-6 pt-0">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5" onClick={() => router.push('/')}>
              Batal
            </Button>
            <Button className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0" onClick={submit} disabled={loading}>
              {loading ? (
                'Sedang mendaftar...'
              ) : (
                <>
                  Daftar Sekarang <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
