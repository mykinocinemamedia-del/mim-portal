/**
 * Content Marketing Agent
 * -----------------------
 * Auto-generates social media content (Facebook posts, Instagram captions,
 * TikTok scripts) about MIM Portal services. Writes compelling Malaysian
 * Malay content with relevant hashtags. Schedules 3-5 posts per run, one
 * per day for the next 3-5 days.
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { aiChat, parseAIJson, type ChatMessage } from '@/lib/ai/provider'
import { db } from '@/lib/db'

// Standard hashtag set per the task spec
const STANDARD_HASHTAGS = [
  '#PembantuRumah',
  '#MaidMalaysia',
  '#Pengasuh',
  '#KinoStudios',
  '#MIMPortal',
]

// Rotating content topics (Malay)
interface ContentTopic {
  type: 'educational' | 'promotional' | 'engagement'
  topic: string
  platform: 'facebook' | 'instagram' | 'tiktok'
  contentType: 'post' | 'caption' | 'script'
}

const CONTENT_TOPICS: ContentTopic[] = [
  {
    type: 'educational',
    topic:
      'Tips memilih pembantu rumah yang sesuai untuk keluarga Malaysia (background check, interview, trial period)',
    platform: 'facebook',
    contentType: 'post',
  },
  {
    type: 'promotional',
    topic:
      'Kisah kejayaan: Makcik Ros dari Kelantan mendapat kerja RM2,500/sebulan melalui MIM Portal selepas 2 minggu',
    platform: 'facebook',
    contentType: 'post',
  },
  {
    type: 'engagement',
    topic:
      'Soalan poll: Apa ciri paling penting pembantu rumah? (A) Jujur (B) Berpengalaman (C) Penyayang (D) Semua',
    platform: 'facebook',
    contentType: 'post',
  },
  {
    type: 'educational',
    topic:
      '5 tips penjagaan kanak-kanak oleh pengasuh profesional: jadual, nutrisi, aktiviti, keselamatan, komunikasi',
    platform: 'instagram',
    contentType: 'caption',
  },
  {
    type: 'promotional',
    topic:
      'Pengumuman: MIM Portal kini ada 500+ pembantu rumah, pengasuh & penjaga orang tua. Pendaftaran PERCUMA!',
    platform: 'instagram',
    contentType: 'caption',
  },
  {
    type: 'engagement',
    topic:
      'FAQ: Berapa gaji pembantu rumah di Malaysia? Jelaskan range RM1,500-RM3,500 mengikut jenis perkhidmatan',
    platform: 'facebook',
    contentType: 'post',
  },
  {
    type: 'promotional',
    topic:
      'Musim Raya menjelang! Tips: dapatkan pembantu rumah awal untuk persiapan Raya. Tempahan sekarang!',
    platform: 'tiktok',
    contentType: 'script',
  },
  {
    type: 'educational',
    topic:
      'Hak dan tanggungjawab majikan vs pembantu rumah di Malaysia mengikut Akta Pekerjaan Domestik',
    platform: 'facebook',
    contentType: 'post',
  },
  {
    type: 'promotional',
    topic:
      'Kisah kejayaan: Keluarga Tan dari Penang berjaya jumpa pengasuh untuk 2 anak dalam masa 5 hari',
    platform: 'instagram',
    contentType: 'caption',
  },
  {
    type: 'engagement',
    topic:
      'Soalan poll: Anda lebih suka pembantu live-in atau live-out? Kongsi pengalaman anda di komen!',
    platform: 'facebook',
    contentType: 'post',
  },
]

class ContentMarketerAgent extends BaseAgent {
  readonly name = 'content_marketer'
  readonly displayName = 'Content Marketing Agent'
  readonly description =
    'Jana kandungan sosial media (Facebook, Instagram, TikTok) dalam Bahasa Melayu secara automatik. 3-5 post per run, dijadualkan 1/hari.'
  readonly category = 'lead_gen'
  readonly schedule = 'Daily 9am'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      generated: 0,
      scheduled: 0,
      errors: 0,
      byType: { educational: 0, promotional: 0, engagement: 0 },
      byPlatform: { facebook: 0, instagram: 0, tiktok: 0 },
    }

    try {
      // Determine number of content pieces to generate (3-5)
      const targetCount = 3 + Math.floor(Math.random() * 3) // 3, 4, or 5

      // Rotate topics: pick the next N topics we haven't recently used
      // by checking what we've scheduled in the last 14 days.
      const recentCutoff = new Date()
      recentCutoff.setDate(recentCutoff.getDate() - 14)

      const recentContent = await db.contentQueue.findMany({
        where: {
          agentId: this.agentId!,
          createdAt: { gte: recentCutoff },
        },
        select: { title: true, content: true },
      })
      const recentTitles = new Set(recentContent.map((c) => c.title))

      const availableTopics = CONTENT_TOPICS.filter((t) => {
        // Match by topic keyword in recent titles
        const topicKey = t.topic.split(' ').slice(0, 4).join(' ').toLowerCase()
        return !Array.from(recentTitles).some((rt) =>
          rt?.toLowerCase().includes(topicKey.slice(0, 20))
        )
      })

      const pool = availableTopics.length >= targetCount ? availableTopics : CONTENT_TOPICS
      const selected: ContentTopic[] = []
      const used = new Set<number>()
      while (selected.length < targetCount && used.size < pool.length) {
        const idx = Math.floor(Math.random() * pool.length)
        if (!used.has(idx)) {
          used.add(idx)
          selected.push(pool[idx])
        }
      }

      await this.logActivity({
        action: 'plan_content',
        status: 'success',
        input: JSON.stringify({ targetCount }),
        output: JSON.stringify({
          selected: selected.map((s) => ({ type: s.type, topic: s.topic.slice(0, 40) })),
        }),
      })

      // Determine next available scheduling day
      // Use tomorrow as starting day, one post per day
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() + 1)
      baseDate.setHours(9, 0, 0, 0)

      for (let i = 0; i < selected.length; i++) {
        const topic = selected[i]
        try {
          // Generate content via AI
          const content = await this.generateContent(topic)
          if (!content) {
            stats.errors++
            continue
          }

          // Build scheduled date — 1 per day
          const scheduledAt = new Date(baseDate)
          scheduledAt.setDate(baseDate.getDate() + i)

          // Build final content (body + hashtags)
          const hashtags = [...STANDARD_HASHTAGS, ...content.extraHashtags].join(' ')
          const fullContent = `${content.body}\n\n${hashtags}`

          // Build title (short version of topic)
          const title = topic.topic.split(' ').slice(0, 8).join(' ')

          // Save to ContentQueue
          const queueItem = await db.contentQueue.create({
            data: {
              agentId: this.agentId,
              platform: topic.platform,
              contentType: topic.contentType,
              title,
              content: fullContent,
              hashtags,
              scheduledAt,
              status: 'scheduled',
            },
          })

          stats.generated++
          stats.scheduled++
          stats.byType[topic.type]++
          stats.byPlatform[topic.platform]++

          await this.logActivity({
            action: 'generate_content',
            status: 'success',
            input: JSON.stringify({
              topic: topic.topic.slice(0, 60),
              platform: topic.platform,
              contentType: topic.contentType,
            }),
            output: JSON.stringify({
              contentId: queueItem.id,
              scheduledAt: scheduledAt.toISOString(),
              title,
            }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'generate_content',
            status: 'error',
            input: JSON.stringify({ topic: topic.topic.slice(0, 60) }),
            errorMessage: e.message || String(e),
          })
        }
      }

      const summary = `Content Marketer: Jana ${stats.generated} kandungan, jadualkan ${stats.scheduled} (educational: ${stats.byType.educational}, promotional: ${stats.byType.promotional}, engagement: ${stats.byType.engagement}). Platform: FB ${stats.byPlatform.facebook}, IG ${stats.byPlatform.instagram}, TikTok ${stats.byPlatform.tiktok}. Errors: ${stats.errors}.`

      await this.notify({
        category: 'summary',
        severity: 'info',
        title: 'Content Marketing Run Selesai',
        message: summary,
        actionUrl: '/admin/agents/content',
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'Content Marketer gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Call AI to generate the content body for a given topic.
   * Returns body text + any extra hashtags beyond the standard set.
   */
  private async generateContent(
    topic: ContentTopic
  ): Promise<{ body: string; extraHashtags: string[] } | null> {
    const platformInstructions: Record<string, string> = {
      facebook:
        'Format Facebook post: 3-6 perenggan pendek, guna emoji secukupnya, mulakan dengan hook yang menarik.',
      instagram:
        'Format Instagram caption: padat (200-400 aksara), guna line break, emoji yang relevan, call-to-action di hujung.',
      tiktok:
        'Format TikTok script: nyatakan [VISUAL] dan [AUDIO/VOICEOVER] secara berasingan. Maksimum 60 saat. Hook dalam 3 saat pertama.',
    }

    const typeInstructions: Record<string, string> = {
      educational:
        'Beri nilai pendidikan yang berguna. Mestilah bermanfaat untuk pembaca. Gunakan fakta & tips konkrit.',
      promotional:
        'Highlight kelebihan MIM Portal (500+ pembantu, pendaftaran percuma, kontrak sah, latihan tersedia). Buat promosi yang menarik tanpa berlebihan.',
      engagement:
        'Ajak interaksi: soalan, poll, atau undian. Minta orang reply/komen. Buat mereka rasa terlibat.',
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Anda adalah content writer MIM Portal — platform pembantu rumah oleh Kino Studios Sdn. Bhd. di Malaysia.

Tugas: Tulis kandungan ${topic.contentType} ${topic.platform} dalam Bahasa Melayu Malaysia yang menarik, mesra, dan profesional.

${platformInstructions[topic.platform]}

${typeInstructions[topic.type]}

Tema syarikat: MIM Portal membantu keluarga Malaysia jumpa pembantu rumah, pengasuh & penjaga orang tua yang terpercaya. Pendaftaran percuma, kontrak sah.

PENTING: Balas dalam format JSON: {"body": "string (kandungan utama tanpa hashtag)", "extraHashtags": ["#tag1", "#tag2"]}. Extra hashtags 2-3 sahaja, berkaitan topik. Jangan ulang hashtag standard.`,
      },
      {
        role: 'user',
        content: `Tulis ${topic.contentType} ${topic.platform} (${topic.type}) tentang:

${topic.topic}

Pastikan:
1. Bahasa Melayu standard Malaysia (bukan formal kaku, tapi mesra)
2. Sesuai dengan budaya Malaysia (Raya, keluarga, musim cuti sekolah)
3. Maksimum 600 aksara untuk body
4. 2-3 extra hashtags berkaitan topik (selain standard: ${STANDARD_HASHTAGS.join(' ')})`,
      },
    ]

    const aiRes = await aiChat(messages, { temperature: 0.8, maxTokens: 1000 })
    const parsed = parseAIJson<{ body?: string; extraHashtags?: string[] }>(aiRes.content)

    if (!parsed?.body) {
      // Fallback: use raw content as body
      return {
        body: aiRes.content.trim().slice(0, 800),
        extraHashtags: [],
      }
    }

    // Clean & validate hashtags
    const cleanedTags = (parsed.extraHashtags || [])
      .filter((t) => typeof t === 'string' && t.startsWith('#'))
      .map((t) => t.trim())
      .filter((t, i, arr) => arr.indexOf(t) === i) // dedupe
      .slice(0, 3)

    return {
      body: parsed.body.trim(),
      extraHashtags: cleanedTags,
    }
  }
}

agentRegistry.register(new ContentMarketerAgent())

export { ContentMarketerAgent }
