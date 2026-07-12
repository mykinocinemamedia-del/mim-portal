# MIM Portal - Maid In Malaysia

Platform pusat perkhidmatan pembantu rumah Malaysia oleh **Kino Studios Sdn. Bhd.** (SSM: 002138666-M)

## Features

### Helper (Pembantu) Module
- Online registration with 2-section form (identity + Form A)
- Auto-generated credentials sent via WhatsApp
- Dashboard with profile, schedule, video courses, contracts
- Edit profile, change password, FAQ

### Employer (Majikan) Module
- Online registration with service needs
- Find Helper with filters (service type, live-in/back-forth, religion, area)
- 3-step booking process with salary calculation
- My Helper, Payment History, Video Courses, Contracts

### Admin Module
- Dashboard with statistics (MATA portal style)
- Match Employer with Helper
- Manage Helpers & Employers (add/edit)
- Contract generation (3 types: Agency-Helper, Agency-Employer, Employer-Helper)
- Schedule Google Meet interviews
- Upload medical & vaccination records
- Manage documents (FAQs, prices, process)
- Send notifications & messages
- WhatsApp message center with templates

### AI Chatbot
- MIM Assistant powered by Groq (llama-3.3-70b-versatile)
- Available on all pages
- Helps users with FAQs and platform navigation

## Tech Stack
- Next.js 16 with App Router
- TypeScript 5
- Tailwind CSS 4 with shadcn/ui
- Prisma ORM (SQLite for dev, PostgreSQL for production)
- Groq AI for chatbot
- Supabase (production database)

## Demo Credentials
- **Admin**: admin@mim.com.my / Admin@MIM2026
- **Helper**: siti.demo@mim.com.my / Demo@1234
- **Employer**: ahmad.demo@mim.com.my / Demo@1234

## Company Info
- **Company**: Kino Studios Sdn. Bhd.
- **SSM**: 002138666-M
- **Brand**: KinoCinema Media
- **Email**: hello@kino.my
- **Phone/WhatsApp**: +6017-663 5990
- **Website**: www.kino.my
- **Address**: Ampang Jaya, Selangor Darul Ehsan, Malaysia
- **Signatory**: Mahadzir Hanafiah (Pengasas & Penerbit Prinsipal)

## Development
```bash
bun install
bun run db:push
bun run scripts/seed.ts
bun run dev
```

## Deployment
The app is deployed on Vercel with Supabase PostgreSQL database.
