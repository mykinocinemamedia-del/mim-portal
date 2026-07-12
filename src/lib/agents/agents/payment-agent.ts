/**
 * Payment Agent
 * ---------------
 * Tracks all payments, sends reminders before due date, flags overdue, generates
 * monthly statements. Auto-generates monthly Payment records for active contracts.
 *
 * Behavior:
 *   - Find payments with status 'pending' and dueDate approaching
 *   - 3 days before due: send reminder WhatsApp (WhatsAppTemplates.paymentReminder)
 *   - On due date: send final reminder
 *   - 1 day after due: mark as 'overdue', notify admin
 *   - 7 days after due: escalate to admin for manual intervention
 *   - Auto-generate monthly payment records for active contracts (1st of each month)
 *   - Generate monthly summary report for admin
 *
 * Monthly payment creation:
 *   - Find all active contracts (status 'active', signed by all 3)
 *   - For each: create Payment record with amount = contract's salary, dueDate = 1st of next month, status = 'pending'
 *
 * Schedule: Daily 8am
 */

import { BaseAgent, AgentContext, AgentRunResult, agentRegistry } from '@/lib/agents/core/base-agent'
import { sendWhatsApp, WhatsAppTemplates } from '@/lib/agents/integrations/whatsapp'
import { db } from '@/lib/db'

// Time windows
const DAY_MS = 24 * 60 * 60 * 1000
const REMINDER_BEFORE_DAYS = 3
const OVERDUE_AFTER_DAYS = 1
const ESCALATE_AFTER_DAYS = 7

const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Kino Studios Sdn. Bhd.',
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+6017-663 5990',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'hello@kino.my',
}

const ADMIN_PHONE = COMPANY.phone

class PaymentAgent extends BaseAgent {
  readonly name = 'payment_agent'
  readonly displayName = 'Payment Agent'
  readonly description =
    'Jejak semua pembayaran, hantar peringatan sebelum tarikh akhir, flag overdue, jana penyata bulanan & rekod pembayaran bulanan automatik untuk kontrak aktif.'
  readonly category = 'operations'
  readonly schedule = 'Daily 8am'

  protected async execute(context: AgentContext): Promise<AgentRunResult> {
    const stats = {
      paymentsScanned: 0,
      remindersSent: 0,
      finalRemindersSent: 0,
      overdueMarked: 0,
      escalatedCount: 0,
      monthlyPaymentsCreated: 0,
      whatsappSent: 0,
      errors: 0,
    }

    try {
      // Phase 1: Auto-generate monthly payment records for active contracts (1st of month)
      stats.monthlyPaymentsCreated = await this.generateMonthlyPayments(stats)

      // Phase 2: Send reminders for upcoming payments (3 days before due)
      const reminderResult = await this.sendUpcomingReminders(stats)
      stats.remindersSent = reminderResult.reminders
      stats.finalRemindersSent = reminderResult.finalReminders

      // Phase 3: Mark overdue payments (1 day after due, still pending)
      stats.overdueMarked = await this.markOverduePayments(stats)

      // Phase 4: Escalate severely overdue payments (7 days after due)
      stats.escalatedCount = await this.escalateOverduePayments(stats)

      // Phase 5: Generate monthly summary report for admin
      await this.generateMonthlySummaryReport()

      const summary =
        `Payment Agent: ${stats.paymentsScanned} pembayaran dijejak, ` +
        `${stats.remindersSent} peringatan awal (3 hari), ${stats.finalRemindersSent} peringatan akhir, ` +
        `${stats.overdueMarked} ditanda overdue, ${stats.escalatedCount} eskalasi (7 hari), ` +
        `${stats.monthlyPaymentsCreated} rekod pembayaran bulanan dijana. ` +
        `${stats.whatsappSent} WhatsApp berjaya. Errors: ${stats.errors}.`

      await this.notify({
        category: 'payment',
        severity: stats.escalatedCount > 0 ? 'warning' : 'info',
        title: 'Payment Agent Run Selesai',
        message: summary,
        actionUrl: '/admin/payments',
      })

      return { success: true, summary, data: stats }
    } catch (e: any) {
      return {
        success: false,
        summary: 'Payment Agent gagal dijalankan',
        error: e.message || String(e),
        data: stats,
      }
    }
  }

  /**
   * Phase 1: For each active contract, create a Payment record for the 1st of next month.
   * Uses notes field marker '[MONTHLY_GENERATED_{YYYY-MM}]' to avoid duplicates.
   */
  private async generateMonthlyPayments(stats: any): Promise<number> {
    let created = 0

    try {
      // Find all active contracts (status 'active') with salary information
      // We need to look at all 3 contracts per booking - but Payment.employerId & helperId
      // are denormalized. We use the contract's salary to create the monthly payment.
      const activeContracts = await db.contract.findMany({
        where: { status: 'active' },
        include: {
          helper: { select: { id: true, fullName: true, phone: true } },
          employer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              salaryOffered: true,
            },
          },
          booking: { select: { id: true, salary: true } },
        },
      })

      // Group by (employerId, helperId, bookingId) - we want only ONE payment per
      // active booking per month, not 3 (one per contract type).
      const uniqueBookings = new Map<string, typeof activeContracts[number]>()
      for (const c of activeContracts) {
        const key = `${c.employerId}_${c.helperId}_${c.bookingId}`
        if (!uniqueBookings.has(key)) uniqueBookings.set(key, c)
      }

      // Determine target month (1st of next month)
      const now = new Date()
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const targetMonthKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`
      const marker = `[MONTHLY_GENERATED_${targetMonthKey}]`

      for (const [, contract] of uniqueBookings) {
        try {
          if (!contract.employerId) continue

          // Check if payment for this month already exists (avoid duplicates)
          const existing = await db.payment.findFirst({
            where: {
              employerId: contract.employerId,
              helperId: contract.helperId,
              dueDate: nextMonth,
              notes: { contains: marker },
            },
          })
          if (existing) continue

          // Determine salary amount
          const salary =
            contract.booking?.salary ||
            contract.employer?.salaryOffered ||
            1800

          await db.payment.create({
            data: {
              employerId: contract.employerId,
              helperId: contract.helperId || null,
              amount: salary,
              dueDate: nextMonth,
              status: 'pending',
              method: null,
              notes: `Pembayaran bulanan auto-jana untuk ${targetMonthKey}. Kontrak: ${contract.id}. ${marker}`,
            },
          })
          created++
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'create_monthly_payment',
            status: 'error',
            input: JSON.stringify({ contractId: contract.id }),
            errorMessage: e.message || String(e),
          })
        }
      }

      if (created > 0) {
        await this.logActivity({
          action: 'generate_monthly_payments',
          status: 'success',
          input: JSON.stringify({ targetMonth: targetMonthKey }),
          output: JSON.stringify({ created }),
        })
      }
    } catch (e: any) {
      stats.errors++
      await this.logActivity({
        action: 'generate_monthly_payments',
        status: 'error',
        input: JSON.stringify({}),
        errorMessage: e.message || String(e),
      })
    }

    return created
  }

  /**
   * Phase 2: Send reminders for upcoming payments.
   *   - 3 days before due: first reminder
   *   - On due date: final reminder
   * Uses notes field markers to avoid duplicate reminders.
   */
  private async sendUpcomingReminders(stats: any): Promise<{
    reminders: number
    finalReminders: number
  }> {
    let reminders = 0
    let finalReminders = 0

    try {
      const now = new Date()
      const in3Days = new Date(now.getTime() + REMINDER_BEFORE_DAYS * DAY_MS)
      const endOf3DayWindow = new Date(now.getTime() + REMINDER_BEFORE_DAYS * DAY_MS + DAY_MS)

      // Find pending payments due in 3 days (3-day reminder)
      const upcomingPayments = await db.payment.findMany({
        where: {
          status: 'pending',
          dueDate: { gte: in3Days, lte: endOf3DayWindow },
          notes: { not: { contains: '[EARLY_REMINDER_SENT]' } },
        },
        include: {
          helper: { select: { id: true, fullName: true, phone: true } },
          employer: { select: { id: true, fullName: true, phone: true } },
        },
        take: 50,
      })

      stats.paymentsScanned += upcomingPayments.length

      for (const payment of upcomingPayments) {
        try {
          const dueDateStr = payment.dueDate
            ? payment.dueDate.toLocaleDateString('ms-MY', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : 'tidak diketahui'

          if (payment.employer?.phone) {
            const msg = WhatsAppTemplates.paymentReminder(
              payment.employer.fullName,
              payment.amount,
              dueDateStr,
              payment.helper?.fullName || 'Pembantu'
            )
            const r = await sendWhatsApp({
              to: payment.employer.phone,
              body: msg,
            })
            if (r.success) stats.whatsappSent++
          }

          // Mark reminder sent
          await db.payment.update({
            where: { id: payment.id },
            data: {
              notes: `${payment.notes || ''} [EARLY_REMINDER_SENT ${now.toISOString()}]`.trim(),
            },
          })

          reminders++

          await this.logActivity({
            action: 'send_payment_reminder',
            status: 'success',
            input: JSON.stringify({ paymentId: payment.id, type: 'early' }),
            output: JSON.stringify({ dueDate: dueDateStr, amount: payment.amount }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'send_payment_reminder',
            status: 'error',
            input: JSON.stringify({ paymentId: payment.id }),
            errorMessage: e.message || String(e),
          })
        }
      }

      // Find pending payments due TODAY (final reminder)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

      const dueTodayPayments = await db.payment.findMany({
        where: {
          status: 'pending',
          dueDate: { gte: startOfToday, lte: endOfToday },
          notes: { not: { contains: '[FINAL_REMINDER_SENT]' } },
        },
        include: {
          helper: { select: { id: true, fullName: true, phone: true } },
          employer: { select: { id: true, fullName: true, phone: true } },
        },
        take: 50,
      })

      stats.paymentsScanned += dueTodayPayments.length

      for (const payment of dueTodayPayments) {
        try {
          const dueDateStr = payment.dueDate
            ? payment.dueDate.toLocaleDateString('ms-MY', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : 'hari ini'

          if (payment.employer?.phone) {
            const finalMsg =
              `🚨 PERINGATAN AKHIR PEMBAYARAN\n\n` +
              `Hai ${payment.employer.fullName},\n\n` +
              `Pembayaran anda TAMAT HARI INI!\n\n` +
              `Butiran:\n` +
              `• Pembantu: ${payment.helper?.fullName || 'Pembantu'}\n` +
              `• Jumlah: RM${payment.amount.toLocaleString('ms-MY')}\n` +
              `• Tarikh akhir: ${dueDateStr}\n\n` +
              `Sila buat pembayaran SEGERA untuk mengelakkan status overdue.\n\n` +
              `Jika sudah dibayar, abaikan mesej ini. Terima kasih! 🙏`
            const r = await sendWhatsApp({
              to: payment.employer.phone,
              body: finalMsg,
            })
            if (r.success) stats.whatsappSent++
          }

          await db.payment.update({
            where: { id: payment.id },
            data: {
              notes: `${payment.notes || ''} [FINAL_REMINDER_SENT ${now.toISOString()}]`.trim(),
            },
          })

          finalReminders++

          await this.logActivity({
            action: 'send_payment_reminder',
            status: 'success',
            input: JSON.stringify({ paymentId: payment.id, type: 'final' }),
            output: JSON.stringify({ dueDate: dueDateStr, amount: payment.amount }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'send_payment_reminder',
            status: 'error',
            input: JSON.stringify({ paymentId: payment.id, type: 'final' }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return { reminders, finalReminders }
  }

  /**
   * Phase 3: Mark payments as 'overdue' if 1+ day past due and still pending.
   */
  private async markOverduePayments(stats: any): Promise<number> {
    let marked = 0

    try {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - OVERDUE_AFTER_DAYS * DAY_MS)

      const overduePayments = await db.payment.findMany({
        where: {
          status: 'pending',
          dueDate: { lt: oneDayAgo },
        },
        include: {
          helper: { select: { id: true, fullName: true } },
          employer: { select: { id: true, fullName: true, phone: true } },
        },
        take: 50,
      })

      for (const payment of overduePayments) {
        try {
          await db.payment.update({
            where: { id: payment.id },
            data: { status: 'overdue' },
          })
          marked++

          // Notify admin via in-app
          await this.notify({
            category: 'payment',
            severity: 'warning',
            title: 'Pembayaran Overdue',
            message: `Pembayaran RM${payment.amount.toLocaleString('ms-MY')} dari ${payment.employer?.fullName || 'majikan'} untuk ${payment.helper?.fullName || 'pembantu'} kini OVERDUE. Tarikh akhir: ${payment.dueDate?.toLocaleDateString('ms-MY') || 'tidak diketahui'}.`,
            actionUrl: '/admin/payments',
          })

          await this.logActivity({
            action: 'mark_overdue',
            status: 'success',
            input: JSON.stringify({ paymentId: payment.id }),
            output: JSON.stringify({ status: 'overdue' }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'mark_overdue',
            status: 'error',
            input: JSON.stringify({ paymentId: payment.id }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return marked
  }

  /**
   * Phase 4: Escalate severely overdue payments (7+ days past due) to admin via WhatsApp.
   */
  private async escalateOverduePayments(stats: any): Promise<number> {
    let escalated = 0

    try {
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - ESCALATE_AFTER_DAYS * DAY_MS)

      const severelyOverdue = await db.payment.findMany({
        where: {
          status: 'overdue',
          dueDate: { lt: sevenDaysAgo },
          notes: { not: { contains: '[ESCALATED]' } },
        },
        include: {
          helper: { select: { id: true, fullName: true, phone: true } },
          employer: { select: { id: true, fullName: true, phone: true } },
        },
        take: 30,
      })

      for (const payment of severelyOverdue) {
        try {
          // Escalate to admin via WhatsApp
          const escalateMsg =
            `🚨 ESKALASI: Pembayaran 7+ Hari Overdue\n\n` +
            `Pembayaran berikut telah overdue 7+ hari dan perlu tindakan manual:\n\n` +
            `• Majikan: ${payment.employer?.fullName || 'tidak diketahui'} (${payment.employer?.phone || 'tiada phone'})\n` +
            `• Pembantu: ${payment.helper?.fullName || 'tidak diketahui'}\n` +
            `• Jumlah: RM${payment.amount.toLocaleString('ms-MY')}\n` +
            `• Tarikh akhir: ${payment.dueDate?.toLocaleDateString('ms-MY') || 'tidak diketahui'}\n` +
            `• Payment ID: ${payment.id}\n\n` +
            `Sila hubungi majikan secara manual untuk tindakan susulan.\n\n— MIM Portal Payment Agent`

          try {
            await sendWhatsApp({ to: ADMIN_PHONE, body: escalateMsg })
            stats.whatsappSent++
          } catch {}

          // Mark escalated
          await db.payment.update({
            where: { id: payment.id },
            data: {
              notes: `${payment.notes || ''} [ESCALATED ${now.toISOString()}]`.trim(),
            },
          })

          escalated++

          await this.notify({
            category: 'payment',
            severity: 'critical',
            title: 'Eskalasi Pembayaran 7+ Hari Overdue',
            message: `Payment ${payment.id}: RM${payment.amount.toLocaleString('ms-MY')} dari ${payment.employer?.fullName} telah overdue 7+ hari. Perlu tindakan manual.`,
            actionUrl: '/admin/payments',
          })

          await this.logActivity({
            action: 'escalate_payment',
            status: 'success',
            input: JSON.stringify({ paymentId: payment.id }),
            output: JSON.stringify({ daysOverdue: ESCALATE_AFTER_DAYS }),
          })
        } catch (e: any) {
          stats.errors++
          await this.logActivity({
            action: 'escalate_payment',
            status: 'error',
            input: JSON.stringify({ paymentId: payment.id }),
            errorMessage: e.message || String(e),
          })
        }
      }
    } catch (e: any) {
      stats.errors++
    }

    return escalated
  }

  /**
   * Phase 5: Generate monthly summary report for admin.
   * Sends on the 1st of each month with stats for the previous month.
   */
  private async generateMonthlySummaryReport(): Promise<void> {
    try {
      const now = new Date()
      // Only run on the 1st of the month
      if (now.getDate() !== 1) return

      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

      const [paidCount, pendingCount, overdueCount, paidPayments] = await Promise.all([
        db.payment.count({
          where: {
            status: 'paid',
            paidDate: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
        db.payment.count({
          where: {
            status: 'pending',
            dueDate: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
        db.payment.count({
          where: {
            status: 'overdue',
            dueDate: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
        db.payment.findMany({
          where: {
            status: 'paid',
            paidDate: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
          select: { amount: true },
        }),
      ])

      const totalCollected = paidPayments.reduce((sum, p) => sum + p.amount, 0)
      const monthStr = startOfLastMonth.toLocaleDateString('ms-MY', {
        month: 'long',
        year: 'numeric',
      })

      const report =
        `📊 PENYATA BULANAN PEMBAYARAN — ${monthStr}\n\n` +
        `Jumlah dipungut: RM${totalCollected.toLocaleString('ms-MY')}\n` +
        `Bil. pembayaran berjaya: ${paidCount}\n` +
        `Bil. pembayaran tertunggak: ${pendingCount}\n` +
        `Bil. pembayaran overdue: ${overdueCount}\n\n` +
        `Sila semak /admin/payments untuk butiran penuh.\n\n` +
        `— MIM Portal Payment Agent`

      // Send report to admin via WhatsApp
      try {
        await sendWhatsApp({ to: ADMIN_PHONE, body: report })
      } catch {}

      await this.notify({
        category: 'payment',
        severity: 'info',
        title: `Penyata Bulanan ${monthStr} Dijana`,
        message: report,
        actionUrl: '/admin/payments',
      })

      await this.logActivity({
        action: 'generate_monthly_report',
        status: 'success',
        input: JSON.stringify({ month: monthStr }),
        output: JSON.stringify({
          totalCollected,
          paidCount,
          pendingCount,
          overdueCount,
        }),
      })
    } catch (e: any) {
      // Silent failure - report is non-critical
      await this.logActivity({
        action: 'generate_monthly_report',
        status: 'error',
        input: JSON.stringify({}),
        errorMessage: e.message || String(e),
      })
    }
  }
}

// Register singleton
agentRegistry.register(new PaymentAgent())

export { PaymentAgent }
