/**
 * Seed initial data: admin user, video courses, FAQ documents, sample helpers.
 */
import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding MIM Portal database...')

  // 1. Admin user
  const admin = await db.admin.upsert({
    where: { email: 'admin@mim.com.my' },
    update: {},
    create: {
      email: 'admin@mim.com.my',
      password: 'Admin@MIM2026',
      fullName: 'MIM Admin',
      role: 'super_admin',
    },
  })
  console.log(`✓ Admin: ${admin.email}`)

  // 2. Video courses
  const courses = [
    {
      title: 'Pengenalan Kerja Pembantu Rumah',
      description: 'Kursus asas untuk pembantu rumah baru. Mempelajari tanggungjawab utama, etika kerja, dan piawaian profesional.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      category: 'Maid',
      durationMinutes: 15,
    },
    {
      title: 'Penjagaan Bayi & Kanak-kanak',
      description: 'Panduan lengkap menjaga bayi dan kanak-kanak termasuk penyusuan, mandi, dan keselamatan.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      category: 'Babysitter',
      durationMinutes: 25,
    },
    {
      title: 'Penjagaan Orang Tua',
      description: 'Asas penjagaan warga emas - kebersihan, pemakanan, dan sokongan emosi.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      category: 'Caregiver',
      durationMinutes: 30,
    },
    {
      title: 'Kebersihan Diri & Keselamatan',
      description: 'Amalan kebersihan diri dan keselamatan di tempat kerja.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      category: 'General',
      durationMinutes: 20,
    },
    {
      title: 'Komunikasi dengan Majikan',
      description: 'Cara berkomunikasi dengan baik dan profesional dengan majikan.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      category: 'General',
      durationMinutes: 18,
    },
    {
      title: 'Pengurusan Masa & Jadual Kerja',
      description: 'Cara menguruskan masa dan mengikut jadual kerja dengan cekap.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      category: 'General',
      durationMinutes: 22,
    },
  ]

  for (const c of courses) {
    await db.videoCourse.create({ data: c })
  }
  console.log(`✓ ${courses.length} video courses`)

  // 3. Documents
  const docs = [
    {
      title: 'Soalan Lazim - Pembantu',
      docType: 'faq',
      content: `Soalan Lazim untuk Pembantu

1. Berapakah gaji minimum?
- Pembantu Rumah: RM1,500 - RM2,500
- Pengasuh: RM1,500 - RM2,500
- Penjaga Orang Tua: RM1,700 - RM3,500

2. Bilakah hari cuti?
- Cuti Ahad & Cuti Umum untuk Live-in
- Untuk Back & Forth: Cuti Ahad & Cuti Umum

3. Bagaimana cara saya menerima gaji?
- Gaji akan dibayar oleh majikan setiap bulan melalui admin MIM.

4. Apa yang perlu saya buat jika ada masalah dengan majikan?
- Hubungi admin MIM di 017-663 5990 (WhatsApp).`,
    },
    {
      title: 'Soalan Lazim - Majikan',
      docType: 'faq',
      content: `Soalan Lazim untuk Majikan

1. Bagaimana proses pengambilan pembantu?
- Daftar online → Pilih pembantu → Temuduga Google Meet → Tandatangan kontrak → Mula kerja

2. Berapakah yuran agensi?
- Sila hubungi admin MIM untuk butiran yuran.

3. Bolehkah saya menukar pembantu jika tidak sesuai?
- Ya, sila hubungi admin untuk perbincangan lanjut.

4. Bagaimana jika pembantu tidak hadir kerja?
- Laporan segera kepada admin MIM melalui WhatsApp.`,
    },
    {
      title: 'Senarai Harga Perkhidmatan',
      docType: 'price',
      content: `Senarai Harga Perkhidmatan MIM

Pembantu Rumah (Maid)
- Gaji Bulanan: RM1,500 - RM2,500

Pengasuh (Babysitter)
- Gaji Bulanan: RM1,500 - RM2,500

Penjaga Orang Tua (Caregiver)
- Gaji Bulanan: RM1,700 - RM3,500

Yuran Agensi:
- Sila hubungi admin untuk butiran lengkap yuran agensi.`,
    },
    {
      title: 'Proses Pengambilan',
      docType: 'process',
      content: `Proses Pengambilan MIM Portal

1. Pendaftaran Online
   - Pembantu dan majikan mendaftar melalui borang online
   - Sistem akan jana email & password automatik
   - Dihantar melalui WhatsApp

2. Sediakan Profil
   - Lengkapkan profil di dashboard
   - Muat naik gambar profil

3. Tonton Video Kursus
   - Pembantu perlu menonton semua video kursus wajib
   - Lengkapkan modul latihan

4. Temuduga Google Meet
   - Admin akan jadualkan temuduga
   - Pembantu, majikan & admin akan hadir

5. Tandatangan Kontrak
   - 3 kontrak: Agensi-Pembantu, Agensi-Majikan, Majikan-Pembantu
   - Semua pihak perlu tandatangan

6. Mula Kerja
   - Pembantu mula bekerja mengikut jadual
   - Gaji dibayar setiap bulan`,
    },
  ]

  for (const d of docs) {
    await db.document.create({ data: d })
  }
  console.log(`✓ ${docs.length} documents`)

  // 4. Sample helpers (for demo)
  const sampleHelpers = [
    {
      fullName: 'Siti Aminah binti Abdullah',
      nickname: 'Siti',
      age: 28,
      religion: 'Islam',
      maritalStatus: 'Berkahwin',
      education: 'SPM',
      phone: '+60123456789',
      city: 'Kuala Lumpur',
      state: 'Kuala Lumpur',
      residencyState: 'Kuala Lumpur',
      workArea: 'Kuala Lumpur',
      canRelocate: true,
      serviceType: 'maid',
      liveIn: true,
      desiredJob: 'maid',
      skills: JSON.stringify(['cooking', 'cleaning', 'washing']),
      motivation: 'Saya ingin bekerja untuk menyokong keluarga.',
      experience: '3 tahun bekerja sebagai pembantu rumah.',
      email: 'siti.demo@mim.com.my',
      password: 'Demo@1234',
      status: 'active',
      rating: 4.8,
    },
    {
      fullName: 'Maria binti Santos',
      nickname: 'Maria',
      age: 32,
      religion: 'Kristian',
      maritalStatus: 'Bujang',
      education: 'Diploma',
      phone: '+60198765432',
      city: 'Petaling Jaya',
      state: 'Selangor',
      residencyState: 'Selangor',
      workArea: 'Selangor',
      canRelocate: false,
      serviceType: 'babysitter',
      backAndForth: true,
      desiredJob: 'babysitter',
      skills: JSON.stringify(['baby_care', 'child_care', 'educating']),
      childAges: JSON.stringify(['0-6', '12-17']),
      motivation: 'Saya suka menjaga kanak-kanak.',
      experience: '5 tahun sebagai pengasuh.',
      email: 'maria.demo@mim.com.my',
      password: 'Demo@1234',
      status: 'active',
      rating: 4.9,
    },
    {
      fullName: 'Rani a/p Kumaran',
      nickname: 'Rani',
      age: 35,
      religion: 'Hindu',
      maritalStatus: 'Berkahwin',
      education: 'SPM',
      phone: '+60112223344',
      city: 'Shah Alam',
      state: 'Selangor',
      residencyState: 'Selangor',
      workArea: 'Selangor',
      canRelocate: true,
      serviceType: 'caregiver',
      liveIn: true,
      desiredJob: 'caregiver',
      skills: JSON.stringify(['cooking', 'cleaning']),
      motivation: 'Saya ada pengalaman menjaga orang tua.',
      experience: '4 tahun sebagai penjaga orang tua.',
      email: 'rani.demo@mim.com.my',
      password: 'Demo@1234',
      status: 'active',
      rating: 4.7,
    },
    {
      fullName: 'Noraini binti Hasan',
      nickname: 'Nora',
      age: 26,
      religion: 'Islam',
      maritalStatus: 'Bujang',
      education: 'SPM',
      phone: '+60133445566',
      city: 'Johor Bahru',
      state: 'Johor',
      residencyState: 'Johor',
      workArea: 'Johor',
      canRelocate: true,
      serviceType: 'maid',
      canBoth: true,
      desiredJob: 'maid',
      skills: JSON.stringify(['cooking', 'cleaning', 'washing', 'baby_care']),
      motivation: 'Ingin membantu keluarga di kampung.',
      experience: '2 tahun pengalaman.',
      email: 'nora.demo@mim.com.my',
      password: 'Demo@1234',
      status: 'active',
      rating: 5.0,
    },
  ]

  for (const h of sampleHelpers) {
    const existing = await db.helper.findUnique({ where: { email: h.email } })
    if (!existing) {
      await db.helper.create({ data: h })
    }
  }
  console.log(`✓ ${sampleHelpers.length} sample helpers`)

  // 5. Sample employer
  const employer = await db.employer.findUnique({ where: { email: 'ahmad.demo@mim.com.my' } })
  if (!employer) {
    await db.employer.create({
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
    console.log('✓ 1 sample employer')
  }

  console.log('\n🎉 Seed complete!')
  console.log('   Admin login: admin@mim.com.my / Admin@MIM2026')
  console.log('   Helper login: siti.demo@mim.com.my / Demo@1234')
  console.log('   Employer login: ahmad.demo@mim.com.my / Demo@1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
