'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, ArrowRight, CheckCircle2, User, FileText, Sparkles, Home } from 'lucide-react'
import { SERVICE_TYPES, SKILLS_OPTIONS, CHILD_AGE_RANGES, RELIGIONS, MALAYSIAN_STATES } from '@/lib/utils'

const STEPS = [
  { num: 1, image: '/images/how-it-works/step1-register.png', title: 'Daftar', desc: 'Maklumat Diri' },
  { num: 2, image: '/images/how-it-works/step2-profile.png', title: 'Profil', desc: 'Borang A' },
]

const inputCls = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
const labelCls = 'text-slate-300'

export default function HelperRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ email: string; password: string; whatsappUrl: string } | null>(null)

  const [form, setForm] = useState({
    // Section 1: Identity
    fullName: '', nickname: '', ic: '', age: '', birthDate: '',
    religion: '', maritalStatus: '', education: '', phone: '', familyPhone: '',
    addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'Malaysia',
    residencyState: '', workArea: '',
    // Section 2: Form A
    hasPermission: '',
    canRelocate: '',
    workTime: '', // live_in, back_forth, both
    serviceTypes: [] as string[], // multiple choice
    desiredJob: '',
    skills: [] as string[],
    childAges: [] as string[],
    otherSkills: '',
    motivation: '',
    experience: '',
  })

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const toggleArray = (key: 'serviceTypes' | 'skills' | 'childAges', value: string) => {
    setForm((p) => {
      const arr = p[key]
      return { ...p, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] }
    })
  }

  const totalSteps = 2
  const progress = (step / totalSteps) * 100

  const validateStep1 = () => {
    if (!form.fullName || !form.phone) {
      toast({ title: 'Ruangan wajib', description: 'Nama penuh dan nombor telefon diperlukan.', variant: 'destructive' })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!form.hasPermission || !form.canRelocate || !form.workTime || !form.desiredJob) {
      toast({ title: 'Ruangan wajib', description: 'Sila jawab semua soalan wajib.', variant: 'destructive' })
      return false
    }
    return true
  }

  const submit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const res = await fetch('/api/helper/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult({
        email: data.helper.email,
        password: data.helper.password,
        whatsappUrl: data.whatsappUrl,
      })
      toast({ title: 'Pendaftaran Berjaya!', description: 'Kredensial anda telah dijana.' })
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
              Akaun anda telah dicipta. Kredensial dihantar melalui WhatsApp.
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
            <Button onClick={() => router.push('/helper/login')} className="w-full btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
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
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-[#00bcd4] transition">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00bcd4] to-[#2d5a7c] flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            Daftar Sebagai Pembantu
          </div>
          <Badge variant="outline" className="bg-[#00bcd4]/10 text-[#00bcd4] border-[#00bcd4]/20">Langkah {step}/{totalSteps}</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl relative">
        <Progress value={progress} className="h-2 mb-6 bg-white/10 [&>div]:bg-[#00bcd4]" />

        {/* Step indicator with images */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          {STEPS.map((s) => {
            const active = step === s.num
            const done = step > s.num
            return (
              <div
                key={s.num}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  active
                    ? 'border-[#00bcd4]/40 bg-[#00bcd4]/10'
                    : done
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-white/10 bg-white/5 opacity-60'
                }`}
              >
                <div className={`relative w-12 h-12 rounded-lg overflow-hidden border shrink-0 ${active ? 'border-[#00bcd4]/50' : 'border-white/10'}`}>
                  <Image
                    src={s.image}
                    alt={`Langkah ${s.num}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${active ? 'text-[#00bcd4]' : done ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {String(s.num).padStart(2, '0')}
                    </span>
                    {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-sm font-semibold text-white truncate">{s.title}</div>
                  <div className="text-xs text-slate-400 truncate">{s.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Step 1: Identity */}
        {step === 1 && (
          <Card className="border border-white/10 glass-dark text-white shadow-lg">
            {/* Step thumbnail header */}
            <div className="relative h-28 sm:h-32 overflow-hidden rounded-t-lg">
              <Image
                src={STEPS[0].image}
                alt="Langkah 1 - Daftar"
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f33] via-[#0d1f33]/70 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#00bcd4]/20 text-[#00bcd4] flex items-center justify-center backdrop-blur">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Maklumat Diri</CardTitle>
                  <p className="text-xs text-slate-300">Seksyen 1: Identiti Pembantu</p>
                </div>
              </div>
            </div>
            <CardContent className="space-y-4 p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className={labelCls}>Nama Penuh <span className="text-rose-400">*</span></Label>
                  <Input id="fullName" className={inputCls} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Cth: Siti Aminah binti Abdullah" />
                </div>
                <div>
                  <Label htmlFor="nickname" className={labelCls}>Nama Samaran</Label>
                  <Input id="nickname" className={inputCls} value={form.nickname} onChange={(e) => set('nickname', e.target.value)} placeholder="Cth: Siti" />
                </div>
                <div>
                  <Label htmlFor="ic" className={labelCls}>No. Kad Pengenalan (IC)</Label>
                  <Input id="ic" className={inputCls} value={form.ic} onChange={(e) => set('ic', e.target.value)} placeholder="XXXXXX-XX-XXXX" />
                </div>
                <div>
                  <Label htmlFor="age" className={labelCls}>Umur</Label>
                  <Input id="age" type="number" className={inputCls} value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="Cth: 28" />
                </div>
                <div>
                  <Label htmlFor="birthDate" className={labelCls}>Tarikh Lahir</Label>
                  <Input id="birthDate" type="date" className={`${inputCls} [color-scheme:dark]`} value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="religion" className={labelCls}>Agama</Label>
                  <Select value={form.religion} onValueChange={(v) => set('religion', v)}>
                    <SelectTrigger className={inputCls}><SelectValue placeholder="Pilih agama" /></SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maritalStatus" className={labelCls}>Status Perkahwinan</Label>
                  <Select value={form.maritalStatus} onValueChange={(v) => set('maritalStatus', v)}>
                    <SelectTrigger className={inputCls}><SelectValue placeholder="Pilih status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bujang">Bujang</SelectItem>
                      <SelectItem value="Berkahwin">Berkahwin</SelectItem>
                      <SelectItem value="Duda/Janda">Duda/Janda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="education" className={labelCls}>Pendidikan</Label>
                  <Select value={form.education} onValueChange={(v) => set('education', v)}>
                    <SelectTrigger className={inputCls}><SelectValue placeholder="Pilih pendidikan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPSRO">UPSR/RO</SelectItem>
                      <SelectItem value="PT3">PT3/PMR/SRP</SelectItem>
                      <SelectItem value="SPM">SPM/SPMV</SelectItem>
                      <SelectItem value="STPM">STPM/Matrikulasi</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Ijazah">Ijazah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone" className={labelCls}>No. Telefon <span className="text-rose-400">*</span></Label>
                  <Input id="phone" className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+60123456789" />
                  <p className="text-xs text-slate-500 mt-1">Kredensial akan dihantar ke nombor ini.</p>
                </div>
                <div>
                  <Label htmlFor="familyPhone" className={labelCls}>No. Tel Keluarga Terdekat</Label>
                  <Input id="familyPhone" className={inputCls} value={form.familyPhone} onChange={(e) => set('familyPhone', e.target.value)} placeholder="+60123456789" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="font-semibold mb-3 text-white">Alamat</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine1" className={labelCls}>Alamat (Baris 1)</Label>
                    <Input id="addressLine1" className={inputCls} value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine2" className={labelCls}>Alamat (Baris 2)</Label>
                    <Input id="addressLine2" className={inputCls} value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="city" className={labelCls}>Bandar</Label>
                    <Input id="city" className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="state" className={labelCls}>Negeri</Label>
                    <Select value={form.state} onValueChange={(v) => set('state', v)}>
                      <SelectTrigger className={inputCls}><SelectValue placeholder="Pilih negeri" /></SelectTrigger>
                      <SelectContent>
                        {MALAYSIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postalCode" className={labelCls}>Poskod</Label>
                    <Input id="postalCode" className={inputCls} value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="country" className={labelCls}>Negara</Label>
                    <Input id="country" className={inputCls} value={form.country} onChange={(e) => set('country', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="residencyState" className={labelCls}>Negeri Tempat Tinggal (untuk profil)</Label>
                    <Select value={form.residencyState} onValueChange={(v) => set('residencyState', v)}>
                      <SelectTrigger className={inputCls}><SelectValue placeholder="Pilih negeri" /></SelectTrigger>
                      <SelectContent>
                        {MALAYSIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workArea" className={labelCls}>Kawasan Kerja Diingini</Label>
                    <Input id="workArea" className={inputCls} value={form.workArea} onChange={(e) => set('workArea', e.target.value)} placeholder="Cth: Kuala Lumpur" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-6 pt-0">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5" onClick={() => router.push('/')}>Batal</Button>
              <Button className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0" onClick={() => validateStep1() && setStep(2)}>
                Seterusnya <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Form A */}
        {step === 2 && (
          <Card className="border border-white/10 glass-dark text-white shadow-lg">
            {/* Step thumbnail header */}
            <div className="relative h-28 sm:h-32 overflow-hidden rounded-t-lg">
              <Image
                src={STEPS[1].image}
                alt="Langkah 2 - Profil"
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f33] via-[#0d1f33]/70 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center backdrop-blur">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Borang A - Soalan</CardTitle>
                  <p className="text-xs text-slate-300">Seksyen 2: Penilaian Pembantu</p>
                </div>
              </div>
            </div>
            <CardContent className="space-y-6 p-6">
              {/* Q1: Permission */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${labelCls}`}>
                  1. Sudahkah anda meminta izin daripada ibu bapa/penjaga atau suami/isteri/tunang anda untuk bekerja sebagai pembantu rumah/pengasuh/penjaga orang tua?
                </Label>
                <p className="text-xs text-slate-500">Sila berikan jawapan yang jujur. Hubungi 011-64611801 untuk maklumat lanjut.</p>
                <RadioGroup value={form.hasPermission} onValueChange={(v) => set('hasPermission', v)}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Sudah" id="p1a" /><Label htmlFor="p1a" className={labelCls}>a. Sudah</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Belum" id="p1b" /><Label htmlFor="p1b" className={labelCls}>b. Belum</Label></div>
                </RadioGroup>
              </div>

              {/* Q2: Relocate */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${labelCls}`}>
                  2. Bolehkah anda bekerja di luar kawasan anda? (Cth: asal Johor bekerja di Kuala Lumpur)
                </Label>
                <p className="text-xs text-slate-500">Jika &quot;Boleh&quot;, profil akan menunjukkan &quot;Boleh di mana-mana sahaja&quot;. Jika &quot;Tidak Boleh&quot;, kawasan akan dihadkan ke negeri asal.</p>
                <RadioGroup value={form.canRelocate} onValueChange={(v) => set('canRelocate', v)}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="p2a" /><Label htmlFor="p2a" className={labelCls}>a. Boleh</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="p2b" /><Label htmlFor="p2b" className={labelCls}>b. Tidak boleh</Label></div>
                </RadioGroup>
              </div>

              {/* Q3: Work Time */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${labelCls}`}>3. Waktu perkhidmatan yang diingini</Label>
                <RadioGroup value={form.workTime} onValueChange={(v) => set('workTime', v)}>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="live_in" id="p3a" className="mt-1" />
                    <Label htmlFor="p3a" className={labelCls}>a. Duduk bersama (Cuti Ahad &amp; Cuti Umum)</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="back_forth" id="p3b" className="mt-1" />
                    <Label htmlFor="p3b" className={labelCls}>b. Balik hari (8:00am - 7:00pm, Cuti Ahad &amp; Cuti Umum)</Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="both" id="p3c" className="mt-1" />
                    <Label htmlFor="p3c" className={labelCls}>c. Boleh kedua-duanya</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Q4: Service Types */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${labelCls}`}>4. Jenis perkhidmatan yang boleh dilakukan (boleh pilih lebih dari satu)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SERVICE_TYPES.map((t) => (
                    <label key={t.value} className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${form.serviceTypes.includes(t.value) ? 'border-[#00bcd4] bg-[#00bcd4]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      <Checkbox checked={form.serviceTypes.includes(t.value)} onCheckedChange={() => toggleArray('serviceTypes', t.value)} />
                      <span className="text-sm text-slate-200">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q5: Desired Job */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${labelCls}`}>5. Ingin menjadi Pembantu Rumah, Pengasuh atau Penjaga Orang Tua?</Label>
                <RadioGroup value={form.desiredJob} onValueChange={(v) => set('desiredJob', v)}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="maid" id="p5a" /><Label htmlFor="p5a" className={labelCls}>a. Pembantu Rumah</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="babysitter" id="p5b" /><Label htmlFor="p5b" className={labelCls}>b. Pengasuh</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="caregiver" id="p5c" /><Label htmlFor="p5c" className={labelCls}>c. Penjaga Orang Tua</Label></div>
                </RadioGroup>
              </div>

              {/* Q6: Skills */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${labelCls}`}>6. Kebolehan (boleh pilih lebih dari satu)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SKILLS_OPTIONS.map((s) => (
                    <label key={s.value} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${form.skills.includes(s.value) ? 'border-[#00bcd4] bg-[#00bcd4]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      <Checkbox checked={form.skills.includes(s.value)} onCheckedChange={() => toggleArray('skills', s.value)} />
                      <span className="text-sm text-slate-200">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q7: Child Ages */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${labelCls}`}>7. Umur anak-anak yang mampu dijaga (untuk Pengasuh &amp; Penjaga Orang Tua)</Label>
                <p className="text-xs text-slate-500">Tidak wajib. Boleh kosongkan jika tidak berkaitan.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {CHILD_AGE_RANGES.map((c) => (
                    <label key={c.value} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${form.childAges.includes(c.value) ? 'border-[#00bcd4] bg-[#00bcd4]/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      <Checkbox checked={form.childAges.includes(c.value)} onCheckedChange={() => toggleArray('childAges', c.value)} />
                      <span className="text-sm text-slate-200">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Q8: Other Skills */}
              <div className="space-y-2">
                <Label htmlFor="otherSkills" className={labelCls}>8. Kemahiran lain (sekiranya ada)</Label>
                <Textarea id="otherSkills" className={inputCls} value={form.otherSkills} onChange={(e) => set('otherSkills', e.target.value)} placeholder="Nyatakan kemahiran lain..." />
              </div>

              {/* Q9: Motivation */}
              <div className="space-y-2">
                <Label htmlFor="motivation" className={labelCls}>9. Nyatakan mengapa anda berminat bekerja sebagai pengasuh/pembantu rumah.</Label>
                <Textarea id="motivation" className={inputCls} value={form.motivation} onChange={(e) => set('motivation', e.target.value)} placeholder="Cth: Saya suka menjaga kanak-kanak dan ingin membantu keluarga..." />
              </div>

              {/* Q10: Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience" className={labelCls}>10. Ceritakan pengalaman hidup yang memotivasikan anda untuk bekerja.</Label>
                <Textarea id="experience" className={inputCls} value={form.experience} onChange={(e) => set('experience', e.target.value)} placeholder="Cth: Saya mempunyai adik beradik yang ramai. Setiap bulan saya juga perlu menyumbang kepada keluarga..." />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-6 pt-0">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
              <Button className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0" onClick={submit} disabled={loading}>
                {loading ? 'Sedang mendaftar...' : <>Daftar Sekarang <Sparkles className="w-4 h-4 ml-2" /></>}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
