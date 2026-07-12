/**
 * Employer Hunter Agent
 * ---------------------
 * Scans mock job postings (Mudah.my, Carousell, Facebook) for families/
 * individuals seeking domestic helpers. Uses AI to analyze stated needs,
 * generate personalized pitch, and reach out via WhatsApp.
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { aiChat, parseAIJson, type ChatMessage } from '@/lib/ai/provider'
import { sendWhatsApp, WhatsAppTemplates } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

interface MockJobPost {
  name: string
  phone: string
  location: string
  platform: 'mudah.my' | 'carousell' | 'facebook'
  sourceUrl: string
  postSnippet: string
  budgetRange?: string
  serviceType?: string
  urgency?: 'segera' | 'minggu_ini' | 'bulan_ini'
}

const MOCK_POSTS: MockJobPost[] = [
  {
    name: 'Ahmad Faizal bin Omar',
    phone: '+60198887701',
    location: 'Damansara, Selangor',
    platform: 'mudah.my',
    sourceUrl: 'https://www.mudah.my/listing/maid-wanted-damansara-001',
    postSnippet:
      'Cari pembantu rumah Indonesia/Malaysia untuk keluarga 4 orang. Live-in. Gaji RM2,000 sebulan.',
    budgetRange: 'RM1,800 - RM2,500',
    serviceType: 'Pembantu Rumah',
    urgency: 'bulan_ini',
  },
  {
    name: 'Tan Wei Ling',
    phone: '+60198887702',
    location: 'Cheras, Kuala Lumpur',
    platform: 'carousell',
    sourceUrl: 'https://carousell.com/p/maid-pengasuh-cheras-002',
    postSnippet:
      'Need pengasuh for 2 kids (3y & 5y). Live-out preferable. Chinese speaking a bonus. RM1,800.',
    budgetRange: 'RM1,500 - RM2,200',
    serviceType: 'Pengasuh',
    urgency: 'minggu_ini',
  },
  {
    name: 'Saraswathy a/p Ramachandran',
    phone: '+60198887703',
    location: 'Shah Alam, Selangor',
    platform: 'facebook',
    sourceUrl: 'https://facebook.com/marketplace/item/maid-shah-alam-003',
    postSnippet:
      'Cari pembantu untuk jaga mak (78 tahun). Boleh masak, mandikan, bawa ke hospital. Gaji RM2,500.',
    budgetRange: 'RM2,000 - RM3,000',
    serviceType: 'Penjaga Orang Tua',
    urgency: 'segera',
  },
  {
    name: 'Lim Chee Keong',
    phone: '+60198887704',
    location: 'Penang Island, Pulau Pinang',
    platform: 'mudah.my',
    sourceUrl: 'https://www.mudah.my/listing/maid-penang-004',
    postSnippet:
      'Looking for live-in maid for new house. Family of 5 with 3 kids. Budget RM2,200/month.',
    budgetRange: 'RM1,800 - RM2,500',
    serviceType: 'Pembantu Rumah',
    urgency: 'bulan_ini',
  },
  {
    name: 'Nurul Aini binti Mohd',
    phone: '+60198887705',
    location: 'Cyberjaya, Selangor',
    platform: 'facebook',
    sourceUrl: 'https://facebook.com/marketplace/item/pengasuh-cyberjaya-005',
    postSnippet:
      'Cari pengasuh part-time/full-time untuk anak 2 tahun. Boleh hantar/pickup sekolah abang juga.',
    budgetRange: 'RM1,500 - RM2,000',
    serviceType: 'Pengasuh',
    urgency: 'minggu_ini',
  },
  {
    name: 'Rajesh a/l Kumaran',
    phone: '+60198887706',
    location: 'Subang Jaya, Selangor',
    platform: 'carousell',
    sourceUrl: 'https://carousell.com/p/elderly-care-subang-006',
    postSnippet:
      'Need helper for elderly father (diabetic). Must assist with medication & cook vegetarian. Live-in ok.',
    budgetRange: 'RM2,000 - RM2,800',
    serviceType: 'Penjaga Orang Tua',
    urgency: 'segera',
  },
]

class EmployerHunterAgent extends BaseAgent {
  readonly name = 'employer_hunter'
  readonly displayName = 'Employer Hunter Agent'
  readonly description =
    'Mencari majikan (keluarga/individu) yang mencari pembantu rumah dari Mudah.my, Carousell & Facebook. Outreach automatik dengan pitch diperibadikan.'
  readonly category = 'lead_gen'
  readonly schedule = 'Every 8 hours'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      scanned: 0,
      newLeads: 0,
      contacted: 0,
      qualified: 0,
      highQuality: 0,
      errors: 0,
    }

    try {
      // Step 1: Scan job postings
      await this.logActivity({
        action: 'scan_job_postings',
        status: 'success',
        input: JSON.stringify({
          platforms: ['mudah.my', 'carousell', 'facebook'],
        }),
        output: JSON.stringify({ found: MOCK_POSTS.length }),
      })

      stats.scanned = MOCK_POSTS.length

      for (const post of MOCK_POSTS) {
        try {
          // Check duplicate
          const existing = await db.lead.findFirst({
            where: {
              contactPhone: post.phone,
              leadType: 'employer',
            },
          })
          if (existing) {
            if (existing.status === 'new') {
              await this.qualifyAndContact(existing.id, post)
              stats.contacted++
            }
            continue
          }

          // Create new lead
          const newLead = await db.lead.create({
            data: {
              agentId: this.agentId,
              leadType: 'employer',
              source: post.platform,
              sourceUrl: post.sourceUrl,
              contactName: post.name,
              contactPhone: post.phone,
              profileData: JSON.stringify({
                location: post.location,
                platform: post.platform,
                budgetRange: post.budgetRange,
                serviceType: post.serviceType,
                urgency: post.urgency,
                postSnippet: post.postSnippet,
                discoveredAt: new Date().toISOString(),
              }),
              status: 'new',
            },
          })
          stats.newLeads++

          // AI qualify + outreach
          await this.qualifyAndContact(newLead.id, post)
          stats.contacted++

          // Notify admin for high-quality leads
          const refreshed = await db.lead.findUnique({ where: { id: newLead.id } })
          if (refreshed && (refreshed.score ?? 0) >= 75) {
            stats.highQuality++
            await this.notify({
              category: 'lead',
              severity: 'info',
              title: 'Lead Majikan Berkualiti Tinggi Dijumpai',
              message: `${post.name} (${post.location}) - Skor: ${refreshed.score}. Service: ${post.serviceType}, Budget: ${post.budgetRange}, Urgensi: ${post.urgency}. Telefon: ${post.phone}`,
              actionUrl: `/admin/agents/leads/${newLead.id}`,
            })
          }
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'process_employer_lead',
            status: 'error',
            input: JSON.stringify(post),
            errorMessage: e.message || String(e),
          })
        }
      }

      const summary = `Employer Hunter: Scanned ${stats.scanned} posts, created ${stats.newLeads} new leads, contacted ${stats.contacted}, ${stats.qualified} qualified, ${stats.highQuality} high-quality. Errors: ${stats.errors}.`

      await this.notify({
        category: 'summary',
        severity: 'info',
        title: 'Employer Hunter Run Selesai',
        message: summary,
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'Employer Hunter gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  private async qualifyAndContact(leadId: string, post: MockJobPost): Promise<void> {
    let score = 50
    let reasoning = 'Default score - AI tidak tersedia'

    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content:
            'Anda adalah AI yang menilai kualiti lead majikan (pencari pembantu) di Malaysia. Berikan skor 0-100 dan reasoning ringkas. Balas dalam format JSON: {"score": number, "reasoning": "string", "outreachMessage": "string", "serviceType": "string", "budgetRange": "string", "urgency": "string"}. Outreach message mesti dalam Bahasa Melayu, diperibadikan, dan highlight nilai MIM Portal.',
        },
        {
          role: 'user',
          content: `Profil majikan:
- Nama: ${post.name}
- Lokasi: ${post.location}
- Platform: ${post.platform}
- Bajet: ${post.budgetRange ?? 'tidak dinyatakan'}
- Jenis perkhidmatan: ${post.serviceType ?? 'umum'}
- Urgensi: ${post.urgency ?? 'tidak diketahui'}
- Catatan iklan: "${post.postSnippet}"

Tugaskan skor kualiti (0-100) berdasarkan: kejelasan keperluan, bajet realistik, urgensi & lokasi.
Kemudian tulis pitch WhatsApp yang diperibadikan (maksimum 500 aksara) yang highlight: 500+ pembantu, background check, kontrak sah, gaji RM1,500-RM3,500.`,
        },
      ]

      const aiRes = await aiChat(messages, { temperature: 0.6, maxTokens: 800 })
      const parsed = parseAIJson<{
        score?: number
        reasoning?: string
        outreachMessage?: string
        serviceType?: string
        budgetRange?: string
        urgency?: string
      }>(aiRes.content)

      if (parsed?.score != null) {
        score = Math.max(0, Math.min(100, parsed.score))
        reasoning = parsed.reasoning || reasoning
      }

      const isQualified = score >= 60

      const outreachBody = parsed?.outreachMessage?.trim()
        ? parsed.outreachMessage
        : WhatsAppTemplates.newLeadOutreach(post.name.split(' ')[0], 'employer')

      const waResult = await sendWhatsApp({
        to: post.phone,
        body: outreachBody,
      })

      await this.logActivity({
        action: 'send_whatsapp',
        status: waResult.success ? 'success' : 'error',
        input: JSON.stringify({ to: post.phone, name: post.name, leadType: 'employer' }),
        output: JSON.stringify({
          method: waResult.method,
          messageId: waResult.messageId,
          waLink: waResult.waLink,
          error: waResult.error,
        }),
        errorMessage: waResult.error,
      })

      const methodNote =
        waResult.method === 'wa.me' ? ' (wa.me link - Twilio tidak dikonfigurasi)' : ''

      await db.lead.update({
        where: { id: leadId },
        data: {
          score,
          status: isQualified ? 'qualified' : 'contacted',
          contactedAt: new Date(),
          qualifiedAt: isQualified ? new Date() : null,
          notes: `AI: ${reasoning}${methodNote}`,
        },
      })

      if (isQualified) {
        await this.logActivity({
          action: 'qualify_lead',
          status: 'success',
          input: JSON.stringify({ leadId, name: post.name }),
          output: JSON.stringify({ score, reasoning }),
        })
      }
    } catch (e: any) {
      // Fallback to template
      const fallbackBody = WhatsAppTemplates.newLeadOutreach(post.name.split(' ')[0], 'employer')
      const waResult = await sendWhatsApp({ to: post.phone, body: fallbackBody })

      await db.lead.update({
        where: { id: leadId },
        data: {
          score,
          status: 'contacted',
          contactedAt: new Date(),
          notes: `AI fallback: ${e.message}. Template outreach sent.`,
        },
      })

      await this.logActivity({
        action: 'send_whatsapp',
        status: waResult.success ? 'success' : 'error',
        input: JSON.stringify({ to: post.phone, name: post.name, fallback: true }),
        output: JSON.stringify({ method: waResult.method, error: waResult.error }),
        errorMessage: waResult.error,
      })
    }
  }
}

agentRegistry.register(new EmployerHunterAgent())

export { EmployerHunterAgent }
