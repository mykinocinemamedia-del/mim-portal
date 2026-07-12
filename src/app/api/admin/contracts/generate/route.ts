import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

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
  website:
    process.env.NEXT_PUBLIC_COMPANY_WEBSITE || 'www.kino.my',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://mim-portal.vercel.app',
}

function formatMYR(amount: number | null | undefined): string {
  if (amount == null) return 'RM [Gaji]'
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function fmtDate(d: Date | string | null): string {
  if (!d) return '[Tarikh]'
  const date = typeof d === 'string' ? new Date(d) : d
  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function addMonths(date: Date | null, months: number | null): Date {
  const d = date ? new Date(date) : new Date()
  const m = months || 12
  d.setMonth(d.getMonth() + m)
  return d
}

function buildContract(
  type: string,
  helper: any,
  employer: any,
  booking: any
): string {
  const today = new Date()
  const startDate = booking?.startDate || today
  const endDate = addMonths(booking?.startDate, booking?.durationMonths)
  const salary = booking?.salary || helper?.desiredJob || 1800

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

1. TEMPoh KONTRAK
   Kontrak ini berkuat kuasa selama ${booking?.durationMonths || 12} bulan,
   bermula dari ${fmtDate(startDate)} hingga ${fmtDate(endDate)}.

2. GAJI & PEMBAYARAN
   Gaji sebulan: ${formatMYR(salary)}
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

  if (type === 'agency_helper') {
    return `
${header}

JENIS KONTRAK: PERJANJIAN ANTARA AGENSI DAN PEMBANTU

${agencyBlock}

${helperBlock}

PENGENALAN:
Perjanjian ini dibuat antara ${COMPANY.name} ("Agensi") dan
${helper?.fullName || 'Pembantu'} ("Pembantu") untuk menyediakan
perkhidmatan penempatan & sokongan pembantu rumah/pengasuh/penjaga
orang tua melalui portal MIM.

${commonTerms}

${signatureBlock}
`.trim()
  }

  if (type === 'agency_employer') {
    return `
${header}

JENIS KONTRAK: PERJANJIAN ANTARA AGENSI DAN MAJIKAN

${agencyBlock}

${employerBlock}

PENGENALAN:
Perjanjian ini dibuat antara ${COMPANY.name} ("Agensi") dan
${employer?.fullName || 'Majikan'} ("Majikan") untuk penyediaan
perkhidmatan pembantu rumah/pengasuh/penjaga orang tua melalui
portal MIM.

${commonTerms}

${signatureBlock}
`.trim()
  }

  if (type === 'employer_helper') {
    return `
${header}

JENIS KONTRAK: PERJANJIAN ANTARA MAJIKAN DAN PEMBANTU

${employerBlock}

${helperBlock}

PENGENALAN:
Perjanjian ini dibuat antara ${employer?.fullName || 'Majikan'}
("Majikan") dan ${helper?.fullName || 'Pembantu'} ("Pembantu")
dengan pemantauan ${COMPANY.name} ("Agensi").

BUTIRAN PENEMPATAN:
  Jenis Perkhidmatan : ${booking?.serviceType || employer?.serviceType || '[Perkhidmatan]'}
  Gaji Sebulan       : ${formatMYR(salary)}
  Tarikh Mula        : ${fmtDate(startDate)}
  Tarikh Tamat       : ${fmtDate(endDate)}
  Tempoh             : ${booking?.durationMonths || 12} bulan
  Mod Kerja          : ${booking?.liveIn ? 'Live-in' : 'Back & Forth'}
  Bilangan Anak      : ${employer?.numKids || 0}

${commonTerms}

${signatureBlock}
`.trim()
  }

  return `${header}\n\n[Unknown contract type: ${type}]`
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Tidak dibenarkan. Admin sahaja.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { contractType, helperId, employerId, bookingId } = body as {
      contractType: string
      helperId?: string
      employerId?: string
      bookingId?: string
    }

    if (!contractType) {
      return NextResponse.json(
        { error: 'contractType diperlukan' },
        { status: 400 }
      )
    }

    const validTypes = ['agency_helper', 'agency_employer', 'employer_helper']
    if (!validTypes.includes(contractType)) {
      return NextResponse.json(
        { error: 'Jenis kontrak tidak sah' },
        { status: 400 }
      )
    }

    const [helper, employer, booking] = await Promise.all([
      helperId ? db.helper.findUnique({ where: { id: helperId } }) : null,
      employerId
        ? db.employer.findUnique({ where: { id: employerId } })
        : null,
      bookingId
        ? db.booking.findUnique({ where: { id: bookingId } })
        : null,
    ])

    // For employer_helper, both helper and employer required
    if (contractType === 'employer_helper' && (!helper || !employer)) {
      return NextResponse.json(
        { error: 'Pembantu dan majikan diperlukan untuk kontrak ini' },
        { status: 400 }
      )
    }
    if (contractType === 'agency_helper' && !helper) {
      return NextResponse.json(
        { error: 'Pembantu diperlukan untuk kontrak ini' },
        { status: 400 }
      )
    }
    if (contractType === 'agency_employer' && !employer) {
      return NextResponse.json(
        { error: 'Majikan diperlukan untuk kontrak ini' },
        { status: 400 }
      )
    }

    const content = buildContract(contractType, helper, employer, booking)

    const startDate = booking?.startDate || new Date()
    const durationMonths = booking?.durationMonths || 12
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + durationMonths)

    const contract = await db.contract.create({
      data: {
        contractType,
        helperId: helper?.id || null,
        employerId: employer?.id || null,
        bookingId: booking?.id || null,
        content,
        status: 'draft',
        startDate,
        endDate,
      },
    })

    // Notify parties
    if (helper) {
      await db.notification.create({
        data: {
          userId: helper.id,
          userType: 'helper',
          helperId: helper.id,
          title: 'Kontrak Baru Dijana',
          message: `Kontrak ${contractType.replace('_', ' ')} telah dijana. Sila semak dan tandatangan.`,
          link: '/helper/contract',
        },
      })
    }
    if (employer) {
      await db.notification.create({
        data: {
          userId: employer.id,
          userType: 'employer',
          employerId: employer.id,
          title: 'Kontrak Baru Dijana',
          message: `Kontrak ${contractType.replace('_', ' ')} telah dijana. Sila semak dan tandatangan.`,
          link: '/employer/contract',
        },
      })
    }

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        content: contract.content,
        status: contract.status,
      },
    })
  } catch (e: any) {
    console.error('Contract generate error:', e)
    return NextResponse.json(
      { error: e.message || 'Ralat semasa menjana kontrak' },
      { status: 500 }
    )
  }
}
