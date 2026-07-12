'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Calendar,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getServiceSalaryRange,
  getServiceLabel,
  formatMYR,
  getInitials,
} from '@/lib/utils'

const DURATIONS = [
  { value: 6, label: '6 Bulan' },
  { value: 12, label: '12 Bulan' },
  { value: 24, label: '24 Bulan' },
]

type Helper = {
  id: string
  fullName: string
  nickname: string | null
  serviceType: string | null
  desiredJob: string | null
  city: string | null
  state: string | null
  profilePhoto: string | null
  rating: number
  liveIn: boolean
  backAndForth: boolean
  canBoth: boolean
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Memuatkan...</div></div>}>
      <NewBookingContent />
    </Suspense>
  )
}

function NewBookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const helperId = searchParams.get('helperId')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [helper, setHelper] = useState<Helper | null>(null)
  const [loadingHelper, setLoadingHelper] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [salary, setSalary] = useState<number>(0)
  const [startDate, setStartDate] = useState('')
  const [durationMonths, setDurationMonths] = useState<number>(12)
  const [customDuration, setCustomDuration] = useState('')
  const [useCustomDuration, setUseCustomDuration] = useState(false)
  const [workMode, setWorkMode] = useState<'live_in' | 'back_forth'>('live_in')
  const [specialRequests, setSpecialRequests] = useState('')

  useEffect(() => {
    if (!helperId) {
      setError('ID pembantu tidak ditemui. Sila pilih pembantu dari halaman Cari Pembantu.')
      setLoadingHelper(false)
      return
    }
    fetch(`/api/employer/find-helpers?helperId=${helperId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.helper) {
          setHelper(d.helper)
          // Determine salary range from service type
          const st = d.helper.serviceType || d.helper.desiredJob
          const range = getServiceSalaryRange(st)
          if (range) {
            setSalary(Math.round((range.min + range.max) / 2))
          } else {
            setSalary(1800)
          }
        } else {
          setError(d.error || 'Pembantu tidak dijumpai')
        }
      })
      .catch(() => setError('Gagal memuatkan maklumat pembantu'))
      .finally(() => setLoadingHelper(false))
  }, [helperId])

  const serviceType = helper?.serviceType || helper?.desiredJob || ''
  const salaryRange = getServiceSalaryRange(serviceType)
  const finalDuration = useCustomDuration
    ? parseInt(customDuration) || 0
    : durationMonths

  const validateStep1 = () => {
    if (!salary || salary < 1) {
      toast({
        title: 'Gaji diperlukan',
        description: 'Sila masukkan jumlah gaji.',
        variant: 'destructive',
      })
      return false
    }
    if (salaryRange && (salary < salaryRange.min || salary > salaryRange.max)) {
      toast({
        title: 'Gaji di luar julat',
        description: `Gaji mesti antara ${formatMYR(salaryRange.min)} - ${formatMYR(salaryRange.max)}.`,
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!startDate) {
      toast({
        title: 'Tarikh mula diperlukan',
        description: 'Sila pilih tarikh mula kerja.',
        variant: 'destructive',
      })
      return false
    }
    if (useCustomDuration && (!customDuration || parseInt(customDuration) < 1)) {
      toast({
        title: 'Tempoh tidak sah',
        description: 'Sila masukkan tempoh yang sah (minimum 1 bulan).',
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const submit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    try {
      const res = await fetch('/api/employer/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helperId,
          salary,
          startDate,
          durationMonths: finalDuration,
          liveIn: workMode === 'live_in',
          specialRequests,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({
        title: 'Tempahan Berjaya!',
        description: 'Tempahan anda telah dihantar. Admin akan menghubungi anda untuk pengesahan.',
      })
      router.push('/employer/bookings')
    } catch (e: any) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Loading / Error states
  if (loadingHelper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-emerald-50/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-sm text-muted-foreground">Memuatkan maklumat pembantu...</p>
        </div>
      </div>
    )
  }

  if (error || !helper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/50 to-emerald-50/30 p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-2">
              <AlertCircle className="w-9 h-9" />
            </div>
            <CardTitle>Ralat</CardTitle>
            <CardDescription>{error || 'Pembantu tidak dijumpai'}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/employer/find-helper">
                <User className="w-4 h-4 mr-2" /> Cari Pembantu
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/employer/dashboard">Kembali ke Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-emerald-50/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/employer/find-helper"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="text-sm font-medium">Tempahan Baru</div>
          <Badge variant="outline">Langkah {step}/3</Badge>
        </div>
        <div className="container mx-auto px-4 pb-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  s <= step ? 'bg-amber-600' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span className={step >= 1 ? 'text-amber-700 font-medium' : ''}>Gaji</span>
            <span className={step >= 2 ? 'text-amber-700 font-medium' : ''}>Perkhidmatan</span>
            <span className={step >= 3 ? 'text-amber-700 font-medium' : ''}>Pengesahan</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Helper card */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center overflow-hidden shrink-0">
              {helper.profilePhoto ? (
                <img
                  src={helper.profilePhoto}
                  alt={helper.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-semibold">{getInitials(helper.fullName)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{helper.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {getServiceLabel(serviceType)}
                {helper.state ? ` · ${helper.state}` : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Salary */}
        {step === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Tawaran Gaji</CardTitle>
                  <CardDescription>Langkah 1: Pilih jumlah gaji bulanan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {salaryRange && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                  <p className="font-semibold mb-1">Julat Gaji Disyorkan</p>
                  <p>
                    Untuk {getServiceLabel(serviceType)}, julat gaji ialah{' '}
                    <strong>
                      {formatMYR(salaryRange.min)} - {formatMYR(salaryRange.max)}
                    </strong>{' '}
                    sebulan.
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Jumlah Gaji (sebulan)</Label>
                  <span className="text-2xl font-bold text-amber-700">
                    {formatMYR(salary)}
                  </span>
                </div>
                {salaryRange && (
                  <Slider
                    value={[salary]}
                    min={salaryRange.min}
                    max={salaryRange.max}
                    step={50}
                    onValueChange={(v) => setSalary(v[0])}
                  />
                )}
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{salaryRange ? formatMYR(salaryRange.min) : 'RM0'}</span>
                  <span>{salaryRange ? formatMYR(salaryRange.max) : 'RM5000'}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="salary-input">Atau masukkan jumlah manual</Label>
                <Input
                  id="salary-input"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(parseInt(e.target.value) || 0)}
                  min={salaryRange?.min}
                  max={salaryRange?.max}
                />
                {salaryRange && (salary < salaryRange.min || salary > salaryRange.max) && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Gaji mesti antara {formatMYR(salaryRange.min)} - {formatMYR(salaryRange.max)}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" asChild>
                <Link href="/employer/find-helper">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Batal
                </Link>
              </Button>
              <Button onClick={() => validateStep1() && setStep(2)}>
                Seterusnya <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Service Details */}
        {step === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Butiran Perkhidmatan</CardTitle>
                  <CardDescription>Langkah 2: Tetapkan butiran perkhidmatan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="startDate">
                  Tarikh Mula Kerja <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Tempoh Perkhidmatan</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => {
                        setDurationMonths(d.value)
                        setUseCustomDuration(false)
                      }}
                      className={`p-2 rounded-lg border-2 text-sm transition ${
                        !useCustomDuration && durationMonths === d.value
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomDuration}
                      onChange={(e) => setUseCustomDuration(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Tempoh tersendiri</span>
                  </label>
                  {useCustomDuration && (
                    <Input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="Cth: 18 bulan"
                      min={1}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Waktu Kerja</Label>
                <RadioGroup
                  value={workMode}
                  onValueChange={(v) => setWorkMode(v as 'live_in' | 'back_forth')}
                  className="mt-2 space-y-2"
                >
                  <label
                    className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                      workMode === 'live_in'
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value="live_in" id="wm-live" className="mt-1" />
                    <div>
                      <Label htmlFor="wm-live" className="cursor-pointer">
                        Duduk bersama (Live-in)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Pembantu tinggal bersama. Cuti Ahad &amp; Cuti Umum.
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                      workMode === 'back_forth'
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value="back_forth" id="wm-bf" className="mt-1" />
                    <div>
                      <Label htmlFor="wm-bf" className="cursor-pointer">
                        Balik hari (Back &amp; Forth)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        8:00am - 7:00pm. Cuti Ahad &amp; Cuti Umum.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="specialRequests">Permintaan Khas</Label>
                <Textarea
                  id="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Cth: Perlu memasak makanan vegetarian, menjaga anak pada hujung minggu..."
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
              <Button onClick={() => validateStep2() && setStep(3)}>
                Seterusnya <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Pengesahan Tempahan</CardTitle>
                  <CardDescription>Langkah 3: Semak dan sahkan tempahan</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm">Ringkasan Tempahan</h4>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Pembantu</p>
                    <p className="font-medium">{helper.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Perkhidmatan</p>
                    <p className="font-medium">{getServiceLabel(serviceType)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gaji Sebulan</p>
                    <p className="font-medium text-amber-700">{formatMYR(salary)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tarikh Mula</p>
                    <p className="font-medium">{startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tempoh</p>
                    <p className="font-medium">{finalDuration} bulan</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Waktu Kerja</p>
                    <p className="font-medium">
                      {workMode === 'live_in' ? 'Live-in' : 'Back & Forth'}
                    </p>
                  </div>
                </div>

                {specialRequests && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Permintaan Khas</p>
                    <p className="text-sm">{specialRequests}</p>
                  </div>
                )}

                {salaryRange && finalDuration > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Anggaran Jumlah Bayaran</p>
                    <p className="font-bold text-lg text-amber-700">
                      {formatMYR(salary * finalDuration)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({formatMYR(salary)} × {finalDuration} bulan)
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  Dengan menekan &quot;Sahkan Tempahan&quot;, anda bersetuju dengan terma
                  perkhidmatan. Admin akan menghubungi anda untuk pengesahan dan
                  seterusnya.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
              <Button onClick={submit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sedang menghantar...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Sahkan Tempahan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
