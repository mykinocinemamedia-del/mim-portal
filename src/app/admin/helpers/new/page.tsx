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
import { Checkbox } from '@/components/ui/checkbox'
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
  SKILLS_OPTIONS,
  CHILD_AGE_RANGES,
  RELIGIONS,
  MALAYSIAN_STATES,
} from '@/lib/utils'

export default function AdminNewHelperPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
    status: 'active',
    fullName: '',
    nickname: '',
    ic: '',
    age: '',
    birthDate: '',
    religion: '',
    maritalStatus: '',
    education: '',
    phone: '',
    familyPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Malaysia',
    residencyState: '',
    workArea: '',
    canRelocate: '',
    workTime: '',
    serviceType: '',
    desiredJob: '',
    skills: [] as string[],
    childAges: [] as string[],
    otherSkills: '',
    motivation: '',
    experience: '',
    profilePhoto: '',
  })

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const toggleArray = (key: 'skills' | 'childAges', value: string) => {
    setForm((p) => {
      const arr = p[key]
      return {
        ...p,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      }
    })
  }

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
      const res = await fetch('/api/admin/helpers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: 'Pembantu Ditambah',
        description: `${data.helper.name} telah ditambahkan ke portal.`,
      })
      router.push('/admin/helpers')
    } catch (e: any) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 to-emerald-50/30">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/admin/helpers"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Senarai
          </Link>
          <div className="text-sm font-medium">Tambah Pembantu Baru</div>
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
                  Email dan password untuk log masuk pembantu
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
                    <SelectItem value="matched">Dipadankan</SelectItem>
                    <SelectItem value="employed">Bekerja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="profilePhoto">URL Gambar Profil</Label>
                <Input
                  id="profilePhoto"
                  value={form.profilePhoto}
                  onChange={(e) => set('profilePhoto', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Maklumat Diri</CardTitle>
                <CardDescription>Identiti pembantu</CardDescription>
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
                  placeholder="Cth: Siti Aminah binti Abdullah"
                />
              </div>
              <div>
                <Label htmlFor="nickname">Nama Samaran</Label>
                <Input
                  id="nickname"
                  value={form.nickname}
                  onChange={(e) => set('nickname', e.target.value)}
                  placeholder="Cth: Siti"
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
                <Label htmlFor="age">Umur</Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => set('age', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Tarikh Lahir</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set('birthDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="religion">Agama</Label>
                <Select value={form.religion} onValueChange={(v) => set('religion', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih agama" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELIGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maritalStatus">Status Perkahwinan</Label>
                <Select
                  value={form.maritalStatus}
                  onValueChange={(v) => set('maritalStatus', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bujang">Bujang</SelectItem>
                    <SelectItem value="Berkahwin">Berkahwin</SelectItem>
                    <SelectItem value="Duda/Janda">Duda/Janda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="education">Pendidikan</Label>
                <Select value={form.education} onValueChange={(v) => set('education', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pendidikan" />
                  </SelectTrigger>
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
                <Label htmlFor="phone">No. Telefon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+60123456789"
                />
              </div>
              <div>
                <Label htmlFor="familyPhone">No. Tel Keluarga</Label>
                <Input
                  id="familyPhone"
                  value={form.familyPhone}
                  onChange={(e) => set('familyPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Alamat</h4>
              <div className="grid md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="residencyState">Negeri Tempat Tinggal</Label>
                  <Select
                    value={form.residencyState}
                    onValueChange={(v) => set('residencyState', v)}
                  >
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
                  <Label htmlFor="workArea">Kawasan Kerja Diingini</Label>
                  <Input
                    id="workArea"
                    value={form.workArea}
                    onChange={(e) => set('workArea', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Perkhidmatan</CardTitle>
                <CardDescription>Keutamaan kerja &amp; kebolehan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Boleh Pindah?</Label>
              <RadioGroup
                value={form.canRelocate}
                onValueChange={(v) => set('canRelocate', v)}
                className="flex gap-4 mt-2"
              >
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="r1" />
                  <Label htmlFor="r1">Ya</Label>
                </label>
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="r2" />
                  <Label htmlFor="r2">Tidak</Label>
                </label>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium">Waktu Perkhidmatan</Label>
              <RadioGroup
                value={form.workTime}
                onValueChange={(v) => set('workTime', v)}
                className="mt-2 space-y-2"
              >
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="live_in" id="w1" />
                  <Label htmlFor="w1">Live-in</Label>
                </label>
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="back_forth" id="w2" />
                  <Label htmlFor="w2">Back &amp; Forth</Label>
                </label>
                <label className="flex items-center gap-2">
                  <RadioGroupItem value="both" id="w3" />
                  <Label htmlFor="w3">Boleh kedua-duanya</Label>
                </label>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="serviceType">Jenis Perkhidmatan</Label>
              <Select
                value={form.serviceType}
                onValueChange={(v) => set('serviceType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih perkhidmatan" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="desiredJob">Pekerjaan Diingini</Label>
              <Select
                value={form.desiredJob}
                onValueChange={(v) => set('desiredJob', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pekerjaan" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Kebolehan</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {SKILLS_OPTIONS.map((s) => (
                  <label
                    key={s.value}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                      form.skills.includes(s.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <Checkbox
                      checked={form.skills.includes(s.value)}
                      onCheckedChange={() => toggleArray('skills', s.value)}
                    />
                    <span className="text-sm">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Umur Anak Dijaga</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                {CHILD_AGE_RANGES.map((c) => (
                  <label
                    key={c.value}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                      form.childAges.includes(c.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <Checkbox
                      checked={form.childAges.includes(c.value)}
                      onCheckedChange={() => toggleArray('childAges', c.value)}
                    />
                    <span className="text-sm">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="otherSkills">Kemahiran Lain</Label>
              <Textarea
                id="otherSkills"
                value={form.otherSkills}
                onChange={(e) => set('otherSkills', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="motivation">Motivasi</Label>
              <Textarea
                id="motivation"
                value={form.motivation}
                onChange={(e) => set('motivation', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="experience">Pengalaman</Label>
              <Textarea
                id="experience"
                value={form.experience}
                onChange={(e) => set('experience', e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => router.push('/admin/helpers')}>
              Batal
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Simpan Pembantu
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
