/**
 * Setup endpoint - creates tables and seeds initial data.
 * Call this ONCE after deployment to initialize the database.
 * Usage: GET /api/setup?key=mim-setup-2026
 */
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(req: NextRequest) {
  const results: { step: string; status: string; message?: string }[] = []

  // Only allow with secret key
  const setupKey = req.nextUrl.searchParams.get('key')
  if (setupKey !== 'mim-setup-2026') {
    return NextResponse.json(
      { error: 'Unauthorized. Add ?key=mim-setup-2026 to setup.' },
      { status: 401 }
    )
  }

  const prisma = new PrismaClient()

  try {
    // Test connection
    try {
      await prisma.$queryRaw`SELECT 1`
      results.push({ step: 'Test connection', status: 'success' })
    } catch (e: any) {
      results.push({ step: 'Test connection', status: 'failed', message: e.message })
      return NextResponse.json({ results, error: 'Database connection failed' }, { status: 500 })
    }

    // Check if tables exist by trying to count admins
    let adminCount = 0
    try {
      adminCount = await prisma.admin.count()
      results.push({ step: 'Check tables', status: 'success', message: `Admins: ${adminCount}` })
    } catch (e: any) {
      results.push({ step: 'Check tables', status: 'failed', message: e.message })
      return NextResponse.json({
        results,
        error: 'Tables do not exist. The prisma db push in vercel-build.sh may have failed.',
        hint: 'Check Vercel build logs. DATABASE_URL must point to a PostgreSQL database with proper permissions.',
      }, { status: 500 })
    }

    // Seed admin
    try {
      await prisma.admin.upsert({
        where: { email: 'admin@mim.com.my' },
        update: {},
        create: {
          email: 'admin@mim.com.my',
          password: 'Admin@MIM2026',
          fullName: 'MIM Admin',
          role: 'super_admin',
        },
      })
      results.push({ step: 'Seed admin', status: 'success' })
    } catch (e: any) {
      results.push({ step: 'Seed admin', status: 'failed', message: e.message })
    }

    // Seed video courses
    const courses = [
      { title: 'Pengenalan Kerja Pembantu Rumah', description: 'Kursus asas untuk pembantu rumah baru.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Maid', durationMinutes: 15 },
      { title: 'Penjagaan Bayi & Kanak-kanak', description: 'Panduan menjaga bayi dan kanak-kanak.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Babysitter', durationMinutes: 25 },
      { title: 'Penjagaan Orang Tua', description: 'Asas penjagaan warga emas.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Caregiver', durationMinutes: 30 },
      { title: 'Kebersihan Diri & Keselamatan', description: 'Amalan kebersihan diri.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'General', durationMinutes: 20 },
      { title: 'Komunikasi dengan Majikan', description: 'Cara berkomunikasi dengan majikan.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'General', durationMinutes: 18 },
      { title: 'Pengurusan Masa & Jadual Kerja', description: 'Cara menguruskan masa.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'General', durationMinutes: 22 },
    ]
    try {
      for (const c of courses) {
        await prisma.videoCourse.create({ data: c })
      }
      results.push({ step: `Seed ${courses.length} video courses`, status: 'success' })
    } catch (e: any) {
      results.push({ step: 'Seed video courses', status: 'failed', message: e.message })
    }

    // Seed documents
    const docs = [
      { title: 'Soalan Lazim - Pembantu', docType: 'faq', content: 'Soalan lazim untuk pembantu rumah mengenai kerja, gaji, dan cuti.\n\n1. Berapakah gaji minimum?\n- Pembantu Rumah: RM1,500 - RM2,500\n- Pengasuh: RM1,500 - RM2,500\n- Penjaga Orang Tua: RM1,700 - RM3,500\n\n2. Bilakah hari cuti?\n- Cuti Ahad & Cuti Umum\n\n3. Bagaimana cara saya menerima gaji?\n- Gaji dibayar oleh majikan setiap bulan melalui admin MIM.\n\n4. Apa yang perlu saya buat jika ada masalah dengan majikan?\n- Hubungi admin MIM di 017-663 5990 (WhatsApp).' },
      { title: 'Soalan Lazim - Majikan', docType: 'faq', content: 'Soalan lazim untuk majikan.\n\n1. Bagaimana proses pengambilan pembantu?\n- Daftar online > Pilih pembantu > Temuduga Google Meet > Tandatangan kontrak > Mula kerja\n\n2. Berapakah yuran agensi?\n- Sila hubungi admin MIM.\n\n3. Bolehkah saya menukar pembantu?\n- Ya, hubungi admin.\n\n4. Bagaimana jika pembantu tidak hadir?\n- Laporan segera kepada admin.' },
      { title: 'Senarai Harga Perkhidmatan', docType: 'price', content: 'Senarai Harga Perkhidmatan MIM\n\nPembantu Rumah: RM1,500 - RM2,500/bulan\nPengasuh: RM1,500 - RM2,500/bulan\nPenjaga Orang Tua: RM1,700 - RM3,500/bulan\n\nYuran Agensi: Hubungi admin' },
      { title: 'Proses Pengambilan', docType: 'process', content: 'Proses Pengambilan MIM Portal\n\n1. Pendaftaran Online - auto-jana kredensial via WhatsApp\n2. Sediakan Profil - lengkapkan profil & gambar\n3. Tonton Video Kursus wajib\n4. Temuduga Google Meet (3 pihak)\n5. Tandatangan 3 Kontrak\n6. Mula Kerja mengikut jadual' },
    ]
    try {
      for (const d of docs) {
        await prisma.document.create({ data: d })
      }
      results.push({ step: `Seed ${docs.length} documents`, status: 'success' })
    } catch (e: any) {
      results.push({ step: 'Seed documents', status: 'failed', message: e.message })
    }

    // Seed sample helpers
    const helpers = [
      { fullName: 'Siti Aminah binti Abdullah', nickname: 'Siti', age: 28, religion: 'Islam', maritalStatus: 'Berkahwin', education: 'SPM', phone: '+60123456789', city: 'Kuala Lumpur', state: 'Kuala Lumpur', residencyState: 'Kuala Lumpur', workArea: 'Kuala Lumpur', canRelocate: true, serviceType: 'maid', liveIn: true, desiredJob: 'maid', skills: JSON.stringify(['cooking', 'cleaning', 'washing']), motivation: 'Saya ingin bekerja untuk menyokong keluarga.', experience: '3 tahun bekerja sebagai pembantu rumah.', email: 'siti.demo@mim.com.my', password: 'Demo@1234', status: 'active', rating: 4.8 },
      { fullName: 'Maria binti Santos', nickname: 'Maria', age: 32, religion: 'Kristian', maritalStatus: 'Bujang', education: 'Diploma', phone: '+60198765432', city: 'Petaling Jaya', state: 'Selangor', residencyState: 'Selangor', workArea: 'Selangor', canRelocate: false, serviceType: 'babysitter', backAndForth: true, desiredJob: 'babysitter', skills: JSON.stringify(['baby_care', 'child_care', 'educating']), childAges: JSON.stringify(['0-6', '12-17']), motivation: 'Saya suka menjaga kanak-kanak.', experience: '5 tahun sebagai pengasuh.', email: 'maria.demo@mim.com.my', password: 'Demo@1234', status: 'active', rating: 4.9 },
      { fullName: 'Rani a/p Kumaran', nickname: 'Rani', age: 35, religion: 'Hindu', maritalStatus: 'Berkahwin', education: 'SPM', phone: '+60112223344', city: 'Shah Alam', state: 'Selangor', residencyState: 'Selangor', workArea: 'Selangor', canRelocate: true, serviceType: 'caregiver', liveIn: true, desiredJob: 'caregiver', skills: JSON.stringify(['cooking', 'cleaning']), motivation: 'Saya ada pengalaman menjaga orang tua.', experience: '4 tahun sebagai penjaga orang tua.', email: 'rani.demo@mim.com.my', password: 'Demo@1234', status: 'active', rating: 4.7 },
      { fullName: 'Noraini binti Hasan', nickname: 'Nora', age: 26, religion: 'Islam', maritalStatus: 'Bujang', education: 'SPM', phone: '+60133445566', city: 'Johor Bahru', state: 'Johor', residencyState: 'Johor', workArea: 'Johor', canRelocate: true, serviceType: 'maid', canBoth: true, desiredJob: 'maid', skills: JSON.stringify(['cooking', 'cleaning', 'washing', 'baby_care']), motivation: 'Ingin membantu keluarga di kampung.', experience: '2 tahun pengalaman.', email: 'nora.demo@mim.com.my', password: 'Demo@1234', status: 'active', rating: 5.0 },
    ]
    try {
      for (const h of helpers) {
        const existing = await prisma.helper.findUnique({ where: { email: h.email } })
        if (!existing) {
          await prisma.helper.create({ data: h })
        }
      }
      results.push({ step: `Seed ${helpers.length} sample helpers`, status: 'success' })
    } catch (e: any) {
      results.push({ step: 'Seed helpers', status: 'failed', message: e.message })
    }

    // Seed sample employer
    try {
      const existing = await prisma.employer.findUnique({ where: { email: 'ahmad.demo@mim.com.my' } })
      if (!existing) {
        await prisma.employer.create({
          data: {
            fullName: 'Ahmad bin Yusof',
            phone: '+60155667788',
            email: 'ahmad.demo@mim.com.my',
            password: 'Demo@1234',
            city: 'Kuala Lumpur',
            state: 'Kuala Lumpur',
            serviceType: 'maid',
            numKids: 2,
            kidsAges: '5, 8',
            salaryOffered: 2000,
            criteria: 'Pembantu rumah yang pandai masak dan sabar dengan kanak-kanak.',
            status: 'active',
          },
        })
        results.push({ step: 'Seed sample employer', status: 'success' })
      } else {
        results.push({ step: 'Seed sample employer', status: 'skipped' })
      }
    } catch (e: any) {
      results.push({ step: 'Seed employer', status: 'failed', message: e.message })
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Database setup complete!',
      credentials: {
        admin: 'admin@mim.com.my / Admin@MIM2026',
        helper: 'siti.demo@mim.com.my / Demo@1234',
        employer: 'ahmad.demo@mim.com.my / Demo@1234',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ results, error: e.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
