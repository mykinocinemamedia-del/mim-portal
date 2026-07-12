/**
 * WhatsApp Business API Integration
 * Supports: Twilio WhatsApp API, wa.me links (fallback)
 *
 * For production: Set up Twilio WhatsApp Business API
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_WHATSAPP_FROM (e.g., "whatsapp:+14155238886")
 *
 * Without Twilio credentials, falls back to wa.me links.
 */

export interface WhatsAppMessage {
  to: string
  body: string
  mediaUrl?: string
  template?: {
    name: string
    params: string[]
  }
}

export interface WhatsAppResult {
  success: boolean
  messageId?: string
  waLink?: string
  error?: string
  method: 'twilio' | 'wa.me'
}

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || ''
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || ''
const TWILIO_FROM = process.env.TWILIO_WHATSAPP_FROM || ''

/**
 * Send a WhatsApp message.
 * If Twilio credentials available → sends via API.
 * Otherwise → returns wa.me link for manual send.
 */
export async function sendWhatsApp(msg: WhatsAppMessage): Promise<WhatsAppResult> {
  const cleanPhone = msg.to.replace(/[^0-9]/g, '')

  if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
    try {
      const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64')
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: TWILIO_FROM,
            To: `whatsapp:+${cleanPhone}`,
            Body: msg.body,
            ...(msg.mediaUrl ? { MediaUrl: msg.mediaUrl } : {}),
          }),
        }
      )

      if (!res.ok) {
        const err = await res.text()
        return {
          success: false,
          error: `Twilio error: ${err.slice(0, 200)}`,
          method: 'twilio',
        }
      }

      const data = await res.json()
      return {
        success: true,
        messageId: data.sid,
        method: 'twilio',
      }
    } catch (e: any) {
      return {
        success: false,
        error: e.message,
        method: 'twilio',
      }
    }
  }

  // Fallback: wa.me link
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg.body)}`
  return {
    success: true,
    waLink,
    method: 'wa.me',
  }
}

/**
 * Send bulk WhatsApp messages.
 */
export async function sendBulkWhatsApp(
  messages: WhatsAppMessage[]
): Promise<WhatsAppResult[]> {
  const results: WhatsAppResult[] = []
  // Rate limit: 1 message per second to avoid being flagged
  for (const msg of messages) {
    const result = await sendWhatsApp(msg)
    results.push(result)
    await new Promise((r) => setTimeout(r, 1000))
  }
  return results
}

/**
 * Template message generators.
 */
export const WhatsAppTemplates = {
  newLeadOutreach: (name: string, type: 'helper' | 'employer') => {
    if (type === 'helper') {
      return `Hai ${name}! 👋

Saya dari MIM Portal (Maid In Malaysia), platform perkhidmatan pembantu rumah oleh Kino Studios Sdn. Bhd.

Kami nampak anda mungkin berminat untuk bekerja sebagai pembantu rumah/pengasuh. Kami ada banyak peluang kerja dengan gaji RM1,500 - RM3,500 sebulan!

✅ Pendaftaran percuma
✅ Latihan disediakan
✅ Kontrak sah & terjamin
✅ Sokongan admin 24/7

Boleh saya kongsi maklumat lanjut? Atau reply "DAFTAR" untuk mula! 🚀`
    }
    return `Hai ${name}! 👋

Saya dari MIM Portal (Maid In Malaysia), platform carian pembantu rumah yang dipercayai oleh Kino Studios Sdn. Bhd.

Kami ada 500+ pembantu rumah, pengasuh & penjaga orang tua yang tersedia untuk keluarga anda!

✅ Background check dilakukan
✅ Latihan & penilaian tersedia
✅ Kontrak sah & terjamin
✅ Gaji RM1,500 - RM3,500 mengikut jenis perkhidmatan

Boleh saya bantu cari pembantu yang sesuai untuk keluarga anda? 🏠`
  },

  referral: (referrerName: string, reward: string) => {
    return `Hai ${referrerName}! 👋

Anda telah menjadi sebahagian daripada keluarga MIM Portal. Kami ingin berkongsi program rujukan (referral) kami dengan anda!

🎁 REWARD: ${reward}

Cara untuk dapatkan reward:
1. Kenalan sesiapa yang cari kerja sebagai pembantu?
2. Atau kenalan sesiapa yang cari pembantu rumah?

Hantar nombor WhatsApp mereka kepada kami. Jika mereka berjaya mendaftar & bekerja, anda dapat reward!

Reply "RUJUK" untuk mula berkongsi kenalan. 🤝`
  },

  onboarding: (name: string, step: string) => {
    return `Hai ${name}! Selamat datang ke MIM Portal! 🎉

${step}

Untuk mula, sila jawab soalan berikut:
Nama penuh anda?

(Taip "SKIP" jika anda mahu daftar kemudian)`
  },

  paymentReminder: (
    name: string,
    amount: number,
    dueDate: string,
    helperName: string
  ) => {
    return `Hai ${name}, peringatan pembayaran MIM Portal! 💳

Butiran pembayaran:
- Pembantu: ${helperName}
- Jumlah: RM${amount.toLocaleString('ms-MY')}
- Tarikh akhir: ${dueDate}

Sila buat pembayaran sebelum tarikh akhir untuk mengelakkan kelewatan.

Jika sudah dibayar, abaikan mesej ini. Terima kasih! 🙏`
  },

  contractExpiry: (name: string, expiryDate: string, helperName: string) => {
    return `Hai ${name}, peringatan kontrak MIM Portal! 📋

Kontrak anda dengan ${helperName} akan tamat pada:
${expiryDate}

Untuk memperbaharui kontrak, sila hubungi admin kami:
- WhatsApp: +6017-663 5990
- Email: hello@kino.my

Atau reply "PERBAHARUI" untuk proses pembaharuan automatik. 🔄`
  },

  feedback: (name: string, period: string, helperName: string) => {
    return `Hai ${name}! 

Ia dah ${period} sejak ${helperName} mula bekerja dengan anda. Kami nak tahu pengalaman anda sejauh ini.

Scale 1-5, berapa puas hati anda? (5 = sangat puas hati)
Reply: [nombor] + komen anda

Contoh: "4 - Pembantu sangat baik, tapi kadang-kadang lambat"

Maklum balas anda membantu kami improve servis! 🌟`
  },

  interviewScheduled: (
    name: string,
    date: string,
    time: string,
    meetUrl: string,
    otherParty: string
  ) => {
    return `Hai ${name}! Temuduga MIM Portal dijadualkan! 📅

Butiran temuduga:
- Tarikh: ${date}
- Masa: ${time}
- Dengan: ${otherParty}
- Google Meet: ${meetUrl}

Sila hadir 5 minit awal. Jika perlu ubah waktu, reply "UBAH".

Jumpa di temuduga nanti! 🤝`
  },
}
