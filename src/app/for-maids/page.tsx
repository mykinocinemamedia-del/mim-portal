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
  Wallet, Award, Headphones, HandHeart, ShieldCheckIcon, BookOpen
} from 'lucide-react'
import { waCompanyLink, formatMYR } from '@/lib/utils'
import Image from 'next/image'

export default function ForMaidsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1f33] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d1f33]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-mim.png" alt="MIM Portal" width={44} height={44} className="rounded-lg shadow-md" />
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">MIM Portal</h1>
              <p className="text-xs text-slate-400 leading-tight">Untuk Pembantu</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/for-maids#benefits" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Kelebihan</Link>
            <Link href="/for-maids#how-it-works" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Cara Kerja</Link>
            <Link href="/for-maids#salary" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Gaji</Link>
            <Link href="/for-maids#training" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Latihan</Link>
            <Link href="/for-maids#faq" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">FAQ</Link>
            <Link href="/" className="px-3 py-2 text-sm font-medium text-[#00bcd4] hover:text-[#00d4e8] transition">Untuk Majikan →</Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[#00bcd4] font-bold">MY</span>
              <span className="text-slate-600">|</span>
              <Link href="/en/for-maids" className="text-slate-400 hover:text-[#00bcd4] font-medium">EN</Link>
            </div>
            <Link href="/helper/login">
              <Button size="sm" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white">Log Masuk</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - For Maids */}
      <section className="relative overflow-hidden wave-bg">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00bcd4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2d5a7c]/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-32 h-32 dot-pattern opacity-30" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-[#00bcd4]/15 text-[#00bcd4] hover:bg-[#00bcd4]/20 border border-[#00bcd4]/20">
                <Heart className="w-3.5 h-3.5 mr-1.5" />
                Kerjaya Pembantu Rumah Profesional
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight text-white">
                Mulakan Kerjaya <span className="gradient-text font-semibold">Sebagai Pembantu Rumah</span> Profesional
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Sertai MIM Portal dan dapatkan kerja pembantu rumah, pengasuh, atau penjaga orang tua dengan gaji RM1,500 - RM3,500 sebulan. Latihan percuma, kontrak sah, dan sokongan berterusan untuk anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/helper/register">
                  <Button size="lg" className="btn-rounded w-full sm:w-auto text-base h-12 px-8 bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                    Daftar Sekarang
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href={waCompanyLink('Hai, saya ingin tahu lebih lanjut tentang bekerja sebagai pembantu di MIM Portal.')} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="btn-rounded w-full sm:w-auto text-base h-12 px-8 bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> Tanya WhatsApp
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <div className="text-2xl font-bold text-[#00bcd4]">500+</div>
                  <div className="text-sm text-slate-400">Pembantu Aktif</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-[#00bcd4]">RM3,500</div>
                  <div className="text-sm text-slate-400">Gaji Maksimum</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-[#00bcd4]">4.9</span>
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-sm text-slate-400">Rating Purata</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/20 to-[#2d5a7c]/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 glass">
                <Image
                  src="/images/pixar/maid.png"
                  alt="Kerjaya Pembantu Rumah"
                  width={1024}
                  height={1024}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Video Section */}
      <section className="py-20 bg-gradient-to-br from-[#0a1828] to-[#0d1f33] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00bcd4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2d5a7c]/15 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
              <Video className="w-3.5 h-3.5 mr-1.5" />Video Promosi
            </Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Kenali <span className="gradient-text font-semibold">Kerjaya Pembantu</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Tonton bagaimana MIM Portal membantu anda memulakan kerjaya sebagai pembantu rumah profesional.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/fMdo1k-lnLY"
                  title="MIM Portal - Kerjaya Pembantu"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - For Maids */}
      <section id="benefits" className="py-20 bg-gradient-to-b from-[#0d1f33] to-[#102943] relative overflow-hidden">
        <div className="absolute top-40 left-10 w-64 h-64 bg-[#00bcd4]/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Kelebihan Bekerja</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Mengapa Sertai <span className="gradient-text font-semibold">MIM Portal?</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Kami komited untuk memastikan pembantu mendapat kerja yang adil, selamat, dan menguntungkan.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wallet, title: 'Gaji Stabil RM1,500-3,500', desc: 'Dapatkan gaji bulanan yang stabil. Pembantu Rumah & Pengasuh: RM1,500-2,500. Penjaga Orang Tua: RM1,700-3,500.' },
              { icon: GraduationCap, title: 'Latihan Percuma', desc: '6 modul latihan video percuma - dari asas pembantu rumah hingga komunikasi dengan majikan. Tingkatkan kemahiran anda.' },
              { icon: ShieldCheck, title: 'Kontrak Sah & Terjamin', desc: '3 jenis kontrak melindungi hak anda. Terma kerja, gaji, dan cuti semuanya tercatat secara sah.' },
              { icon: Headphones, title: 'Sokongan 24/7', desc: 'AI assistant Aida sentiasa membantu. Admin kami sedia membantu sebarang masalah dengan majikan.' },
              { icon: Calendar, title: 'Pilihan Waktu Fleksibel', desc: 'Pilih Live-in (tinggal bersama majikan, cuti Ahad) atau Back & Forth (8am-7pm, balik petang). Pilih yang sesuai.' },
              { icon: Award, title: 'Rating & Penarafan', desc: 'Kerja keras anda dihargai. Rating tinggi bermakna lebih banyak majikan akan pilih anda. Pembantu top mendapat keutamaan.' },
              { icon: Heart, title: 'Padanan Yang Sesuai', desc: 'AI Matchmaker kami akan cari majikan yang sesuai dengan kemahiran, kawasan, dan pilihan anda. Bukan sekadar pilih random.' },
              { icon: BookOpen, title: 'Pembangunan Kerjaya', desc: 'Kursus latihan berterusan, sijil penyelesaian, dan peluang untuk upgrade ke posisi yang lebih baik dengan gaji lebih tinggi.' },
            ].map((b, i) => (
              <Card key={i} className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-3">
                    <b.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-400">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - For Maids */}
      <section id="how-it-works" className="py-20 bg-[#102943] relative overflow-hidden">
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-[#2d5a7c]/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Proses Mudah</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Bagaimana <span className="gradient-text font-semibold">Untuk Mula Bekerja</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              6 langkah mudah dari pendaftaran sehingga mula bekerja dengan majikan.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', icon: UserPlus, title: 'Daftar Online', desc: 'Isi borang online - maklumat diri, alamat, agama, pendidikan, dan jawab 10 soalan Borang A.' },
              { num: '02', icon: MessageCircle, title: 'Terima Kredensial', desc: 'Email & password auto-dijana dan dihantar melalui WhatsApp. Gunakan untuk log masuk ke dashboard.' },
              { num: '03', icon: UserCheck, title: 'Lengkapkan Profil', desc: 'Muat naik gambar profil, lengkapkan maklumat tambahan. Profil lengkap menarik lebih banyak majikan.' },
              { num: '04', icon: MonitorPlay, title: 'Tonton Latihan Video', desc: '6 modul latihan video wajib - asas kerja, penjagaan, keselamatan, komunikasi. Lulus untuk layak dipilih.' },
              { num: '05', icon: Video, title: 'Temuduga Online', desc: 'Google Meet dengan majikan & admin MIM. Kenali majikan, faham keperluan, dan pastikan sesuai sebelum komitmen.' },
              { num: '06', icon: Rocket, title: 'Mula Bekerja', desc: 'Tandatangan kontrak, mula bekerja mengikut jadual. Terima gaji setiap bulan. Rating diberikan selepas bekerja.' },
            ].map((step, i) => (
              <Card key={i} className="numbered-card group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300" data-number={step.num}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00bcd4] flex items-center justify-center text-white shadow-lg shrink-0">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#00bcd4]/40">{step.num}</span>
                        <h3 className="font-semibold text-white">{step.title}</h3>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/helper/register">
              <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                Daftar Sekarang <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Salary Info Section */}
      <section id="salary" className="py-20 bg-gradient-to-br from-[#0a1828] via-[#0d1f33] to-[#102943] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00bcd4]/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Maklumat Gaji</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Berapa <span className="gradient-text font-semibold">Gaji Anda?</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Gaji bergantung kepada jenis perkhidmatan dan pengalaman anda.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-2">
                  <Home className="w-8 h-8" />
                </div>
                <CardTitle className="text-white">Pembantu Rumah</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold gradient-text mb-1">RM1,500</p>
                <p className="text-sm text-slate-400 mb-3">hingga RM2,500/bulan</p>
                <div className="space-y-1 text-xs text-slate-300 text-left">
                  <p>• Membersihkan rumah</p>
                  <p>• Memasak</p>
                  <p>• Mencuci & menggosok</p>
                  <p>• Live-in atau Back & Forth</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-2">
                  <Baby className="w-8 h-8" />
                </div>
                <CardTitle className="text-white">Pengasuh</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold gradient-text mb-1">RM1,500</p>
                <p className="text-sm text-slate-400 mb-3">hingga RM2,500/bulan</p>
                <div className="space-y-1 text-xs text-slate-300 text-left">
                  <p>• Jaga bayi (0-6 tahun)</p>
                  <p>• Jaga kanak-kanak</p>
                  <p>• Didik & ajar</p>
                  <p>• Aktiviti pembelajaran</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-2">
                  <Accessibility className="w-8 h-8" />
                </div>
                <CardTitle className="text-white">Penjaga Orang Tua</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold gradient-text mb-1">RM1,700</p>
                <p className="text-sm text-slate-400 mb-3">hingga RM3,500/bulan</p>
                <div className="space-y-1 text-xs text-slate-300 text-left">
                  <p>• Jaga warga emas</p>
                  <p>• Bantu aktiviti harian</p>
                  <p>• Sokongan emosi</p>
                  <p>• Ingatkan ubat</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 max-w-2xl mx-auto">
            <Card className="border border-[#00bcd4]/20 glass-dark">
              <CardContent className="p-5">
                <p className="text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-[#00bcd4]" />
                  <strong className="text-white">Gaji dibayar setiap bulan</strong> oleh majikan kepada pembantu. Sistem auto-invois MIM Portal memastikan gaji dibayar tepat pada masanya dengan peringatan automatik.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Training & Development Section */}
      <section id="training" className="py-20 bg-[#102943]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Latihan & Pembangunan</Badge>
              <h2 className="text-3xl md:text-5xl font-light text-white">Latihan <span className="gradient-text font-semibold">Percuma</span> Untuk Anda</h2>
              <p className="text-slate-300 leading-relaxed">
                Kami sediakan 6 modul latihan video percuma untuk membantu anda menjadi pembantu rumah profesional. Lengkapkan semua modul untuk layak dipilih oleh majikan.
              </p>
              <div className="space-y-3">
                {[
                  { title: 'Pengenalan Kerja Pembantu Rumah', duration: '15 min', desc: 'Asas tanggungjawab dan etika kerja' },
                  { title: 'Penjagaan Bayi & Kanak-kanak', duration: '25 min', desc: 'Panduan menjaga bayi dan kanak-kanak' },
                  { title: 'Penjagaan Orang Tua', duration: '30 min', desc: 'Asas penjagaan warga emas' },
                  { title: 'Kebersihan Diri & Keselamatan', duration: '20 min', desc: 'Amalan kebersihan dan keselamatan' },
                  { title: 'Komunikasi dengan Majikan', duration: '18 min', desc: 'Cara berkomunikasi profesional' },
                  { title: 'Pengurusan Masa & Jadual Kerja', duration: '22 min', desc: 'Cara menguruskan masa dengan cekap' },
                ].map((course, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg glass-dark hover:bg-white/5 transition">
                    <div className="w-10 h-10 rounded-lg bg-[#00bcd4] flex items-center justify-center text-white shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-white">{course.title}</h4>
                      <p className="text-xs text-slate-400">{course.desc}</p>
                    </div>
                    <Badge variant="outline" className="text-[#00bcd4] border-[#00bcd4]/30">{course.duration}</Badge>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Link href="/helper/register">
                  <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                    <GraduationCap className="w-4 h-4 mr-2" /> Mula Latihan Sekarang
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/15 to-[#2d5a7c]/15 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src="/images/pixar/why-training.png"
                  alt="Latihan Video MIM Portal"
                  width={1024}
                  height={1024}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Detailed for Maids */}
      <section id="faq" className="py-20 bg-[#102943]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Soalan Lazim Pembantu</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Soalan <span className="gradient-text font-semibold">Lazim</span></h2>
            <p className="text-slate-400">Jawapan untuk soalan yang kerap ditanya oleh pembantu.</p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: 'Siapa boleh mendaftar sebagai pembantu?', a: 'Sesiapa sahaja yang:\n\n• Warganegara Malaysia atau pemegang kad kerja sah\n• Berumur 18 tahun ke atas\n• Boleh membaca dan menulis (BM/Inggeris)\n• Bersedia untuk bekerja sebagai pembantu rumah, pengasuh, atau penjaga orang tua\n• Mendapat kebenaran keluarga (suami/isteri/ibu bapa)\n\nTiada yuran pendaftaran. Ia percuma!' },
              { q: 'Bagaimana cara mendaftar?', a: 'Proses pendaftaran mudah:\n\n1. Pergi ke halaman Daftar Pembantu\n2. Isi borang online (2 seksyen):\n   - Seksyen 1: Maklumat diri (nama, IC, alamat, telefon)\n   - Seksyen 2: Borang A (10 soalan - kebenaran keluarga, kebolehan, motivasi)\n3. Sistem auto-jana email & password\n4. Kredensial dihantar melalui WhatsApp ke nombor anda\n5. Log masuk dengan kredensial tersebut\n\nTiada dokumen fizikal diperlukan semasa pendaftaran. Semua dibuat online.' },
              { q: 'Berapakah gaji yang saya akan dapat?', a: 'Gaji bergantung kepada jenis perkhidmatan:\n\n• Pembantu Rumah (Maid): RM1,500 - RM2,500 sebulan\n• Pengasuh (Babysitter): RM1,500 - RM2,500 sebulan\n• Penjaga Orang Tua (Caregiver): RM1,700 - RM3,500 sebulan\n\nGaji anda bergantung kepada:\n- Pengalaman kerja sebelumnya\n- Kemahiran (masak, jaga bayi, dll)\n- Rating dari majikan sebelumnya\n- Pilihan Live-in atau Back & Forth\n\nMajikan akan tawar gaji dalam julat ini semasa proses booking.' },
              { q: 'Apakah perbezaan Live-in dan Back & Forth?', a: 'Live-in (Duduk Bersama):\n• Anda tinggal di rumah majikan\n• Waktu kerja: 24/6 (6 hari seminggu)\n• Cuti: Ahad & Cuti Umum\n• Majikan sediakan tempat tinggal & makanan\n• Sesuai untuk yang tinggal jauh dari kawasan kerja\n\nBack & Forth (Balik Hari):\n• Anda datang bekerja dan balik rumah sendiri\n• Waktu kerja: 8:00am - 7:00pm (6 hari seminggu)\n• Cuti: Ahad & Cuti Umum\n• Anda balik rumah setiap petang\n• Sesuai untuk yang tinggal berdekatan\n\nAnda boleh pilih kedua-duanya (Boleh Kedua-duanya) untuk lebih fleksibiliti.' },
              { q: 'Adakah latihan diperlukan?', a: 'Ya, latihan video wajib untuk semua pembantu:\n\n• 6 modul latihan video (total ~2 jam)\n• Topik: asas kerja, penjagaan, keselamatan, komunikasi\n• Percuma sepenuhnya\n• Boleh tonton berulang kali\n• Perlu lulus untuk layak dipilih majikan\n\nLatihan ini membantu anda:\n- Memahami tanggungjawab sebagai pembantu\n- Meningkatkan kemahiran\n- Mendapat rating yang lebih baik\n- Menarik lebih banyak majikan\n\nAnda boleh akses latihan melalui dashboard selepas log masuk.' },
              { q: 'Bagaimana jika ada masalah dengan majikan?', a: 'Kami komited untuk melindungi hak pembantu:\n\n• 24/7 Support AI (Aida) sentiasa sedia mendengar\n• Admin MIM akan mediasi sebarang konflik\n• Untuk isu serius (keselamatan, penyalahgunaan), hubungi admin segera di 017-663 5990\n• Kontrak melindungi hak anda - gaji, waktu kerja, cuti\n• Dalam kes kecemasan, hubungi polis 999 dahulu\n\nJangan takut untuk lapor sebarang masalah. Keselamatan dan kesejahteraan anda adalah keutamaan kami. Semua aduan dirahsiakan.' },
              { q: 'Bagaimana pembayaran gaji?', a: 'Sistem pembayaran MIM Portal:\n\n• Gaji dibayar setiap bulan oleh majikan\n• Auto-invois dijana pada awal setiap bulan\n• Peringatan dihantar kepada majikan 3 hari sebelum tarikh akhir\n• Jika majikan lewat bayar, sistem auto-flag sebagai "overdue"\n• Admin akan follow up dengan majikan\n\nAnda boleh semak status pembayaran di dashboard. Jika gaji tertunggak lebih dari 7 hari, hubungi admin melalui WhatsApp.' },
              { q: 'Bolehkah saya pilih kawasan kerja?', a: 'Ya, anda boleh pilih:\n\n• Negeri tempat tinggal anda (untuk profil)\n• Kawasan kerja yang diingini (contoh: "Kuala Lumpur")\n• Boleh kerja luar kawasan? (Boleh/Tidak Boleh)\n\nJika anda pilih "Boleh", profil anda akan tunjuk "Boleh di mana-mana sahaja" - majikan dari semua kawasan boleh pilih anda.\n\nJika "Tidak Boleh", hanya majikan dari kawasan anda boleh pilih. AI Matchmaker akan padankan anda dengan majikan yang sesuai.' },
              { q: 'Apakah kontrak yang saya perlu tandatangan?', a: 'Terdapat 3 jenis kontrak:\n\n1. Kontrak Agensi-Pembantu: Antara anda dan MIM Portal (Kino Studios)\n   - Terma kerjasama dengan agensi\n   - Hak dan tanggungjawab anda\n\n2. Kontrak Agensi-Majikan: Antara MIM Portal dan majikan\n   - Terma perkhidmatan agensi\n\n3. Kontrak Majikan-Pembantu: Antara majikan dan anda\n   - Gaji, waktu kerja, cuti\n   - Tanggungjawab kedua-dua pihak\n   - Tempoh kontrak\n\nSemua kontrak dijana secara automatik dan ditandatangani secara digital. Salinan disimpan di dashboard anda.' },
              { q: 'Bagaimana rating saya ditentukan?', a: 'Rating anda (1-5 bintang) ditentukan oleh:\n\n• Rating dari majikan (selepas bekerja)\n• Feedback dari Quality Monitor Agent (minggu 1, bulan 1, suku tahunan)\n• Kualiti kerja (dinilai oleh admin)\n\nRating tinggi (4.5+) memberi kelebihan:\n- AI Matchmaker akan utamakan anda\n- Lebih banyak majikan akan pilih anda\n- Peluang gaji lebih tinggi\n- Badge "Top Helper" di profil\n\nRating baru bermula dengan 5.0. Jaga rating anda dengan kerja yang teliti dan profesional.' },
              { q: 'Bolehkah saya berhenti selepas mula bekerja?', a: 'Ya, anda boleh berhenti dengan syarat:\n\n• Beri notis 7 hari kepada majikan dan admin\n• Selesaikan tugas yang sedang berjalan\n• Kontrak akan ditamatkan secara rasmi\n\nSebab berhenti yang sah:\n- Masalah kesihatan\n- Keperluan keluarga\n- Majikan tidak mematuhi kontrak\n- Situasi tidak selamat\n\nJika anda berhenti tanpa notis yang sah, rating anda mungkin terjejas. Hubungi admin untuk bantuan proses berhenti yang betul.' },
              { q: 'Adakah yuran dikenakan kepada pembantu?', a: 'Pendaftaran dan penggunaan platform MIM Portal adalah PERCUMA untuk pembantu.\n\nTiada yuran:\n• Pendaftaran: PERCUMA\n• Latihan video: PERCUMA\n• Penggunaan dashboard: PERCUMA\n• Sokongan admin: PERCUMA\n\nAnda terima penuh gaji dari majikan. MIM Portal hanya mengenakan yuran agensi kepada majikan, bukan pembantu.' },
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
            <a href={waCompanyLink('Hai, saya pembantu dan ada soalan tentang MIM Portal.')} target="_blank" rel="noopener noreferrer">
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
              <h2 className="text-3xl md:text-5xl font-light mb-4">Bersedia <span className="gradient-text font-semibold">Mula Bekerja?</span></h2>
              <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-lg">
                Daftar sekarang dan dapatkan kerja pembantu rumah dengan gaji RM1,500 - RM3,500 sebulan. Latihan percuma, kontrak sah, sokongan 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/helper/register">
                  <Button size="lg" className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                    Daftar Sebagai Pembantu
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg" variant="outline" className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                    Saya Majikan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
                  <p className="text-xs text-slate-500">Untuk Pembantu</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Platform kerjaya pembantu rumah profesional Malaysia oleh Kino Studios Sdn. Bhd.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Kerjaya</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Pembantu Rumah (RM1,500-2,500)</li>
                <li>Pengasuh (RM1,500-2,500)</li>
                <li>Penjaga Orang Tua (RM1,700-3,500)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Pautan Pantas</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/helper/register" className="hover:text-[#00bcd4] transition">Daftar Pembantu</Link></li>
                <li><Link href="/" className="hover:text-[#00bcd4] transition">Untuk Majikan</Link></li>
                <li><Link href="/helper/login" className="hover:text-[#00bcd4] transition">Log Masuk</Link></li>
                <li><Link href="/admin/login" className="hover:text-[#00bcd4] transition">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Hubungi Kami</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#00bcd4]" />Ampang Jaya, Selangor, Malaysia</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0 text-[#00bcd4]" />+6017-663 5990</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0 text-[#00bcd4]" />hello@kino.my</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <p>&copy; 2026 Kino Studios Sdn. Bhd. (002138666-M). Semua hak terpelihara.</p>
            <p>Brand: KinoCinema Media</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
