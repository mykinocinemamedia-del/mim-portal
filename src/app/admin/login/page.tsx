'use client'

import { useState } from 'react'
import Image from 'next/image'
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
import { useToast } from '@/hooks/use-toast'
import { Home, ArrowLeft, LogIn, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'admin' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: 'Log Masuk Berjaya',
        description: `Selamat datang, ${data.user.name}!`,
      })
      // Use window.location for full page reload so session cookie is properly read
      window.location.href = '/admin/dashboard'
    } catch (e: any) {
      toast({
        title: 'Log Masuk Gagal',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-[#0d1f33]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1828] via-[#0d1f33] to-[#102943]" />
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'url(/images/patterns/login-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00bcd4]/15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2d5a7c]/20 rounded-full blur-3xl" />
      <div className="absolute top-20 left-20 w-32 h-32 dot-pattern opacity-20" />
      <Card className="w-full max-w-md border border-white/10 shadow-2xl relative z-10 glass-dark text-white">
        <CardHeader className="text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 mb-4"
          >
            <Image src="/logo-mim.png" alt="MIM Portal" width={44} height={44} className="rounded-lg shadow-md" />
          </Link>
          <CardTitle className="text-2xl text-white">Log Masuk Admin</CardTitle>
          <CardDescription className="text-slate-400">
            Portal Pentadbir MIM — akses terhad
          </CardDescription>
        </CardHeader>
        <form onSubmit={submit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mim.com.my"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="bg-[#00bcd4]/10 border border-[#00bcd4]/20 rounded-lg p-3 text-xs text-[#00bcd4]">
              <p className="font-semibold mb-1">Demo Login:</p>
              <p>Email: admin@mim.com.my</p>
              <p>Password: Admin@MIM2026</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0" disabled={loading}>
              {loading ? (
                'Sedang log masuk...'
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" /> Log Masuk
                </>
              )}
            </Button>
            <div className="flex justify-between w-full text-sm">
              <Link
                href="/"
                className="text-slate-400 hover:text-[#00bcd4] inline-flex items-center"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Laman Utama
              </Link>
              <Link
                href="/helper/login"
                className="text-slate-400 hover:text-[#00bcd4] inline-flex items-center"
              >
                <Home className="w-3 h-3 mr-1" /> Log Masuk Pembantu
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
