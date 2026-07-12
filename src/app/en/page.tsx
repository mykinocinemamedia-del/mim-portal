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
  Bell, BadgeCheck, CalendarClock, ScanSearch, RefreshCw, Download
} from 'lucide-react'
import { waCompanyLink, formatMYR, getServiceLabel, SKILLS_OPTIONS } from '@/lib/utils'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Image from 'next/image'

export default async function MimLandingPageEn() {
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
            <Link href="/en#how-it-works" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">How It Works</Link>
            <Link href="/en#maids" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Helpers</Link>
            <Link href="/en#benefits" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Benefits</Link>
            <Link href="/en#services" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Services</Link>
            <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Pricing</Link>
            <Link href="/en#ai-agents" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">AI Agents</Link>
            <Link href="/en#faq" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">FAQ</Link>
            <Link href="/en/for-maids" className="px-3 py-2 text-sm font-medium text-[#00bcd4] hover:text-[#00d4e8] transition">For Helpers →</Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Link href="/" className="text-slate-400 hover:text-[#00bcd4] font-medium">MY</Link>
              <span className="text-slate-600">|</span>
              <span className="text-[#00bcd4] font-bold">EN</span>
            </div>
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-300 hover:text-white hover:bg-white/5">Admin</Button>
            </Link>
            <Link href="/employer/login">
              <Button size="sm" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Focus on Employer with Video Background */}
      <section className="relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden" style={{ backgroundImage: 'url(/images/pixar/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <iframe
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ width: '177.77vh', height: '56.25vw', minWidth: '100%', minHeight: '100%', opacity: 0.2 }}
          src="https://www.youtube.com/embed/3-M09WyY6Rw?autoplay=1&mute=1&loop=1&playlist=3-M09WyY6Rw&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&start=0"
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
                Malaysia&apos;s #1 House Helper Platform
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight text-white">
                Find <span className="gradient-text font-semibold">Professional House Helpers</span> For Your Family
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                MIM Portal connects employers with trained and trusted house helpers, babysitters, and elderly caregivers. All processes — from search, interview, contract, to payment — are managed within one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/employer/register">
                  <Button size="lg" className="btn-rounded w-full sm:w-auto text-base h-12 px-8 bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                    Find a Helper Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href={waCompanyLink('Hi, I would like to know more about MIM Portal services.')} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="btn-rounded w-full sm:w-auto text-base h-12 px-8 bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> Ask on WhatsApp
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <div className="text-2xl font-bold text-[#00bcd4]">500+</div>
                  <div className="text-sm text-slate-400">Registered Helpers</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-[#00bcd4]">98%</div>
                  <div className="text-sm text-slate-400">Employer Satisfaction</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-[#00bcd4]">4.9</span>
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-sm text-slate-400">Average Rating</div>
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
                    <Badge variant="outline" className="bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/30">Get Started</Badge>
                  </div>
                  <div className="space-y-2">
                    <Link href="/employer/register" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group">
                      <div className="w-9 h-9 rounded-lg bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">I&apos;m an Employer</div>
                        <div className="text-xs text-slate-400">Find a helper</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#00bcd4]" />
                    </Link>
                    <Link href="/en/for-maids" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group">
                      <div className="w-9 h-9 rounded-lg bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">I&apos;m a Helper</div>
                        <div className="text-xs text-slate-400">Find a job</div>
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
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Benefits For Employers</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Why Employers <span className="gradient-text font-semibold">Choose MIM Portal?</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              We understand finding a trustworthy house helper is not easy. MIM Portal solves all your problems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: 'Safe & Secure', desc: 'All helpers go through screening, training, and assessment. Legally valid contracts protect both parties.', image: '/images/pixar/why-safety.png' },
              { icon: Search, title: 'Search & Choose Yourself', desc: 'Filter helpers by service type, area, religion, and live-in/back & forth preference. You choose the best.', image: '/images/pixar/why-search.png' },
              { icon: Clock, title: 'Save Time', desc: 'All processes are automated — from registration, interview, contract, to payment. No paperwork hassle.', image: '/images/pixar/why-time.png' },
              { icon: Headphones, title: '24/7 Support', desc: 'AI assistant Aida is always ready to help. Our admins assist with any issue via WhatsApp anytime.', image: '/images/pixar/why-support.png' },
              { icon: Award, title: 'Trained Helpers', desc: 'Every helper completes mandatory video training modules before being selectable. Skills monitored and assessed.', image: '/images/pixar/why-training.png' },
              { icon: FileText, title: 'Auto Contract', desc: '3 contract types generated automatically — Agency-Helper, Agency-Employer, Employer-Helper. Valid and secure.', image: '/images/pixar/why-contract.png' },
              { icon: CreditCard, title: 'Organized Payments', desc: 'Monthly auto-invoicing, payment reminders, and complete payment records. Never worry about forgetting to pay.', image: '/images/pixar/why-payment.png' },
              { icon: Bot, title: 'AI Matchmaker', desc: 'Our AI scores compatibility between you and the helper (0-100) based on your needs, area, and budget.', image: '/images/pixar/why-matchmaker.png' },
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
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Simple Process</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">How To <span className="gradient-text font-semibold">Get a Helper</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              6 simple steps from registration until the helper starts working at your home.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', icon: UserPlus, title: 'Register as Employer', desc: 'Fill out the online form with your requirements — service type, number of children, budget, area.', image: '/images/steps-pixar/step1-register-wide.png' },
              { num: '02', icon: Search, title: 'Search & Choose Helper', desc: 'Filter helpers by criteria. View profiles, ratings, skills. Pick the one that suits you.', image: '/images/steps-pixar/step2-find-wide.png' },
              { num: '03', icon: Calendar, title: 'Online Interview', desc: '3-party Google Meet session — you, the helper, and MIM admin. Get to know the helper before commitment.', image: '/images/steps-pixar/step3-interview-wide.png' },
              { num: '04', icon: PenTool, title: 'Sign Contract', desc: '3 contract types signed digitally. Legally valid, protecting both parties.', image: '/images/steps-pixar/step4-contract-wide.png' },
              { num: '05', icon: Rocket, title: 'Helper Starts Work', desc: 'Helper starts work according to agreed schedule. Auto-generated schedule.', image: '/images/steps-pixar/step5-start-wide.png' },
              { num: '06', icon: Headphones, title: 'Ongoing Support', desc: 'AI monitors quality, auto-invoices payments, and admin is ready to help throughout the contract period.', image: '/images/steps-pixar/step6-support-wide.png' },
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
                Start Finding a Helper <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
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
              <Video className="w-3.5 h-3.5 mr-1.5" />Promo Video
            </Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Get to Know <span className="gradient-text font-semibold">MIM Portal</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Watch how MIM Portal helps Malaysian families find the right house helper.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* MIM Portal Enhanced Video (voiceover + motion) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[#00bcd4] font-medium">🎬 MIM Portal Video - USP Features & Steps (Enhanced)</p>
                <a href="/videos/mim-promo-enhanced.mp4" download className="text-xs text-slate-400 hover:text-[#00bcd4] transition inline-flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <video
                  className="w-full"
                  controls
                  autoPlay
                  loop
                  playsInline
                  poster="/images/pixar/hero.png"
                >
                  <source src="/videos/mim-promo-enhanced.mp4" type="video/mp4" />
                  Your browser does not support video.
                </video>
              </div>
            </div>

            {/* YouTube Promo Video */}
            <div>
              <p className="text-center text-sm text-slate-400 mb-3">YouTube Video</p>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/3-M09WyY6Rw"
                    title="MIM Portal - Promo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Helpers */}
      <section id="maids" className="py-20 bg-[#102943] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00bcd4]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#2d5a7c]/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />Featured Helpers
            </Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Choose the <span className="gradient-text font-semibold">Best Helper</span> For Your Family</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Browse available helper profiles. Click to book an interview.
            </p>
          </div>

          {helpers.length === 0 ? (
            <div className="text-center py-12 glass-dark rounded-2xl border border-white/10 max-w-xl mx-auto">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No helpers available at the moment. Register now to receive notifications.</p>
              <Link href={selectHelperHref}>
                <Button className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                  Register as Employer <ArrowRight className="w-4 h-4 ml-2" />
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
                              Flexible
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                        <Link href={selectHelperHref} className="flex-1">
                          <Button size="sm" className="w-full btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                            Select Helper
                          </Button>
                        </Link>
                        <Link href={selectHelperHref}>
                          <Button size="sm" variant="outline" className="btn-rounded bg-transparent border border-white/20 text-slate-300 hover:bg-white/5 hover:text-white">
                            View Profile
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
                View All Helpers <ArrowRight className="w-4 h-4 ml-2" />
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
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Our Services</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">3 Types of <span className="gradient-text font-semibold">Services</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose the service that suits your family&apos;s needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300 overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <Image src="/images/pixar/maid.png" alt="House Helper" width={1024} height={1024} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102943] via-transparent to-transparent" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-white">House Helper</CardTitle>
                <p className="text-2xl font-bold text-[#00bcd4]">RM1,500 - RM2,500</p>
                <p className="text-xs text-slate-500">Per Month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />House cleaning</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Cooking</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Washing &amp; ironing clothes</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Live-in or Back &amp; Forth option</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300 overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <Image src="/images/pixar/babysitter.png" alt="Babysitter" width={1024} height={1024} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102943] via-transparent to-transparent" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-white">Babysitter</CardTitle>
                <p className="text-2xl font-bold text-[#00bcd4]">RM1,500 - RM2,500</p>
                <p className="text-xs text-slate-500">Per Month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Infant care (0-6 years)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Child care (12-17 years)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Educating children</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Learning activities</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300 overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <Image src="/images/pixar/caregiver.png" alt="Elderly Caregiver" width={1024} height={1024} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102943] via-transparent to-transparent" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-white">Elderly Caregiver</CardTitle>
                <p className="text-2xl font-bold text-[#00bcd4]">RM1,700 - RM3,500</p>
                <p className="text-xs text-slate-500">Per Month</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Elderly care</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Assistance with daily activities</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Emotional support</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#00bcd4] mt-0.5 shrink-0" />Medication reminders</li>
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
                13 AI Agents <span className="gradient-text font-semibold">Automate Everything</span>
              </h2>
              <p className="text-slate-300 leading-relaxed">
                MIM Portal is not just a platform — it&apos;s an AI ecosystem that automates the entire process. From helper search to contract management and payments, everything is handled autonomously by AI agents.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, title: 'Lead Generation', desc: '4 agents find leads' },
                  { icon: Heart, title: 'AI Matchmaker', desc: 'Auto-score compatibility' },
                  { icon: MessageCircle, title: 'WhatsApp Onboarding', desc: 'Aida AI assistant' },
                  { icon: FileText, title: 'Auto-Contract', desc: '3 auto-generated contracts' },
                  { icon: CreditCard, title: 'Payment Agent', desc: 'Auto-invoice & reminder' },
                  { icon: Calendar, title: 'Schedule Agent', desc: 'Auto work schedule' },
                  { icon: Bot, title: '24/7 Support AI', desc: 'Handle all chats' },
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
                  <Bot className="w-4 h-4 mr-2" /> View AI Agents Dashboard <ArrowRight className="w-4 h-4 ml-2" />
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
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Employer FAQ</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Frequently <span className="gradient-text font-semibold">Asked Questions</span></h2>
            <p className="text-slate-400">Answers to questions frequently asked by employers.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: 'How much is the helper\'s salary?', a: 'Helper salary depends on the service type:\n\n• House Helper (Maid): RM1,500 - RM2,500 per month\n• Babysitter: RM1,500 - RM2,500 per month\n• Elderly Caregiver: RM1,700 - RM3,500 per month\n\nSalary is determined by experience, skills, and service type. Employers can negotiate salary within this range during the booking process.' },
              { q: 'How does the process of getting a helper work?', a: 'The process is simple — 6 steps:\n\n1. Register as an employer (online form)\n2. Search & choose a helper (filter by criteria)\n3. Online interview (3-party Google Meet)\n4. Sign contract (3 types of digital contracts)\n5. Helper starts work (per schedule)\n6. Ongoing support (AI + admin)\n\nThe entire process usually takes 3-7 days from registration until the helper starts working.' },
              { q: 'Are helpers screened and trained?', a: 'Yes, all helpers go through the following process before being listed on the platform:\n\n• Registration with complete information (IC, family, address)\n• Form A (10 assessment questions — family permission, abilities, motivation)\n• Mandatory video training modules (6 basic courses)\n• System rating assessment\n• Admin screening before "active" status\n\nHelpers with low ratings or incomplete profiles will be flagged for review.' },
              { q: 'What types of contracts are signed?', a: 'There are 3 types of contracts signed digitally:\n\n1. Agency-Helper Contract: Between MIM Portal (Kino Studios) and the helper\n2. Agency-Employer Contract: Between MIM Portal and the employer\n3. Employer-Helper Contract: Between the employer and the helper\n\nAll contracts are generated automatically after a match is confirmed, contain complete terms & conditions, and are legally valid in Malaysia.' },
              { q: 'What if the helper is not suitable?', a: 'If the helper is not suitable after starting work:\n\n• Week 1: Contact admin via WhatsApp for feedback\n• Our Quality Monitor Agent will contact you for a satisfaction survey\n• If there are serious issues, admin will arrange a helper replacement\n• Contract can be terminated with 7 days notice\n\nWe are committed to ensuring employers get a suitable helper. Our support continues throughout the contract period.' },
              { q: 'How is the helper\'s salary paid?', a: 'MIM Portal payment system:\n\n• Salary is paid monthly by the employer to the helper\n• Auto-invoice is generated each month by the Payment Agent\n• Reminders are sent 3 days before the due date\n• Payment status: pending → paid → overdue\n• Employer can pay via WhatsApp to admin or directly to the helper\n\nComplete payment records are saved in the employer dashboard for reference.' },
              { q: 'What are the Live-in or Back & Forth options?', a: 'Helpers can choose two work schedule options:\n\n• Live-in: The helper stays at the employer\'s home. Off on Sundays & Public Holidays. Suitable for families who need a helper 24/7.\n\n• Back & Forth: The helper comes to work 8:00am - 7:00pm, goes home in the evening. Off on Sundays & Public Holidays. Suitable for families who only need help during the day.\n\n• Can Do Both: Flexible helper, can choose based on employer\'s offer.\n\nEmployers can filter helpers by these options during search.' },
              { q: 'What if there is a conflict with the helper?', a: 'MIM Portal provides support to resolve conflicts:\n\n• 24/7 Support AI (Aida) is always ready to listen and help\n• MIM admin will mediate if needed (via WhatsApp/Google Meet)\n• For serious issues (safety, abuse), contact admin immediately at 017-663 5990\n• Contracts contain dispute resolution clauses\n• In emergencies, call police 999 first, then MIM admin\n\nThe safety and well-being of both parties is our priority.' },
              { q: 'How much is the MIM Portal agency fee?', a: 'Agency fees depend on the service package. Please contact our admin via WhatsApp at +6017-663 5990 for:\n\n• Agency fee details\n• Custom service packages\n• Current promotions\n\nThe agency fee is one-time only and is separate from the helper\'s monthly salary. The helper\'s salary is paid directly to the helper.' },
              { q: 'Do helpers have medical records?', a: 'Yes, MIM admin manages helper medical records:\n\n• General health records\n• Vaccination records\n• Updated periodically\n\nMedical records can be requested by employers via the dashboard. For health issues during work, admin will coordinate with the helper for medical examinations.' },
              { q: 'Can I change helpers after the contract starts?', a: 'Yes, you can apply for a helper replacement if:\n\n• The helper is not suitable (after a 1-month trial period)\n• Unresolvable conflict\n• Family needs have changed\n\nReplacement process:\n1. Contact admin via WhatsApp\n2. Admin will review the situation and suggest a replacement helper\n3. A new contract is generated\n4. Old and new helpers will be coordinated\n\nA replacement fee may apply depending on the situation.' },
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
            <p className="text-slate-400 mb-4">Still have questions? Contact us:</p>
            <a href={waCompanyLink('Hi, I have a question about MIM Portal.')} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                <MessageCircle className="w-4 h-4 mr-2" /> Ask on WhatsApp
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
              <h2 className="text-3xl md:text-5xl font-light mb-4">Ready to <span className="gradient-text font-semibold">Get a Helper?</span></h2>
              <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-lg">
                Register now and let our AI find the right helper for your family.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/employer/register">
                  <Button size="lg" className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                    Register as Employer
                  </Button>
                </Link>
                <Link href="/en/for-maids">
                  <Button size="lg" variant="outline" className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                    I&apos;m a Helper / Babysitter
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Flyer Download Section */}
      <section className="py-16 bg-[#102943] border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
              <FileText className="w-3.5 h-3.5 mr-1.5" />Download Flyers
            </Badge>
            <h2 className="text-2xl md:text-3xl font-light text-white mb-2">MIM Portal <span className="gradient-text font-semibold">Flyers</span></h2>
            <p className="text-slate-400 text-sm">Download our flyers for complete service information.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <a href="/downloads/flyers-front.jpg" download="MIM-Flyer-Front.jpg">
              <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/40 transition-all cursor-pointer overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <Image src="/flyers-front.jpg" alt="Flyer Front" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1828] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">Flyer Front</span>
                    <Badge className="bg-[#00bcd4] text-white">Download</Badge>
                  </div>
                </div>
              </Card>
            </a>
            <a href="/downloads/flyers-back.jpg" download="MIM-Flyer-Back.jpg">
              <Card className="group border border-white/10 glass-dark hover:border-[#00bcd4]/40 transition-all cursor-pointer overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <Image src="/flyers-back.jpg" alt="Flyer Back" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1828] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">Flyer Back</span>
                    <Badge className="bg-[#00bcd4] text-white">Download</Badge>
                  </div>
                </div>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* Smart Features Section - NEW */}
      <section id="smart-features" className="py-20 bg-gradient-to-br from-[#0a1828] via-[#0d1f33] to-[#102943] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00bcd4]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2d5a7c]/15 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />New Smart Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Smart Features for <span className="gradient-text font-semibold">Better Matches</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Innovative tools to help you find the perfect helper or employer — faster, safer, and smarter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Bell, title: 'Smart Match Alerts', desc: 'Get WhatsApp notification when AI finds a perfect match for you.' },
              { icon: BadgeCheck, title: 'Verified Badge System', desc: 'Helpers with verified IC, medical records, and background checks get a blue checkmark.' },
              { icon: CalendarClock, title: 'Trial Period', desc: '7-day trial period before committing to full contract.' },
              { icon: Video, title: 'Video Profile', desc: 'Helpers can record a 30-second video introducing themselves.' },
              { icon: MessageCircle, title: 'Instant Chat', desc: 'Chat directly with the helper before booking (via WhatsApp integration).' },
              { icon: Star, title: 'Rating & Reviews', desc: 'See real reviews from previous employers.' },
              { icon: ScanSearch, title: 'Background Check', desc: 'AI-powered background verification for all helpers.' },
              { icon: RefreshCw, title: 'Replacement Guarantee', desc: 'Free replacement within 30 days if the match doesn&apos;t work out.' },
            ].map((f, i) => (
              <Card key={i} className="group border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#00bcd4] group-hover:text-white transition-all">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/employer/register">
              <Button size="lg" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0 px-8">
                Try Smart Features <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
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
                Malaysia&apos;s house helper service platform by Kino Studios Sdn. Bhd.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>House Helper (RM1,500-2,500)</li>
                <li>Babysitter (RM1,500-2,500)</li>
                <li>Elderly Caregiver (RM1,700-3,500)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/employer/register" className="hover:text-[#00bcd4] transition">Employer Register</Link></li>
                <li><Link href="/en/for-maids" className="hover:text-[#00bcd4] transition">For Helpers</Link></li>
                <li><Link href="/employer/login" className="hover:text-[#00bcd4] transition">Employer Login</Link></li>
                <li><Link href="/helper/login" className="hover:text-[#00bcd4] transition">Helper Login</Link></li>
                <li><Link href="/admin/login" className="hover:text-[#00bcd4] transition">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Contact Us</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#00bcd4]" />Ampang Jaya, Selangor, Malaysia</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0 text-[#00bcd4]" />+6017-663 5990</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0 text-[#00bcd4]" />hello@kino.my</li>
                <li className="flex items-center gap-2"><Globe className="w-4 h-4 shrink-0 text-[#00bcd4]" />www.kino.my</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <p>&copy; 2026 Kino Studios Sdn. Bhd. (002138666-M). All rights reserved.</p>
            <p>Brand: KinoCinema Media | Led by Mahadzir Hanafiah</p>
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
