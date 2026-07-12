import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  CheckCircle2, X, Home, Sparkles, Flame, Lock, Users2,
  Star, MessageCircle, Zap, ShieldCheck, Crown, Rocket,
  ArrowRight, ChevronRight,
} from 'lucide-react'
import { waCompanyLink } from '@/lib/utils'

export const metadata = {
  title: 'Harga & Pakej | MIM Portal - Maid In Malaysia',
  description:
    'Pilih pakej MIM Portal yang sesuai untuk keluarga anda. Percuma, Basic (RM49/bulan) atau Premium (RM99/bulan). Diskaun 50% untuk 100 pendaftaran pertama.',
}

type Plan = {
  name: string
  tagline: string
  priceMonthly: number
  priceYearly: number | null
  yearlyNote?: string
  ctaLabel: string
  ctaHref: string
  badge?: { label: string; highlight?: boolean }
  features: string[]
  limitations: string[]
  scarcity?: { icon: 'flame' | 'lock'; text: string }
  highlight?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'FREE',
    tagline: 'Cuba Percuma',
    priceMonthly: 0,
    priceYearly: null,
    ctaLabel: 'Mula Percuma',
    ctaHref: '/employer/register',
    badge: { label: 'Untuk Cubaan' },
    features: [
      'Cari & lihat maksimum 3 pembantu sebulan',
      'Lihat profil asas (nama, kawasan, jenis perkhidmatan)',
      '1 temuduga sebulan',
      'Akses AI Chatbot (basic)',
      'Community support',
    ],
    limitations: [
      'Tiada akses rating & reviews',
      'Tiada filter advanced',
      'Tiada kontrak automatik',
      'Tiada priority matching',
    ],
  },
  {
    name: 'BASIC',
    tagline: 'Paling Popular',
    priceMonthly: 49,
    priceYearly: 490,
    yearlyNote: 'atau RM490/tahun - save 17%',
    ctaLabel: 'Pilih Basic',
    ctaHref: '/employer/register?plan=basic',
    badge: { label: 'PALING POPULAR', highlight: true },
    highlight: true,
    features: [
      'Cari & lihat pembantu TANPA LIMIT',
      'Lihat profil lengkap + rating & reviews',
      'Filter advanced (agama, kawasan, kemahiran)',
      '5 temuduga sebulan',
      'Kontrak automatik (3 jenis)',
      'AI Matchmaker (basic scoring)',
      'WhatsApp support',
    ],
    limitations: [],
    scarcity: {
      icon: 'flame',
      text: 'Harga naik ke RM79/bulan selepas 50 pendaftaran pertama',
    },
  },
  {
    name: 'PREMIUM',
    tagline: 'Pengalaman Lengkap',
    priceMonthly: 99,
    priceYearly: 990,
    yearlyNote: 'atau RM990/tahun - save 17%',
    ctaLabel: 'Pilih Premium',
    ctaHref: '/employer/register?plan=premium',
    badge: { label: 'TERBAIK' },
    features: [
      'Semua feature Basic',
      'Priority matching (AI score 85+ first)',
      'Temuduga TANPA LIMIT',
      'AI Matchmaker advanced (detailed reasoning)',
      'Dedicated account manager',
      'Background check lengkap',
      'Medical records access',
      'Contract customization',
      '24/7 priority support',
      'Early access to new helpers',
    ],
    limitations: [],
    scarcity: {
      icon: 'lock',
      text: 'Hanya 20 slot Premium tersedia bulan ini',
    },
  },
]

// Feature comparison rows: value is boolean or string
type CompareRow = {
  category: string
  label: string
  free: boolean | string
  basic: boolean | string
  premium: boolean | string
}

const COMPARE_ROWS: CompareRow[] = [
  // Pencarian & Profil
  { category: 'Pencarian & Profil', label: 'Lihat profil asas', free: true, basic: true, premium: true },
  { category: 'Pencarian & Profil', label: 'Lihat profil lengkap + rating & reviews', free: false, basic: true, premium: true },
  { category: 'Pencarian & Profil', label: 'Bilangan pembantu boleh lihat sebulan', free: '3', basic: 'Tanpa Limit', premium: 'Tanpa Limit' },
  { category: 'Pencarian & Profil', label: 'Filter advanced (agama, kawasan, kemahiran)', free: false, basic: true, premium: true },
  { category: 'Pencarian & Profil', label: 'Early access ke pembantu baru', free: false, basic: false, premium: true },
  // Temuduga
  { category: 'Temuduga', label: 'Bilangan temuduga sebulan', free: '1', basic: '5', premium: 'Tanpa Limit' },
  { category: 'Temuduga', label: 'Google Meet 3-pihak (majikan, pembantu, admin)', free: true, basic: true, premium: true },
  // AI Features
  { category: 'AI Features', label: 'AI Chatbot (basic)', free: true, basic: true, premium: true },
  { category: 'AI Features', label: 'AI Matchmaker - basic scoring', free: false, basic: true, premium: true },
  { category: 'AI Features', label: 'AI Matchmaker - advanced reasoning', free: false, basic: false, premium: true },
  { category: 'AI Features', label: 'Priority matching (AI score 85+ first)', free: false, basic: false, premium: true },
  // Kontrak & Dokumen
  { category: 'Kontrak & Dokumen', label: 'Kontrak automatik (3 jenis)', free: false, basic: true, premium: true },
  { category: 'Kontrak & Dokumen', label: 'Contract customization', free: false, basic: false, premium: true },
  { category: 'Kontrak & Dokumen', label: 'Background check lengkap', free: false, basic: false, premium: true },
  { category: 'Kontrak & Dokumen', label: 'Medical records access', free: false, basic: false, premium: true },
  // Sokongan
  { category: 'Sokongan', label: 'Community support', free: true, basic: false, premium: false },
  { category: 'Sokongan', label: 'WhatsApp support', free: false, basic: true, premium: true },
  { category: 'Sokongan', label: '24/7 priority support', free: false, basic: false, premium: true },
  { category: 'Sokongan', label: 'Dedicated account manager', free: false, basic: false, premium: true },
]

const FAQ_ITEMS = [
  {
    q: 'Boleh saya tukar pakej selepas mendaftar?',
    a: 'Ya! Anda boleh naik taraf (upgrade) atau turun taraf (downgrade) pakej pada bila-bila masa melalui dashboard majikan. Perbezaan harga akan diprorata mengikut baki tempoh. Untuk naik taraf ke Premium, hubungi admin kami melalui WhatsApp.',
  },
  {
    q: 'Adakah harga akan naik selepas tempoh promosi?',
    a: 'Harga promosi (RM49/bulan untuk Basic dan RM99/bulan untuk Premium) dijamin untuk pelanggan yang mendaftar dalam 100 pendaftaran pertama. Anda akan kekal pada harga promosi selagi langganan aktif. Selepas kuota promosi habis, harga standard Basic ialah RM79/bulan.',
  },
  {
    q: 'Apakah perbezaan antara pembayaran bulanan dan tahunan?',
    a: 'Pembayaran tahunan memberi anda diskaun 17% berbanding pembayaran bulanan. Sebagai contoh, pakej Basic berjumlah RM490/tahun berbanding RM588 jika dibayar bulanan (12 x RM49). Pembayaran tahunan juga mengelakkan kenaikan harga semasa tempoh langganan.',
  },
  {
    q: 'Adakah percuma benar-benar percuma?',
    a: 'Ya! Pakej FREE tiada bayaran dan tiada kad kredit diperlukan. Ia sesuai untuk mencuba platform MIM Portal. Anda boleh lihat sehingga 3 profil pembantu dan jalankan 1 temuduga sebulan. Bila anda sedia untuk pengalaman penuh, naik taraf ke Basic atau Premium.',
  },
]

function PlanCard({ plan }: { plan: Plan }) {
  const isFree = plan.priceMonthly === 0
  const isHighlight = plan.highlight

  return (
    <Card
      className={`relative border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        isHighlight
          ? 'border-[#00bcd4]/60 glass-dark shadow-[0_0_40px_rgba(0,188,212,0.25)] lg:scale-105'
          : 'border-white/10 glass-dark hover:border-[#00bcd4]/40'
      }`}
    >
      {/* Glow accent for highlight card */}
      {isHighlight && (
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00bcd4] to-transparent" />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-0 right-0 z-10">
          <div
            className={`px-4 py-1.5 text-[10px] font-bold tracking-wider rounded-bl-xl ${
              plan.badge.highlight
                ? 'bg-[#00bcd4] text-[#0d1f33]'
                : 'bg-white/10 text-slate-300'
            }`}
          >
            {plan.badge.label}
          </div>
        </div>
      )}

      <CardContent className="p-6 md:p-7">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            {plan.name === 'FREE' && <Home className="w-4 h-4 text-slate-400" />}
            {plan.name === 'BASIC' && <Zap className="w-4 h-4 text-[#00bcd4]" />}
            {plan.name === 'PREMIUM' && <Crown className="w-4 h-4 text-amber-400" />}
            <h3 className={`text-xl font-bold tracking-wide ${isHighlight ? 'text-[#00bcd4]' : 'text-white'}`}>
              {plan.name}
            </h3>
          </div>
          <p className="text-sm text-slate-400">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="mb-5 pb-5 border-b border-white/10">
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-slate-400">RM</span>
            <span className="text-4xl md:text-5xl font-bold text-white">{plan.priceMonthly}</span>
            <span className="text-sm text-slate-400">/bulan</span>
          </div>
          {plan.yearlyNote && (
            <p className="text-xs text-[#00bcd4] mt-1.5">{plan.yearlyNote}</p>
          )}
          {isFree && (
            <p className="text-xs text-slate-500 mt-1.5">Selama-lamanya. Tiada kad kredit diperlukan.</p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2.5 mb-5">
          {plan.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#00bcd4] shrink-0 mt-0.5" />
              <span className="text-sm text-slate-200">{f}</span>
            </div>
          ))}
        </div>

        {/* Limitations */}
        {plan.limitations.length > 0 && (
          <div className="space-y-2.5 mb-5 pt-4 border-t border-white/10">
            {plan.limitations.map((l, i) => (
              <div key={i} className="flex items-start gap-2.5 opacity-50">
                <X className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-500 line-through decoration-slate-600">{l}</span>
              </div>
            ))}
          </div>
        )}

        {/* Scarcity badge */}
        {plan.scarcity && (
          <div
            className={`mb-5 px-3 py-2.5 rounded-lg text-xs flex items-start gap-2 ${
              plan.scarcity.icon === 'flame'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {plan.scarcity.icon === 'flame' ? (
              <Flame className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{plan.scarcity.text}</span>
          </div>
        )}

        {/* CTA */}
        <Link href={plan.ctaHref} className="block">
          <Button
            className={`w-full btn-rounded h-12 text-sm font-semibold border-0 ${
              isHighlight
                ? 'bg-[#00bcd4] hover:bg-[#00a5bb] text-white'
                : isFree
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                : 'bg-[#00bcd4]/90 hover:bg-[#00bcd4] text-white'
            }`}
          >
            {plan.ctaLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function CompareCell({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="flex justify-center">
        <CheckCircle2 className={`w-5 h-5 ${highlight ? 'text-[#00bcd4]' : 'text-emerald-400'}`} />
      </div>
    ) : (
      <div className="flex justify-center">
        <X className="w-5 h-5 text-slate-600" />
      </div>
    )
  }
  return (
    <div className="text-center">
      <span className={`text-sm font-medium ${highlight ? 'text-[#00bcd4]' : 'text-slate-200'}`}>{value}</span>
    </div>
  )
}

export default function PricingPage() {
  // Scarcity counters
  const registrationsFilled = 93
  const totalSlots = 100
  const fillPercent = (registrationsFilled / totalSlots) * 100

  // Group comparison rows by category
  const categories = Array.from(new Set(COMPARE_ROWS.map((r) => r.category)))

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1f33] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d1f33]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00bcd4] to-[#2d5a7c] flex items-center justify-center text-white font-bold shadow-md">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">MIM Portal</h1>
              <p className="text-xs text-slate-400 leading-tight">Maid In Malaysia</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/#how-it-works" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Cara Kerja</Link>
            <Link href="/#services" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Perkhidmatan</Link>
            <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-[#00bcd4] transition">Harga</Link>
            <Link href="/#ai-agents" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">AI Agents</Link>
            <Link href="/#faq" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/employer/login">
              <Button size="sm" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white">Log Masuk</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Title */}
      <section className="relative overflow-hidden wave-bg">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00bcd4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2d5a7c]/20 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 py-16 md:py-20 relative text-center">
          <Badge variant="secondary" className="mb-4 bg-[#00bcd4]/15 text-[#00bcd4] hover:bg-[#00bcd4]/20 border border-[#00bcd4]/20">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Pilih Pakej Yang Sesuai
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight text-white mb-4">
            Harga <span className="gradient-text font-semibold">Telus & Berpatutan</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Pilih pakej yang sesuai untuk keluarga anda. Cuba percuma, atau dapatkan akses penuh dengan Basic dan Premium. Tiada yuran tersembunyi.
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00bcd4] to-[#2d5a7c] border-2 border-[#0d1f33] flex items-center justify-center"
                >
                  <Users2 className="w-4 h-4 text-white" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-300">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-white">Dipercayai oleh 200+ keluarga Malaysia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-[#0d1f33] to-[#102943] relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-start">
            {PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">
            Semua harga dalam Ringgit Malaysia (RM). Pembayaran melalui WhatsApp admin atau platform pembayaran selamat.
          </p>
        </div>
      </section>

      {/* Scarcity Section - Limited Offer */}
      <section className="py-14 bg-[#102943] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <Card className="border border-amber-500/30 glass-dark max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-6 md:p-10">
              <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Flame className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20">
                      Offaran Terhad
                    </Badge>
                    <span className="text-xs text-amber-300/70 font-medium">BERAKHIR MALAM INI</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    50% DISKAUN untuk 100 pendaftaran pertama
                  </h2>
                  <p className="text-sm text-slate-300 mb-4">
                    Jangan terlepas peluang! Harga promosi ini akan berakhir apabila kuota 100 pendaftaran pertama habis diisi.
                  </p>

                  {/* Counter */}
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl md:text-3xl font-bold text-[#00bcd4]">{registrationsFilled}</span>
                      <span className="text-slate-400 text-sm md:text-base">/ {totalSlots} pendaftaran telah diisi</span>
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-amber-300 whitespace-nowrap">
                      {totalSlots - registrationsFilled} slot tinggal!
                    </span>
                  </div>
                  <Progress
                    value={fillPercent}
                    className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-[#00bcd4]"
                  />

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Link href="/employer/register" className="flex-1">
                      <Button className="w-full btn-rounded h-12 bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 font-semibold">
                        <Rocket className="w-4 h-4 mr-2" /> Daftar Sekarang
                      </Button>
                    </Link>
                    <a
                      href={waCompanyLink('Hai, saya mahu tahu tentang offaran promosi pakej MIM Portal.')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full btn-rounded h-12 bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" /> Tanya WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-[#102943] to-[#0d1f33]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border border-[#00bcd4]/20">
              Perbandingan Pakej
            </Badge>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
              Bandingkan <span className="gradient-text font-semibold">Semua Features</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Lihat semua features setiap pakej secara berperingkat supaya anda boleh pilih yang paling sesuai.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="text-left p-4 glass-dark border border-white/10 rounded-tl-xl">
                    <span className="text-sm font-medium text-slate-400">Features</span>
                  </th>
                  <th className="p-4 glass-dark border border-white/10 border-l-0 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Home className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-white">FREE</span>
                    </div>
                    <span className="text-xs text-slate-500">RM0/bulan</span>
                  </th>
                  <th className="p-4 glass-dark border border-[#00bcd4]/40 bg-[#00bcd4]/5 text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#00bcd4] text-[#0d1f33] text-[9px] font-bold rounded-full tracking-wider">
                      POPULAR
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Zap className="w-4 h-4 text-[#00bcd4]" />
                      <span className="text-sm font-bold text-[#00bcd4]">BASIC</span>
                    </div>
                    <span className="text-xs text-slate-500">RM49/bulan</span>
                  </th>
                  <th className="p-4 glass-dark border border-white/10 border-l-0 text-center rounded-tr-xl">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-white">PREMIUM</span>
                    </div>
                    <span className="text-xs text-slate-500">RM99/bulan</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, ci) => (
                  <CompareCategoryRows key={`cat-${ci}`} category={cat} rows={COMPARE_ROWS.filter((r) => r.category === cat)} startIndex={ci} />
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            * Semua pakej termasuk akses kepada AI Chatbot Aida &amp; sokongan pasukan MIM Portal.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-20 bg-[#102943]">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border border-[#00bcd4]/20">
              Soalan Lazim
            </Badge>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
              Soalan Tentang <span className="gradient-text font-semibold">Harga &amp; Pakej</span>
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-white/10 glass-dark rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="px-5 py-4 text-white hover:no-underline hover:bg-white/5 transition text-left">
                  <span className="font-medium text-base">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 text-slate-300 whitespace-pre-line text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 text-center">
            <p className="text-slate-400 mb-4">Masih ada soalan tentang pakej kami?</p>
            <a
              href={waCompanyLink('Hai, saya ada soalan tentang pakej & harga MIM Portal.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                <MessageCircle className="w-4 h-4 mr-2" /> Tanya WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-br from-[#0a1828] to-[#0d1f33]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/10 to-[#2d5a7c]/20" />
        <div className="container mx-auto px-4 relative">
          <Card className="border border-white/10 glass-dark text-white shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-[#00bcd4] mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-light mb-3">
                Bersedia <span className="gradient-text font-semibold">Memulakan?</span>
              </h2>
              <p className="text-slate-300 max-w-2xl mx-auto mb-7">
                Sertai 200+ keluarga Malaysia yang telah mempercayai MIM Portal. Daftar hari ini dan dapatkan pembantu yang sesuai untuk keluarga anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/employer/register">
                  <Button size="lg" className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                    Mula Percuma Sekarang
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    size="lg"
                    variant="outline"
                    className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white"
                  >
                    Kembali ke Laman Utama
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#0a1828] py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00bcd4] to-[#2d5a7c] flex items-center justify-center text-white">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-white">MIM Portal</p>
                <p className="text-xs">Maid In Malaysia &bull; Kino Studios Sdn. Bhd.</p>
              </div>
            </div>
            <p>&copy; 2026 Kino Studios Sdn. Bhd. (002138666-M). Semua hak terpelihara.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CompareCategoryRows({
  category,
  rows,
  startIndex,
}: {
  category: string
  rows: CompareRow[]
  startIndex: number
}) {
  return (
    <>
      <tr>
        <td
          colSpan={4}
          className="px-4 py-2.5 bg-[#0a1828]/60 border border-white/10 border-t-0 border-b-0 text-xs font-semibold tracking-wider text-[#00bcd4] uppercase"
        >
          {category}
        </td>
      </tr>
      {rows.map((row, ri) => (
        <tr
          key={`row-${startIndex}-${ri}`}
          className="hover:bg-white/[0.03] transition-colors"
        >
          <td className="px-4 py-3 border border-white/10 border-t-0 text-sm text-slate-200">
            {row.label}
          </td>
          <td className="px-4 py-3 border border-white/10 border-t-0 border-l-0">
            <CompareCell value={row.free} />
          </td>
          <td className="px-4 py-3 border border-[#00bcd4]/30 border-t-0 border-l-0 bg-[#00bcd4]/[0.03]">
            <CompareCell value={row.basic} highlight />
          </td>
          <td className="px-4 py-3 border border-white/10 border-t-0 border-l-0">
            <CompareCell value={row.premium} />
          </td>
        </tr>
      ))}
    </>
  )
}
