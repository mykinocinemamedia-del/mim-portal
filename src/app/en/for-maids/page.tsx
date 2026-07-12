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

export default function ForMaidsPageEn() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1f33] text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d1f33]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/en" className="flex items-center gap-3">
            <Image src="/logo-mim.png" alt="MIM Portal" width={44} height={44} className="rounded-lg shadow-md" />
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">MIM Portal</h1>
              <p className="text-xs text-slate-400 leading-tight">For Helpers</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/en/for-maids#benefits" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Benefits</Link>
            <Link href="/en/for-maids#how-it-works" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">How It Works</Link>
            <Link href="/en/for-maids#salary" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Salary</Link>
            <Link href="/en/for-maids#training" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">Training</Link>
            <Link href="/en/for-maids#faq" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-[#00bcd4] transition">FAQ</Link>
            <Link href="/en" className="px-3 py-2 text-sm font-medium text-[#00bcd4] hover:text-[#00d4e8] transition">For Employers →</Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Link href="/for-maids" className="text-slate-400 hover:text-[#00bcd4] font-medium">MY</Link>
              <span className="text-slate-600">|</span>
              <span className="text-[#00bcd4] font-bold">EN</span>
            </div>
            <Link href="/helper/login">
              <Button size="sm" className="btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white">Login</Button>
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
                Professional House Helper Career
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight text-white">
                Start Your Career <span className="gradient-text font-semibold">As a Professional House Helper</span>
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Join MIM Portal and get a job as a house helper, babysitter, or elderly caregiver with a salary of RM1,500 - RM3,500 per month. Free training, valid contracts, and ongoing support for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/helper/register">
                  <Button size="lg" className="btn-rounded w-full sm:w-auto text-base h-12 px-8 bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                    Register Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href={waCompanyLink('Hi, I would like to know more about working as a helper at MIM Portal.')} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="btn-rounded w-full sm:w-auto text-base h-12 px-8 bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> Ask on WhatsApp
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <div className="text-2xl font-bold text-[#00bcd4]">500+</div>
                  <div className="text-sm text-slate-400">Active Helpers</div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-[#00bcd4]">RM3,500</div>
                  <div className="text-sm text-slate-400">Maximum Salary</div>
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
                  src="/images/pixar/maid.png"
                  alt="House Helper Career"
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
              <Video className="w-3.5 h-3.5 mr-1.5" />Promo Video
            </Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Get to Know the <span className="gradient-text font-semibold">Helper Career</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Watch how MIM Portal helps you start a career as a professional house helper.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/iSrqa6J_C0w"
                  title="MIM Portal - Helper Career"
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
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Work Benefits</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Why Join <span className="gradient-text font-semibold">MIM Portal?</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              We are committed to ensuring helpers get fair, safe, and rewarding work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wallet, title: 'Stable Salary RM1,500-3,500', desc: 'Get a stable monthly salary. House Helper & Babysitter: RM1,500-2,500. Elderly Caregiver: RM1,700-3,500.' },
              { icon: GraduationCap, title: 'Free Training', desc: '6 free video training modules — from basic house helper duties to communicating with employers. Improve your skills.' },
              { icon: ShieldCheck, title: 'Valid & Secure Contracts', desc: '3 types of contracts protect your rights. Work terms, salary, and leave are all legally documented.' },
              { icon: Headphones, title: '24/7 Support', desc: 'AI assistant Aida is always ready to help. Our admins are ready to help with any issues with employers.' },
              { icon: Calendar, title: 'Flexible Schedule Options', desc: 'Choose Live-in (stay with employer, off on Sundays) or Back & Forth (8am-7pm, home in evening). Choose what suits you.' },
              { icon: Award, title: 'Rating & Reviews', desc: 'Your hard work is appreciated. High ratings mean more employers will choose you. Top helpers get priority.' },
              { icon: Heart, title: 'Suitable Matches', desc: 'Our AI Matchmaker will find employers that match your skills, area, and preferences. Not just random selection.' },
              { icon: BookOpen, title: 'Career Development', desc: 'Continuous training courses, completion certificates, and opportunities to upgrade to better positions with higher pay.' },
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
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Simple Process</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">How To <span className="gradient-text font-semibold">Start Working</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              6 simple steps from registration until starting work with an employer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', icon: UserPlus, title: 'Register Online', desc: 'Fill out the online form — personal info, address, religion, education, and answer 10 Form A questions.' },
              { num: '02', icon: MessageCircle, title: 'Receive Credentials', desc: 'Email & password auto-generated and sent via WhatsApp. Use them to log in to the dashboard.' },
              { num: '03', icon: UserCheck, title: 'Complete Profile', desc: 'Upload profile photo, complete additional info. A complete profile attracts more employers.' },
              { num: '04', icon: MonitorPlay, title: 'Watch Video Training', desc: '6 mandatory video training modules — basic work, care, safety, communication. Pass to be eligible for selection.' },
              { num: '05', icon: Video, title: 'Online Interview', desc: 'Google Meet with employer & MIM admin. Get to know the employer, understand requirements, and ensure suitability before commitment.' },
              { num: '06', icon: Rocket, title: 'Start Working', desc: 'Sign contract, start work per schedule. Receive salary every month. Rating is given after working.' },
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
                Register Now <ArrowRight className="w-4 h-4 ml-2" />
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
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Salary Info</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">How Much <span className="gradient-text font-semibold">Will You Earn?</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Salary depends on the type of service and your experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-2">
                  <Home className="w-8 h-8" />
                </div>
                <CardTitle className="text-white">House Helper</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold gradient-text mb-1">RM1,500</p>
                <p className="text-sm text-slate-400 mb-3">up to RM2,500/month</p>
                <div className="space-y-1 text-xs text-slate-300 text-left">
                  <p>• Clean the house</p>
                  <p>• Cook</p>
                  <p>• Wash &amp; iron</p>
                  <p>• Live-in or Back &amp; Forth</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-2">
                  <Baby className="w-8 h-8" />
                </div>
                <CardTitle className="text-white">Babysitter</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold gradient-text mb-1">RM1,500</p>
                <p className="text-sm text-slate-400 mb-3">up to RM2,500/month</p>
                <div className="space-y-1 text-xs text-slate-300 text-left">
                  <p>• Care for infants (0-6 years)</p>
                  <p>• Care for children</p>
                  <p>• Teach &amp; educate</p>
                  <p>• Learning activities</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 glass-dark hover:border-[#00bcd4]/30 transition-all">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center mb-2">
                  <Accessibility className="w-8 h-8" />
                </div>
                <CardTitle className="text-white">Elderly Caregiver</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold gradient-text mb-1">RM1,700</p>
                <p className="text-sm text-slate-400 mb-3">up to RM3,500/month</p>
                <div className="space-y-1 text-xs text-slate-300 text-left">
                  <p>• Care for elderly</p>
                  <p>• Help with daily activities</p>
                  <p>• Emotional support</p>
                  <p>• Remind about medication</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <Card className="border border-[#00bcd4]/20 glass-dark">
              <CardContent className="p-5">
                <p className="text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 inline mr-2 text-[#00bcd4]" />
                  <strong className="text-white">Salary is paid every month</strong> by the employer to the helper. MIM Portal&apos;s auto-invoice system ensures salary is paid on time with automatic reminders.
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
              <Badge variant="secondary" className="bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Training & Development</Badge>
              <h2 className="text-3xl md:text-5xl font-light text-white">Free Training <span className="gradient-text font-semibold">For You</span></h2>
              <p className="text-slate-300 leading-relaxed">
                We provide 6 free video training modules to help you become a professional house helper. Complete all modules to be eligible for selection by employers.
              </p>
              <div className="space-y-3">
                {[
                  { title: 'Introduction to House Helper Work', duration: '15 min', desc: 'Basic responsibilities and work ethics' },
                  { title: 'Infant & Child Care', duration: '25 min', desc: 'Guide to caring for infants and children' },
                  { title: 'Elderly Care', duration: '30 min', desc: 'Basics of elderly care' },
                  { title: 'Personal Hygiene & Safety', duration: '20 min', desc: 'Hygiene practices and safety' },
                  { title: 'Communication with Employers', duration: '18 min', desc: 'How to communicate professionally' },
                  { title: 'Time Management & Work Schedule', duration: '22 min', desc: 'How to manage time efficiently' },
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
                    <GraduationCap className="w-4 h-4 mr-2" /> Start Training Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00bcd4]/15 to-[#2d5a7c]/15 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src="/images/pixar/why-training.png"
                  alt="MIM Portal Video Training"
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
            <Badge variant="secondary" className="mb-3 bg-[#00bcd4]/15 text-[#00bcd4] border-[#00bcd4]/20">Helper FAQ</Badge>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-3">Frequently <span className="gradient-text font-semibold">Asked Questions</span></h2>
            <p className="text-slate-400">Answers to questions frequently asked by helpers.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: 'Who can register as a helper?', a: 'Anyone who:\n\n• Is a Malaysian citizen or valid work permit holder\n• Is 18 years old and above\n• Can read and write (Malay/English)\n• Is ready to work as a house helper, babysitter, or elderly caregiver\n• Has family permission (husband/wife/parents)\n\nThere is no registration fee. It is free!' },
              { q: 'How do I register?', a: 'The registration process is simple:\n\n1. Go to the Helper Register page\n2. Fill out the online form (2 sections):\n   - Section 1: Personal info (name, IC, address, phone)\n   - Section 2: Form A (10 questions — family permission, abilities, motivation)\n3. System auto-generates email & password\n4. Credentials are sent via WhatsApp to your number\n5. Log in with those credentials\n\nNo physical documents are required during registration. Everything is done online.' },
              { q: 'How much salary will I get?', a: 'Salary depends on the service type:\n\n• House Helper (Maid): RM1,500 - RM2,500 per month\n• Babysitter: RM1,500 - RM2,500 per month\n• Elderly Caregiver: RM1,700 - RM3,500 per month\n\nYour salary depends on:\n- Previous work experience\n- Skills (cooking, infant care, etc.)\n- Ratings from previous employers\n- Live-in or Back & Forth preference\n\nEmployers will negotiate salary within this range during the booking process.' },
              { q: 'What is the difference between Live-in and Back & Forth?', a: 'Live-in:\n• You stay at the employer\'s home\n• Work hours: 24/6 (6 days a week)\n• Off: Sundays & Public Holidays\n• Employer provides accommodation & food\n• Suitable for those who live far from the work area\n\nBack & Forth:\n• You come to work and go home yourself\n• Work hours: 8:00am - 7:00pm (6 days a week)\n• Off: Sundays & Public Holidays\n• You go home every evening\n• Suitable for those who live nearby\n\nYou can choose both (Can Do Both) for more flexibility.' },
              { q: 'Is training required?', a: 'Yes, video training is mandatory for all helpers:\n\n• 6 video training modules (total ~2 hours)\n• Topics: basic work, care, safety, communication\n• Completely free\n• Can be watched repeatedly\n• Must pass to be eligible for employer selection\n\nThis training helps you:\n- Understand responsibilities as a helper\n- Improve your skills\n- Get better ratings\n- Attract more employers\n\nYou can access the training through the dashboard after logging in.' },
              { q: 'What if there are problems with the employer?', a: 'We are committed to protecting helper rights:\n\n• 24/7 Support AI (Aida) is always ready to listen\n• MIM admin will mediate any conflict\n• For serious issues (safety, abuse), contact admin immediately at 017-663 5990\n• Contracts protect your rights — salary, work hours, leave\n• In emergencies, call police 999 first\n\nDon\'t be afraid to report any issues. Your safety and well-being are our priority. All complaints are confidential.' },
              { q: 'How is salary paid?', a: 'MIM Portal payment system:\n\n• Salary is paid every month by the employer\n• Auto-invoice is generated at the start of each month\n• Reminders are sent to the employer 3 days before the due date\n• If the employer is late paying, the system auto-flags as "overdue"\n• Admin will follow up with the employer\n\nYou can check payment status in the dashboard. If salary is more than 7 days late, contact admin via WhatsApp.' },
              { q: 'Can I choose my work area?', a: 'Yes, you can choose:\n\n• Your state of residence (for profile)\n• Desired work area (e.g., "Kuala Lumpur")\n• Can work outside the area? (Yes/No)\n\nIf you choose "Yes", your profile will show "Can work anywhere" — employers from all areas can select you.\n\nIf "No", only employers from your area can select you. AI Matchmaker will match you with suitable employers.' },
              { q: 'What contracts do I need to sign?', a: 'There are 3 types of contracts:\n\n1. Agency-Helper Contract: Between you and MIM Portal (Kino Studios)\n   - Terms of cooperation with the agency\n   - Your rights and responsibilities\n\n2. Agency-Employer Contract: Between MIM Portal and the employer\n   - Agency service terms\n\n3. Employer-Helper Contract: Between the employer and you\n   - Salary, work hours, leave\n   - Responsibilities of both parties\n   - Contract period\n\nAll contracts are generated automatically and signed digitally. A copy is saved in your dashboard.' },
              { q: 'How is my rating determined?', a: 'Your rating (1-5 stars) is determined by:\n\n• Ratings from employers (after working)\n• Feedback from Quality Monitor Agent (week 1, month 1, quarterly)\n• Work quality (assessed by admin)\n\nHigh ratings (4.5+) give advantages:\n- AI Matchmaker will prioritize you\n- More employers will select you\n- Higher salary opportunities\n- "Top Helper" badge on profile\n\nNew ratings start at 5.0. Maintain your rating with careful and professional work.' },
              { q: 'Can I quit after starting work?', a: 'Yes, you can quit with the conditions:\n\n• Give 7 days notice to the employer and admin\n• Complete ongoing tasks\n• Contract will be officially terminated\n\nValid reasons for quitting:\n- Health issues\n- Family needs\n- Employer not complying with contract\n- Unsafe situation\n\nIf you quit without valid notice, your rating may be affected. Contact admin for help with the proper quitting process.' },
              { q: 'Are there any fees charged to helpers?', a: 'Registration and use of the MIM Portal platform is FREE for helpers.\n\nNo fees for:\n• Registration: FREE\n• Video training: FREE\n• Dashboard use: FREE\n• Admin support: FREE\n\nYou receive the full salary from the employer. MIM Portal only charges agency fees to the employer, not the helper.' },
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
            <a href={waCompanyLink('Hi, I am a helper and have a question about MIM Portal.')} target="_blank" rel="noopener noreferrer">
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
              <h2 className="text-3xl md:text-5xl font-light mb-4">Ready to <span className="gradient-text font-semibold">Start Working?</span></h2>
              <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-lg">
                Register now and get a house helper job with a salary of RM1,500 - RM3,500 per month. Free training, valid contracts, 24/7 support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/helper/register">
                  <Button size="lg" className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-[#00bcd4] hover:bg-[#00a5bb] text-white border-0">
                    Register as Helper
                  </Button>
                </Link>
                <Link href="/en">
                  <Button size="lg" variant="outline" className="btn-rounded w-full sm:w-auto h-12 px-8 text-base bg-transparent border-2 border-[#00bcd4]/40 text-[#00bcd4] hover:bg-[#00bcd4]/10 hover:text-white">
                    I&apos;m an Employer
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
                  <p className="text-xs text-slate-500">For Helpers</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Malaysia&apos;s professional house helper career platform by Kino Studios Sdn. Bhd.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Careers</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>House Helper (RM1,500-2,500)</li>
                <li>Babysitter (RM1,500-2,500)</li>
                <li>Elderly Caregiver (RM1,700-3,500)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/helper/register" className="hover:text-[#00bcd4] transition">Helper Register</Link></li>
                <li><Link href="/en" className="hover:text-[#00bcd4] transition">For Employers</Link></li>
                <li><Link href="/helper/login" className="hover:text-[#00bcd4] transition">Login</Link></li>
                <li><Link href="/admin/login" className="hover:text-[#00bcd4] transition">Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm text-white">Contact Us</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#00bcd4]" />Ampang Jaya, Selangor, Malaysia</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0 text-[#00bcd4]" />+6017-663 5990</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0 text-[#00bcd4]" />hello@kino.my</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <p>&copy; 2026 Kino Studios Sdn. Bhd. (002138666-M). All rights reserved.</p>
            <p>Brand: KinoCinema Media</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
