/**
 * 24/7 Support AI Agent ("Aida")
 * ------------------------------
 * Handles all incoming chat messages from helpers and employers. Answers FAQs,
 * resolves issues, escalates to human when needed.
 *
 * Behavior:
 *   - Find unread AgentMessage entries from users (sender='user')
 *   - Use AI to generate appropriate response based on:
 *     - User type (helper/employer)
 *     - Conversation history
 *     - Knowledge base (FAQs from Document table)
 *     - User's profile context
 *   - Categorize intent: faq, complaint, schedule_change, payment_issue,
 *     contract_question, escalation, other
 *   - For simple FAQs: auto-respond
 *   - For complaints/issues: empathize, offer solution, create notification for admin
 *   - For emergencies (keywords: emergency, bahaya, threat, abuse, exploit):
 *     immediately escalate to admin via WhatsApp + notification
 *   - Learn from conversations (store unresolved questions for knowledge base updates)
 *
 * Schedule: Every 5 minutes
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { aiChat, parseAIJson, type ChatMessage } from '@/lib/ai/provider'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

const MAX_MESSAGES_PER_RUN = 30
const MAX_HISTORY_MESSAGES = 10

// Emergency keywords (in multiple languages/dialects)
const EMERGENCY_KEYWORDS = [
  'emergency',
  'bahaya',
  'ancaman',
  'threat',
  'abuse',
  'dianiaya',
  'exploit',
  'dieksploitasi',
  'dipukul',
  'disamun',
  'rogol',
  'seksual',
  'tidak selamat',
  'takut',
  'mangsa',
  'polis',
]

const COMPANY = {
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+6017-663 5990',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'hello@kino.my',
}

const PERSONA_NAME = 'Aida'

interface AISupportResponse {
  reply: string
  intent: 'faq' | 'complaint' | 'schedule_change' | 'payment_issue' | 'contract_question' | 'escalation' | 'other'
  escalate: boolean
  summary: string
}

class SupportAgent extends BaseAgent {
  readonly name = 'support_agent'
  readonly displayName = '24/7 Support AI Agent'
  readonly description =
    'Pembantu AI 24/7 "Aida" yang menjawab soalan, isu & aduan dari pembantu/majikan. Auto-respon FAQ, eskalasi ke admin untuk isu serius, kecemasan dihantar serta-merta.'
  readonly category = 'support'
  readonly schedule = 'Every 5 minutes'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      messagesProcessed: 0,
      autoResponded: 0,
      escalated: 0,
      emergenciesHandled: 0,
      complaintsForwarded: 0,
      whatsappSent: 0,
      errors: 0,
    }

    try {
      // Step 1: Find unread user messages (sender='user') without an agent reply yet.
      // We use a soft flag: metadata containing '{replied: true}' indicates processed.
      const unreadMessages = await db.agentMessage.findMany({
        where: {
          sender: 'user',
          metadata: { not: { contains: '"replied":true' } },
        },
        include: {
          conversation: {
            select: {
              id: true,
              userId: true,
              userType: true,
              status: true,
              context: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: MAX_MESSAGES_PER_RUN,
      })

      await this.logActivity({
        action: 'scan_unread_messages',
        status: 'success',
        input: JSON.stringify({ trigger: context.trigger }),
        output: JSON.stringify({ unread: unreadMessages.length }),
      })

      for (const message of unreadMessages) {
        try {
          stats.messagesProcessed++
          await this.handleUserMessage(message, stats)
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'handle_user_message',
            status: 'error',
            input: JSON.stringify({ messageId: message.id }),
            errorMessage: e.message || String(e),
          })
        }
      }

      const summary =
        `24/7 Support: ${stats.messagesProcessed} mesej diproses, ` +
        `${stats.autoResponded} auto-respon, ${stats.escalated} eskalasi ke admin, ` +
        `${stats.emergenciesHandled} kecemasan, ${stats.complaintsForwarded} aduan dihantar. ` +
        `${stats.whatsappSent} WhatsApp berjaya. Errors: ${stats.errors}.`

      // Only notify admin if there were escalations or emergencies
      if (stats.escalated > 0 || stats.emergenciesHandled > 0) {
        await this.notify({
          category: 'support',
          severity: stats.emergenciesHandled > 0 ? 'critical' : 'info',
          title: 'Support Agent: Eskalasi diperlukan',
          message: summary,
          actionUrl: '/admin/messages',
        })
      }

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: '24/7 Support Agent gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Handle a single user message: detect emergency, fetch context, call AI,
   * store reply, send via WhatsApp, escalate if needed.
   */
  private async handleUserMessage(message: any, stats: any): Promise<void> {
    const content = message.content || ''
    const conversation = message.conversation

    if (!conversation) {
      // No conversation context - mark as replied to avoid infinite loop
      await this.markReplied(message.id)
      return
    }

    const userType = conversation.userType as 'helper' | 'employer'
    const userId = conversation.userId

    // Step 1: Check for emergency keywords
    const isEmergency = this.detectEmergency(content)

    if (isEmergency) {
      stats.emergenciesHandled++
      await this.handleEmergency(message, conversation, content)
      await this.markReplied(message.id)
      return
    }

    // Step 2: Fetch user profile context
    const userProfile = await this.fetchUserProfile(userId, userType)

    // Step 3: Fetch conversation history (last N messages)
    const history = await db.agentMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: MAX_HISTORY_MESSAGES,
    })
    history.reverse()

    // Step 4: Fetch FAQ knowledge base from Document table
    const knowledgeBase = await this.fetchKnowledgeBase()

    // Step 5: Call AI to generate reply
    const aiResponse = await this.generateAIResponse(
      content,
      conversation,
      userProfile,
      history,
      knowledgeBase
    )

    if (!aiResponse) {
      // AI failed - send a fallback message
      const fallbackMsg =
        `Maaf, saya mengalami masalah teknikal sekarang. 😔\n\n` +
        `Sila hubungi admin kami secara langsung:\n` +
        `WhatsApp: ${COMPANY.phone}\n` +
        `Email: ${COMPANY.email}\n\n` +
        `— ${PERSONA_NAME}, MIM Portal`
      await this.storeAgentReply(message, conversation, fallbackMsg, 'other', false)
      stats.whatsappSent += await this.sendReplyWhatsApp(conversation, fallbackMsg, userProfile)
      await this.markReplied(message.id)
      return
    }

    // Step 6: Store agent reply + send via WhatsApp
    await this.storeAgentReply(
      message,
      conversation,
      aiResponse.reply,
      aiResponse.intent,
      aiResponse.escalate
    )
    stats.autoResponded++
    stats.whatsappSent += await this.sendReplyWhatsApp(conversation, aiResponse.reply, userProfile)

    // Step 7: Escalate to admin if AI flagged escalate=true
    if (aiResponse.escalate || aiResponse.intent === 'complaint') {
      stats.escalated++
      if (aiResponse.intent === 'complaint') stats.complaintsForwarded++

      const userName = userProfile?.fullName || (userType === 'helper' ? 'Pembantu' : 'Majikan')
      await this.notify({
        category: 'support',
        severity: aiResponse.intent === 'complaint' ? 'warning' : 'info',
        title: `Eskalasi Support (${aiResponse.intent})`,
        message:
          `Dari: ${userName} (${userType}, ${userProfile?.phone || 'tiada phone'})\n` +
          `Mesej asal: "${content.slice(0, 200)}${content.length > 200 ? '...' : ''}"\n` +
          `Intent: ${aiResponse.intent}\n` +
          `Ringkasan AI: ${aiResponse.summary}\n` +
          `Respon AI: ${aiResponse.reply.slice(0, 200)}`,
        actionUrl: '/admin/messages',
      })

      // Also send WhatsApp to admin for urgent escalation
      if (aiResponse.intent === 'complaint' || aiResponse.escalate) {
        try {
          await sendWhatsApp({
            to: COMPANY.phone,
            body:
              `🔔 Eskalasi Support (${aiResponse.intent})\n\n` +
              `Dari: ${userName} (${userType})\n` +
              `Phone: ${userProfile?.phone || 'tiada'}\n` +
              `Mesej: "${content.slice(0, 300)}${content.length > 300 ? '...' : ''}"\n` +
              `Ringkasan: ${aiResponse.summary}\n\n` +
              `Sila semak /admin/messages`,
          })
        } catch {}
      }
    }

    // Step 8: If intent unresolved (AI couldn't answer well), store for knowledge base update
    if (aiResponse.intent === 'other' && aiResponse.escalate) {
      await this.storeUnresolvedQuestion(message, conversation, content, aiResponse)
    }

    await this.markReplied(message.id)

    await this.logActivity({
      action: 'handle_support_message',
      status: 'success',
      input: JSON.stringify({
        messageId: message.id,
        conversationId: conversation.id,
        userType,
        intent: aiResponse.intent,
      }),
      output: JSON.stringify({
        escalate: aiResponse.escalate,
        replyLength: aiResponse.reply.length,
      }),
    })
  }

  /**
   * Detect emergency keywords in user message (case-insensitive).
   */
  private detectEmergency(content: string): boolean {
    const lower = content.toLowerCase()
    return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))
  }

  /**
   * Handle emergency: immediately notify admin via WhatsApp + notification,
   * reply to user with safety guidance.
   */
  private async handleEmergency(
    message: any,
    conversation: any,
    content: string
  ): Promise<void> {
    const userType = conversation.userType as 'helper' | 'employer'
    const userProfile = await this.fetchUserProfile(conversation.userId, userType)
    const userName = userProfile?.fullName || (userType === 'helper' ? 'Pembantu' : 'Majikan')

    // Reply to user immediately with safety guidance
    const emergencyReply =
      `🚨 Saya nampak situasi ini mungkin kecemasan. Kami AMBIL SERIUS keselamatan anda.\n\n` +
      `Jika anda dalam bahaya SEGERA:\n` +
      `• Panggil POLIS: 999\n` +
      `• Atau pergi ke balai polis terdekat\n\n` +
      `Admin MIM Portal telah dihubungi & akan menghubungi anda TIDAK LAMA LAGI.\n\n` +
      `Tetap selamat. Kami di sini untuk anda. 🙏\n\n` +
      `— ${PERSONA_NAME}, MIM Portal`

    await this.storeAgentReply(message, conversation, emergencyReply, 'escalation', true)
    await this.sendReplyWhatsApp(conversation, emergencyReply, userProfile)

    // Critical notification to admin
    await this.notify({
      category: 'support',
      severity: 'critical',
      title: '🚨 KECEMASAN - Tindakan Segera Diperlukan',
      message:
        `KECEMASAN dikesan dari ${userName} (${userType})\n` +
        `Phone: ${userProfile?.phone || 'tiada'}\n` +
        `Mesej: "${content.slice(0, 500)}${content.length > 500 ? '...' : ''}"\n\n` +
        `SILA HUBUNGI USER SEGERA & JIKA PERLU, HUBUNGI PIHAK BERWAJIB.`,
      actionUrl: '/admin/messages',
    })

    // WhatsApp admin directly
    try {
      await sendWhatsApp({
        to: COMPANY.phone,
        body:
          `🚨 KECEMASAN MIM Portal 🚨\n\n` +
          `Dari: ${userName} (${userType})\n` +
          `Phone: ${userProfile?.phone || 'tiada'}\n` +
          `Mesej: "${content.slice(0, 500)}${content.length > 500 ? '...' : ''}"\n\n` +
          `SILA HUBUNGI SEGERA & pertimbangkan menghubungi polis (999) jika perlu.`,
      })
    } catch {}

    await this.logActivity({
      action: 'handle_emergency',
      status: 'success',
      input: JSON.stringify({
        messageId: message.id,
        conversationId: conversation.id,
        userType,
      }),
      output: JSON.stringify({
        adminNotified: true,
        whatsappSent: true,
      }),
    })
  }

  /**
   * Fetch user profile based on userType.
   */
  private async fetchUserProfile(
    userId: string,
    userType: 'helper' | 'employer'
  ): Promise<any> {
    try {
      if (userType === 'helper') {
        return await db.helper.findUnique({
          where: { id: userId },
          select: {
            id: true,
            fullName: true,
            nickname: true,
            phone: true,
            serviceType: true,
            state: true,
            city: true,
            liveIn: true,
            rating: true,
            status: true,
          },
        })
      } else {
        return await db.employer.findUnique({
          where: { id: userId },
          select: {
            id: true,
            fullName: true,
            phone: true,
            serviceType: true,
            state: true,
            city: true,
            numKids: true,
            salaryOffered: true,
            status: true,
          },
        })
      }
    } catch {
      return null
    }
  }

  /**
   * Fetch FAQ knowledge base from Document table (docType='faq').
   */
  private async fetchKnowledgeBase(): Promise<string> {
    try {
      const docs = await db.document.findMany({
        where: {
          docType: 'faq',
          isPublished: true,
        },
        select: { title: true, content: true },
        take: 20,
      })
      if (docs.length === 0) {
        // Fallback: include all published docs
        const allDocs = await db.document.findMany({
          where: { isPublished: true },
          select: { title: true, content: true, docType: true },
          take: 20,
        })
        if (allDocs.length === 0) return '(Tiada FAQ dalam knowledge base)'
        return allDocs
          .map((d) => `[${d.docType || 'doc'}] ${d.title}\n${(d.content || '').slice(0, 500)}`)
          .join('\n\n---\n\n')
      }
      return docs
        .map((d) => `[FAQ] ${d.title}\n${(d.content || '').slice(0, 500)}`)
        .join('\n\n---\n\n')
    } catch {
      return '(Gagal mendapatkan knowledge base)'
    }
  }

  /**
   * Call AI to generate a support response based on user message, conversation
   * history, user profile, and knowledge base.
   */
  private async generateAIResponse(
    userMessage: string,
    conversation: any,
    userProfile: any,
    history: any[],
    knowledgeBase: string
  ): Promise<AISupportResponse | null> {
    const systemPrompt =
      `Anda adalah ${PERSONA_NAME}, AI support assistant MIM Portal. ` +
      `Anda membantu pembantu dan majikan dengan soalan, isu, dan aduan.\n\n` +
      `Gaya: Mesra, membantu, profesional, berbahasa Melayu.\n` +
      `Jika soalan di luar skop, arahkan ke admin WhatsApp ${COMPANY.phone}.\n\n` +
      `Kategorikan intent: faq, complaint, schedule_change, payment_issue, contract_question, escalation, other\n` +
      `Return JSON: {"reply": "...", "intent": "...", "escalate": false, "summary": "..."}\n\n` +
      `Peraturan penting:\n` +
      `- reply mesti max 500 aksara, mesra & empati\n` +
      `- Jika user marah/sedih, tunjuk empati dahulu, baru beri penyelesaian\n` +
      `- escalate=true jika perlu admin tindakan (schedule change, payment issue, complaint)\n` +
      `- summary adalah ringkasan 1 ayat untuk log admin\n` +
      `- Untuk FAQ mudah (gaji, cara daftar, lokasi), jawab terus tanpa escalate\n` +
      `- Jika tidak pasti, escalate=true supaya admin boleh follow up`

    const userTypeLabel = conversation.userType === 'helper' ? 'Pembantu' : 'Majikan'
    const profileStr = userProfile
      ? `Nama: ${userProfile.fullName}\nLokasi: ${[userProfile.city, userProfile.state].filter(Boolean).join(', ')}\nPhone: ${userProfile.phone || 'tiada'}\nService: ${userProfile.serviceType || 'umum'}`
      : '(profil tidak dijumpai)'

    const historyStr = history
      .slice(-8) // last 8 messages
      .map((m) => `${m.sender === 'user' ? 'User' : PERSONA_NAME}: ${m.content.slice(0, 200)}`)
      .join('\n')

    const userPrompt = `PROFIL USER (${userTypeLabel}):
${profileStr}

KNOWLEDGE BASE FAQ:
${knowledgeBase}

SEJARAH PERBUALAN:
${historyStr || '(tiada sejarah)'}

MESEJ USER BARU:
"${userMessage}"

Tulis reply yang sesuai. Kembalikan JSON SAHAJA dengan format:
{"reply": "...", "intent": "faq|complaint|schedule_change|payment_issue|contract_question|escalation|other", "escalate": false, "summary": "ringkasan 1 ayat"}`

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]
      const aiRes = await aiChat(messages, { temperature: 0.6, maxTokens: 800 })
      const parsed = parseAIJson<AISupportResponse>(aiRes.content)
      if (!parsed || typeof parsed.reply !== 'string') {
        return null
      }
      return {
        reply: parsed.reply,
        intent: parsed.intent || 'other',
        escalate: !!parsed.escalate,
        summary: parsed.summary || '(tiada ringkasan)',
      }
    } catch (e: any) {
      await this.logActivity({
        action: 'generate_ai_response',
        status: 'error',
        input: JSON.stringify({ conversationId: conversation.id }),
        errorMessage: e.message || String(e),
      })
      return null
    }
  }

  /**
   * Store the agent's reply as an AgentMessage in the same conversation.
   */
  private async storeAgentReply(
    userMessage: any,
    conversation: any,
    reply: string,
    intent: string,
    escalate: boolean
  ): Promise<void> {
    await db.agentMessage.create({
      data: {
        conversationId: conversation.id,
        agentId: this.agentId,
        sender: 'agent',
        content: reply,
        messageType: 'text',
        metadata: JSON.stringify({
          intent,
          escalate,
          replyTo: userMessage.id,
        }),
      },
    })
  }

  /**
   * Send the agent reply via WhatsApp to the user (if phone available).
   */
  private async sendReplyWhatsApp(
    conversation: any,
    reply: string,
    userProfile: any
  ): Promise<number> {
    if (!userProfile?.phone) return 0
    try {
      const r = await sendWhatsApp({
        to: userProfile.phone,
        body: reply,
      })
      await this.logActivity({
        action: 'send_support_whatsapp',
        status: r.success ? 'success' : 'error',
        input: JSON.stringify({
          to: userProfile.phone,
          conversationId: conversation.id,
        }),
        output: JSON.stringify({ method: r.method, error: r.error }),
        errorMessage: r.error,
      })
      return r.success ? 1 : 0
    } catch {
      return 0
    }
  }

  /**
   * Mark a user message as replied (via metadata flag).
   */
  private async markReplied(messageId: string): Promise<void> {
    try {
      const msg = await db.agentMessage.findUnique({
        where: { id: messageId },
        select: { metadata: true },
      })
      let metadata: any = {}
      try {
        metadata = JSON.parse(msg?.metadata || '{}')
      } catch {}
      metadata.replied = true
      metadata.repliedAt = new Date().toISOString()
      await db.agentMessage.update({
        where: { id: messageId },
        data: { metadata: JSON.stringify(metadata) },
      })
    } catch {}
  }

  /**
   * Store an unresolved question for future knowledge base updates.
   */
  private async storeUnresolvedQuestion(
    message: any,
    conversation: any,
    userMessage: string,
    aiResponse: AISupportResponse
  ): Promise<void> {
    try {
      // Create a Document entry with docType='unresolved' for admin review
      await db.document.create({
        data: {
          title: `Soalan tak terjawab - ${conversation.userType} (${new Date().toLocaleDateString('ms-MY')})`,
          docType: 'unresolved',
          content:
            `Mesej user: "${userMessage}"\n\n` +
            `Intent AI: ${aiResponse.intent}\n` +
            `Reply AI: ${aiResponse.reply}\n` +
            `Summary: ${aiResponse.summary}\n\n` +
            `Conversation ID: ${conversation.id}\n` +
            `Timestamp: ${new Date().toISOString()}`,
          isPublished: false,
        },
      })
    } catch {}
  }
}

// Register singleton
agentRegistry.register(new SupportAgent())

export { SupportAgent }
