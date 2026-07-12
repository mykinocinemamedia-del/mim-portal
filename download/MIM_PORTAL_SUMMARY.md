# MIM Portal - Maid In Malaysia | Deployment Summary

## Live URLs
- **Production**: https://mim-portal.vercel.app
- **GitHub Repo**: https://github.com/mykinocinemamedia-del/mim-portal
- **Vercel Project**: https://vercel.com/mahadzirs-projects/mim-portal

## Demo Credentials
- **Admin**: admin@mim.com.my / Admin@MIM2026
- **Helper (Pembantu)**: siti.demo@mim.com.my / Demo@1234
- **Employer (Majikan)**: ahmad.demo@mim.com.my / Demo@1234

## Database Setup (One-Time)
The Supabase PostgreSQL database needs to be initialized. Run this SQL in Supabase SQL Editor:
- File: `scripts/supabase_schema.sql` (in the GitHub repo)
- Or visit: https://supabase.com/dashboard/project/tgikwdngogwzpmbttjoc/sql/new
- Copy & paste the SQL, click Run

After running SQL, call the setup endpoint to verify:
```
curl "https://mim-portal.vercel.app/api/setup?key=mim-setup-2026"
```

## Features Built

### Landing Page (`/`)
- Hero section with 3 user pathways (Helper, Employer, Admin)
- Services section (Pembantu Rumah, Pengasuh, Penjaga Orang Tua)
- 6-step process flow
- Company info (Kino Studios Sdn. Bhd.)
- Contact section (WhatsApp, Email, Phone)
- AI Chatbot (floating button, bottom-right)

### Helper Module
- `/helper/register` - 2-step registration (Identity + Form A with 10 questions)
- `/helper/login` - Login with auto-generated credentials
- `/helper/dashboard` - Overview with profile, schedule, courses, alerts
- `/helper/schedule` - Working schedule
- `/helper/video-courses` - 6 training videos with progress tracking
- `/helper/contract` - View 3 contract types
- `/helper/edit-profile` - Edit profile information
- `/helper/change-password` - Change password (required on first login)
- `/helper/faq` - FAQ accordion
- `/helper/notifications` - Notification center

### Employer Module
- `/employer/register` - Registration with service needs
- `/employer/login` - Login
- `/employer/dashboard` - Account info, contract expiry, overdue alerts, latest helpers
- `/employer/find-helper` - **CRITICAL**: Browse helpers with filters (service type, live-in/back-forth, religion, area)
- `/employer/bookings/new` - 3-step booking wizard with salary calculation
- `/employer/bookings` - All bookings list
- `/employer/my-helper` - Active helper information
- `/employer/payments` - Payment history with status
- `/employer/video-courses` - Training videos
- `/employer/contract` - Contract management
- `/employer/faq` - FAQ
- `/employer/notifications` - Notifications

### Admin Module
- `/admin/login` - Admin login
- `/admin/dashboard` - Statistics, recent activity, quick actions (MATA portal style)
- `/admin/match` - **CRITICAL**: Match employers with helpers
- `/admin/helpers` - Manage all helpers (add/edit/view)
- `/admin/helpers/new` - Manual helper entry
- `/admin/helpers/[id]` - View/Edit specific helper
- `/admin/employers` - Manage all employers
- `/admin/employers/new` - Manual employer entry
- `/admin/bookings` - All bookings management
- `/admin/contracts` - **CRITICAL**: Generate 3 contract types, signing status, download
- `/admin/schedule` - Schedule management
- `/admin/interviews` - Schedule Google Meet interviews, upload recordings
- `/admin/medical` - Upload medical & vaccination records
- `/admin/documents` - Manage FAQs, prices, process docs
- `/admin/video-courses` - Manage video courses
- `/admin/notifications` - Send notifications (broadcast or targeted)
- `/admin/messages` - Send messages to users
- `/admin/whatsapp` - WhatsApp message center with 5 templates

### AI Chatbot
- Floating button on all pages
- Powered by Groq (llama-3.3-70b-versatile)
- Helps with FAQs, registration, processes
- Quick question suggestions
- Malay language responses

## Tech Stack
- **Frontend**: Next.js 16, TypeScript 5, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Supabase PostgreSQL (production), SQLite (dev)
- **ORM**: Prisma 6
- **AI**: Groq (Llama 3.3 70B)
- **Auth**: Custom JWT-based session (cookie)
- **Deployment**: Vercel
- **Code Repository**: GitHub

## Company Info (Kino Studios Sdn. Bhd.)
- SSM: 002138666-M
- Brand: KinoCinema Media
- Email: hello@kino.my
- Phone/WhatsApp: +6017-663 5990
- Website: www.kino.my
- Address: Ampang Jaya, Selangor Darul Ehsan, Malaysia
- Signatory: Mahadzir Hanafiah (Pengasas & Penerbit Prinsipal)

## API Endpoints

### Authentication
- POST `/api/auth/login` - Login (helper/employer/admin)
- POST `/api/auth/logout` - Logout
- GET `/api/auth/session` - Get current session

### Helper APIs
- POST `/api/helper/register` - Register new helper (auto-gen credentials)
- GET `/api/helper/profile` - Get helper profile
- POST `/api/helper/update-profile` - Update profile
- POST `/api/helper/change-password` - Change password

### Employer APIs
- POST `/api/employer/register` - Register new employer
- GET `/api/employer/find-helpers` - List helpers with filters
- GET `/api/employer/find-helpers?helperId=X` - Get specific helper
- POST `/api/employer/book` - Create booking
- GET `/api/employer/profile` - Get employer profile

### Admin APIs (16 endpoints)
- helpers/create, helpers/update
- employers/create, employers/update
- contracts/generate, contracts/update
- interviews/create, interviews/update
- medical/create, documents/create, documents/update
- video-courses/create, notifications/send
- match, schedule/create, messages/send

### Other APIs
- POST `/api/courses/progress` - Update video course progress
- POST `/api/notifications/mark-read` - Mark notification as read
- GET `/api/notifications/unread-count` - Get unread count
- POST `/api/ai/chat` - AI chatbot
- GET `/api/setup?key=mim-setup-2026` - Setup/seed database

## Security Checklist (AFTER USE)
- [ ] Revoke GitHub PAT: https://github.com/settings/tokens
- [ ] Revoke Supabase Token: https://supabase.com/dashboard/account/tokens
- [ ] Revoke Vercel Token: https://vercel.com/account/tokens
- [ ] Revoke Groq API Key: https://console.groq.com/keys
- [ ] Revoke Gemini API Key: https://aistudio.google.com/app/apikey
- [ ] Reset Supabase DB Password: Supabase Dashboard > Database

## Next Steps
1. Run the SQL schema in Supabase dashboard (see Database Setup above)
2. Test login with demo credentials
3. Customize content (FAQs, video courses, documents) via Admin Dashboard
4. Add real helper/employer data
5. Set up custom domain (optional) in Vercel
6. Revoke all exposed tokens and generate new ones
