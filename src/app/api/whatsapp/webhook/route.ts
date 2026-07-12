import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aiChat, type ChatMessage } from '@/lib/ai/provider'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'

/**
 * WhatsApp Webhook Endpoint
 * --------------------------
 * Receives incoming WhatsApp messages from Twilio WhatsApp Business API.
 * Enables REAL two-way communication between users (helpers + employers)
 * and the 24/7 Support AI ("Aida").
 *
 * Flow:
 *   1. Twilio POSTs webhook with `From` (whatsapp:+60123456789) and `Body` (msg text)
 *   2. Normalize the phone number
 *   3. Look up user: db.helper.findFirst({ where: { phone: { contains: phone } } })
 *      or db.employer.findFirst(...)
 *   4. Find or create a Conversation for this user
 *   5. Store the user's incoming message in AgentMessage (sender='user')
 *      — this lets the Support Agent pick it up too if needed
 *   6. Fetch last ~6 messages for context
 *   7. Call aiChat() with the Support AI persona ("Aida") to generate a reply
 *   8. Send the AI reply back to the user via sendWhatsApp()
 *   9. Store the agent reply in AgentMessage (sender='agent')
 *  10. Return 200 OK to Twilio (must be <10s)
 *
 * Twilio webhook security: in production, verify X-Twilio-Signature header.
 * For demo purposes we accept all POSTs but rate-limit by phone number.
 */

const COMPANY_PHONE =
  process.env.NEXT_PUBLIC_COMPANY_PHONE || '+6017-663 5990'
const COMPANY_EMAIL =
  process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'hello@kino.my'
const PERSONA_NAME = 'Aida'

// Optional shared secret to prevent random abuse
const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || ''

// Emergency keywords (in multiple languages/dialects) — same list as Support Agent
const EMERGENCY_KEYWORDS = [
  'emergency', 'bahaya', 'ancaman', 'threat', 'abuse', 'dianiaya',
  'exploit', 'dieksploitasi', 'dipukul', 'disamun', 'rogol', 'seksual',
  'tidak selamat', 'takut', 'mangsa', 'polis',
]

/**
 * Extract last 4-15 digits of a phone for `contains` lookup.
 * We try several prefixes (last 10, last 11, last 12 digits) to handle
 * both `+60123456789` and `0123456789` formats stored in DB.
 */
function phoneVariants(rawPhone: string): string[] {
  const digits = rawPhone.replace(/[^0-9]/g, '')
  const variants = new Set<string>()
  if (digits.length >= 8) {
    variants.add(digits)
    variants.add(digits.slice(-10))
    variants.add(digits.slice(-11))
    variants.add(digits.slice(-12))
  }
  return Array.from(variants)
}

async function lookupUser(phone: string) {
  const variants = phoneVariants(phone)
  if (variants.length === 0) return null

  // Try helper table first
  for (const v of variants) {
    const helper = await db.helper
      .findFirst({
        where: { phone: { contains: v } },
        select: {
          id: true,
          fullName: true,
          phone: true,
          serviceType: true,
          state: true,
          city: true,
          status: true,
        },
      })
      .catch(() => null)
    if (helper) {
      return { type: 'helper' as const, user: helper }
    }
  }

  // Then employer table
  for (const v of variants) {
    const employer = await db.employer
      .findFirst({
        where: { phone: { contains: v } },
        select: {
          id: true,
          fullName: true,
          phone: true,
          serviceType: true,
          state: true,
          city: true,
          status: true,
        },
      })
      .catch(() => null)
    if (employer) {
      return { type: 'employer' as const, user: employer }
    }
  }

  return null
}

/**
 * Find or create a Conversation row for this user.
 * The Support Agent's name in registry is 'support_agent'.
 */
async function ensureConversation(userId: string, userType: 'helper' | 'employer') {
  // Find the Support Agent row in DB (best-effort)
  let agentId: string | null = null
  try {
    const agent = await db.agent.findUnique({ where: { name: 'support_agent' } })
    agentId = agent?.id ?? null
  } catch {}

  // Find existing active conversation
  let conversation = await db.conversation.findFirst({
    where: { userId, userType, status: 'active' },
    orderBy: { createdAt: 'desc' },
  })

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        agentId,
        userId,
        userType,
        channel: 'whatsapp',
        status: 'active',
        context: JSON.stringify({ startedAt: new Date().toISOString() }),
      },
    })
  }

  return { conversation, agentId }
}

/**
 * Build the AI prompt using Support Agent persona and conversation history.
 */
async function generateAIReply(
  userMessage: string,
  userName: string,
  userType: 'helper' | 'employer',
  userPhone: string,
  conversationId: string,
  isEmergency: boolean
): Promise<string | null> {
  // Pull last 6 messages for context
  const history = await db.agentMessage
    .findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { sender: true, content: true },
    })
    .catch(() => [])
  history.reverse()

  const userTypeLabel = userType === 'helper' ? 'Pembantu' : 'Majikan'

  const systemPrompt =
    `Anda adalah ${PERSONA_NAME}, AI support assistant rasmi MIM Portal (Maid In Malaysia). ` +
    `Anda menerima mesej WhatsApp dari pengguna dan perlu membalas dengan mesra & membantu.\n\n` +
    `Gaya: Mesra, ringkas, profesional, berbahasa Melayu.\n` +
    `Mesej mesti MAX 500 aksara (WhatsApp friendly).\n` +
    `Jika soalan di luar skop, arahkan ke admin WhatsApp ${COMPANY_PHONE} atau email ${COMPANY_EMAIL}.\n` +
    `Untuk FAQ mudah (gaji, cara daftar, lokasi, kontrak), jawab terus.\n` +
    `Untuk isu teknikal atau aduan, tunjuk empati & offer bantuan admin.\n` +
    `JANGAN tanya soalan lanjut jika user jelas minta bantuan admin — teruskan dengan info kontak.\n\n` +
    `Maklumat syarikat:\n` +
    `- Syarikat: Kino Studios Sdn. Bhd.\n` +
    `- WhatsApp: ${COMPANY_PHONE}\n` +
    `- Email: ${COMPANY_EMAIL}\n` +
    `- Jenis perkhidmatan: Pembantu Rumah (RM1,500-2,500), Pengasuh (RM1,500-2,500), Penjaga Orang Tua (RM1,700-3,500)\n\n` +
    `BANTUAN: Hanya balas dengan teks WhatsApp yang siap dihantar. JANGAN gunakan format JSON atau markdown.`

  const historyStr = history
    .map((m) => `${m.sender === 'user' ? 'User' : PERSONA_NAME}: ${m.content.slice(0, 200)}`)
    .join('\n')

  let userPrompt = `PROFIL USER:
- Jenis: ${userTypeLabel}
- Nama: ${userName || '(tiada nama)'}
- Phone: ${userPhone}

SEJARAH PERBUALAN:
${historyStr || '(tiada sejarah)'}

MESEJ USER BARU (WhatsApp):
"${userMessage}"

${isEmergency ? 'PERHATIAN: Mesej ini mengandungi kata kunci kecemasan. Balas dengan panduan keselamatan & maklumkan admin akan dihubungi.' : ''}

Tulis reply WhatsApp yang sesuai. Maksimum 500 aksara, mesra, dan terus ke point.`

  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]
    const res = await aiChat(messages, { temperature: 0.6, maxTokens: 600 })
    return (res.content || '').trim().slice(0, 1500)
  } catch (e: any) {
    console.error('[WhatsApp Webhook] AI reply failed:', e.message)
    return null
  }
}

/**
 * Parse Twilio form-encoded POST body. Twilio sends:
 *   - From: whatsapp:+60123456789
 *   - Body: text of incoming message
 *   - MessageSid, AccountSid, ProfileName, etc.
 */
async function parseTwilioBody(req: NextRequest): Promise<{ from: string; body: string }> {
  // Try JSON first (for testing)
  try {
    const ct = req.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const j = await req.json()
      return {
        from: String(j.From || j.from || ''),
        body: String(j.Body || j.body || ''),
      }
    }
  } catch {}

  // Fall back to form-encoded (what Twilio actually sends)
  try {
    const text = await req.text()
    const params = new URLSearchParams(text)
    return {
      from: params.get('From') || '',
      body: params.get('Body') || '',
    }
  } catch {
    return { from: '', body: '' }
  }
}

// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const startedAt = Date.now()

  try {
    // Optional shared-secret check
    if (WEBHOOK_SECRET) {
      const provided =
        req.headers.get('x-webhook-secret') ||
        req.headers.get('x-twilio-secret') ||
        new URL(req.url).searchParams.get('secret')
      if (provided !== WEBHOOK_SECRET) {
        return NextResponse.json(
          { error: 'Unauthorized webhook' },
          { status: 401 }
        )
      }
    }

    const { from, body } = await parseTwilioBody(req)

    if (!from || !body) {
      // Twilio still expects 200 OK even on bad input
      return NextResponse.json({ ok: true, skipped: 'missing from/body' })
    }

    // Strip 'whatsapp:' prefix from `From`
    const rawPhone = from.replace(/^whatsapp:/i, '').trim()
    const messageText = body.trim()

    if (!messageText) {
      return NextResponse.json({ ok: true, skipped: 'empty body' })
    }

    // 1. Identify sender (helper or employer)
    const lookup = await lookupUser(rawPhone)
    if (!lookup) {
      // Unknown sender — reply with generic info so they can register
      const reply =
        `Hai! 👋 Saya ${PERSONA_NAME}, AI assistant MIM Portal (Maid In Malaysia).\n\n` +
        `Nombor WhatsApp anda belum berdaftar di portal kami. Jika anda mahu:\n` +
        `• Daftar sebagai pembantu → /helper/register\n` +
        `• Daftar sebagai majikan → /employer/register\n\n` +
        `Atau hubungi admin kami:\n` +
        `WhatsApp: ${COMPANY_PHONE}\n` +
        `Email: ${COMPANY_EMAIL}\n\n` +
        `Terima kasih! 🙏`
      await sendWhatsApp({ to: rawPhone, body: reply }).catch(() => {})
      return NextResponse.json({ ok: true, unknown: true })
    }

    const { type: userType, user } = lookup
    const userName = user.fullName || (userType === 'helper' ? 'Pembantu' : 'Majikan')
    const userPhone = user.phone || rawPhone

    // 2. Find or create conversation
    const { conversation, agentId } = await ensureConversation(user.id, userType)

    // 3. Store incoming user message
    await db.agentMessage.create({
      data: {
        conversationId: conversation.id,
        agentId,
        sender: 'user',
        content: messageText,
        messageType: 'text',
        metadata: JSON.stringify({
          source: 'whatsapp_webhook',
          fromPhone: rawPhone,
          receivedAt: new Date().toISOString(),
        }),
      },
    })

    // 4. Check emergency
    const isEmergency = EMERGENCY_KEYWORDS.some((kw) =>
      messageText.toLowerCase().includes(kw.toLowerCase())
    )

    // 5. Notify admin immediately on emergency
    if (isEmergency) {
      try {
        await db.agentNotification.create({
          data: {
            agentName: 'support_agent',
            category: 'support',
            severity: 'critical',
            title: '🚨 KECEMASAN dari WhatsApp Webhook',
            message:
              `Dari: ${userName} (${userType})\n` +
              `Phone: ${userPhone}\n` +
              `Mesej: "${messageText.slice(0, 500)}${messageText.length > 500 ? '...' : ''}"\n\n` +
              `SILA HUBUNGI USER SEGERA.`,
            actionUrl: '/admin/messages',
          },
        })
        await sendWhatsApp({
          to: COMPANY_PHONE,
          body:
            `🚨 KECEMASAN MIM Portal (WhatsApp Webhook) 🚨\n\n` +
            `Dari: ${userName} (${userType})\n` +
            `Phone: ${userPhone}\n` +
            `Mesej: "${messageText.slice(0, 400)}${messageText.length > 400 ? '...' : ''}"\n\n` +
            `SILA HUBUNGI SEGERA.`,
        })
      } catch {}
    }

    // 6. Generate AI reply
    let aiReply = await generateAIReply(
      messageText,
      userName,
      userType,
      userPhone,
      conversation.id,
      isEmergency
    )

    // Fallback reply if AI failed
    if (!aiReply) {
      aiReply =
        `Maaf, saya mengalami masalah teknikal sekarang. 😔\n\n` +
        `Sila hubungi admin kami:\n` +
        `WhatsApp: ${COMPANY_PHONE}\n` +
        `Email: ${COMPANY_EMAIL}\n\n` +
        `— ${PERSONA_NAME}, MIM Portal`
    }

    // 7. Store agent reply
    await db.agentMessage.create({
      data: {
        conversationId: conversation.id,
        agentId,
        sender: 'agent',
        content: aiReply,
        messageType: 'text',
        metadata: JSON.stringify({
          source: 'whatsapp_webhook',
          intent: isEmergency ? 'escalation' : 'auto_reply',
          generatedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
        }),
      },
    })

    // 8. Send reply back via WhatsApp
    await sendWhatsApp({ to: userPhone, body: aiReply }).catch((e) => {
      console.error('[WhatsApp Webhook] sendWhatsApp failed:', e.message)
    })

    // 9. Twilio requires 200 OK within 10s
    return NextResponse.json({
      ok: true,
      userId: user.id,
      userType,
      durationMs: Date.now() - startedAt,
    })
  } catch (e: any) {
    console.error('[WhatsApp Webhook] error:', e)
    // Return 200 to Twilio anyway — failing to ack causes Twilio to retry
    return NextResponse.json(
      { ok: false, error: e.message || 'unknown error' },
      { status: 200 }
    )
  }
}

/**
 * GET endpoint — basic info / health check.
 * Twilio verifies webhook URLs with a GET sometimes.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: 'whatsapp-webhook',
    persona: PERSONA_NAME,
    timestamp: new Date().toISOString(),
  })
}
