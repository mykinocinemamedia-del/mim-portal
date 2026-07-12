'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  Briefcase,
  Camera,
  Sparkles,
  FileText,
} from 'lucide-react'
import { MALAYSIAN_STATES } from '@/lib/utils'

type ProfileForm = {
  nickname: string
  phone: string
  familyPhone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  profilePhoto: string
  workArea: string
  motivation: string
  experience: string
  otherSkills: string
}

const EMPTY_FORM: ProfileForm = {
  nickname: '',
  phone: '',
  familyPhone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Malaysia',
  profilePhoto: '',
  workArea: '',
  motivation: '',
  experience: '',
  otherSkills: '',
}

export default function HelperEditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const set = (k: keyof ProfileForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    fetch('/api/helper/profile')
      .then(async (r) => {
        if (!r.ok) throw new Error('Gagal memuatkan profil')
        const data = await r.json()
        setForm({
          nickname: data.helper.nickname || '',
          phone: data.helper.phone || '',
          familyPhone: data.helper.familyPhone || '',
          addressLine1: data.helper.addressLine1 || '',
          addressLine2: data.helper.addressLine2 || '',
          city: data.helper.city || '',
          state: data.helper.state || '',
          postalCode: data.helper.postalCode || '',
          country: data.helper.country || 'Malaysia',
          profilePhoto: data.helper.profilePhoto || '',
          workArea: data.helper.workArea || '',
          motivation: data.helper.motivation || '',
          experience: data.helper.experience || '',
          otherSkills: data.helper.otherSkills || '',
        })
      })
      .catch((e) => {
        toast({
          title: 'Ralat',
          description: e.message,
          variant: 'destructive',
        })
      })
      .finally(() => setLoading(false))
  }, [toast])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/helper/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan profil')
      toast({
        title: 'Profil Dikemaskini',
        description: 'Maklumat profil anda telah disimpan.',
      })
      router.push('/helper/dashboard')
    } catch (e: any) {
      toast({
        title: 'Ralat',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-amber-50/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/helper/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <div className="text-sm font-medium">Edit Profil Pembantu</div>
          <div className="w-32" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <form onSubmit={submit} className="space-y-6">
          {/* Header card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Maklumat Peribadi</CardTitle>
                  <CardDescription>Kemas kini butiran peribadi anda</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <FormSkeleton rows={4} />
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
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
                      <Label htmlFor="phone">No. Telefon</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => set('phone', e.target.value)}
                        placeholder="+60123456789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="familyPhone">No. Tel Keluarga Terdekat</Label>
                      <Input
                        id="familyPhone"
                        value={form.familyPhone}
                        onChange={(e) => set('familyPhone', e.target.value)}
                        placeholder="+60123456789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profilePhoto">URL Gambar Profil</Label>
                      <div className="flex gap-2">
                        <Input
                          id="profilePhoto"
                          value={form.profilePhoto}
                          onChange={(e) => set('profilePhoto', e.target.value)}
                          placeholder="https://..."
                        />
                        {form.profilePhoto && (
                          <img
                            src={form.profilePhoto}
                            alt="Preview"
                            className="w-10 h-10 rounded-lg object-cover border"
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Camera className="w-3 h-3 inline mr-1" />
                        Muat naik gambar ke hosting (cth: Imgur) dan tampal URL di sini.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Address card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Alamat</CardTitle>
                  <CardDescription>Alamat tempat tinggal semasa</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <FormSkeleton rows={4} />
              ) : (
                <>
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
                      <Select
                        value={form.state}
                        onValueChange={(v) => set('state', v)}
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Work info */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Maklumat Kerja</CardTitle>
                  <CardDescription>Butiran pekerjaan dan pengalaman</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <FormSkeleton rows={3} />
              ) : (
                <>
                  <div>
                    <Label htmlFor="workArea">Kawasan Kerja Diingini</Label>
                    <Input
                      id="workArea"
                      value={form.workArea}
                      onChange={(e) => set('workArea', e.target.value)}
                      placeholder="Cth: Kuala Lumpur, Selangor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherSkills">Kemahiran Lain</Label>
                    <Textarea
                      id="otherSkills"
                      value={form.otherSkills}
                      onChange={(e) => set('otherSkills', e.target.value)}
                      placeholder="Nyatakan kemahiran lain yang anda ada..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="motivation" className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Motivasi
                    </Label>
                    <Textarea
                      id="motivation"
                      value={form.motivation}
                      onChange={(e) => set('motivation', e.target.value)}
                      placeholder="Mengapa anda berminat bekerja sebagai pembantu?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience" className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Pengalaman
                    </Label>
                    <Textarea
                      id="experience"
                      value={form.experience}
                      onChange={(e) => set('experience', e.target.value)}
                      placeholder="Ceritakan pengalaman hidup yang memotivasikan anda..."
                      rows={4}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/helper/dashboard')}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving || loading} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Simpan Profil
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}

function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
