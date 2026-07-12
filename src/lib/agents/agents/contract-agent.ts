/**
 * Auto-Contract Agent
 * --------------------
 * Automatically generates the 3 contract types (agency_helper, agency_employer,
 * employer_helper) when a booking is confirmed but has no contracts yet. Sends
 * WhatsApp to all 3 parties (helper, employer, admin) with contract link. Sends
 * 3-day reminder if not signed. After 7 days, marks as 'expired' and notifies
 * admin. When all 3 contracts signed by all parties, marks them 'active' and
 * updates booking status.
 *
 * Behavior:
 *   - Find bookings with status 'confirmed' that have no contracts
 *   - For each: generate 3 contracts (using AI to personalize content)
 *   - Store contracts with status='draft'
 *   - Send WhatsApp to helper, employer, admin with contract link
 *   - 3 days after creation: reminder if not signed
 *   - 7 days after creation: mark 'expired', notify admin
 *   - When all 3 contracts fully signed (helper + employer + admin): mark 'active'
 *     and update booking status
 *
 * Schedule: Every 4 hours
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { aiChat, parseAIJson, type ChatMessage } from '@/lib/ai/provider'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

// Time windows (in milliseconds)
const DAY_MS = 24 * 60 * 60 * 1000
const REMINDER_AFTER_DAYS = 3
const EXPIRE_AFTER_DAYS = 7
const MAX_BOOKINGS_PER_RUN = 10

// Company info from env vars (fallback to defaults)
const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Kino Studios Sdn. Bhd.',
  brand: process.env.NEXT_PUBLIC_BRAND || 'KinoCinema Media',
  ssm: process.env.NEXT_PUBLIC_COMPANY_SSM || '002138666-M',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'hello@kino.my',
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+6017-663 5990',
  address:
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
    'Ampang Jaya, Selangor Darul Ehsan, Malaysia',
  signatory: process.env.NEXT_PUBLIC_SIGNATORY || 'Mahadzir Hanafiah',
  website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE || 'www.kino.my',
}

const ADMIN_PHONE = COMPANY.phone // admin notified via company WhatsApp

const CONTRACT_TYPES = ['agency_helper', 'agency_employer', 'employer_helper'] as const
type ContractType = (typeof CONTRACT_TYPES)[number]

interface AIPersonalization {
  specialClauses: string[]
  responsibilities: string[]
  notes: string
}

class ContractAgent extends BaseAgent {
  readonly name = 'contract_agent'
  readonly displayName = 'Auto-Contract Agent'
  readonly description =
    'Jana automatik 3 jenis kontrak (agensi-pembantu, agensi-majikan, majikan-pembantu) apabila tempahan disahkan. Hantar peringatan 3 hari, tamat tempoh 7 hari, dan aktifkan kontrak apabila semua pihak menandatangani.'
  readonly category = 'contract'
  readonly schedule = 'Every 4 hours'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      bookingsScanned: 0,
      contractsGenerated: 0,
      remindersSent: 0,
      expiredCount: 0,
      activatedCount: 0,
      whatsappSent: 0,
      errors: 0,
    }

    try {
      // Phase 1: Generate contracts for newly-confirmed bookings
      stats.contractsGenerated = await this.generateContractsForConfirmedBookings(stats)

      // Phase 2: Send reminders for unsigned contracts (3 days old)
      stats.remindersSent = await this.sendSigningReminders(stats)

      // Phase 3: Expire contracts after 7 days unsigned
      stats.expiredCount = await this.expireStaleContracts(stats)

      // Phase 4: Activate contracts fully signed by all 3 parties
      stats.activatedCount = await this.activateFullySignedContracts(stats)

      const summary =
        `Auto-Contract: ${stats.contractsGenerated} kontrak baru dijana (3 jenis setiap tempahan), ` +
        `${stats.remindersSent} peringatan dihantar, ${stats.expiredCount} kontrak ditamatkan (7 hari), ` +
        `${stats.activatedCount} kontrak diaktifkan (semua tandatangan). ` +
        `${stats.whatsappSent} WhatsApp berjaya. Errors: ${stats.errors}.`

      await this.notify({
        category: 'contract',
        severity: 'info',
        title: 'Auto-Contract Run Selesai',
        message: summary,
        actionUrl: '/admin/contracts',
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'Auto-Contract Agent gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Phase 1: Find confirmed bookings without contracts. For each, generate
   * 3 contracts (agency_helper, agency_employer, employer_helper) with AI-personalized
   * content, store with status='draft', and send WhatsApp to all parties.
   */
  private async generateContractsForConfirmedBookings(stats: any): Promise<number> {
    let generated = 0

    try {
      // Find confirmed bookings that have NO contracts yet
      const confirmedBookings = await db.booking.findMany({
        where: {
          status: 'confirmed',
          contracts: { none: {} },
        },
        include: {
          helper: {
            select: {
              id: true,
              fullName: true,
              nickname: true,
              ic: true,
              phone: true,
              email: true,
              addressLine1: true,
              addressLine2: true,
              city: true,
              state: true,
              postalCode: true,
              serviceType: true,
              desiredJob: true,
              religion: true,
              skills: true,
              otherSkills: true,
              experience: true,
              liveIn: true,
              backAndForth: true,
            },
          },
          employer: {
            select: {
              id: true,
              fullName: true,
              ic: true,
              phone: true,
              email: true,
              addressLine1: true,
              addressLine2: true,
              city: true,
              state: true,
              postalCode: true,
              serviceType: true,
              numKids: true,
              kidsAges: true,
              salaryOffered: true,
              criteria: true,
            },
          },
        },
        take: MAX_BOOKINGS_PER_RUN,
      })

      stats.bookingsScanned = confirmedBookings.length

      for (const booking of confirmedBookings) {
        try {
          // Use AI to personalize contract content based on helper/employer details
          const personalization = await this.generateAIPersonalization(booking.helper, booking.employer, booking)

          // Generate 3 contracts
          const startDate = booking.startDate || new Date()
          const durationMonths = booking.durationMonths || 12
          const endDate = new Date(startDate)
          endDate.setMonth(endDate.getMonth() + durationMonths)

          for (const contractType of CONTRACT_TYPES) {
            try {
              const content = this.buildContractContent(
                contractType,
                booking.helper,
                booking.employer,
                booking,
                personalization
              )

              await db.contract.create({
                data: {
                  bookingId: booking.id,
                  contractType,
                  helperId: booking.helperId,
                  employerId: booking.employerId,
                  content,
                  status: 'draft',
                  signedHelper: false,
                  signedEmployer: false,
                  signedAdmin: false,
                  startDate,
                  endDate,
                },
              })
              generated++
            } catch (e: any) {
              stats.errors++
              await this.logActivity({
                action: 'generate_contract',
                status: 'error',
                input: JSON.stringify({
                  bookingId: booking.id,
                  contractType,
                }),
                errorMessage: e.message || String(e),
              })
            }
          }

          // Send WhatsApp to all 3 parties (helper, employer, admin)
          const whatsappResults = await this.notifyContractsCreated(booking)
          stats.whatsappSent += whatsappResults

          await this.logActivity({
            action: 'generate_contracts_for_booking',
            status: 'success',
            input: JSON.stringify({
              bookingId: booking.id,
              helperName: booking.helper.fullName,
              employerName: booking.employer.fullName,
            }),
            output: JSON.stringify({
              contractsCreated: 3,
              whatsappSent: whatsappResults,
            }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'process_confirmed_booking',
            status: 'error',
            input: JSON.stringify({ bookingId: booking.id }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
      await this.logActivity({
        action: 'generate_contracts_scan',
        status: 'error',
        input: JSON.stringify({}),
        errorMessage: e.message || String(e),
      })
    }

    return generated
  }

  /**
   * Phase 2: Send signing reminder WhatsApp to unsigned contracts older than 3 days.
   * Uses notes field marker '[REMINDER_SENT]' to avoid duplicates.
   */
  private async sendSigningReminders(stats: any): Promise<number> {
    let sent = 0

    try {
      const now = Date.now()
      const reminderThreshold = new Date(now - REMINDER_AFTER_DAYS * DAY_MS)

      // Contracts that are draft, not fully signed, older than 3 days, no reminder yet
      const unsignedContracts = await db.contract.findMany({
        where: {
          status: 'draft',
          createdAt: { lte: reminderThreshold },
          // Hasn't been reminded yet
          content: { not: { contains: '[CONTRACT_REMINDER_SENT]' } },
          // Not fully signed
          OR: [
            { signedHelper: false },
            { signedEmployer: false },
            { signedAdmin: false },
          ],
        },
        include: {
          helper: { select: { id: true, fullName: true, phone: true } },
          employer: { select: { id: true, fullName: true, phone: true } },
          booking: { select: { id: true } },
        },
        take: 30,
      })

      // Group by booking to avoid sending duplicate reminders for the same booking
      const byBooking = new Map<string, typeof unsignedContracts>()
      for (const c of unsignedContracts) {
        const key = c.bookingId || c.id
        if (!byBooking.has(key)) byBooking.set(key, [])
        byBooking.get(key)!.push(c)
      }

      for (const [, contracts] of byBooking) {
        try {
          const first = contracts[0]
          const helper = first.helper
          const employer = first.employer

          const contractLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mim-portal.vercel.app'}/admin/contracts`

          // Build reminder message
          const buildReminder = (name: string, role: 'helper' | 'employer') => {
            const roleLabel = role === 'helper' ? 'Pembantu' : 'Majikan'
            return (
              `📋 Peringatan Tandatangan Kontrak MIM Portal\n\n` +
              `Hai ${name},\n\n` +
              `Kontrak anda sebagai ${roleLabel} masih belum ditandatangani. ` +
              `Sila tandatangani sebelum kontrak tamat tempoh (7 hari dari tarikh dijana).\n\n` +
              `🔗 Link kontrak: ${contractLink}\n\n` +
              `Jika ada soalan, hubungi admin:\n` +
              `WhatsApp: ${COMPANY.phone}\n` +
              `Email: ${COMPANY.email}\n\n` +
              `Terima kasih! 🙏`
            )
          }

          let thisSent = 0
          if (helper?.phone) {
            const r = await sendWhatsApp({
              to: helper.phone,
              body: buildReminder(helper.fullName, 'helper'),
            })
            if (r.success) {
              thisSent++
              stats.whatsappSent++
            }
          }
          if (employer?.phone) {
            const r = await sendWhatsApp({
              to: employer.phone,
              body: buildReminder(employer.fullName, 'employer'),
            })
            if (r.success) {
              thisSent++
              stats.whatsappSent++
            }
          }

          // Mark reminder as sent on all 3 contracts in this booking
          for (const c of contracts) {
            await db.contract.update({
              where: { id: c.id },
              data: {
                content: `${c.content || ''}\n\n[CONTRACT_REMINDER_SENT ${new Date().toISOString()}]`,
              },
            })
          }

          sent++

          await this.logActivity({
            action: 'send_contract_reminder',
            status: 'success',
            input: JSON.stringify({ bookingId: first.bookingId }),
            output: JSON.stringify({ whatsappSent: thisSent }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'send_contract_reminder',
            status: 'error',
            input: JSON.stringify({ bookingId: contracts[0]?.bookingId }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return sent
  }

  /**
   * Phase 3: Mark contracts as 'expired' after 7 days if still not fully signed.
   */
  private async expireStaleContracts(stats: any): Promise<number> {
    let expired = 0

    try {
      const now = Date.now()
      const expireThreshold = new Date(now - EXPIRE_AFTER_DAYS * DAY_MS)

      // Find draft contracts older than 7 days, not fully signed
      const staleContracts = await db.contract.findMany({
        where: {
          status: 'draft',
          createdAt: { lte: expireThreshold },
          OR: [
            { signedHelper: false },
            { signedEmployer: false },
            { signedAdmin: false },
          ],
        },
        include: {
          helper: { select: { id: true, fullName: true, phone: true } },
          employer: { select: { id: true, fullName: true, phone: true } },
          booking: { select: { id: true } },
        },
        take: 30,
      })

      for (const contract of staleContracts) {
        try {
          await db.contract.update({
            where: { id: contract.id },
            data: { status: 'expired' },
          })
          expired++

          await this.logActivity({
            action: 'expire_contract',
            status: 'success',
            input: JSON.stringify({ contractId: contract.id, type: contract.contractType }),
            output: JSON.stringify({ reason: '7 hari tanpa tandatangan' }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'expire_contract',
            status: 'error',
            input: JSON.stringify({ contractId: contract.id }),
            errorMessage: e.message || String(e),
          })
        }
      }

      // Notify admin if any contracts expired
      if (expired > 0) {
        await this.notify({
          category: 'contract',
          severity: 'warning',
          title: `${expired} kontrak ditamatkan (7 hari tanpa tandatangan)`,
          message: `${expired} kontrak telah ditandakan sebagai 'expired' kerana tidak ditandatangani dalam tempoh 7 hari. Sila semak dan hubungi pihak berkenaan secara manual.`,
          actionUrl: '/admin/contracts',
        })

        // Send WhatsApp to admin
        try {
          await sendWhatsApp({
            to: ADMIN_PHONE,
            body:
              `⚠️ Kontrak Tamat Tempoh\n\n` +
              `${expired} kontrak telah ditamatkan kerana tidak ditandatangani dalam 7 hari.\n` +
              `Sila semak: /admin/contracts\n\n` +
              `— MIM Portal Auto-Contract Agent`,
          })
        } catch {}
      }
    } catch (e: any) {
      stats.errors++
    }

    return expired
  }

  /**
   * Phase 4: Activate contracts that are fully signed by all 3 parties.
   * When a booking's all 3 contracts are active, update booking status to 'active'.
   */
  private async activateFullySignedContracts(stats: any): Promise<number> {
    let activated = 0

    try {
      // Find draft contracts fully signed by all 3 parties
      const readyContracts = await db.contract.findMany({
        where: {
          status: 'draft',
          signedHelper: true,
          signedEmployer: true,
          signedAdmin: true,
        },
        include: {
          booking: { select: { id: true, status: true } },
          helper: { select: { id: true, fullName: true, phone: true } },
          employer: { select: { id: true, fullName: true, phone: true } },
        },
        take: 30,
      })

      const bookingIdsToCheck = new Set<string>()

      for (const contract of readyContracts) {
        try {
          await db.contract.update({
            where: { id: contract.id },
            data: { status: 'active' },
          })
          activated++

          if (contract.bookingId) {
            bookingIdsToCheck.add(contract.bookingId)
          }

          await this.logActivity({
            action: 'activate_contract',
            status: 'success',
            input: JSON.stringify({ contractId: contract.id, type: contract.contractType }),
            output: JSON.stringify({ status: 'active' }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'activate_contract',
            status: 'error',
            input: JSON.stringify({ contractId: contract.id }),
            errorMessage: e.message || String(e),
          })
        }
      }

      // For each affected booking, check if all 3 contracts are now active
      for (const bookingId of bookingIdsToCheck) {
        try {
          const allContracts = await db.contract.findMany({
            where: { bookingId },
            select: { id: true, status: true, contractType: true },
          })

          const allActive =
            allContracts.length >= 3 &&
            allContracts.every((c) => c.status === 'active')

          if (allActive) {
            // Update booking status to 'active' (work has started)
            await db.booking.update({
              where: { id: bookingId },
              data: { status: 'active' },
            })

            await this.notify({
              category: 'contract',
              severity: 'info',
              title: 'Semua kontrak diaktifkan!',
              message: `Booking ${bookingId}: Semua 3 kontrak telah ditandatangani dan diaktifkan. Status booking dikemaskini ke 'active'.`,
              actionUrl: `/admin/contracts?booking=${bookingId}`,
            })

            await this.logActivity({
              action: 'activate_booking',
              status: 'success',
              input: JSON.stringify({ bookingId }),
              output: JSON.stringify({ allContractsActive: true }),
            })
          }
        } catch (e: any) {
          stats.errors++
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return activated
  }

  /**
   * Use AI to generate personalized contract clauses based on helper/employer details.
   */
  private async generateAIPersonalization(
    helper: any,
    employer: any,
    booking: any
  ): Promise<AIPersonalization> {
    const defaultResult: AIPersonalization = {
      specialClauses: [],
      responsibilities: [],
      notes: '',
    }

    try {
      const systemPrompt =
        'Anda adalah penjana kontrak AI untuk MIM Portal, platform pembantu rumah Malaysia. ' +
        'Berdasarkan maklumat pembantu & majikan, cadangkan klausa khas yang relevan. ' +
        'Balas dalam JSON SAHAJA: {"specialClauses": ["klausa 1", "klausa 2"], "responsibilities": ["tanggungjawab tambahan"], "notes": "nota ringkas"}. ' +
        'Semua dalam Bahasa Melayu. Maksimum 4 klausa, 4 tanggungjawab.'

      const userPrompt = `MAKLMAT PEMBANTU:
- Nama: ${helper?.fullName || 'tidak diketahui'}
- Perkhidmatan: ${helper?.serviceType || helper?.desiredJob || 'Pembantu Rumah'}
- Kemahiran: ${[helper?.skills, helper?.otherSkills].filter(Boolean).join(', ') || 'umum'}
- Pengalaman: ${helper?.experience || 'tidak diketahui'}
- Agama: ${helper?.religion || 'tidak diketahui'}
- Lokasi: ${[helper?.city, helper?.state].filter(Boolean).join(', ') || 'Malaysia'}

MAKLUMAT MAJIKAN:
- Nama: ${employer?.fullName || 'tidak diketahui'}
- Perkhidmatan diperlukan: ${employer?.serviceType || booking?.serviceType || 'Pembantu Rumah'}
- Bilangan anak: ${employer?.numKids || 0}${employer?.kidsAges ? ` (umur: ${employer.kidsAges})` : ''}
- Gaji ditawarkan: RM${employer?.salaryOffered || booking?.salary || 'tidak diketahui'}
- Kriteria khusus: ${employer?.criteria || 'tiada'}
- Lokasi: ${[employer?.city, employer?.state].filter(Boolean).join(', ') || 'Malaysia'}

MAKLUMAT BOOKING:
- Mod: ${booking?.liveIn ? 'Live-in' : 'Back & Forth'}
- Tempoh: ${booking?.durationMonths || 12} bulan
- Permintaan khas: ${booking?.specialRequests || 'tiada'}

Cadangkan klausa khas yang sesuai untuk kontrak ini (contoh: jaga bayi, masak, larangan, keperluan khusus).`

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]
      const aiRes = await aiChat(messages, { temperature: 0.4, maxTokens: 800 })
      const parsed = parseAIJson<AIPersonalization>(aiRes.content)
      if (!parsed) return defaultResult

      return {
        specialClauses: Array.isArray(parsed.specialClauses)
          ? parsed.specialClauses.slice(0, 4)
          : [],
        responsibilities: Array.isArray(parsed.responsibilities)
          ? parsed.responsibilities.slice(0, 4)
          : [],
        notes: typeof parsed.notes === 'string' ? parsed.notes : '',
      }
    } catch {
      return defaultResult
    }
  }

  /**
   * Build contract content (similar style to /api/admin/contracts/generate but with
   * AI personalization appended).
   */
  private buildContractContent(
    type: ContractType,
    helper: any,
    employer: any,
    booking: any,
    personalization: AIPersonalization
  ): string {
    const today = new Date()
    const startDate = booking?.startDate || today
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + (booking?.durationMonths || 12))
    const salary = booking?.salary || employer?.salaryOffered || 1800

    const fmtDate = (d: Date) =>
      new Intl.DateTimeFormat('ms-MY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d)

    const fmtMYR = (amt: number) =>
      new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amt)

    const header = `
==============================================================
              PERJANJIAN KONTRAT PERKHIDMATAN
                    MIM PORTAL — ${COMPANY.brand}
==============================================================

${COMPANY.name}
(No. SSM: ${COMPANY.ssm})
${COMPANY.address}

Email: ${COMPANY.email}
Telefon: ${COMPANY.phone}
Laman Web: ${COMPANY.website}

Tarikh Kontrak: ${fmtDate(today)}
`.trim()

    const helperBlock = `
PIHAK KEDUA (PEMBANTU):
  Nama Penuh      : ${helper?.fullName || '[Nama Pembantu]'}
  No. IC          : ${helper?.ic || '[No. IC]'}
  No. Telefon     : ${helper?.phone || '[Telefon]'}
  Alamat          : ${[helper?.addressLine1, helper?.addressLine2, helper?.city, helper?.state, helper?.postalCode].filter(Boolean).join(', ') || '[Alamat]'}
  Jawatan         : ${helper?.serviceType || helper?.desiredJob || 'Pembantu Rumah'}
`.trim()

    const employerBlock = `
PIHAK KETIGA (MAJIKAN):
  Nama Penuh      : ${employer?.fullName || '[Nama Majikan]'}
  No. IC          : ${employer?.ic || '[No. IC]'}
  No. Telefon     : ${employer?.phone || '[Telefon]'}
  Alamat          : ${[employer?.addressLine1, employer?.addressLine2, employer?.city, employer?.state, employer?.postalCode].filter(Boolean).join(', ') || '[Alamat]'}
  Perkhidmatan    : ${employer?.serviceType || booking?.serviceType || '[Perkhidmatan]'}
`.trim()

    const agencyBlock = `
PIHAK PERTAMA (AGENSI):
  ${COMPANY.name}
  (No. SSM: ${COMPANY.ssm})
  ${COMPANY.address}
  Wakil: ${COMPANY.signatory} (Pengasas & Penerbit Prinsipal)
`.trim()

    const commonTerms = `
TERMA & SYARAT UMUM:

1. TEMPOH KONTRAK
   Kontrak ini berkuat kuasa selama ${booking?.durationMonths || 12} bulan,
   bermula dari ${fmtDate(startDate)} hingga ${fmtDate(endDate)}.

2. GAJI & PEMBAYARAN
   Gaji sebulan: ${fmtMYR(salary)}
   Gaji dibayar oleh Majikan kepada Pembantu pada setiap hujung bulan
   melalui pemindahan bank atau tunai. Agensi akan memantau pembayaran.

3. WAKTU KERJA
   - Live-in: 6:00 pagi - 10:00 malam (cuti Ahad & cuti umum)
   - Back & Forth: 8:00 pagi - 7:00 petang (cuti Ahad & cuti umum)
   - Cuti tahunan: 8 hari cuti berbayar setiap tahun kontrak

4. TANGGUNGJAWAB PEMBANTU
   - Melaksanakan tugas mengikut jenis perkhidmatan yang dipersetujui
   - Menjaga kerahsiaan maklumat majikan
   - Mematuhi peraturan rumah majikan
   - Melaporkan sebarang masalah kepada Agensi
${personalization.responsibilities.map((r) => `   - ${r}`).join('\n')}

5. TANGGUNGJAWAB MAJIKAN
   - Menyediakan tempat tinggal yang selesa (untuk Live-in)
   - Membayar gaji tepat pada masa
   - Memberikan cuti mengikut kontrak
   - Menjaga keselamatan & kebajikan pembantu

6. TANGGUNGJAWAB AGENSI
   - Memantau perjalanan kontrak
   - Menjadi orang tengah dalam penyelesaian masalah
   - Memberi latihan & sokongan berterusan kepada pembantu

7. PENTAMBATAN KONTRAK
   Kontrak ini boleh ditamatkan oleh mana-mana pihak dengan notis
   bertulis 30 hari terlebih dahulu. Sekiranya berlaku pelanggaran
   terma, pihak yang terkilan boleh menamatkan kontrak dengan notis
   7 hari.

8. KESIHATAN & KESELAMATAN
   - Pembantu dikehendaki menjalani pemeriksaan kesihatan & vaksinasi
   - Majikan bertanggungjawab memastikan persekitaran kerja selamat
   - Agensi menyimpan rekod perubatan pembantu

9. PENYELESAIAN PERKARA
   Sebarang perselisihan akan dirundingkan secara muafakat. Jika tidak
   selesai, ia akan dirujuk ke mahkamah Malaysia.

10. UMUM
    Kontrak ini terpakai selaras dengan Akta Pekerjaan 1955 dan
    undang-undang Malaysia yang berkaitan.
${personalization.specialClauses.length > 0 ? `\n11. KLAUSA KHAS\n${personalization.specialClauses.map((c, i) => `    ${i + 1}. ${c}`).join('\n')}` : ''}
${personalization.notes ? `\nNOTA: ${personalization.notes}` : ''}
`.trim()

    const signatureBlock = `
TANDATANGAN:

PIHAK PERTAMA (AGENSI)
${COMPANY.name}

_______________________________
${COMPANY.signatory}
Pengasas & Penerbit Prinsipal
Tarikh: _____________


PIHAK KEDUA (PEMBANTU)

_______________________________
${helper?.fullName || '[Nama Pembantu]'}
No. IC: ${helper?.ic || '_______________'}
Tarikh: _____________


PIHAK KETIGA (MAJIKAN)

_______________________________
${employer?.fullName || '[Nama Majikan]'}
No. IC: ${employer?.ic || '_______________'}
Tarikh: _____________

==============================================================
Kontrak ini dijana oleh MIM Portal (${COMPANY.brand})
Pertanyaan: ${COMPANY.phone} | ${COMPANY.email}
==============================================================
`.trim()

    const typeHeader: Record<ContractType, string> = {
      agency_helper: 'JENIS KONTRAK: PERJANJIAN ANTARA AGENSI DAN PEMBANTU',
      agency_employer: 'JENIS KONTRAK: PERJANJIAN ANTARA AGENSI DAN MAJIKAN',
      employer_helper: 'JENIS KONTRAK: PERJANJIAN ANTARA MAJIKAN DAN PEMBANTU',
    }

    const intro: Record<ContractType, string> = {
      agency_helper: `Perjanjian ini dibuat antara ${COMPANY.name} ("Agensi") dan ${helper?.fullName || 'Pembantu'} ("Pembantu") untuk menyediakan perkhidmatan penempatan & sokongan pembantu rumah/pengasuh/penjaga orang tua melalui portal MIM.`,
      agency_employer: `Perjanjian ini dibuat antara ${COMPANY.name} ("Agensi") dan ${employer?.fullName || 'Majikan'} ("Majikan") untuk penyediaan perkhidmatan pembantu rumah/pengasuh/penjaga orang tua melalui portal MIM.`,
      employer_helper: `Perjanjian ini dibuat antara ${employer?.fullName || 'Majikan'} ("Majikan") dan ${helper?.fullName || 'Pembantu'} ("Pembantu") dengan pemantauan ${COMPANY.name} ("Agensi").`,
    }

    const placementBlock =
      type === 'employer_helper'
        ? `\nBUTIRAN PENEMPATAN:\n  Jenis Perkhidmatan : ${booking?.serviceType || employer?.serviceType || '[Perkhidmatan]'}\n  Gaji Sebulan       : ${fmtMYR(salary)}\n  Tarikh Mula        : ${fmtDate(startDate)}\n  Tarikh Tamat       : ${fmtDate(endDate)}\n  Tempoh             : ${booking?.durationMonths || 12} bulan\n  Mod Kerja          : ${booking?.liveIn ? 'Live-in' : 'Back & Forth'}\n  Bilangan Anak      : ${employer?.numKids || 0}\n`
        : ''

    const partyOrder: Record<ContractType, string> = {
      agency_helper: `${agencyBlock}\n\n${helperBlock}`,
      agency_employer: `${agencyBlock}\n\n${employerBlock}`,
      employer_helper: `${employerBlock}\n\n${helperBlock}`,
    }

    return `
${header}

${typeHeader[type]}

${partyOrder[type]}

PENGENALAN:
${intro[type]}
${placementBlock}
${commonTerms}

${signatureBlock}
`.trim()
  }

  /**
   * Send WhatsApp to helper, employer, and admin when contracts are created.
   */
  private async notifyContractsCreated(booking: any): Promise<number> {
    let sent = 0
    const contractLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mim-portal.vercel.app'}/admin/contracts`

    const buildMsg = (name: string, role: 'helper' | 'employer' | 'admin') => {
      const roleLabel =
        role === 'helper' ? 'Pembantu' : role === 'employer' ? 'Majikan' : 'Admin'
      const otherParty =
        role === 'helper'
          ? `Majikan: ${booking.employer.fullName}`
          : role === 'employer'
          ? `Pembantu: ${booking.helper.fullName}`
          : `Pembantu: ${booking.helper.fullName}, Majikan: ${booking.employer.fullName}`
      return (
        `📋 Kontrak Baru MIM Portal\n\n` +
        `Hai ${name} (${roleLabel}),\n\n` +
        `3 kontrak telah dijana untuk penempatan ini:\n` +
        `• Agensi ↔ Pembantu\n` +
        `• Agensi ↔ Majikan\n` +
        `• Majikan ↔ Pembantu\n\n` +
        `Butiran:\n` +
        `${otherParty}\n` +
        `Gaji: RM${(booking.salary || booking.employer.salaryOffered || 1800).toLocaleString('ms-MY')}/bulan\n` +
        `Mod: ${booking.liveIn ? 'Live-in' : 'Back & Forth'}\n` +
        `Tempoh: ${booking.durationMonths || 12} bulan\n\n` +
        `Sila semak & tandatangani kontrak anda:\n` +
        `🔗 ${contractLink}\n\n` +
        `Kontrak perlu ditandatangani dalam 7 hari. Jika ada soalan, hubungi ${COMPANY.phone}.`
      )
    }

    // Helper
    if (booking.helper?.phone) {
      try {
        const r = await sendWhatsApp({
          to: booking.helper.phone,
          body: buildMsg(booking.helper.fullName, 'helper'),
        })
        if (r.success) sent++
      } catch {}
    }

    // Employer
    if (booking.employer?.phone) {
      try {
        const r = await sendWhatsApp({
          to: booking.employer.phone,
          body: buildMsg(booking.employer.fullName, 'employer'),
        })
        if (r.success) sent++
      } catch {}
    }

    // Admin (via company WhatsApp)
    try {
      const r = await sendWhatsApp({
        to: ADMIN_PHONE,
        body: buildMsg('Admin', 'admin'),
      })
      if (r.success) sent++
    } catch {}

    return sent
  }
}

// Register singleton
agentRegistry.register(new ContractAgent())

export { ContractAgent }
