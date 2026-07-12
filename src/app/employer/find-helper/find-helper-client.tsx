'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Star,
  MapPin,
  Phone,
  Search as SearchIcon,
  SlidersHorizontal,
  Users,
  Calendar,
  Home as HomeIcon,
  Briefcase,
  GraduationCap,
  Heart,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react'
import {
  SERVICE_TYPES,
  RELIGIONS,
  MALAYSIAN_STATES,
  getServiceLabel,
  formatMYR,
  getInitials,
} from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

type Helper = {
  id: string
  fullName: string
  nickname: string | null
  age: number | null
  religion: string | null
  maritalStatus: string | null
  education: string | null
  phone: string | null
  city: string | null
  state: string | null
  workArea: string | null
  canRelocate: boolean
  serviceType: string | null
  desiredJob: string | null
  liveIn: boolean
  backAndForth: boolean
  canBoth: boolean
  skills: string | null
  otherSkills: string | null
  motivation: string | null
  experience: string | null
  profilePhoto: string | null
  rating: number
  serviceLabel: string
}

type Filters = {
  serviceType: string
  liveIn: boolean
  backAndForth: boolean
  religion: string
  state: string
}

const SKILL_LABELS: Record<string, string> = {
  cooking: 'Memasak',
  baby_care: 'Menjaga bayi',
  child_care: 'Menjaga kanak-kanak',
  washing: 'Mencuci baju',
  cleaning: 'Membersihkan rumah',
  educating: 'Mendidik anak',
}

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

function WorkModeBadge({ helper }: { helper: Helper }) {
  if (helper.canBoth) {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">Boleh kedua-duanya</Badge>
  }
  if (helper.liveIn) {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">Live-in</Badge>
  }
  if (helper.backAndForth) {
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">Back &amp; Forth</Badge>
  }
  return <Badge variant="outline" className="text-xs">-</Badge>
}

export function FindHelperClient({
  helpers,
  filters,
}: {
  helpers: Helper[]
  filters: Filters
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [openHelperId, setOpenHelperId] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const openHelper = helpers.find((h) => h.id === openHelperId)

  const updateFilter = (key: keyof Filters, value: any) => {
    const params = new URLSearchParams()
    if (key === 'serviceType') {
      if (value) params.set('serviceType', value)
    } else {
      if (filters.serviceType) params.set('serviceType', filters.serviceType)
    }
    if (key === 'liveIn') {
      if (value) params.set('liveIn', 'true')
    } else {
      if (filters.liveIn) params.set('liveIn', 'true')
    }
    if (key === 'backAndForth') {
      if (value) params.set('backAndForth', 'true')
    } else {
      if (filters.backAndForth) params.set('backAndForth', 'true')
    }
    if (key === 'religion') {
      if (value) params.set('religion', value)
    } else {
      if (filters.religion) params.set('religion', filters.religion)
    }
    if (key === 'state') {
      if (value) params.set('state', value)
    } else {
      if (filters.state) params.set('state', filters.state)
    }
    const qs = params.toString()
    router.push(`/employer/find-helper${qs ? `?${qs}` : ''}`)
  }

  const clearFilters = () => {
    router.push('/employer/find-helper')
  }

  const hasActiveFilters =
    filters.serviceType ||
    filters.liveIn ||
    filters.backAndForth ||
    filters.religion ||
    filters.state

  const renderFilters = () => (
    <div className="space-y-5">
      {/* Service Type */}
      <div>
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Jenis Perkhidmatan
        </Label>
        <div className="mt-2 space-y-1.5">
          <button
            type="button"
            onClick={() => updateFilter('serviceType', '')}
            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition ${
              !filters.serviceType
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            Semua
          </button>
          {SERVICE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => updateFilter('serviceType', t.value)}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition ${
                filters.serviceType === t.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div>
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Waktu Kerja
        </Label>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.liveIn}
              onCheckedChange={(v) => updateFilter('liveIn', v === true)}
            />
            <span className="text-sm">Live-in</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.backAndForth}
              onCheckedChange={(v) => updateFilter('backAndForth', v === true)}
            />
            <span className="text-sm">Back &amp; Forth</span>
          </label>
        </div>
      </div>

      {/* Religion */}
      <div>
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Agama
        </Label>
        <Select
          value={filters.religion}
          onValueChange={(v) => updateFilter('religion', v)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Semua agama" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua</SelectItem>
            {RELIGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* State */}
      <div>
        <Label className="text-xs font-semibold uppercase text-muted-foreground">
          Negeri / Kawasan
        </Label>
        <Select
          value={filters.state}
          onValueChange={(v) => updateFilter('state', v)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Semua negeri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua</SelectItem>
            {MALAYSIAN_STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={clearFilters}
        >
          <X className="w-3 h-3 mr-1" /> Kosongkan Penapis
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cari Pembantu</h1>
          <p className="text-muted-foreground mt-1">
            Cari pembantu rumah, pengasuh atau penjaga orang tua yang sesuai.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm self-start">
          <Users className="w-3 h-3 mr-1" /> {helpers.length} pembantu dijumpai
        </Badge>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Card className="border-0 shadow-md sticky top-20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Penapis</h3>
              </div>
              {renderFilters()}
            </CardContent>
          </Card>
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showMobileFilters ? 'Tutup Penapis' : 'Tunjuk Penapis'}
          </Button>
          {showMobileFilters && (
            <Card className="border-0 shadow-md mt-3">
              <CardContent className="p-4">
                {renderFilters()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Helper Cards Grid */}
        <div className="flex-1 min-w-0">
          {helpers.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <SearchIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Tiada Pembantu Dijumpai</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Tiada pembantu yang sepadan dengan penapis anda. Cuba ubah penapis
                  atau hubungi admin untuk bantuan.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Kosongkan Penapis
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {helpers.map((h) => {
                const skills = parseSkills(h.skills)
                return (
                  <Card
                    key={h.id}
                    className="border-0 shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    <CardContent className="p-4 flex flex-col flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center overflow-hidden shrink-0">
                          {h.profilePhoto ? (
                            <img
                              src={h.profilePhoto}
                              alt={h.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold text-lg">
                              {getInitials(h.fullName)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate">{h.fullName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {h.serviceLabel}
                            {h.age ? ` · ${h.age} thn` : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium">
                                {h.rating.toFixed(1)}
                              </span>
                            </div>
                            {h.canRelocate && (
                              <Badge variant="outline" className="text-xs">
                                Boleh pindah
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {h.city ? `${h.city}, ` : ''}
                          {h.state || h.workArea || '-'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <WorkModeBadge helper={h} />
                        {h.religion && (
                          <Badge variant="outline" className="text-xs">
                            {h.religion}
                          </Badge>
                        )}
                      </div>

                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {skills.slice(0, 4).map((s, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                            >
                              {SKILL_LABELS[s] || s}
                            </Badge>
                          ))}
                          {skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setOpenHelperId(h.id)}
                      >
                        Lihat Profil
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={!!openHelper} onOpenChange={(o) => !o && setOpenHelperId(null)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          {openHelper && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center overflow-hidden shrink-0">
                    {openHelper.profilePhoto ? (
                      <img
                        src={openHelper.profilePhoto}
                        alt={openHelper.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-semibold">
                        {getInitials(openHelper.fullName)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate">{openHelper.fullName}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {openHelper.serviceLabel}
                    </span>
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Profil penuh pembantu
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Quick info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <InfoBox icon={<Star className="w-4 h-4" />} label="Penarafan" value={openHelper.rating.toFixed(1)} />
                  <InfoBox icon={<Calendar className="w-4 h-4" />} label="Umur" value={openHelper.age ? `${openHelper.age} thn` : '-'} />
                  <InfoBox icon={<Heart className="w-4 h-4" />} label="Agama" value={openHelper.religion || '-'} />
                  <InfoBox icon={<Briefcase className="w-4 h-4" />} label="Status" value={openHelper.maritalStatus || '-'} />
                </div>

                {/* Work Mode & Location */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {openHelper.city ? `${openHelper.city}, ` : ''}
                      {openHelper.state || '-'}
                      {openHelper.workArea ? ` (Kawasan: ${openHelper.workArea})` : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <HomeIcon className="w-4 h-4 text-muted-foreground" />
                    <WorkModeBadge helper={openHelper} />
                    {openHelper.canRelocate && (
                      <Badge variant="outline" className="text-xs">
                        Boleh pindah ke mana-mana
                      </Badge>
                    )}
                  </div>
                  {openHelper.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{openHelper.phone}</span>
                      <span className="text-xs text-muted-foreground">(ditunjukkan selepas tempahan disahkan)</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {(() => {
                  const skills = parseSkills(openHelper.skills)
                  if (skills.length === 0 && !openHelper.otherSkills) return null
                  return (
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
                      {openHelper.otherSkills && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Kemahiran lain: {openHelper.otherSkills}
                        </p>
                      )}
                    </div>
                  )
                })()}

                {/* Education */}
                {openHelper.education && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-600" /> Pendidikan
                    </h4>
                    <p className="text-sm text-muted-foreground">{openHelper.education}</p>
                  </div>
                )}

                {/* Motivation */}
                {openHelper.motivation && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> Motivasi
                    </h4>
                    <p className="text-sm text-muted-foreground">{openHelper.motivation}</p>
                  </div>
                )}

                {/* Experience */}
                {openHelper.experience && (
                  <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-rose-600" /> Pengalaman
                    </h4>
                    <p className="text-sm text-muted-foreground">{openHelper.experience}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setOpenHelperId(null)}>
                  Tutup
                </Button>
                <Button asChild>
                  <Link href={`/employer/bookings/new?helperId=${openHelper.id}`}>
                    <Briefcase className="w-4 h-4 mr-2" /> Tempah Pembantu Ini
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-muted/30 rounded-lg p-2 text-center">
      <div className="flex items-center justify-center text-muted-foreground mb-1">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}
