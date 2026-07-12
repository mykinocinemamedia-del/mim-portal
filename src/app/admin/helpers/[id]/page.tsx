import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Pencil,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Briefcase,
  User,
  Home,
  FileText,
  ClipboardList,
  Stethoscope,
  Printer,
  Heart,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import {
  getServiceLabel,
  formatDate,
  formatMYR,
  getInitials,
  waLink,
  RELIGIONS,
} from '@/lib/utils'

export const dynamic = 'force-dynamic'

function parseSkills(skills: string | null): string[] {
  if (!skills) return []
  try {
    const parsed = JSON.parse(skills)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return skills.split(',').map((s) => s.trim()).filter(Boolean)
  }
}

const SKILL_LABELS: Record<string, string> = {
  cooking: 'Memasak',
  baby_care: 'Menjaga bayi',
  child_care: 'Menjaga kanak-kanak',
  washing: 'Mencuci baju',
  cleaning: 'Membersihkan rumah',
  educating: 'Mendidik anak',
}

export default async function AdminHelperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login')
  }

  const { id } = await params
  const helper = await db.helper.findUnique({
    where: { id },
    include: {
      bookings: {
        include: { employer: true },
        orderBy: { createdAt: 'desc' },
      },
      contracts: {
        include: { employer: true },
        orderBy: { createdAt: 'desc' },
      },
      schedules: { orderBy: { workDate: 'desc' }, take: 10 },
      medicalRecords: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!helper) {
    redirect('/admin/helpers')
  }

  const skills = parseSkills(helper.skills)

  return (
    <DashboardShell
      role="admin"
      user={{ name: session.name, email: session.email }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin/helpers">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {helper.fullName}
              </h1>
              <p className="text-muted-foreground mt-1">
                Profil pembantu · Didaftar {formatDate(helper.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                helper.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                  : helper.status === 'pending'
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                  : helper.status === 'employed'
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
              }
            >
              {helper.status}
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/helpers/${helper.id}?edit=1`}>
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/helpers/${helper.id}/edit`}>
                <Pencil className="w-4 h-4 mr-1" /> Edit Penuh
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-1" /> Cetak
            </Button>
            {helper.phone && (
              <a
                href={waLink(
                  helper.phone,
                  `Hai ${helper.fullName}, ini admin MIM Portal. Saya ingin menghubungi anda tentang...`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center overflow-hidden mb-3">
                  {helper.profilePhoto ? (
                    <img
                      src={helper.profilePhoto}
                      alt={helper.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold">
                      {getInitials(helper.fullName)}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg">{helper.fullName}</h3>
                {helper.nickname && (
                  <p className="text-sm text-muted-foreground">
                    &ldquo;{helper.nickname}&rdquo;
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">
                    {helper.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span className="text-xs break-all">{helper.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span className="text-xs">{helper.phone || '-'}</span>
                </div>
                {helper.familyPhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <span className="text-xs">
                      Keluarga: {helper.familyPhone}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span className="text-xs">
                    {helper.addressLine1}
                    {helper.addressLine2 ? `, ${helper.addressLine2}` : ''}
                    {helper.city ? `, ${helper.city}` : ''}
                    {helper.state ? `, ${helper.state}` : ''}
                    {helper.postalCode ? ` ${helper.postalCode}` : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Maklumat Peribadi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <DetailItem label="IC" value={helper.ic || '-'} />
                  <DetailItem label="Umur" value={helper.age ? `${helper.age} thn` : '-'} />
                  <DetailItem label="Tarikh Lahir" value={helper.birthDate ? formatDate(helper.birthDate) : '-'} />
                  <DetailItem label="Agama" value={helper.religion || '-'} />
                  <DetailItem label="Status" value={helper.maritalStatus || '-'} />
                  <DetailItem label="Pendidikan" value={helper.education || '-'} />
                  <DetailItem label="Negeri Tinggal" value={helper.residencyState || '-'} />
                  <DetailItem label="Kawasan Kerja" value={helper.workArea || '-'} />
                  <DetailItem label="Boleh Pindah" value={helper.canRelocate ? 'Ya' : 'Tidak'} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Perkhidmatan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Perkhidmatan</p>
                      <p className="font-medium text-sm">
                        {getServiceLabel(helper.serviceType)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pekerjaan Diingini</p>
                      <p className="font-medium text-sm">
                        {getServiceLabel(helper.desiredJob)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Waktu Kerja</p>
                      <p className="font-medium text-sm">
                        {helper.canBoth
                          ? 'Boleh kedua-duanya'
                          : helper.liveIn
                          ? 'Live-in'
                          : helper.backAndForth
                          ? 'Back & Forth'
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kebolehan
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                        >
                          {SKILL_LABELS[s] || s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {helper.otherSkills && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Kemahiran Lain</h4>
                    <p className="text-sm text-muted-foreground">{helper.otherSkills}</p>
                  </div>
                )}
                {helper.motivation && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> Motivasi
                    </h4>
                    <p className="text-sm text-muted-foreground">{helper.motivation}</p>
                  </div>
                )}
                {helper.experience && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-rose-600" /> Pengalaman
                    </h4>
                    <p className="text-sm text-muted-foreground">{helper.experience}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bookings */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-slate-600" /> Tempahan
                  </span>
                  <Badge variant="outline">{helper.bookings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {helper.bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tiada tempahan.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {helper.bookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {b.employer.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getServiceLabel(b.serviceType)} ·{' '}
                            {b.salary ? formatMYR(b.salary) + '/bln' : '-'} ·{' '}
                            {formatDate(b.createdAt)}
                          </p>
                        </div>
                        <Badge
                          className={
                            b.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                              : b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                          }
                        >
                          {b.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contracts */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" /> Kontrak
                  </span>
                  <Badge variant="outline">{helper.contracts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {helper.contracts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tiada kontrak.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {helper.contracts.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {c.contractType.replace('_', ' - ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.employer?.fullName || '-'} · {formatDate(c.createdAt)}
                          </p>
                        </div>
                        <Badge variant="outline">{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Records */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-rose-600" /> Rekod Perubatan
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/admin/medical">Tambah</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {helper.medicalRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tiada rekod perubatan.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {helper.medicalRecords.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {m.recordType === 'vaccination'
                              ? 'Vaksinasi'
                              : 'Kesihatan'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.result || '-'} ·{' '}
                            {m.uploadDate ? formatDate(m.uploadDate) : '-'}
                          </p>
                        </div>
                        {m.fileUrl && (
                          <a
                            href={m.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">
                              Lihat Fail
                            </Button>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  )
}
