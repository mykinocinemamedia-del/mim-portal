'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog'
import { Eye, Phone, Mail, MessageCircle, ExternalLink, Calendar, User, Briefcase } from 'lucide-react'

type Lead = {
  id: string
  leadType: string
  source: string
  sourceUrl: string | null
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  profileData: string | null
  status: string
  score: number | null
  notes: string | null
  convertedTo: string | null
  contactedAt: Date | null
  qualifiedAt: Date | null
  convertedAt: Date | null
  createdAt: Date
}

const statusLabel: Record<string, string> = {
  new: 'Baru',
  contacted: 'Dihubungi',
  qualified: 'Layak',
  converted: 'Berjaya',
  rejected: 'Ditolak',
}

const sourceLabel: Record<string, string> = {
  facebook: 'Facebook',
  referral: 'Rujukan',
  content: 'Kandungan',
  ads: 'Iklan',
  manual: 'Manual',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

export function LeadDetailDialog({ lead }: { lead: Lead }) {
  let profile: any = null
  try {
    profile = lead.profileData ? JSON.parse(lead.profileData) : null
  } catch {
    profile = null
  }

  const waMessage = encodeURIComponent(
    `Helo ${lead.contactName || ''}, saya dari MIM Portal. Kami mendapati profil anda sesuai untuk perkhidmatan kami. Boleh saya kongsi maklumat lanjut?`
  )
  const waPhone = lead.contactPhone ? lead.contactPhone.replace(/[^0-9]/g, '') : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {lead.contactName || 'Tiada nama'}
            <Badge variant="outline" className="gap-1">
              {lead.leadType === 'helper' ? (
                <><Briefcase className="w-3 h-3" /> Pembantu</>
              ) : (
                <><User className="w-3 h-3" /> Majikan</>
              )}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Lead dari {sourceLabel[lead.source] || lead.source} • {new Date(lead.createdAt).toLocaleString('ms-MY')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status & Score */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold">{statusLabel[lead.status] || lead.status}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Skor AI</p>
              <p className="font-semibold">{lead.score !== null ? `${Math.round(lead.score)}/100` : '-'}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Maklumat Hubungan</h4>
            <div className="space-y-1 text-sm">
              {lead.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{lead.contactPhone}</span>
                </div>
              )}
              {lead.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{lead.contactEmail}</span>
                </div>
              )}
              {!lead.contactPhone && !lead.contactEmail && (
                <p className="text-muted-foreground text-xs">Tiada maklumat hubungan</p>
              )}
            </div>
          </div>

          {/* Source URL */}
          {lead.sourceUrl && (
            <div>
              <h4 className="text-sm font-semibold mb-1">URL Sumber</h4>
              <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 break-all">
                <ExternalLink className="w-3 h-3 shrink-0" /> {lead.sourceUrl}
              </a>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Garis Masa</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Dicipta:</span>
                <span>{new Date(lead.createdAt).toLocaleString('ms-MY')}</span>
              </div>
              {lead.contactedAt && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3 h-3 text-amber-600" />
                  <span className="text-muted-foreground">Dihubungi:</span>
                  <span>{new Date(lead.contactedAt).toLocaleString('ms-MY')}</span>
                </div>
              )}
              {lead.qualifiedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-purple-600" />
                  <span className="text-muted-foreground">Layak:</span>
                  <span>{new Date(lead.qualifiedAt).toLocaleString('ms-MY')}</span>
                </div>
              )}
              {lead.convertedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  <span className="text-muted-foreground">Berjaya:</span>
                  <span>{new Date(lead.convertedAt).toLocaleString('ms-MY')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Nota</h4>
              <p className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Profile Data */}
          {profile && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Data Profil (AI Scraped)</h4>
              <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto max-h-60">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          {waPhone && (
            <a
              href={`https://wa.me/${waPhone}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                <MessageCircle className="w-4 h-4 mr-2" /> Hubungi via WhatsApp
              </Button>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
