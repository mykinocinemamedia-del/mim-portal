import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen, UserPlus, LogIn, Search, Calendar, FileText,
  CreditCard, Headphones, Home, Users, Briefcase, ShieldCheck,
  ArrowRight, MessageCircle, CheckCircle2, GraduationCap
} from 'lucide-react'
import { waCompanyLink } from '@/lib/utils'
import Image from 'next/image'

export default function HowToUsePage() {
  const employerSteps = [
    { num: '1', icon: UserPlus, title: 'Daftar Sebagai Majikan', desc: 'Pergi ke halaman pendaftaran majikan. Isi borang dengan maklumat lengkap - nama, telefon, alamat, jenis perkhidmatan diperlukan, bilangan anak, dan bajet gaji. Sistem akan auto-jana email dan password.', link: '/employer/register', linkText: 'Daftar Sekarang' },
    { num: '2', icon: LogIn, title: 'Terima Kredensial via WhatsApp', desc: 'Selepas daftar, anda akan terima email dan password melalui WhatsApp. Simpan kredensial ini untuk log masuk.', link: null },
    { num: '3', icon: LogIn, title: 'Log Masuk ke Dashboard', desc: 'Gunakan kredensial yang diterima untuk log masuk. Dashboard akan paparkan maklumat akaun, kontrak, dan pembayaran.', link: '/employer/login', linkText: 'Log Masuk' },
    { num: '4', icon: Search, title: 'Cari & Pilih Pembantu', desc: 'Pergi ke "Cari Pembantu". Tapis mengikut jenis perkhidmatan, kawasan, agama, dan pilihan Live-in/Back & Forth. Lihat profil lengkap setiap pembantu.', link: '/employer/find-helper', linkText: 'Cari Pembantu' },
    { num: '5', icon: Calendar, title: 'Booking & Temuduga', desc: 'Klik "Book" pada pembantu pilihan. Isi borang booking dengan gaji, tarikh mula, dan tempoh. Admin akan jadualkan temuduga Google Meet 3 pihak.', link: '/employer/bookings', linkText: 'Lihat Tempahan' },
    { num: '6', icon: FileText, title: 'Tandatangan Kontrak', desc: 'Selepas temuduga berjaya, 3 jenis kontrak akan dijana automatik - Agensi-Pembantu, Agensi-Majikan, Majikan-Pembantu. Tandatangan secara digital.', link: '/employer/contract', linkText: 'Lihat Kontrak' },
    { num: '7', icon: CreditCard, title: 'Pembayaran Bulanan', desc: 'Sistem auto-jana invois bulanan. Bayar gaji pembantu setiap bulan. Peringatan dihantar sebelum tarikh akhir.', link: '/employer/payments', linkText: 'Lihat Pembayaran' },
    { num: '8', icon: Headphones, title: 'Sokongan Berterusan', desc: 'AI Aida sentiasa sedia membantu 24/7. Admin MIM membantu sebarang masalah. Quality monitor akan hubungi anda untuk feedback.', link: null },
  ]

  const helperSteps = [
    { num: '1', icon: UserPlus, title: 'Daftar Sebagai Pembantu', desc: 'Isi borang online 2 seksyen - maklumat diri dan Borang A (10 soalan). Termasuk nama, IC, umur, agama, alamat, kemahiran.', link: '/helper/register', linkText: 'Daftar Sekarang' },
    { num: '2', icon: LogIn, title: 'Terima Kredensial via WhatsApp', desc: 'Email dan password auto-dijana dan dihantar ke WhatsApp anda.', link: null },
    { num: '3', icon: LogIn, title: 'Log Masuk & Lengkapkan Profil', desc: 'Log masuk dengan kredensial yang diterima. Muat naik gambar profil dan lengkapkan maklumat.', link: '/helper/login', linkText: 'Log Masuk' },
    { num: '4', icon: GraduationCap, title: 'Tonton Video Kursus', desc: '6 modul latihan video wajib - asas kerja, penjagaan, kebersihan, komunikasi. Lengkapkan semua untuk layak dipilih.', link: '/helper/video-courses', linkText: 'Tonton Kursus' },
    { num: '5', icon: Calendar, title: 'Temuduga dengan Majikan', desc: 'Apabila majikan booking anda, admin akan jadualkan temuduga Google Meet. Hadir dan kenali majikan.', link: null },
    { num: '6', icon: FileText, title: 'Tandatangan Kontrak', desc: 'Selepas temuduga berjaya, tandatangan kontrak secara digital. Kontrak melindungi hak anda.', link: '/helper/contract', linkText: 'Lihat Kontrak' },
    { num: '7', icon: Calendar, title: 'Mula Bekerja', desc: 'Mula bekerja mengikut jadual. Terima gaji setiap bulan. Rating diberikan selepas bekerja.', link: '/helper/schedule', linkText: 'Lihat Jadual' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1f33] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d1f33]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-mim.png" alt="MIM Portal" width={44} height={44} className="rounded-lg shadow-md" />
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">MIM Portal</h1>
              <p className="text-xs text-slate-400 leading-tight">Panduan Penggunaan</p>
            </div>
          </Link>
          <Link href="/">
            <Button size="sm" variant="outline" className="btn-rounded border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
              <Home className="w-4 h-4 mr-1" /> Laman Utama
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Title */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />Panduan Penggunaan
          </Badge>
          <h1 className="text-3xl md:text-5xl font-light text-white mb-3">Bagaimana <span className="gradient-text font-semibold">Menggunakan MIM Portal</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Panduan langkah demi langkah untuk majikan dan pembantu. Faham flow keseluruhan sebelum mula.
          </p>
        </div>

        {/* Employer Guide */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Untuk Majikan</h2>
              <p className="text-sm text-slate-400">8 langkah mendapatkan pembantu</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {employerSteps.map((step, i) => (
              <Card key={i} className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#00bcd4] flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="w-5 h-5 text-[#00bcd4]" />
                        <h3 className="font-semibold text-white">{step.title}</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{step.desc}</p>
                      {step.link && (
                        <Link href={step.link}>
                          <Button size="sm" variant="outline" className="btn-rounded border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                            {step.linkText} <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Helper Guide */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Untuk Pembantu</h2>
              <p className="text-sm text-slate-400">7 langkah mula bekerja</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {helperSteps.map((step, i) => (
              <Card key={i} className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#00bcd4] flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="w-5 h-5 text-[#00bcd4]" />
                        <h3 className="font-semibold text-white">{step.title}</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{step.desc}</p>
                      {step.link && (
                        <Link href={step.link}>
                          <Button size="sm" variant="outline" className="btn-rounded border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                            {step.linkText} <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Tips Penting</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: 'Safety First', desc: 'Sentiasa guna platform MIM untuk semua komunikasi. Jangan bayar luar platform.' },
              { icon: CheckCircle2, title: 'Lengkapkan Profil', desc: 'Profil lengkap dengan gambar mendapat lebih banyak respons dari majikan/pembantu.' },
              { icon: Headphones, title: 'Hubungi Admin', desc: 'Ada masalah? WhatsApp admin di +6017-663 5990. AI Aida juga sedia membantu 24/7.' },
            ].map((tip, i) => (
              <Card key={i} className="border border-white/10 glass-dark">
                <CardContent className="p-5">
                  <tip.icon className="w-8 h-8 text-[#00bcd4] mb-3" />
                  <h3 className="font-semibold text-white mb-1">{tip.title}</h3>
                  <p className="text-sm text-slate-400">{tip.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-slate-400 mb-4">Sedia untuk mula?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/employer/register">
              <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                Daftar Sebagai Majikan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/helper/register">
              <Button size="lg" variant="outline" className="btn-rounded border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white px-8">
                Daftar Sebagai Pembantu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
