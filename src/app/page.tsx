import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sparkles, Users, Briefcase, ShieldCheck, Heart, Clock,
  ArrowRight, Phone, Mail, MapPin, MessageCircle, Star,
  GraduationCap, FileText, Video, Calendar, CheckCircle2,
  Home, Baby, Accessibility, Bot, Zap, TrendingUp, CreditCard,
  UserPlus, UserCheck, MonitorPlay, PenTool, Rocket,
  Search, Filter, Award, Wallet, Users2, Headphones, ChevronRight,
  Bell, BadgeCheck, CalendarClock, ScanSearch, RefreshCw, BookOpen
} from 'lucide-react'
import { waCompanyLink, formatMYR, getServiceLabel, SKILLS_OPTIONS } from '@/lib/utils'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Image from 'next/image'

export default async function MimLandingPage() {
  const session = await getSession()
  const helpers = await db.helper.findMany({
    where: { status: 'active' },
    orderBy: { rating: 'desc' },
    take: 6,
  })
  const selectHelperHref = session?.role === 'employer' ? '/employer/find-helper' : '/employer/register'
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1f33] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d1f33]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-mim.png" alt="MIM Portal" width={44} height={44} className="rounded-lg shadow-md" />
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">MIM Portal</h1>
              <p className="text-xs text-slate-400 leading-tight">Maid In Malaysia</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="#how-it-works" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Cara Kerja</Link>
            <Link href="#maids" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Pembantu</Link>
            <Link href="#benefits" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Kelebihan</Link>
            <Link href="#services" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Perkhidmatan</Link>
            <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Harga</Link>
            <Link href="#ai-agents" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">AI Agents</Link>
            <Link href="#faq" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">FAQ</Link>
            <Link href="/for-maids" className="px-3 py-2 text-sm font-medium text-[#00bcd4] hover:text-[#00d4e8] transition">Untuk Pembantu →</Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[#00bcd4] font-bold">MY</span>
              <span className="text-slate-600">|</span>
              <Link href="/en" className="text-slate-400 hover:text-[#00bcd4] font-medium">EN</Link>
            </div>
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-300 hover:text-white hover:bg-white/5">Admin</Button>
            </Link>
            <Link href="/employer/login">
              <Button size="sm" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white">Log Masuk</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Focus on Employer with Video Background */}
      <section className="relative overflow-hidden">
        {/* Video Background - lazy loaded via client component for performance */}
        <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: 'url(/images/pixar/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <iframe
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: '177.77vh', height: '56.25vw', minWidth: '100%', minHeight: '100%', opacity: 0.2 }}
          src="https://www.youtube.com/embed/3d_e0VwQ6gc?autoplay=1&mute=1&loop=1&playlist=3d_e0VwQ6gc&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&start=0"
          title="MIM Portal Background"
          frameBorder="0"
          loading="lazy"
          allow="autoplay; encrypted-media"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f33]/90 via-[#0d1f33]/85 to-[#102943]/90" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00bcd4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2d5a7c]/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-32 h-32 dot-pattern opacity-30" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-[#00bcd4]/15 text-[#00bcd4] hover:bg-[#00bcd4]/20 border border-[#00bcd4]/20">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Platform Pembantu Rumah Malaysia #1
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight text-white">
                Cari <span className="gradient-text font-semibold">Pembantu Rumah Profesional</span> Untuk Keluarga Anda
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                MIM Portal menghubungkan majikan dengan pembantu rumah, pengasuh, dan penjaga orang tua yang telatih dan dipercayai. Semua proses - dari pencarian, temuduga, kontrak, hingga pembayaran - diuruskan dalam satu platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/employer/register">
                  <Button size="lg" className="btn-rounded w-full sm:w-auto text-base h-12 px-8 bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                    Cari Pembantu Sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href={waCompanyLink('Hai, saya ingin tahu lebih lanjut tentang perkhidmatan MIM Portal.')} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="btn-rounded w-full sm:w-auto text-base h-12 px-8 bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> Tanya WhatsApp
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <div className="text-2xl font-bold text-[#00bcd4]">500+</div>
                  <div className="text-sm text-slate-400">Pembantu Berdaftar</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-[#00bcd4]">98%</div>
                  <div className="text-sm text-slate-400">Kepuasan Majikan</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-[#00bcd4]">4.9</span>
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-sm text-slate-400">Penarafan Purata</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/20 to-[#2d5a7c]/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 glass">
                <Image
                  src="/images/pixar/hero.png"
                  alt="MIM Portal - Maid In Malaysia"
                  width={1344}
                  height={768}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <Card className="absolute -bottom-6 -left-6 hidden md:block border-0 shadow-2xl glass-dark">
                <CardContent className="p-4 w-72">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/30">Mula Sekarang</Badge>
                  </div>
                  <div className="space-y-2">
                    <Link href="/employer/register" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group">
                      <div className="w-9 h-9 rounded-lg bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">Saya Majikan</div>
                        <div className="text-xs text-slate-400">Cari pembantu</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00bcd4]" />
                    </Link>
                    <Link href="/for-maids" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group">
                      <div className="w-9 h-9 rounded-lg bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">Saya Pembantu</div>
                        <div className="text-xs text-slate-400">Cari kerja</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00bcd4]" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - For Employers */}
      <section id="benefits" className="py-20 bg-gradient-to-b from-[#0d1f33] to-[#102943] relative overflow-hidden">
        <div className="absolute top-40 left-10 w-64 h-64 bg-[#00bcd4]/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Kelebihan Untuk Majikan</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Mengapa Majikan <span className="gradient-text font-semibold">Pilih MIM Portal?</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Kami faham mencari pembantu rumah yang dipercayai bukan mudah. MIM Portal selesaikan semua masalah anda.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: 'Selamat & Terjamin', desc: 'Semua pembantu melalui proses saringan, latihan, dan penilaian. Kontrak sah undang-undang melindungi kedua-dua pihak.', image: '/images/pixar/why-safety.png' },
              { icon: Search, title: 'Cari & Pilih Sendiri', desc: 'Tapis pembantu mengikut jenis perkhidmatan, kawasan, agama, dan pilihan live-in/back & forth. Anda pilih yang terbaik.', image: '/images/pixar/why-search.png' },
              { icon: Clock, title: 'Jimat Masa', desc: 'Semua proses diuruskan automatik - dari pendaftaran, temuduga, kontrak, hingga pembayaran. Tak perlu urus kertas kerja.', image: '/images/pixar/why-time.png' },
              { icon: Headphones, title: 'Sokongan 24/7', desc: 'AI assistant Aida sentiasa membantu. Admin kami sedia membantu sebarang masalah melalui WhatsApp bila-bila masa.', image: '/images/pixar/why-support.png' },
              { icon: Award, title: 'Pembantu Telatih', desc: 'Setiap pembantu melalui modul latihan video wajib sebelum boleh dipilih. Kemahiran dipantau dan dinilai.', image: '/images/pixar/why-training.png' },
              { icon: FileText, title: 'Kontrak Automatik', desc: '3 jenis kontrak dijana automatik - Agensi-Pembantu, Agensi-Majikan, Majikan-Pembantu. Sah dan terjamin.', image: '/images/pixar/why-contract.png' },
              { icon: CreditCard, title: 'Pembayaran Teratur', desc: 'Sistem auto-invois bulanan, peringatan pembayaran, dan rekod pembayaran lengkap. Tak perlu risau lupa bayar.', image: '/images/pixar/why-payment.png' },
              { icon: Bot, title: 'AI Matchmaker', desc: 'AI kami score keserasian antara anda dan pembantu (0-100) berdasarkan keperluan, kawasan, dan budget anda.', image: '/images/pixar/why-matchmaker.png' },
            ].map((b, i) => (
              <Card key={i} className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="relative aspect-square overflow-hidden">
                  <Image src={b.image} alt={b.title} width={1024} height={1024} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102943] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00bcd4] flex items-center justify-center text-white shadow-lg">
                      <b.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-5 flex-1">
                  <h3 className="font-semibold text-white mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-400">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - For Employers */}
      <section id="how-it-works" className="py-20 bg-[#102943] relative overflow-hidden">
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-[#2d5a7c]/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Proses Mudah</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Bagaimana <span className="gradient-text font-semibold">Mendapatkan Pembantu</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              6 langkah mudah dari pendaftaran sehingga pembantu mula bekerja di rumah anda.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', icon: UserPlus, title: 'Daftar Sebagai Majikan', desc: 'Isi borang online dengan keperluan anda - jenis perkhidmatan, bilangan anak, budget, kawasan.', image: '/images/steps-pixar/step1-register-wide.png' },
              { num: '02', icon: Search, title: 'Cari & Pilih Pembantu', desc: 'Tapis pembantu mengikut kriteria. Lihat profil, rating, kemahiran. Pilih yang sesuai.', image: '/images/steps-pixar/step2-find-wide.png' },
              { num: '03', icon: Calendar, title: 'Temuduga Online', desc: 'Sesi Google Meet 3 pihak - anda, pembantu, dan admin MIM. Kenali pembantu sebelum komitmen.', image: '/images/steps-pixar/step3-interview-wide.png' },
              { num: '04', icon: PenTool, title: 'Tandatangan Kontrak', desc: '3 jenis kontrak ditandatangani secara digital. Sah undang-undang, terjamin kedua-dua pihak.', image: '/images/steps-pixar/step4-contract-wide.png' },
              { num: '05', icon: Rocket, title: 'Pembantu Mula Kerja', desc: 'Pembantu mula bekerja mengikut jadual yang dipersetujui. Schedule auto dijana.', image: '/images/steps-pixar/step5-start-wide.png' },
              { num: '06', icon: Headphones, title: 'Sokongan Berterusan', desc: 'AI monitor kualiti, auto-invois pembayaran, dan admin sedia membantu sepanjang tempoh kontrak.', image: '/images/steps-pixar/step6-support-wide.png' },
            ].map((step, i) => (
              <Card key={i} className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={1024}
                    height={1024}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102943] via-[#102943]/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00bcd4] flex items-center justify-center text-white shadow-lg">
                      <step.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-4xl font-bold text-[#00bcd4]/60">{step.num}</span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/employer/register">
              <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                Mula Cari Pembantu <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 bg-gradient-to-br from-[#0a1828] to-[#0d1f33] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00bcd4]/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative text-center">
          <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />Panduan Penggunaan
          </Badge>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-3">Bagaimana <span className="gradient-text font-semibold">Menggunakan MIM Portal?</span></h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            Lihat panduan langkah demi langkah untuk majikan dan pembantu. Faham flow keseluruhan sebelum mula.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/how-to-use">
              <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                <BookOpen className="w-4 h-4 mr-2" /> Lihat Panduan Lengkap
              </Button>
            </Link>
            <a href={waCompanyLink('Hai, saya ingin tahu cara guna MIM Portal.')} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="btn-rounded border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white px-8">
                <MessageCircle className="w-4 h-4 mr-2" /> Tanya WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Helpers / Pembantu Terpilih */}
      <section id="maids" className="py-20 bg-[#102943] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00bcd4]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#2d5a7c]/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />Pembantu Terpilih
            </Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Pilih Pembantu <span className="gradient-text font-semibold">Terbaik</span> Untuk Keluarga Anda</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Lihat profil pembantu yang tersedia. Klik untuk booking temuduga.
            </p>
          </div>

          {helpers.length === 0 ? (
            <div className="text-center py-12 glass-dark rounded-2xl border border-white/10 max-w-xl mx-auto">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">Tiada pembantu tersedia buat masa ini. Daftar sekarang untuk menerima pemberitahuan.</p>
              <Link href={selectHelperHref}>
                <Button className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                  Daftar Sebagai Majikan <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpers.map((helper, i) => {
                const skillsRaw: string[] = (() => {
                  try {
                    const parsed = JSON.parse(helper.skills || '[]')
                    return Array.isArray(parsed) ? parsed : []
                  } catch {
                    return []
                  }
                })()
                const skills = skillsRaw
                  .map((s) => {
                    const opt = SKILLS_OPTIONS.find((o) => o.value === s)
                    return opt ? opt.label : null
                  })
                  .filter((s): s is string => Boolean(s))

                const location = [helper.city, helper.state].filter(Boolean).join(', ')

                return (
                  <Card key={helper.id} className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#00bcd4]/30 shrink-0 bg-[#0d1f33]">
                          <Image
                            src={`/images/avatars/maid-${(i % 4) + 1}.png`}
                            alt={helper.fullName}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{helper.fullName}</h3>
                          <Badge variant="outline" className="mt-1 bg-[#00bcd4]/10 text-[#00bcd4] border-[#00bcd4]/20">
                            {getServiceLabel(helper.serviceType)}
                          </Badge>
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium text-white">{(helper.rating ?? 5).toFixed(1)}</span>
                            <span className="text-xs text-slate-400">/ 5.0</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <MapPin className="w-4 h-4 text-[#00bcd4] shrink-0" />
                          <span className="truncate">{location || '-'}</span>
                        </div>

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {skills.slice(0, 4).map((s, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-white/5 text-slate-300 border border-white/10">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                          {helper.liveIn && (
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              Live-in
                            </Badge>
                          )}
                          {helper.backAndForth && (
                            <Badge variant="outline" className="text-xs bg-[#00bcd4]/10 text-[#00bcd4] border-[#00bcd4]/20">
                              Back &amp; Forth
                            </Badge>
                          )}
                          {helper.canBoth && !helper.liveIn && !helper.backAndForth && (
                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">
                              Fleksibel
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                        <Link href={selectHelperHref} className="flex-1">
                          <Button size="sm" className="w-full btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                            Pilih Pembantu
                          </Button>
                        </Link>
                        <Link href={selectHelperHref}>
                          <Button size="sm" variant="outline" className="btn-rounded bg-transparent border border-white/20 text-slate-300 hover:bg-white/5 hover:text-white">
                            Lihat Profil
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href={selectHelperHref}>
              <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                Lihat Semua Pembantu <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-[#102943] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00bcd4]/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Perkhidmatan Kami</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">3 Jenis <span className="gradient-text font-semibold">Perkhidmatan</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Pilih perkhidmatan yang sesuai untuk keperluan keluarga anda.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300 overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <Image src="/images/pixar/maid.png" alt="Pembantu Rumah" width={1024} height={1024} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102943] via-transparent to-transparent" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-white">Pembantu Rumah</CardTitle>
                <p className="text-2xl font-bold text-[#00bcd4]">RM1,500 - RM2,500</p>
                <p className="text-xs text-slate-500">Sebulan</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Pembersihan rumah</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Memasak</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Mencuci & menggosok baju</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Pilihan Live-in atau Back & Forth</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300 overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <Image src="/images/pixar/babysitter.png" alt="Pengasuh" width={1024} height={1024} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102943] via-transparent to-transparent" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-white">Pengasuh</CardTitle>
                <p className="text-2xl font-bold text-[#00bcd4]">RM1,500 - RM2,500</p>
                <p className="text-xs text-slate-500">Sebulan</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Penjagaan bayi (0-6 tahun)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Penjagaan kanak-kanak (12-17 tahun)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Mendidik anak-anak</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Aktiviti pembelajaran</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300 overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <Image src="/images/pixar/caregiver.png" alt="Penjaga Orang Tua" width={1024} height={1024} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102943] via-transparent to-transparent" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-white">Penjaga Orang Tua</CardTitle>
                <p className="text-2xl font-bold text-[#00bcd4]">RM1,700 - RM3,500</p>
                <p className="text-xs text-slate-500">Sebulan</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Penjagaan warga emas</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Bantuan aktiviti harian</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Sokongan emosi</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Mengingatkan ubat</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="ai-agents" className="py-20 bg-gradient-to-br from-[#0a1828] via-[#0d1f33] to-[#102943] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00bcd4]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2d5a7c]/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
                <Bot className="w-3.5 h-3.5 mr-1.5" />Fully Agentic AI Platform
              </Badge>
              <h2 className="text-3xl md:text-5xl font-light text-white">
                13 AI Agents <span className="gradient-text font-semibold">Automate Semua</span>
              </h2>
              <p className="text-slate-300 leading-relaxed">
                MIM Portal bukan sekadar platform - ia ekosistem AI yang automate keseluruhan proses. Dari carian pembantu sehingga pengurusan kontrak dan pembayaran, semua diuruskan oleh AI agents secara autonomi.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, title: 'Lead Generation', desc: '4 agents cari leads' },
                  { icon: Heart, title: 'AI Matchmaker', desc: 'Auto-score keserasian' },
                  { icon: MessageCircle, title: 'WhatsApp Onboarding', desc: 'Aida AI assistant' },
                  { icon: FileText, title: 'Auto-Contract', desc: '3 kontrak auto-jana' },
                  { icon: CreditCard, title: 'Payment Agent', desc: 'Auto-invoice & reminder' },
                  { icon: Calendar, title: 'Schedule Agent', desc: 'Auto jadual kerja' },
                  { icon: Bot, title: '24/7 Support AI', desc: 'Handle semua chat' },
                  { icon: TrendingUp, title: 'Quality Monitor', desc: 'Feedback & churn prediction' },
                ].map((agent, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg glass-dark hover:bg-white/5 transition">
                    <agent.icon className="w-4 h-4 mt-0.5 text-[#00bcd4] shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm text-white">{agent.title}</h4>
                      <p className="text-xs text-slate-400">{agent.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/agents">
                <Button size="lg" className="btn-rounded mt-4 bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                  <Bot className="w-4 h-4 mr-2" /> Lihat AI Agents Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/20 to-[#2d5a7c]/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image src="/images/pixar/ai-agents.png" alt="AI Agents" width={1344} height={768} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Detailed for Employers */}
      <section id="faq" className="py-20 bg-[#102943]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Soalan Lazim Majikan</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Soalan <span className="gradient-text font-semibold">Lazim</span></h2>
            <p className="text-slate-400">Jawapan untuk soalan yang kerap ditanya oleh majikan.</p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: 'Berapakah gaji pembantu rumah?', a: 'Gaji pembantu rumah bergantung kepada jenis perkhidmatan:\n\n• Pembantu Rumah (Maid): RM1,500 - RM2,500 sebulan\n• Pengasuh (Babysitter): RM1,500 - RM2,500 sebulan\n• Penjaga Orang Tua (Caregiver): RM1,700 - RM3,500 sebulan\n\nGaji ditentukan oleh pengalaman, kemahiran, dan jenis perkhidmatan. Majikan boleh tawar gaji dalam julat ini semasa proses booking.' },
              { q: 'Bagaimana proses mendapatkan pembantu?', a: 'Prosesnya mudah - 6 langkah:\n\n1. Daftar sebagai majikan (borang online)\n2. Cari & pilih pembantu (tapis mengikut kriteria)\n3. Temuduga online (Google Meet 3 pihak)\n4. Tandatangan kontrak (3 jenis kontrak digital)\n5. Pembantu mula bekerja (ikut jadual)\n6. Sokongan berterusan (AI + admin)\n\nKeseluruhan proses biasanya mengambil masa 3-7 hari dari pendaftaran sehingga pembantu mula bekerja.' },
              { q: 'Adakah pembantu telah disaring dan telatih?', a: 'Ya, semua pembantu melalui proses berikut sebelum tersenarai di platform:\n\n• Pendaftaran dengan maklumat lengkap (IC, keluarga, alamat)\n• Borang A (10 soalan penilaian - kebenaran keluarga, kebolehan, motivasi)\n• Modul latihan video wajib (6 kursus asas)\n• Penilaian rating oleh sistem\n• Saringan admin sebelum status "active"\n\nPembantu dengan rating rendah atau yang tidak lengkap profil akan ditandai untuk semakan.' },
              { q: 'Apakah jenis kontrak yang ditandatangani?', a: 'Terdapat 3 jenis kontrak yang ditandatangani secara digital:\n\n1. Kontrak Agensi-Pembantu: Antara MIM Portal (Kino Studios) dan pembantu\n2. Kontrak Agensi-Majikan: Antara MIM Portal dan majikan\n3. Kontrak Majikan-Pembantu: Antara majikan dan pembantu\n\nSemua kontrak dijana secara automatik selepas padanan disahkan, mengandungi terma & syarat lengkap, dan sah di sisi undang-undang Malaysia.' },
              { q: 'Bagaimana jika pembantu tidak sesuai?', a: 'Jika pembantu tidak sesuai selepas mula bekerja:\n\n• Minggu 1: Hubungi admin melalui WhatsApp untuk feedback\n• Quality Monitor Agent kami akan hubungi anda untuk survey kepuasan\n• Jika masalah serius, admin akan uruskan penggantian pembantu\n• Kontrak boleh ditamatkan dengan notis 7 hari\n\nKami komited untuk memastikan majikan mendapat pembantu yang sesuai. Sokongan kami berterusan sepanjang tempoh kontrak.' },
              { q: 'Bagaimana pembayaran gaji pembantu?', a: 'Sistem pembayaran MIM Portal:\n\n• Gaji dibayar bulanan oleh majikan kepada pembantu\n• Auto-invois dijana setiap bulan oleh Payment Agent\n• Peringatan dihantar 3 hari sebelum tarikh akhir\n• Status pembayaran: pending → paid → overdue\n• Majikan boleh bayar melalui WhatsApp ke admin atau direct ke pembantu\n\nRekod pembayaran lengkap tersimpan di dashboard majikan untuk rujukan.' },
              { q: 'Apakah pilihan Live-in atau Back & Forth?', a: 'Pembantu boleh memilih dua pilihan waktu kerja:\n\n• Live-in (Duduk Bersama): Pembantu tinggal di rumah majikan. Cuti Ahad & Cuti Umum. Sesuai untuk keluarga yang perlu pembantu 24/7.\n\n• Back & Forth (Balik Hari): Pembantu datang bekerja 8:00am - 7:00pm, balik rumah sendiri petang. Cuti Ahad & Cuti Umum. Sesuai untuk keluarga yang perlu bantuan waktu siang sahaja.\n\n• Boleh Kedua-duanya: Pembantu fleksibel, boleh pilih ikut tawaran majikan.\n\nMajikan boleh tapis pembantu mengikut pilihan ini semasa carian.' },
              { q: 'Bagaimana jika berlaku konflik dengan pembantu?', a: 'MIM Portal menyediakan sokongan untuk menyelesaikan konflik:\n\n• 24/7 Support AI (Aida) sentiasa sedia mendengar dan membantu\n• Admin MIM akan mediasi jika perlu (melalui WhatsApp/Google Meet)\n• Untuk isu serius (keselamatan, penyalahgunaan), hubungi admin segera di 017-663 5990\n• Kontrak mengandungi klausa penyelesaian pertikaian\n• Dalam kes kecemasan, hubungi polis 999 dahulu, kemudian admin MIM\n\nKeselamatan dan kesejahteraan kedua-dua pihak adalah keutamaan kami.' },
              { q: 'Berapakah yuran agensi MIM Portal?', a: 'Yuran agensi bergantung kepada pakej perkhidmatan. Sila hubungi admin kami melalui WhatsApp di +6017-663 5990 untuk:\n\n• Butiran yuran agensi\n• Pakej perkhidmatan tersuai\n• Promosi semasa\n\nYuran agensi adalah sekali sahaja (one-time) dan berbeza dari gaji bulanan pembantu. Gaji pembantu dibayar terus kepada pembantu.' },
              { q: 'Adakah pembantu ada rekod perubatan?', a: 'Ya, admin MIM menguruskan rekod perubatan pembantu:\n\n• Rekod kesihatan umum\n• Rekod vaksinasi\n• Dikemaskini secara berkala\n\nRekod perubatan boleh diminta oleh majikan melalui dashboard. Untuk isu kesihatan semasa bekerja, admin akan koordinasi dengan pembantu untuk pemeriksaan perubatan.' },
              { q: 'Bolehkah saya menukar pembantu selepas kontrak bermula?', a: 'Ya, anda boleh memohon pertukaran pembantu jika:\n\n• Pembantu tidak sesuai (selepas tempoh percubaan 1 bulan)\n• Konflik yang tidak boleh diselesaikan\n• Keperluan keluarga berubah\n\nProses pertukaran:\n1. Hubungi admin melalui WhatsApp\n2. Admin akan semak situasi dan cadangkan pembantu gantian\n3. Kontrak baru dijana\n4. Pembantu lama dan baru akan diselaraskan\n\nYuran pertukaran mungkin dikenakan bergantung kepada situasi.' },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 glass-dark rounded-xl overflow-hidden">
                <AccordionTrigger className="px-5 py-4 text-white hover:no-underline hover:bg-white/5 transition text-left">
                  <span className="font-medium text-base">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 text-slate-300 whitespace-pre-line text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">Masih ada soalan? Hubungi kami:</p>
            <a href={waCompanyLink('Hai, saya ada soalan tentang MIM Portal.')} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                <MessageCircle className="w-4 h-4 mr-2" /> Tanya WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-[#0a1828] to-[#0d1f33]">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url(/images/patterns/cta-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/10 to-[#2d5a7c]/20" />
        
        <div className="container mx-auto px-4 relative">
          <Card className="border border-white/10 glass-dark text-white shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-10 md:p-14 text-center">
              <h2 className="text-3xl md:text-5xl font-light mb-4">Bersedia <span className="gradient-text font-semibold">Mendapatkan Pembantu?</span></h2>
              <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-lg">
                Daftar sekarang dan biar AI kami carikan pembantu yang sesuai untuk keluarga anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/employer/register">
                  <Button size="lg" className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                    Daftar Sebagai Majikan
                  </Button>
                </Link>
                <Link href="/for-maids">
                  <Button size="lg" variant="outline" className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                    Saya Pembantu / Pengasuh
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Smart Features Section - NEW */}
      <section className="py-20 bg-gradient-to-b from-[#0a1828] to-[#0d1f33] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00bcd4]/8 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />Ciri Pintar
            </Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Ciri Pintar <span className="gradient-text font-semibold">MIM Portal</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Teknologi AI dan automation yang memudahkan proses mencari pembantu dan majikan.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Bell, title: 'Amaran Padanan Pintar', desc: 'Dapat notifikasi WhatsApp apabila AI jumpa padanan sempurna untuk anda.' },
              { icon: BadgeCheck, title: 'Sistem Pengesahan', desc: 'Pembantu dengan IC, rekod perubatan & saringan latar belakang dapat tanda biru.' },
              { icon: CalendarClock, title: 'Tempoh Percubaan', desc: '7 hari percubaan sebelum komitmen kontrak penuh.' },
              { icon: Video, title: 'Profil Video', desc: 'Pembantu boleh rakam video 30 saat memperkenalkan diri.' },
              { icon: MessageCircle, title: 'Sembang Segera', desc: 'Chat terus dengan pembantu sebelum booking melalui WhatsApp.' },
              { icon: Star, title: 'Rating & Ulasan', desc: 'Lihat ulasan sebenar dari majikan sebelumnya.' },
              { icon: ScanSearch, title: 'Saringan Latar Belakang', desc: 'Pengesahan latar belakang bertenaga AI untuk semua pembantu.' },
              { icon: RefreshCw, title: 'Jaminan Penggantian', desc: 'Penggantian percuma dalam 30 hari jika padanan tidak sesuai.' },
            ].map((f, i) => (
              <Card key={i} className="group border border-white/10 glass-dark hover:border-[#00bcd4]/40 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-3 group-hover:bg-[#00bcd4] group-hover:text-white transition-all">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Flyer Download Section */}
      <section className="py-16 bg-[#102943] border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
              <FileText className="w-3.5 h-3.5 mr-1.5" />Muat Turun Risalah
            </Badge>
            <h2 className="text-2xl md:text-3xl font-light text-white mb-2">Risalah <span className="gradient-text font-semibold">MIM Portal</span></h2>
            <p className="text-slate-400 text-sm">Muat turun risalah kami untuk maklumat lengkap perkhidmatan.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <a href="/downloads/flyers-front.jpg" download="MIM-Flyer-Front.jpg">
              <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/40 transition-all cursor-pointer overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <Image src="/flyers-front.jpg" alt="Risahan Depan" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1828] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">Risalah Depan</span>
                    <Badge className="bg-[#00bcd4] text-white">Download</Badge>
                  </div>
                </div>
              </Card>
            </a>
            <a href="/downloads/flyers-back.jpg" download="MIM-Flyer-Back.jpg">
              <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/40 transition-all cursor-pointer overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <Image src="/flyers-back.jpg" alt="Risalah Belakang" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1828] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">Risalah Belakang</span>
                    <Badge className="bg-[#00bcd4] text-white">Download</Badge>
                  </div>
                </div>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#0a1828] py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Image src="/logo-mim.png" alt="MIM Portal" width={40} height={40} className="rounded-lg" />
                <div>
                  <h3 className="font-bold text-white">MIM Portal</h3>
                  <p className="text-xs text-slate-500">Maid In Malaysia</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Platform pusat perkhidmatan pembantu rumah Malaysia oleh Kino Studios Sdn. Bhd.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Perkhidmatan</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Pembantu Rumah (RM1,500-2,500)</li>
                <li>Pengasuh (RM1,500-2,500)</li>
                <li>Penjaga Orang Tua (RM1,700-3,500)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Pautan Pantas</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/employer/register" className="hover:text-[#00bcd4] transition">Daftar Majikan</Link></li>
                <li><Link href="/for-maids" className="hover:text-[#00bcd4] transition">Untuk Pembantu</Link></li>
                <li><Link href="/employer/login" className="hover:text-[#00bcd4] transition">Log Masuk Majikan</Link></li>
                <li><Link href="/helper/login" className="hover:text-[#00bcd4] transition">Log Masuk Pembantu</Link></li>
                <li><Link href="/admin/login" className="hover:text-[#00bcd4] transition">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Hubungi Kami</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#00bcd4]" />Ampang Jaya, Selangor, Malaysia</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0 text-[#00bcd4]" />+6017-663 5990</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0 text-[#00bcd4]" />hello@kino.my</li>
                <li className="flex items-center gap-2"><Globe className="w-4 h-4 shrink-0 text-[#00bcd4]" />www.kino.my</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <p>&copy; 2026 Kino Studios Sdn. Bhd. (002138666-M). Semua hak terpelihara.</p>
            <p>Brand: KinoCinema Media | Diketuai oleh Mahadzir Hanafiah</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Globe({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}
