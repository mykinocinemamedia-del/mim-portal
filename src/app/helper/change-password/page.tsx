'use client'

import { useState, useMemo } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react'

type Strength = {
  score: number // 0-100
  label: string
  color: string
  checks: { label: string; pass: boolean }[]
}

function evaluateStrength(pw: string): Strength {
  const checks = [
    { label: 'Sekurang-kurangnya 8 aksara', pass: pw.length >= 8 },
    { label: 'Mengandungi huruf besar', pass: /[A-Z]/.test(pw) },
    { label: 'Mengandungi huruf kecil', pass: /[a-z]/.test(pw) },
    { label: 'Mengandungi nombor', pass: /[0-9]/.test(pw) },
    { label: 'Mengandungi simbol', pass: /[^A-Za-z0-9]/.test(pw) },
  ]
  const passed = checks.filter((c) => c.pass).length
  const score = Math.round((passed / checks.length) * 100)
  let label = 'Sangat Lemah'
  let color = 'bg-rose-500'
  if (score >= 80) {
    label = 'Sangat Kuat'
    color = 'bg-emerald-500'
  } else if (score >= 60) {
    label = 'Kuat'
    color = 'bg-emerald-400'
  } else if (score >= 40) {
    label = 'Sederhana'
    color = 'bg-amber-500'
  } else if (score >= 20) {
    label = 'Lemah'
    color = 'bg-rose-400'
  }
  return { score, label, color, checks }
}

export default function HelperChangePasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const strength = useMemo(() => evaluateStrength(newPassword), [newPassword])
  const match = newPassword !== '' && newPassword === confirmPassword

  const canSubmit =
    currentPassword !== '' &&
    newPassword.length >= 8 &&
    match &&
    currentPassword !== newPassword

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!match) {
      toast({
        title: 'Ralat',
        description: 'Password baharu dan pengesahan tidak sepadan.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/helper/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menukar password')
      toast({
        title: 'Berjaya',
        description: 'Password anda telah ditukar.',
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
          <div className="text-sm font-medium">Tukar Password</div>
          <div className="w-32" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-xl">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>Tukar Password</CardTitle>
                <CardDescription>
                  Pilih password yang kuat untuk melindungi akaun anda.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={submit}>
            <CardContent className="space-y-4">
              {/* Current password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Semasa</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Tunjuk/Sembunyi"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baharu</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Tunjuk/Sembunyi"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength indicator */}
                {newPassword && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Kekuatan Password:</span>
                      <Badge
                        variant="secondary"
                        className={`${strength.color} text-white hover:${strength.color}`}
                      >
                        {strength.label}
                      </Badge>
                    </div>
                    <Progress value={strength.score} className="h-1.5" />
                    <ul className="grid grid-cols-1 gap-1 mt-2">
                      {strength.checks.map((c) => (
                        <li
                          key={c.label}
                          className={`text-xs flex items-center gap-1.5 ${
                            c.pass ? 'text-emerald-700' : 'text-muted-foreground'
                          }`}
                        >
                          {c.pass ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Pengesahan Password Baharu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`pr-10 ${
                      confirmPassword
                        ? match
                          ? 'border-emerald-500 focus-visible:ring-emerald-500'
                          : 'border-rose-500 focus-visible:ring-rose-500'
                        : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Tunjuk/Sembunyi"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p
                    className={`text-xs ${
                      match ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {match ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                        Password sepadan
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 inline mr-1" />
                        Password tidak sepadan
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Info banner */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 inline mr-1" />
                Password anda akan dikemaskini dan akaun akan ditandai sebagai log masuk pertama selesai.
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/helper/dashboard')}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" /> Tukar Password
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
