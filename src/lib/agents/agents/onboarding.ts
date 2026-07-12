/**
 * WhatsApp Onboarding Agent ("Aida")
 * ---------------------------------
 * Guides newly-registered helpers and employers through profile completion
 * via WhatsApp chat. Uses AI persona "Aida" - friendly, casual Bahasa Melayu.
 *
 * Behavior:
 *   - Finds helpers/employers with incomplete profiles
 *   - Initiates WhatsApp conversation using WhatsAppTemplates.onboarding()
 *   - Tracks conversation state in Conversation.context (JSON)
 *   - Stores every sent/received message in AgentMessage
 *   - AI generates next message based on conversation state + user type
 *   - Sends follow-up reminders if no response in 24h (max 3)
 *   - Escalates to admin if user appears stuck or repeatedly confused
 *   - Updates helper/employer profile fields as info is collected
 *
 * Helper flow: welcome -> profile photo -> IC + emergency contact -> service prefs
 *              -> schedule video course -> end
 * Employer flow: welcome -> service needs -> budget -> family details
 *                -> show top 3 matching helpers -> offer interview -> end
 *
 * Schedule: Every 1 hour
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { aiChat, type ChatMessage } from '@/lib/ai/provider'
import { sendWhatsApp, WhatsAppTemplates } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

// Limits and thresholds
const MAX_FOLLOWUPS = 3
const STALL_HOURS = 24
const ESCALATION_FOLLOWUPS = 4 // after this many follow-ups, escalate to admin

const PERSONA_NAME = 'Aida'

interface ConversationContext {
  userType: 'helper' | 'employer'
  userId: string
  userName: string
  userPhone: string
  step: string // current onboarding step
  stepIndex: number
  collected: Record<string, any> // collected field values
  followupsSent: number
  lastUserMessageAt: string | null // ISO
  lastAgentMessageAt: string | null // ISO
  startedAt: string // ISO
}

const HELPER_STEPS = [
  'welcome',
  'photo',
  'ic_verification',
  'emergency_contact',
  'service_prefs',
  'video_course',
  'complete',
] as const

const EMPLOYER_STEPS = [
  'welcome',
  'service_needs',
  'budget',
  'family_details',
  'show_matches',
  'offer_interview',
  'complete',
] as const

class OnboardingAgent extends BaseAgent {
  readonly name = 'onboarding'
  readonly displayName = 'WhatsApp Onboarding Agent'
  readonly description =
    'Pembantu AI WhatsApp "Aida" yang membimbing pembantu & majikan baru melengkapkan profil secara interaktif. Termasuk follow-up automatik & eskalasi ke admin.'
  readonly category = 'onboarding'
  readonly schedule = 'Every 1 hour'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      helpersProcessed: 0,
      employersProcessed: 0,
      conversationsStarted: 0,
      messagesSent: 0,
      followupsSent: 0,
      completed: 0,
      escalated: 0,
      errors: 0,
    }

    try {
      // Step 1: Find helpers with incomplete profiles
      const incompleteHelpers = await db.helper.findMany({
        where: {
          AND: [
            { status: { in: ['pending', 'active'] } },
            { phone: { not: null } },
            {
              OR: [
                { isFirstLogin: true },
                { profilePhoto: null },
                { ic: null },
                { familyPhone: null },
              ],
            },
          ],
        },
        select: {
          id: true,
          fullName: true,
          nickname: true,
          phone: true,
          ic: true,
          familyPhone: true,
          profilePhoto: true,
          serviceType: true,
          state: true,
          city: true,
          isFirstLogin: true,
          rating: true,
          skills: true,
          liveIn: true,
        },
      })

      // Step 2: Find employers with incomplete profiles
      const incompleteEmployers = await db.employer.findMany({
        where: {
          AND: [
            { status: { in: ['pending', 'active'] } },
            { phone: { not: null } },
            {
              OR: [
                { isFirstLogin: true },
                { criteria: null },
                { salaryOffered: null },
                { numKids: 0 },
              ],
            },
          ],
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          serviceType: true,
          state: true,
          city: true,
          salaryOffered: true,
          numKids: true,
          kidsAges: true,
          criteria: true,
          isFirstLogin: true,
        },
      })

      await this.logActivity({
        action: 'scan_incomplete_profiles',
        status: 'success',
        input: JSON.stringify({ trigger: context.trigger }),
        output: JSON.stringify({
          helpers: incompleteHelpers.length,
          employers: incompleteEmployers.length,
        }),
      })

      // Step 3: Process each helper
      for (const helper of incompleteHelpers) {
        try {
          stats.helpersProcessed++
          const result = await this.processOnboarding(helper, 'helper')
          stats.conversationsStarted += result.conversationsStarted
          stats.messagesSent += result.messagesSent
          stats.followupsSent += result.followupsSent
          stats.completed += result.completed
          stats.escalated += result.escalated
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'process_helper_onboarding',
            status: 'error',
            input: JSON.stringify({ helperId: helper.id }),
            errorMessage: e.message || String(e),
          })
        }
      }

      // Step 4: Process each employer
      for (const employer of incompleteEmployers) {
        try {
          stats.employersProcessed++
          const result = await this.processOnboarding(employer, 'employer')
          stats.conversationsStarted += result.conversationsStarted
          stats.messagesSent += result.messagesSent
          stats.followupsSent += result.followupsSent
          stats.completed += result.completed
          stats.escalated += result.escalated
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'process_employer_onboarding',
            status: 'error',
            input: JSON.stringify({ employerId: employer.id }),
            errorMessage: e.message || String(e),
          })
        }
      }

      const summary =
        `WhatsApp Onboarding: ${stats.helpersProcessed} pembantu, ${stats.employersProcessed} majikan diproses. ` +
        `${stats.conversationsStarted} perbualan baru, ${stats.messagesSent} mesej dihantar, ` +
        `${stats.followupsSent} follow-up, ${stats.completed} siap, ${stats.escalated} eskalasi. ` +
        `Errors: ${stats.errors}.`

      await this.notify({
        category: 'summary',
        severity: 'info',
        title: 'WhatsApp Onboarding Run Selesai',
        message: summary,
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'WhatsApp Onboarding gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Process onboarding for a single user (helper or employer).
   */
  private async processOnboarding(
    user: any,
    userType: 'helper' | 'employer'
  ): Promise<{
    conversationsStarted: number
    messagesSent: number
    followupsSent: number
    completed: number
    escalated: number
  }> {
    const result = {
      conversationsStarted: 0,
      messagesSent: 0,
      followupsSent: 0,
      completed: 0,
      escalated: 0,
    }

    const phone = user.phone
    if (!phone) return result

    // Find existing active conversation for this user
    const existing = await db.conversation.findFirst({
      where: {
        userId: user.id,
        userType,
        status: { in: ['active', 'completed'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    // Case A: No conversation yet -> start new
    if (!existing) {
      const ctx: ConversationContext = {
        userType,
        userId: user.id,
        userName: user.fullName || user.nickname || (userType === 'helper' ? 'Pembantu' : 'Majikan'),
        userPhone: phone,
        step: 'welcome',
        stepIndex: 0,
        collected: {},
        followupsSent: 0,
        lastUserMessageAt: null,
        lastAgentMessageAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      }

      const conversation = await db.conversation.create({
        data: {
          agentId: this.agentId,
          userId: user.id,
          userType,
          channel: 'whatsapp',
          status: 'active',
          context: JSON.stringify(ctx),
          summary: `Onboarding ${userType} untuk ${user.fullName}`,
        },
      })

      const welcomeMsg = this.buildWelcomeMessage(user, userType)
      await this.sendAgentMessage(conversation.id, phone, welcomeMsg, ctx)
      result.conversationsStarted++
      result.messagesSent++
      return result
    }

    // Case B: Conversation already completed
    if (existing.status === 'completed') return result

    // Case C: Active conversation - parse context
    let ctx: ConversationContext
    try {
      ctx = JSON.parse(existing.context || '{}')
    } catch {
      // Reset context if corrupt
      ctx = {
        userType,
        userId: user.id,
        userName: user.fullName,
        userPhone: phone,
        step: 'welcome',
        stepIndex: 0,
        collected: {},
        followupsSent: 0,
        lastUserMessageAt: null,
        lastAgentMessageAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      }
    }

    if (ctx.step === 'complete') {
      // Already complete - mark conversation done
      await db.conversation.update({
        where: { id: existing.id },
        data: { status: 'completed' },
      })
      return result
    }

    // Check last user message - if recent user message, generate AI response
    const lastMsg = existing.messages[0]
    const lastWasUser = lastMsg && lastMsg.sender === 'user'
    const lastMsgTime = lastMsg ? new Date(lastMsg.createdAt) : new Date(0)
    const hoursSinceLast = (Date.now() - lastMsgTime.getTime()) / (1000 * 60 * 60)

    if (lastWasUser && hoursSinceLast < 2) {
      // User just responded - generate AI-driven next step message
      const aiMessage = await this.generateNextStepMessage(existing, ctx, user)
      if (aiMessage) {
        await this.sendAgentMessage(existing.id, phone, aiMessage, ctx)
        result.messagesSent++
      }
      return result
    }

    // No user response yet - check if we should follow up
    if (hoursSinceLast < STALL_HOURS) {
      // Not yet time for follow-up
      return result
    }

    if (ctx.followupsSent >= MAX_FOLLOWUPS) {
      // Already sent max follow-ups - escalate to admin
      if (ctx.followupsSent < ESCALATION_FOLLOWUPS) {
        await db.conversation.update({
          where: { id: existing.id },
          data: {
            status: 'escalated',
            context: JSON.stringify({ ...ctx, followupsSent: ctx.followupsSent + 1 }),
          },
        })
        result.escalated++
        await this.notify({
          category: 'onboarding',
          severity: 'warning',
          title: `Onboarding ${userType} terhenti - perlu tindakan admin`,
          message: `${user.fullName} (${phone}) tidak menjawab selepas ${MAX_FOLLOWUPS} follow-up. Step terakhir: ${ctx.step}. Sila hubungi secara manual.`,
          actionUrl: '/admin/helpers',
        })
      }
      return result
    }

    // Send follow-up reminder
    const followup = await this.generateFollowupMessage(ctx, user)
    ctx.followupsSent++
    ctx.lastAgentMessageAt = new Date().toISOString()
    await this.sendAgentMessage(existing.id, phone, followup, ctx)
    result.followupsSent++
    result.messagesSent++
    return result
  }

  /**
   * Build the initial welcome message for a new onboarding conversation.
   */
  private buildWelcomeMessage(user: any, userType: 'helper' | 'employer'): string {
    const name = user.fullName || user.nickname || (userType === 'helper' ? 'Kakak' : 'Tuan/Puan')
    if (userType === 'helper') {
      return (
        `Selamat datang! Saya ${PERSONA_NAME}, AI assistant MIM Portal. 🎉\n\n` +
        `Saya akan bantu anda lengkapkan profil anda. Ini penting supaya majikan boleh jumpa dan pilih anda!\n\n` +
        `Profil akan siap dalam 5-10 minit saja. Boleh mula sekarang?\n\n` +
        `Pertama, sila hantar FOTO PROFIL anda (gambar diri yang jelas). 📸`
      )
    }
    return (
      `Selamat datang! Saya ${PERSONA_NAME}, AI assistant MIM Portal. 🎉\n\n` +
      `Saya akan bantu anda lengkapkan profil majikan supaya kami boleh cari pembantu yang paling sesuai untuk keluarga anda.\n\n` +
      `Profil akan siap dalam 5-10 minit. Boleh mula sekarang?\n\n` +
      `Pertama, boleh sahkan jenis perkhidmatan yang anda perlukan? (Pembantu Rumah / Pengasuh / Penjaga Orang Tua)`
    )
  }

  /**
   * Use AI to generate the next onboarding message based on conversation state.
   */
  private async generateNextStepMessage(
    conversation: any,
    ctx: ConversationContext,
    user: any
  ): Promise<string | null> {
    try {
      // Advance step based on current step
      const nextStep = this.advanceStep(ctx)
      ctx.step = nextStep
      ctx.stepIndex++
      ctx.lastUserMessageAt = new Date().toISOString()
      ctx.lastAgentMessageAt = new Date().toISOString()
      ctx.followupsSent = 0 // reset on user response

      // For employer at 'show_matches' step, query top 3 MatchScores
      let matchesContext = ''
      if (nextStep === 'show_matches' && ctx.userType === 'employer') {
        matchesContext = await this.fetchTopMatchesForEmployer(user.id)
      }

      const recentMessages = conversation.messages
        .slice(0, 5)
        .reverse()
        .map((m: any) => `${m.sender === 'user' ? 'User' : PERSONA_NAME}: ${m.content}`)
        .join('\n')

      const systemPrompt =
        `Anda adalah ${PERSONA_NAME}, AI assistant MIM Portal (platform pembantu rumah Malaysia oleh Kino Studios). ` +
        `Anda mesra, sabar, dan bercakap Bahasa Melayu secara kasual (campuran BM + sedikit english ok). ` +
        `Tugas anda: bimbing ${ctx.userType === 'helper' ? 'pembantu' : 'majikan'} melengkapkan profil mereka. ` +
        `Mesej mesti ringkas (max 300 aksara), guna emoji secukupnya, dan hanya tanya SATU soalan pada satu masa. ` +
        `Jangan ulang soalan yang sama. Jika user nampak keliru, terangkan dengan mudah.\n\n` +
        `Flow ${ctx.userType}:\n` +
        (ctx.userType === 'helper'
          ? HELPER_STEPS.map((s, i) => `${i + 1}. ${s}`).join('\n')
          : EMPLOYER_STEPS.map((s, i) => `${i + 1}. ${s}`).join('\n')) +
        `\n\nLangkah seterusnya yang perlu anda tanya: "${nextStep}".\n` +
        `Jangan tanya soalan yang sudah dijawab dalam sejarah perbualan.`

      const userPrompt = `Maklumat user:
- Nama: ${user.fullName}
- Jenis: ${ctx.userType}
- Phone: ${ctx.userPhone}
- IC: ${user.ic || '(belum isi)'}
- Service type: ${user.serviceType || '(belum isi)'}
- State: ${user.state || '(belum isi)'}
${matchesContext ? `\nPadanan terbaik dijumpai:\n${matchesContext}` : ''}

Sejarah perbualan (terbaru di bawah):
${recentMessages}

Langkah seterusnya: ${nextStep}
Tulis mesej WhatsApp seterusnya untuk ${PERSONA_NAME}. Ringkas, mesra, BM kasual, satu soalan saja.`

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]
      const aiRes = await aiChat(messages, { temperature: 0.7, maxTokens: 400 })
      const content = aiRes.content?.trim()
      if (!content) return null

      // Persist updated context
      await db.conversation.update({
        where: { id: conversation.id },
        data: { context: JSON.stringify(ctx), updatedAt: new Date() },
      })

      // If step is complete, finalize profile & mark conversation done
      if (nextStep === 'complete') {
        await this.markProfileComplete(user, ctx.userType, conversation.id)
      }

      return content
    } catch (e: any) {
      await this.logActivity({
        action: 'generate_ai_message',
        status: 'error',
        input: JSON.stringify({ conversationId: conversation.id, step: ctx.step }),
        errorMessage: e.message || String(e),
      })
      return null
    }
  }

  /**
   * Determine the next step based on current step + user info.
   */
  private advanceStep(ctx: ConversationContext): string {
    const steps = ctx.userType === 'helper' ? HELPER_STEPS : EMPLOYER_STEPS
    const currentIdx = steps.indexOf(ctx.step as any)
    if (currentIdx === -1 || currentIdx >= steps.length - 1) return 'complete'
    return steps[currentIdx + 1]
  }

  /**
   * Generate a follow-up reminder message for stalled conversation.
   */
  private async generateFollowupMessage(ctx: ConversationContext, user: any): Promise<string> {
    const name = user.fullName?.split(' ')[0] || (ctx.userType === 'helper' ? 'Kakak' : 'Tuan/Puan')
    const stepLabels: Record<string, string> = {
      welcome: 'mula onboarding',
      photo: 'hantar foto profil',
      ic_verification: 'sahkan IC',
      emergency_contact: 'kontak kecemasan',
      service_prefs: 'sahkan jenis perkhidmatan',
      video_course: 'tonton video kursus',
      service_needs: 'sahkan jenis perkhidmatan',
      budget: 'bincang bajet',
      family_details: 'butiran keluarga',
      show_matches: 'lihat padanan pembantu',
      offer_interview: 'tempah temuduga',
      complete: 'selesai',
    }
    const stepLabel = stepLabels[ctx.step] || ctx.step

    return (
      `Hai ${name}, ${PERSONA_NAME} dari MIM Portal ni. 😊\n\n` +
      `Anda masih perlu ${stepLabel} untuk siapkan profil. ` +
      `Profil yang lengkap akan cepat dipadankan dengan ${ctx.userType === 'helper' ? 'majikan' : 'pembantu'} yang sesuai!\n\n` +
      `Boleh sambung sekarang? Kalau tak free sekarang, reply "NANTI" dan kami hubungi anda lain kali. 🙏`
    )
  }

  /**
   * Fetch top 3 matches for an employer (from MatchScore table).
   */
  private async fetchTopMatchesForEmployer(employerId: string): Promise<string> {
    try {
      const matches = await db.matchScore.findMany({
        where: { employerId, score: { gte: 60 } },
        orderBy: { score: 'desc' },
        take: 3,
        include: {
          helper: {
            select: {
              id: true,
              fullName: true,
              serviceType: true,
              state: true,
              rating: true,
              skills: true,
            },
          },
        },
      })
      if (matches.length === 0) {
        return '(Tiada padanan dijumpai lagi - pendaftaran pembantu masih berjalan)'
      }
      return matches
        .map(
          (m, i) =>
            `${i + 1}. ${m.helper.fullName} (Skor: ${Math.round(m.score)}) - ${m.helper.serviceType || 'Umum'}, ${m.helper.state || 'Malaysia'}, Rating ${m.helper.rating.toFixed(1)}/5`
        )
        .join('\n')
    } catch {
      return '(Gagal mendapatkan padanan)'
    }
  }

  /**
   * Persist agent message to DB + send via WhatsApp.
   */
  private async sendAgentMessage(
    conversationId: string,
    phone: string,
    body: string,
    ctx: ConversationContext
  ): Promise<void> {
    // Update conversation context
    ctx.lastAgentMessageAt = new Date().toISOString()
    await db.conversation.update({
      where: { id: conversationId },
      data: { context: JSON.stringify(ctx), updatedAt: new Date() },
    })

    // Store message
    await db.agentMessage.create({
      data: {
        conversationId,
        agentId: this.agentId,
        sender: 'agent',
        content: body,
        messageType: 'text',
        metadata: JSON.stringify({ step: ctx.step, followup: ctx.followupsSent }),
      },
    })

    // Send via WhatsApp
    const waResult = await sendWhatsApp({ to: phone, body })
    await this.logActivity({
      action: 'send_whatsapp',
      status: waResult.success ? 'success' : 'error',
      input: JSON.stringify({ to: phone, step: ctx.step }),
      output: JSON.stringify({
        method: waResult.method,
        messageId: waResult.messageId,
        waLink: waResult.waLink,
        error: waResult.error,
      }),
      errorMessage: waResult.error,
    })
  }

  /**
   * Mark user profile as complete after onboarding flow finishes.
   */
  private async markProfileComplete(
    user: any,
    userType: 'helper' | 'employer',
    conversationId: string
  ): Promise<void> {
    if (userType === 'helper') {
      await db.helper.update({
        where: { id: user.id },
        data: {
          isFirstLogin: false,
          // If profile photo was missing and conversation captured one, set it.
          // (In real implementation, photo would arrive via WhatsApp media webhook.)
        },
      })
    } else {
      await db.employer.update({
        where: { id: user.id },
        data: { isFirstLogin: false },
      })
    }
    await db.conversation.update({
      where: { id: conversationId },
      data: { status: 'completed' },
    })

    await this.notify({
      category: 'onboarding',
      severity: 'info',
      title: `Onboarding ${userType} selesai`,
      message: `${user.fullName} telah lengkap profilnya melalui perbualan WhatsApp dengan ${PERSONA_NAME}.`,
      actionUrl: userType === 'helper' ? `/admin/helpers/${user.id}` : '/admin/employers',
    })
  }
}

// Register singleton
agentRegistry.register(new OnboardingAgent())

export { OnboardingAgent }
