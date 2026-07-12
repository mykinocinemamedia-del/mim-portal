import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  HelpCircle,
  MessageCircle,
  User,
  Briefcase,
  FileText,
} from 'lucide-react'
import { waCompanyLink } from '@/lib/utils'

// Default FAQs in case DB is empty
const DEFAULT_HELPER_FAQS = [
  {
    id: 'default-helper-1',
    title: 'Bagaimana cara untuk log masuk ke akaun pembantu?',
    content:
      'Anda akan menerima kredensial (email & password) melalui WhatsApp selepas pendaftaran diluluskan. Gunakan kredensial tersebut di halaman Log Masuk Pembantu.',
  },
  {
    id: 'default-helper-2',
    title: 'Apakah yang perlu saya buat selepas log masuk pertama kali?',
    content:
      'Selepas log masuk pertama, sila: 1) Tukar password anda, 2) Lengkapkan profil anda, 3) Muat naik gambar profil, 4) Tonton semua video kursus latihan.',
  },
  {
    id: 'default-helper-3',
    title: 'Bagaimana saya boleh melihat jadual kerja saya?',
    content:
      'Jadual kerja boleh dilihat di menu "Jadual Kerja" dalam dashboard anda. Majikan atau admin akan menetapkan jadual untuk anda.',
  },
  {
    id: 'default-helper-4',
    title: 'Bila saya akan dipadankan dengan majikan?',
    content:
      'Setelah profil anda diluluskan oleh admin, anda akan dipadankan dengan majikan yang sesuai berdasarkan kriteria dan kawasan kerja anda. Proses ini biasanya mengambil masa 1-2 minggu.',
  },
  {
    id: 'default-helper-5',
    title: 'Adakah saya perlu membayar yuran untuk mendaftar?',
    content:
      'Tiada bayaran diperlukan untuk mendaftar sebagai pembantu. Sila hubungi admin jika ada pihak yang meminta bayaran.',
  },
]

const DEFAULT_EMPLOYER_FAQS = [
  {
    id: 'default-employer-1',
    title: 'Bagaimana cara untuk memohon pembantu?',
    content:
      'Log masuk ke akaun majikan, pergi ke "Cari Pembantu", pilih pembantu yang sesuai dan buat tempahan. Admin akan menghubungi anda untuk proses selanjutnya.',
  },
  {
    id: 'default-employer-2',
    title: 'Berapakah kos upah pembantu?',
    content:
      'Kos upah bergantung kepada jenis perkhidmatan: Pembantu Rumah/Pengasuh (RM1,500-2,500) dan Penjaga Orang Tua (RM1,700-3,500). Butiran terperinci akan diberikan selepas pemadanan.',
  },
  {
    id: 'default-employer-3',
    title: 'Berapa lama proses pemadanan pembantu?',
    content:
      'Proses pemadanan biasanya mengambil masa 1-2 minggu selepas tempahan dibuat, bergantung kepada ketersediaan pembantu yang sesuai.',
  },
]

export default async function HelperFaqPage() {
  const session = await getSession()
  if (!session || session.role !== 'helper') {
    redirect('/helper/login')
  }

  const helper = await db.helper.findUnique({ where: { id: session.id } })
  if (!helper) redirect('/helper/login')

  // Fetch FAQs from DB
  const dbFaqs = await db.document.findMany({
    where: { docType: 'faq', isPublished: true },
    orderBy: { createdAt: 'asc' },
  })

  // Group FAQs by content - if title or content includes "Majikan" we put in employer group
  // Otherwise default to helper group
  const helperFaqs: { id: string; title: string; content: string }[] = []
  const employerFaqs: { id: string; title: string; content: string }[] = []

  for (const f of dbFaqs) {
    const item = {
      id: f.id,
      title: f.title,
      content: f.content || '',
    }
    const lower = (f.title + ' ' + (f.content || '')).toLowerCase()
    if (
      lower.includes('majikan') ||
      lower.includes('employer') ||
      lower.includes('upah') ||
      lower.includes('bayaran')
    ) {
      employerFaqs.push(item)
    } else {
      helperFaqs.push(item)
    }
  }

  // If no helper FAQs, use defaults
  const finalHelperFaqs = helperFaqs.length > 0 ? helperFaqs : DEFAULT_HELPER_FAQS
  const finalEmployerFaqs = employerFaqs.length > 0 ? employerFaqs : DEFAULT_EMPLOYER_FAQS

  return (
    <DashboardShell role="helper" user={{ name: helper.fullName, email: helper.email || '' }}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Soalan Lazim (FAQ)</h1>
          <p className="text-muted-foreground mt-1">
            Jawapan kepada soalan-soalan yang sering ditanya.
          </p>
        </div>

        {/* Helper FAQs */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">Soalan Lazim - Pembantu</CardTitle>
                <CardDescription className="text-xs">
                  Panduan untuk pembantu rumah, pengasuh, dan penjaga orang tua
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {finalHelperFaqs.map((faq, i) => (
                <AccordionItem key={faq.id} value={`helper-${faq.id}`}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <span className="flex items-start gap-2">
                      <Badge variant="outline" className="rounded-full h-5 min-w-5 px-1.5 text-xs justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </Badge>
                      <span className="text-left">{faq.title}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pl-7">
                    {faq.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Employer FAQs (for context) */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">Soalan Lazim - Majikan</CardTitle>
                <CardDescription className="text-xs">
                  Untuk rujukan - bagaimana pihak majikan beroperasi
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {finalEmployerFaqs.map((faq, i) => (
                <AccordionItem key={faq.id} value={`employer-${faq.id}`}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <span className="flex items-start gap-2">
                      <Badge variant="outline" className="rounded-full h-5 min-w-5 px-1.5 text-xs justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </Badge>
                      <span className="text-left">{faq.title}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pl-7">
                    {faq.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Other documents */}
        {dbFaqs.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Dokumen Lain</CardTitle>
                  <CardDescription className="text-xs">
                    Dokumen tambahan dari MIM Portal ({dbFaqs.length} dokumen)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-72 overflow-y-auto">
              {dbFaqs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {d.content || 'Tiada kandungan'}
                    </p>
                  </div>
                  {d.fileUrl && (
                    <Button asChild size="sm" variant="outline">
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer">
                        Lihat
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Contact card */}
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-amber-50/50">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Masih Ada Soalan?</h3>
                <p className="text-sm text-muted-foreground">
                  Hubungi admin MIM melalui WhatsApp untuk pertanyaan lanjut.
                </p>
              </div>
            </div>
            <a
              href={waCompanyLink('Saya mempunyai soalan tentang MIM Portal.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" /> Hubungi Admin
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
