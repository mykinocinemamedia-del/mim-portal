/**
 * Schedule Agent
 * ----------------
 * Auto-generates work schedules for matched helper-employer pairs. Handles changes.
 * Sends daily WhatsApp reminders to helpers with their schedule for the day.
 *
 * Behavior:
 *   - For each active booking (status='confirmed', contract 'active'):
 *     - Generate weekly schedule (Monday-Sunday)
 *     - If live-in: work Mon-Sat 7am-7pm, Sunday off
 *     - If back-and-forth: work Mon-Sat 8am-7pm, Sunday off
 *     - Store in `Schedule` table
 *   - Daily at 7am: send WhatsApp reminder to helper with today's schedule
 *   - Handle public holidays (mock: check against Malaysian holiday list)
 *   - Allow schedule change requests (store as notification for admin approval)
 *
 * Schedule: Daily 6am (generate weekly) + Daily 7am (reminders)
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { sendWhatsApp } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

// Scheduling constants
const LIVE_IN_START = '07:00'
const LIVE_IN_END = '19:00'
const BACK_FORTH_START = '08:00'
const BACK_FORTH_END = '19:00'
const WEEK_AHEAD_DAYS = 7
const MAX_BOOKINGS_PER_RUN = 20

// Malaysian public holidays (mock - 2024/2025 fixed list)
// Key: YYYY-MM-DD -> holiday name
const MALAYSIAN_HOLIDAYS: Record<string, string> = {
  '2024-01-01': 'Tahun Baru',
  '2024-01-25': 'Thaipusam',
  '2024-02-01': 'Hari Wilayah',
  '2024-02-10': 'Tahun Baru Cina',
  '2024-02-11': 'Tahun Baru Cina (hari ke-2)',
  '2024-04-10': 'Hari Raya Aidilfitri',
  '2024-04-11': 'Hari Raya Aidilfitri (hari ke-2)',
  '2024-05-01': 'Hari Pekerja',
  '2024-05-22': 'Wesak Day',
  '2024-06-02': 'Agong Birthday',
  '2024-06-17': 'Hari Raya Haji',
  '2024-07-07': 'Awal Muharram',
  '2024-08-31': 'Hari Kebangsaan',
  '2024-09-16': 'Hari Malaysia',
  '2024-09-17': 'Nabi Muhammad SAW',
  '2024-11-02': 'Deepavali',
  '2024-12-25': 'Hari Krismas',
  '2025-01-01': 'Tahun Baru',
  '2025-01-27': 'Thaipusam',
  '2025-01-29': 'Tahun Baru Cina',
  '2025-01-30': 'Tahun Baru Cina (hari ke-2)',
  '2025-03-31': 'Hari Raya Aidilfitri',
  '2025-04-01': 'Hari Raya Aidilfitri (hari ke-2)',
  '2025-05-01': 'Hari Pekerja',
  '2025-05-12': 'Wesak Day',
  '2025-06-02': 'Agong Birthday',
  '2025-06-07': 'Hari Raya Haji',
  '2025-07-06': 'Tahun Baru Islam',
  '2025-08-31': 'Hari Kebangsaan',
  '2025-09-05': 'Nabi Muhammad SAW',
  '2025-09-16': 'Hari Malaysia',
  '2025-10-20': 'Deepavali',
  '2025-12-25': 'Hari Krismas',
}

const COMPANY = {
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+6017-663 5990',
}

class ScheduleAgent extends BaseAgent {
  readonly name = 'schedule_agent'
  readonly displayName = 'Schedule Agent'
  readonly description =
    'Jana jadual kerja mingguan untuk pembantu-majikan yang dipadankan, hantar peringatan harian 7am, urus cuti umum Malaysia & permintaan ubah jadual.'
  readonly category = 'operations'
  readonly schedule = 'Daily 6am (generate weekly) + Daily 7am (reminders)'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      bookingsScanned: 0,
      schedulesGenerated: 0,
      remindersSent: 0,
      holidaysHandled: 0,
      changeRequests: 0,
      whatsappSent: 0,
      errors: 0,
    }

    try {
      // Phase 1: Generate weekly schedules for active bookings (no schedules yet for upcoming week)
      const generateResult = await this.generateWeeklySchedules(stats)
      stats.schedulesGenerated = generateResult

      // Phase 2: Send today's schedule reminders to helpers (7am)
      const reminderResult = await this.sendDailyReminders(stats)
      stats.remindersSent = reminderResult

      const summary =
        `Schedule Agent: ${stats.bookingsScanned} tempahan aktif diimbas, ` +
        `${stats.schedulesGenerated} jadual mingguan dijana, ${stats.remindersSent} peringatan harian dihantar, ` +
        `${stats.holidaysHandled} cuti umum diurus, ${stats.changeRequests} permintaan ubah. ` +
        `${stats.whatsappSent} WhatsApp berjaya. Errors: ${stats.errors}.`

      await this.notify({
        category: 'operations',
        severity: 'info',
        title: 'Schedule Agent Run Selesai',
        message: summary,
        actionUrl: '/admin/schedule',
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'Schedule Agent gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Phase 1: Generate weekly schedules for active bookings that don't yet have
   * schedules for the upcoming week.
   */
  private async generateWeeklySchedules(stats: any): Promise<number> {
    let generated = 0

    try {
      // Find confirmed bookings where at least one contract is 'active'
      // (i.e., the placement has officially started).
      const activeBookings = await db.booking.findMany({
        where: {
          status: { in: ['confirmed', 'active'] },
          contracts: { some: { status: 'active' } },
        },
        include: {
          helper: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              nickname: true,
              serviceType: true,
            },
          },
          employer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              state: true,
              city: true,
            },
          },
          contracts: {
            where: { status: 'active' },
            select: { id: true, contractType: true },
            take: 1,
          },
        },
        take: MAX_BOOKINGS_PER_RUN,
      })

      stats.bookingsScanned = activeBookings.length

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const booking of activeBookings) {
        try {
          // Check what dates already have schedules for this helper-employer pair
          // within the next WEEK_AHEAD_DAYS days
          const weekAheadEnd = new Date(today)
          weekAheadEnd.setDate(weekAheadEnd.getDate() + WEEK_AHEAD_DAYS - 1)

          const existingSchedules = await db.schedule.findMany({
            where: {
              helperId: booking.helperId,
              employerId: booking.employerId,
              workDate: { gte: today, lte: weekAheadEnd },
            },
            select: { workDate: true },
          })

          const existingDates = new Set(
            existingSchedules.map((s) => s.workDate.toISOString().split('T')[0])
          )

          // Determine work hours based on liveIn flag
          const isLiveIn = booking.liveIn
          const workStart = isLiveIn ? LIVE_IN_START : BACK_FORTH_START
          const workEnd = isLiveIn ? LIVE_IN_END : BACK_FORTH_END

          // Generate schedules for the next 7 days
          for (let i = 0; i < WEEK_AHEAD_DAYS; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() + i)
            const dateKey = date.toISOString().split('T')[0]

            // Skip if schedule already exists for this date
            if (existingDates.has(dateKey)) continue

            const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
            const isSunday = dayOfWeek === 0
            const holidayName = MALAYSIAN_HOLIDAYS[dateKey]

            // Sunday or public holiday = day off
            const isDayOff = isSunday || !!holidayName

            let notes = ''
            if (holidayName) {
              notes = `Cuti umum: ${holidayName}`
              stats.holidaysHandled++
            } else if (isSunday) {
              notes = 'Cuti mingguan (Ahad)'
            }

            await db.schedule.create({
              data: {
                helperId: booking.helperId,
                employerId: booking.employerId,
                workDate: date,
                startTime: isDayOff ? null : workStart,
                endTime: isDayOff ? null : workEnd,
                isDayOff,
                notes: notes || null,
              },
            })
            generated++
          }

          await this.logActivity({
            action: 'generate_weekly_schedule',
            status: 'success',
            input: JSON.stringify({
              bookingId: booking.id,
              helperName: booking.helper.fullName,
              employerName: booking.employer.fullName,
            }),
            output: JSON.stringify({
              weekAhead: WEEK_AHEAD_DAYS,
              liveIn: booking.liveIn,
              workStart,
              workEnd,
            }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'generate_weekly_schedule',
            status: 'error',
            input: JSON.stringify({ bookingId: booking.id }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
      await this.logActivity({
        action: 'generate_weekly_schedules_scan',
        status: 'error',
        input: JSON.stringify({}),
        errorMessage: e.message || String(e),
      })
    }

    return generated
  }

  /**
   * Phase 2: Send WhatsApp reminder to each helper with today's schedule.
   */
  private async sendDailyReminders(stats: any): Promise<number> {
    let sent = 0

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Find all schedules for today, include helper & employer
      const todaysSchedules = await db.schedule.findMany({
        where: {
          workDate: { gte: today, lt: tomorrow },
        },
        include: {
          helper: { select: { id: true, fullName: true, phone: true, nickname: true } },
          employer: { select: { id: true, fullName: true, city: true, state: true } },
        },
        take: 100,
      })

      for (const schedule of todaysSchedules) {
        try {
          if (!schedule.helper?.phone) continue

          const dateStr = today.toLocaleDateString('ms-MY', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })

          const helperName =
            schedule.helper.nickname || schedule.helper.fullName.split(' ')[0]
          const employerName = schedule.employer?.fullName || 'majikan'
          const employerLoc = [schedule.employer?.city, schedule.employer?.state]
            .filter(Boolean)
            .join(', ')

          let body: string
          if (schedule.isDayOff) {
            const offReason = schedule.notes?.includes('Cuti umum')
              ? `Cuti umum: ${schedule.notes?.replace('Cuti umum: ', '')}`
              : 'Cuti mingguan (Ahad)'
            body =
              `🌸 Hari Cuti!\n\n` +
              `Hai ${helperName},\n\n` +
              `Hari ini (${dateStr}) adalah ${offReason}.\n` +
              `Anda TIDAK perlu bekerja hari ini. Selamat rehat! 😊\n\n` +
              `Majikan: ${employerName}${employerLoc ? ` (${employerLoc})` : ''}\n\n` +
              `— MIM Portal Schedule Agent`
          } else {
            body =
              `📅 Peringatan Jadual Hari Ini\n\n` +
              `Hai ${helperName},\n\n` +
              `Tarikh: ${dateStr}\n` +
              `Waktu kerja: ${schedule.startTime} - ${schedule.endTime}\n` +
              `Majikan: ${employerName}${employerLoc ? ` (${employerLoc})` : ''}\n` +
              `${schedule.notes ? `Nota: ${schedule.notes}\n` : ''}` +
              `\nSila hadir tepat pada masa. Jika perlu ubah jadual, hubungi admin:\n` +
              `WhatsApp: ${COMPANY.phone}\n\n` +
              `Semoga harimu berjalan lancar! 💪\n\n` +
              `— MIM Portal Schedule Agent`
          }

          const r = await sendWhatsApp({
            to: schedule.helper.phone,
            body,
          })

          if (r.success) {
            sent++
            stats.whatsappSent++
          }

          await this.logActivity({
            action: 'send_schedule_reminder',
            status: r.success ? 'success' : 'error',
            input: JSON.stringify({
              helperId: schedule.helper.id,
              scheduleId: schedule.id,
              isDayOff: schedule.isDayOff,
            }),
            output: JSON.stringify({ method: r.method, error: r.error }),
            errorMessage: r.error,
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'send_schedule_reminder',
            status: 'error',
            input: JSON.stringify({ scheduleId: schedule.id }),
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
   * Handle a schedule change request (called externally, e.g., from a chat handler).
   * Stores the request as an admin notification for approval.
   */
  async requestScheduleChange(params: {
    helperId?: string
    employerId?: string
    requestedBy: 'helper' | 'employer'
    requestDate: Date
    reason: string
    proposedStartTime?: string
    proposedEndTime?: string
  }): Promise<void> {
    try {
      // Find the relevant schedule
      const schedule = await db.schedule.findFirst({
        where: {
          workDate: params.requestDate,
          ...(params.helperId ? { helperId: params.helperId } : {}),
          ...(params.employerId ? { employerId: params.employerId } : {}),
        },
        include: {
          helper: { select: { fullName: true, phone: true } },
          employer: { select: { fullName: true, phone: true } },
        },
      })

      const dateStr = params.requestDate.toLocaleDateString('ms-MY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

      const requesterName =
        params.requestedBy === 'helper'
          ? schedule?.helper?.fullName || 'Pembantu'
          : schedule?.employer?.fullName || 'Majikan'

      const message =
        `Permintaan ubah jadual dari ${params.requestedBy} (${requesterName})\n\n` +
        `Tarikh: ${dateStr}\n` +
        `Waktu dicadang: ${params.proposedStartTime || 'tidak ditentukan'} - ${params.proposedEndTime || 'tidak ditentukan'}\n` +
        `Alasan: ${params.reason || 'tidak dinyatakan'}\n` +
        `Schedule ID: ${schedule?.id || 'tidak dijumpai'}`

      await this.notify({
        category: 'operations',
        severity: 'warning',
        title: `Permintaan Ubah Jadual (${params.requestedBy})`,
        message,
        actionUrl: '/admin/schedule',
      })

      // Also send WhatsApp to admin
      try {
        await sendWhatsApp({
          to: COMPANY.phone,
          body: `🔔 Permintaan Ubah Jadual\n\n${message}\n\nSila semak di dashboard admin untuk kelulusan.`,
        })
      } catch {}

      await this.logActivity({
        action: 'schedule_change_request',
        status: 'success',
        input: JSON.stringify(params),
        output: JSON.stringify({ notifiedAdmin: true }),
      })
    } catch (e: any) {
      await this.logActivity({
        action: 'schedule_change_request',
        status: 'error',
        input: JSON.stringify(params),
        errorMessage: e.message || String(e),
      })
    }
  }
}

// Register singleton
agentRegistry.register(new ScheduleAgent())

export { ScheduleAgent }
