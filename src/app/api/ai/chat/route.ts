import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `Anda adalah Aida, AI assistant rasmi untuk MIM Portal (Maid In Malaysia) - platform perkhidmatan pembantu rumah Malaysia oleh Kino Studios Sdn. Bhd.

Anda ada akses ke database pembantu. Tugas anda:
1. Membantu pengguna (pembantu & majikan) dengan soalan tentang perkhidmatan MIM
2. Memberi maklumat tentang proses pendaftaran, temuduga, kontrak, dan pembayaran
3. Menjelaskan jenis perkhidmatan: Pembantu Rumah (RM1,500-2,500), Pengasuh (RM1,500-2,500), Penjaga Orang Tua (RM1,700-3,500)
4. Menggalakkan pengguna mendaftar di platform

Jika user tanya tentang cari pembantu / maid / pengasuh / penjaga:
1. Semak criteria yang user nyatakan (jenis perkhidmatan, kawasan, budget)
2. Query database untuk pembantu yang match (info disediakan dalam context di bawah)
3. Suggest 2-3 pembantu terbaik dengan nama, jenis perkhidmatan, rating, dan kawasan
4. Beritahu user boleh klik "Cari Pembantu" atau daftar di /employer/register untuk lihat profil lengkap

Format respons:
- Jika ada pembantu yang match: "Saya jumpa beberapa pembantu yang sesuai untuk anda:
  1. [Nama] - [Jenis Perkhidmatan] - Rating [X] - [Kawasan]
  2. [Nama] - [Jenis Perkhidmatan] - Rating [X] - [Kawasan]
  ..."
- Jika tiada pembantu yang match: "Maaf, tiada pembantu yang match criteria anda sekarang. Cuba ubah criteria atau daftar untuk dapatkan notifikasi apabila ada pembantu baru."

Maklumat syarikat:
- Syarikat: Kino Studios Sdn. Bhd. (SSM: 002138666-M)
- Brand: KinoCinema Media
- Email: hello@kino.my
- Telefon/WhatsApp: +6017-663 5990
- Website: www.kino.my
- Alamat: Ampang Jaya, Selangor Darul Ehsan, Malaysia
- Signatory: Mahadzir Hanafiah (Pengasas & Penerbit Prinsipal)

Proses pengambilan:
1. Pendaftaran online (auto-jana kredensial, dihantar via WhatsApp)
2. Lengkapkan profil & muat naik gambar
3. Tonton video kursus wajib
4. Temuduga Google Meet (3 pihak: pembantu, majikan, admin)
5. Tandatangan 3 kontrak: Agensi-Pembantu, Agensi-Majikan, Majikan-Pembantu
6. Mula kerja mengikut jadual

Jawab dalam Bahasa Melayu. Jadilah mesra, membantu, dan profesional. Jika soalan di luar skop MIM Portal, arahkan pengguna menghubungi admin melalui WhatsApp di +6017-663 5990.`

// Malaysian state keywords for matching in user messages
const STATE_KEYWORDS: Record<string, string[]> = {
  Johor: ['johor', 'jb', 'johor bahru', 'skudai', 'batu pahat', 'muar'],
  Kedah: ['kedah', 'alor setar', 'sungai petani'],
  Kelantan: ['kelantan', 'kota bharu', 'kota bahru'],
  'Kuala Lumpur': ['kuala lumpur', 'kl', 'cheras', 'setapak', 'wangsa maju', 'kepong', 'bukit bintang'],
  Labuan: ['labuan'],
  Melaka: ['melaka', 'malacca'],
  'Negeri Sembilan': ['negeri sembilan', 'seremban', 'port dickson', 'ns'],
  Pahang: ['pahang', 'kuantan', 'temerloh'],
  Perak: ['perak', 'ipoh', 'taiping'],
  Perlis: ['perlis', 'kangar'],
  'Pulau Pinang': ['pulau pinang', 'penang', 'georgetown', 'bukit mertajam', 'bayan baru'],
  Putrajaya: ['putrajaya'],
  Sabah: ['sabah', 'kota kinabalu', 'kk', 'tawau', 'sandakan'],
  Sarawak: ['sarawak', 'kuching', 'miri', 'sibu'],
  Selangor: ['selangor', 'shah alam', 'petaling jaya', 'pj', 'subang', 'klang', 'kajang', 'ampang', 'damansara', 'cheras'],
  Terengganu: ['terengganu', 'kuala terengganu', 'kt'],
}

// Service type keywords
const SERVICE_KEYWORDS: Record<string, string[]> = {
  maid: ['pembantu rumah', 'maid', 'pembantu', 'housemaid', 'cleaner'],
  babysitter: ['pengasuh', 'babysitter', 'nanny', 'asuh anak', 'jaga bayi', 'jaga kanak'],
  caregiver: ['penjaga orang tua', 'caregiver', 'penjaga warga emas', 'jaga orang tua', 'jaga warga emas', 'penjaga pesakit'],
}

interface HelperContext {
  contextText: string
}

/**
 * Parse the user message for any filtering criteria (state, service type),
 * then query the database for matching active helpers.
 * Returns a string of helper info to inject into the AI prompt context.
 */
async function buildHelperContext(message: string): Promise<HelperContext> {
  const lower = message.toLowerCase()

  // Detect states mentioned
  const matchedStates: string[] = []
  for (const [state, keywords] of Object.entries(STATE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      matchedStates.push(state)
    }
  }

  // Detect service types mentioned
  const matchedServices: string[] = []
  for (const [service, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      matchedServices.push(service)
    }
  }

  // If user is asking about finding helpers, query the DB
  const isHelperQuery =
    matchedServices.length > 0 ||
    matchedStates.length > 0 ||
    /cari|mencari|cari pembantu|ada pembantu|pembantu yang|saya perlu|saya nak|saya mahu|perlukan|tengok pembantu|senarai pembantu/.test(
      lower
    )

  if (!isHelperQuery) {
    return { contextText: '' }
  }

  try {
    // Build where clause with case-insensitive filtering
    const where: any = { status: 'active' }

    if (matchedServices.length > 0) {
      where.OR = matchedServices.map((s) => ({ serviceType: { contains: s, mode: 'insensitive' } }))
    }

    if (matchedStates.length > 0) {
      // Combine with existing OR if services also matched
      const stateFilter = matchedStates.map((s) => [
        { state: { contains: s, mode: 'insensitive' } },
        { city: { contains: s, mode: 'insensitive' } },
        { workArea: { contains: s, mode: 'insensitive' } },
        { residencyState: { contains: s, mode: 'insensitive' } },
      ]).flat()
      if (where.OR) {
        // Both service and state: use AND of two ORs
        where.AND = [
          { OR: where.OR },
          { OR: stateFilter },
        ]
        delete where.OR
      } else {
        where.OR = stateFilter
      }
    }

    const helpers = await db.helper.findMany({
      where,
      take: 8,
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        fullName: true,
        nickname: true,
        serviceType: true,
        rating: true,
        city: true,
        state: true,
        workArea: true,
        religion: true,
        liveIn: true,
        backAndForth: true,
        skills: true,
        experience: true,
        status: true,
      },
    })

    if (helpers.length === 0) {
      // Fallback: query general active helpers so Aida can still suggest
      const fallback = await db.helper.findMany({
        where: { status: 'active' },
        take: 5,
        orderBy: [{ rating: 'desc' }],
        select: {
          id: true,
          fullName: true,
          nickname: true,
          serviceType: true,
          rating: true,
          city: true,
          state: true,
          workArea: true,
          religion: true,
          liveIn: true,
          backAndForth: true,
        },
      })

      if (fallback.length === 0) {
        return {
          contextText:
            '\n\n[DATABASE INFO] Tiada pembantu aktif dalam database buat masa ini. Beritahu user kami sedang menambah pembantu baru dan ajak mereka daftar untuk dapatkan notifikasi.',
        }
      }

      const list = fallback
        .map(
          (h, i) =>
            `${i + 1}. ${h.fullName}${h.nickname ? ` (${h.nickname})` : ''} - ${h.serviceType || 'Pembantu Rumah'} - Rating: ${Number(h.rating).toFixed(1)} - ${[h.city, h.state].filter(Boolean).join(', ')}${h.liveIn ? ' [Live-in]' : ''}${h.backAndForth ? ' [Back & Forth]' : ''}`
        )
        .join('\n')

      return {
        contextText:
          `\n\n[DATABASE INFO] Tiada pembantu yang EXACT match criteria user (${matchedStates.length ? `Kawasan: ${matchedStates.join(', ')}; ` : ''}${matchedServices.length ? `Perkhidmatan: ${matchedServices.join(', ')}` : ''}). Tetapi ini adalah pembantu aktif lain yang mungkin menarik:\n${list}\n\nBeritahu user tiada exact match untuk criteria mereka, tetapi cadangkan pembantu di atas. Cadangkan juga user ubah criteria atau daftar untuk notifikasi pembantu baru.`,
      }
    }

    const list = helpers
      .map(
        (h, i) =>
          `${i + 1}. ${h.fullName}${h.nickname ? ` (${h.nickname})` : ''} - ${h.serviceType || 'Pembantu Rumah'} - Rating: ${Number(h.rating).toFixed(1)} - ${[h.city, h.state].filter(Boolean).join(', ')}${h.religion ? ` [${h.religion}]` : ''}${h.liveIn ? ' [Live-in]' : ''}${h.backAndForth ? ' [Back & Forth]' : ''}${h.experience ? ` - Exp: ${h.experience}` : ''}`
      )
      .join('\n')

    const criteriaSummary = [
      matchedStates.length ? `Kawasan: ${matchedStates.join(', ')}` : '',
      matchedServices.length ? `Perkhidmatan: ${matchedServices.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join(' | ')

    return {
      contextText:
        `\n\n[DATABASE INFO] Pembantu aktif yang match criteria user${criteriaSummary ? ` (${criteriaSummary})` : ''}:\n${list}\n\nGunakan maklumat ini untuk suggest 2-3 pembantu terbaik. Beritahu user boleh daftar di /employer/register untuk lihat profil lengkap & jalankan temuduga.`,
    }
  } catch (e) {
    console.error('Error querying helpers for AI context:', e)
    return { contextText: '' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Mesej diperlukan' }, { status: 400 })
    }

    // Build helper database context for the AI
    const { contextText } = await buildHelperContext(message)
    const dynamicSystemPrompt = SYSTEM_PROMPT + contextText

    // If no Groq API key, return canned response (still try to be useful)
    if (!GROQ_API_KEY) {
      if (contextText) {
        return NextResponse.json({
          reply: `Terima kasih! Berdasarkan soalan anda, saya cuba cari pembantu yang sesuai. Untuk lihat profil lengkap & jalankan temuduga, sila daftar di /employer/register.\n\nUntuk bantuan segera, hubungi admin MIM melalui WhatsApp di +6017-663 5990.`,
        })
      }
      return NextResponse.json({
        reply: `Terima kasih atas soalan anda! Untuk bantuan segera, sila hubungi admin MIM melalui WhatsApp di +6017-663 5990 atau email hello@kino.my. Kami sedia membantu anda dengan apa-apa pertanyaan tentang perkhidmatan MIM Portal.`,
      })
    }

    const messages = [
      { role: 'system', content: dynamicSystemPrompt },
      ...history.slice(-10).map((h: any) => ({
        role: h.role || 'user',
        content: h.content || h.message,
      })),
      { role: 'user', content: message },
    ]

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Groq API error:', err)
      return NextResponse.json({
        reply: `Maaf, saya tidak dapat memproses soalan anda sekarang. Sila hubungi admin MIM melalui WhatsApp di +6017-663 5990.`,
      })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || 'Maaf, saya tidak faham soalan anda.'

    return NextResponse.json({ reply })
  } catch (e: any) {
    console.error('AI chat error:', e)
    return NextResponse.json(
      { reply: 'Maaf, berlaku ralat. Sila cuba lagi atau hubungi admin melalui WhatsApp +6017-663 5990.' },
      { status: 500 }
    )
  }
}
