'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Home, LogOut, Menu, Bell, ChevronRight, User, Calendar,
  Video, FileText, Settings, KeyRound, HelpCircle, Briefcase,
  Users, Search, CreditCard, MessageCircle, ShieldCheck,
  Stethoscope, GraduationCap, ClipboardList, Bot, Upload
} from 'lucide-react'
import { getInitials } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: any
}

const navByRole: Record<'helper' | 'employer' | 'admin', NavItem[]> = {
  helper: [
    { href: '/helper/dashboard', label: 'Dashboard', icon: Home },
    { href: '/helper/schedule', label: 'Jadual Kerja', icon: Calendar },
    { href: '/helper/video-courses', label: 'Video Kursus', icon: Video },
    { href: '/helper/contract', label: 'Kontrak', icon: FileText },
    { href: '/helper/edit-profile', label: 'Edit Profil', icon: Settings },
    { href: '/helper/change-password', label: 'Tukar Password', icon: KeyRound },
    { href: '/helper/faq', label: 'FAQ', icon: HelpCircle },
  ],
  employer: [
    { href: '/employer/dashboard', label: 'Dashboard', icon: Home },
    { href: '/employer/find-helper', label: 'Cari Pembantu', icon: Search },
    { href: '/employer/my-helper', label: 'Pembantu Saya', icon: Users },
    { href: '/employer/bookings', label: 'Tempahan', icon: ClipboardList },
    { href: '/employer/payments', label: 'Pembayaran', icon: CreditCard },
    { href: '/employer/video-courses', label: 'Video Kursus', icon: Video },
    { href: '/employer/contract', label: 'Kontrak', icon: FileText },
    { href: '/employer/faq', label: 'FAQ', icon: HelpCircle },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/match', label: 'Padan Pembantu', icon: Users },
    { href: '/admin/helpers', label: 'Pembantu', icon: Briefcase },
    { href: '/admin/employers', label: 'Majikan', icon: User },
    { href: '/admin/bookings', label: 'Tempahan', icon: ClipboardList },
    { href: '/admin/contracts', label: 'Kontrak', icon: FileText },
    { href: '/admin/schedule', label: 'Jadual', icon: Calendar },
    { href: '/admin/interviews', label: 'Temuduga', icon: Video },
    { href: '/admin/medical', label: 'Rekod Perubatan', icon: Stethoscope },
    { href: '/admin/documents', label: 'Dokumen', icon: FileText },
    { href: '/admin/video-courses', label: 'Video Kursus', icon: GraduationCap },
    { href: '/admin/notifications', label: 'Notifikasi', icon: Bell },
    { href: '/admin/messages', label: 'Mesej', icon: MessageCircle },
    { href: '/admin/whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { href: '/admin/upload-maids', label: 'Upload Pembantu', icon: Upload },
    { href: '/admin/agents', label: '🤖 AI Agents', icon: Bot },
  ],
}

const roleConfig = {
  helper: { label: 'Pembantu', color: 'bg-[#00bcd4]', home: '/helper/dashboard' },
  employer: { label: 'Majikan', color: 'bg-[#00bcd4]', home: '/employer/dashboard' },
  admin: { label: 'Admin', color: 'bg-[#00bcd4]', home: '/admin/dashboard' },
}

export function DashboardShell({
  role,
  user,
  children,
}: {
  role: 'helper' | 'employer' | 'admin'
  user: { name: string; email: string }
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const cfg = roleConfig[role]
  const navItems = navByRole[role]

  useEffect(() => {
    fetch('/api/notifications/unread-count')
      .then((r) => r.json())
      .then((d) => setNotifications(d.count || 0))
      .catch(() => {})
  }, [pathname])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a1828] text-slate-100">
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-mim.png" alt="MIM Portal" width={40} height={40} className="rounded-lg" />
          <div>
            <p className="font-bold text-sm text-white">MIM Portal</p>
            <p className="text-xs text-slate-400">{cfg.label}</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? 'bg-[#00bcd4]/15 text-[#00bcd4] font-medium'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Log Keluar
        </Button>
      </div>
    </div>
  )

  return (
    <div className="dark min-h-screen flex bg-[#0d1f33]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-white/10 flex-col">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-[#0a1828]">
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d1f33]/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden text-slate-300 hover:text-white hover:bg-white/5" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="md:hidden">
              <Image src="/logo-mim.png" alt="MIM Portal" width={32} height={32} className="rounded-lg" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight text-white">MIM Portal</p>
              <p className="text-xs text-slate-400 leading-tight">{cfg.label} Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="relative text-slate-300 hover:text-white hover:bg-white/5">
              <Link href={`/${role === 'helper' ? 'helper' : role === 'employer' ? 'employer' : 'admin'}/notifications`}>
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center" variant="destructive">
                    {notifications}
                  </Badge>
                )}
              </Link>
            </Button>
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-[#00bcd4] text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content - dark theme */}
        <main className="flex-1 p-4 md:p-6 bg-[#0d1f33] text-slate-100">
          {children}
        </main>
      </div>
    </div>
  )
}
