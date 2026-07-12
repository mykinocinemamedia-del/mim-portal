/**
 * Helper Recruiter Agent
 * -----------------------
 * Scans Facebook Groups (mock data) for potential helpers (maids),
 * uses AI to qualify leads and generate personalized outreach messages,
 * then sends WhatsApp outreach and tracks lead status progression
 * (new → contacted → qualified → converted).
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { aiChat, parseAIJson, type ChatMessage } from '@/lib/ai/provider'
import { sendWhatsApp, WhatsAppTemplates } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

// ---- Mock data: realistic Malaysian helper candidates ----
interface MockFBLead {
  name: string
  phone: string
  location: string
  postSnippet: string
  sourceUrl: string
  age?: number
  serviceInterest?: string
}

const FB_GROUPS = [
  'https://facebook.com/groups/kerja-pembantu-rumah-kl',
  'https://facebook.com/groups/kerjaan-pengasuh-malaysia',
  'https://facebook.com/groups/pembantu-rumah-selangor',
  'https://facebook.com/groups/kerja-domestik-malaysia',
]

const MOCK_LEADS: MockFBLead[] = [
  {
    name: 'Siti Aishah binti Rahman',
    phone: '+60123456701',
    location: 'Kuantan, Pahang',
    age: 28,
    serviceInterest: 'Pembantu Rumah',
    postSnippet:
      'Cari kerja pembantu rumah sekitar Kuantan. Dah ada pengalaman 3 tahun. Boleh tinggal dalam.',
    sourceUrl: FB_GROUPS[0],
  },
  {
    name: 'Nurul Huda binti Ismail',
    phone: '+60123456702',
    location: 'Ipoh, Perak',
    age: 32,
    serviceInterest: 'Pengasuh',
    postSnippet:
      'Saya ibu rumah tangga, cari kerja pengasuh kanak-kanak. Berpengalaman jaga anak sendiri 5 tahun.',
    sourceUrl: FB_GROUPS[1],
  },
  {
    name: 'Norhayati binti Yusof',
    phone: '+60123456703',
    location: 'Johor Bahru, Johor',
    age: 35,
    serviceInterest: 'Penjaga Orang Tua',
    postSnippet:
      'Cari kerja jaga orang tua. Boleh mandi, masak, bawa ke klinik. Pengalaman jaga mak saya sebelum ini.',
    sourceUrl: FB_GROUPS[2],
  },
  {
    name: 'Faridah binti Abdullah',
    phone: '+60123456704',
    location: 'Kota Bharu, Kelantan',
    age: 26,
    serviceInterest: 'Pembantu Rumah',
    postSnippet:
      'Baru pindah KL, cari kerja pembantu rumah. Belum ada pengalaman tapi sanggup belajar.',
    sourceUrl: FB_GROUPS[3],
  },
  {
    name: 'Roslina binti Hassan',
    phone: '+60123456705',
    location: 'Alor Setar, Kedah',
    age: 30,
    serviceInterest: 'Pembantu Rumah',
    postSnippet:
      'Cari kerja pembantu rumah. Boleh masak Melayu, Cina & India. Pengalaman 4 tahun di Singapore.',
    sourceUrl: FB_GROUPS[0],
  },
  {
    name: 'Zubaidah binti Othman',
    phone: '+60123456706',
    location: 'Kuala Terengganu, Terengganu',
    age: 29,
    serviceInterest: 'Pengasuh',
    postSnippet:
      'Pengasuh berpengalaman. Dah ambil kursus asuhan kanak-kanak. Cari keluarga yang perlukan jaga anak sepenuh masa.',
    sourceUrl: FB_GROUPS[1],
  },
]

class HelperRecruiterAgent extends BaseAgent {
  readonly name = 'helper_recruiter'
  readonly displayName = 'Helper Recruiter Agent'
  readonly description =
    'Mencari calon pembantu rumah/pengasuh dari Facebook Groups, layakkan dengan AI, dan hantar outreach WhatsApp automatik.'
  readonly category = 'lead_gen'
  readonly schedule = 'Every 6 hours'

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
      // Step 1: Scan Facebook Groups (mocked)
      await this.logActivity({
        action: 'scan_facebook',
        status: 'success',
        input: JSON.stringify({ groups: FB_GROUPS }),
        output: JSON.stringify({ found: MOCK_LEADS.length }),
      })

      const discoveredLeads = MOCK_LEADS
      stats.scanned = discoveredLeads.length

      // Step 2: For each lead - create/update DB record, AI qualify, send WhatsApp
      for (const lead of discoveredLeads) {
        try {
          // Avoid duplicates by checking existing leads with same phone
          const existing = await db.lead.findFirst({
            where: {
              contactPhone: lead.phone,
              leadType: 'helper',
            },
          })

          if (existing) {
            // Re-qualify existing lead (e.g., if still "new")
            if (existing.status === 'new') {
              await this.qualifyAndContact(existing.id, lead)
              stats.contacted++
            }
            continue
          }

          // Create new lead
          const newLead = await db.lead.create({
            data: {
              agentId: this.agentId,
              leadType: 'helper',
              source: 'facebook',
              sourceUrl: lead.sourceUrl,
              contactName: lead.name,
              contactPhone: lead.phone,
              profileData: JSON.stringify({
                location: lead.location,
                age: lead.age,
                serviceInterest: lead.serviceInterest,
                postSnippet: lead.postSnippet,
                discoveredAt: new Date().toISOString(),
              }),
              status: 'new',
            },
          })
          stats.newLeads++

          // Step 3: AI qualify + send outreach
          await this.qualifyAndContact(newLead.id, lead)
          stats.contacted++

          // Step 4: If high quality (score >= 75), notify admin
          const refreshed = await db.lead.findUnique({ where: { id: newLead.id } })
          if (refreshed && (refreshed.score ?? 0) >= 75) {
            stats.highQuality++
            await this.notify({
              category: 'lead',
              severity: 'info',
              title: 'Lead Pembantu Berkualiti Tinggi Dijumpai',
              message: `${lead.name} (${lead.location}) - Skor: ${refreshed.score}. Service: ${lead.serviceInterest}. Telefon: ${lead.phone}`,
              actionUrl: `/admin/agents/leads/${newLead.id}`,
            })
          }
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'process_lead',
            status: 'error',
            input: JSON.stringify(lead),
            errorMessage: e.message || String(e),
          })
        }
      }

      // Final summary
      const summary = `Helper Recruiter: Scanned ${stats.scanned} FB posts, created ${stats.newLeads} new leads, contacted ${stats.contacted}, ${stats.qualified} qualified, ${stats.highQuality} high-quality. Errors: ${stats.errors}.`

      await this.notify({
        category: 'summary',
        severity: 'info',
        title: 'Helper Recruiter Run Selesai',
        message: summary,
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'Helper Recruiter gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Use AI to score the lead and send WhatsApp outreach.
   */
  private async qualifyAndContact(leadId: string, lead: MockFBLead): Promise<void> {
    // AI qualification: score 0-100 + reasoning
    let score = 50
    let reasoning = 'Default score - AI tidak tersedia'
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content:
            'Anda adalah AI yang menilai kualiti lead pembantu rumah Malaysia. Berikan skor 0-100 dan reasoning ringkas. Balas dalam format JSON: {"score": number, "reasoning": "string", "outreachMessage": "string"}. Outreach message mesti dalam Bahasa Melayu, mesra, dan diperibadikan berdasarkan profil lead.',
        },
        {
          role: 'user',
          content: `Profil lead:
- Nama: ${lead.name}
- Lokasi: ${lead.location}
- Umur: ${lead.age ?? 'tidak diketahui'}
- Minat perkhidmatan: ${lead.serviceInterest ?? 'umum'}
- Catatan FB: "${lead.postSnippet}"

Tugaskan skor kualiti (0-100) berdasarkan: pengalaman, kesediaan, lokasi, kebolehpercayaan.
Kemudian tulis outreach message WhatsApp yang diperibadikan (maksimum 500 aksara) untuk mengajak mereka join MIM Portal.`,
        },
      ]
      const aiRes = await aiChat(messages, { temperature: 0.6, maxTokens: 800 })
      const parsed = parseAIJson<{ score?: number; reasoning?: string; outreachMessage?: string }>(
        aiRes.content
      )
      if (parsed?.score != null) {
        score = Math.max(0, Math.min(100, parsed.score))
        reasoning = parsed.reasoning || reasoning
      }

      // Step: Mark as qualified if score >= 60
      const isQualified = score >= 60

      // Step: Send WhatsApp outreach (use AI-personalized if available, else template)
      const outreachBody = parsed?.outreachMessage?.trim()
        ? parsed.outreachMessage
        : WhatsAppTemplates.newLeadOutreach(lead.name.split(' ')[0], 'helper')

      const waResult = await sendWhatsApp({
        to: lead.phone,
        body: outreachBody,
      })

      await this.logActivity({
        action: 'send_whatsapp',
        status: waResult.success ? 'success' : 'error',
        input: JSON.stringify({ to: lead.phone, name: lead.name }),
        output: JSON.stringify({
          method: waResult.method,
          messageId: waResult.messageId,
          waLink: waResult.waLink,
          error: waResult.error,
        }),
        errorMessage: waResult.error,
      })

      const methodNote = waResult.method === 'wa.me' ? ' (wa.me link - Twilio tidak dikonfigurasi)' : ''

      // Update lead: status = contacted, score, notes
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
        // Track separately via activity log
        await this.logActivity({
          action: 'qualify_lead',
          status: 'success',
          input: JSON.stringify({ leadId, name: lead.name }),
          output: JSON.stringify({ score, reasoning }),
        })
      }
    } catch (e: any) {
      // If AI fails, still send template-based outreach
      const fallbackBody = WhatsAppTemplates.newLeadOutreach(lead.name.split(' ')[0], 'helper')
      const waResult = await sendWhatsApp({ to: lead.phone, body: fallbackBody })

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
        input: JSON.stringify({ to: lead.phone, name: lead.name, fallback: true }),
        output: JSON.stringify({ method: waResult.method, error: waResult.error }),
        errorMessage: waResult.error,
      })
    }
  }
}

// Register singleton
agentRegistry.register(new HelperRecruiterAgent())

export { HelperRecruiterAgent }
