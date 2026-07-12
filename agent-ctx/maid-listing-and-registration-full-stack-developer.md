---
Task ID: maid-listing-and-registration
Agent: full-stack-developer
Task: Add Maid Listing section to landing page + Update registration pages with step images and dark theme

Work Log:
- Read worklog.md and existing files: `/src/app/page.tsx`, `/src/app/helper/register/page.tsx`, `/src/app/employer/register/page.tsx`, `/src/lib/db.ts`, `/src/lib/utils.ts`, `/src/lib/auth.ts`, `prisma/schema.prisma`
- Verified image assets exist in `/public/images/avatars/maid-{1-4}.png` and `/public/images/how-it-works/step{1-2}.png`

TASK 1 - Landing page (`/src/app/page.tsx`):
- Converted `MimLandingPage` to `async` server component
- Added imports: `db` from `@/lib/db`, `getSession` from `@/lib/auth`, `getServiceLabel` and `SKILLS_OPTIONS` from `@/lib/utils`
- Added `await getSession()` + `await db.helper.findMany({ where: { status: 'active' }, orderBy: { rating: 'desc' }, take: 6 })` at top of component
- Computed `selectHelperHref` = `/employer/find-helper` if logged in as employer, otherwise `/employer/register`
- Added nav link `#maids` labelled "Pembantu" after "Cara Kerja" in header
- Inserted NEW `<section id="maids">` "Pembantu Terpilih" AFTER the "How It Works" section and BEFORE the "Services" section
- Section design (dark theme, matches existing `bg-[#102943]`):
  - Cyan badge "Pembantu Terpilih" with Sparkles icon
  - Title "Pilih Pembantu Terbaik Untuk Keluarga Anda" with gradient on "Terbaik"
  - Subtitle "Lihat profil pembantu yang tersedia. Klik untuk booking temuduga."
  - Empty-state card when no helpers (shows Users icon + CTA button)
  - Grid of helper cards (md:2 cols, lg:3 cols) using glassmorphism dark style
- Each helper card shows:
  - Avatar image `/images/avatars/maid-${(i % 4) + 1}.png` (cycled through 4) via next/image with `fill`
  - fullName
  - Service type badge via `getServiceLabel(helper.serviceType)`
  - Rating with amber Star icon + numeric `helper.rating.toFixed(1)`
  - Location `[city, state]` with MapPin icon
  - Skills parsed from JSON string (`JSON.parse(helper.skills || '[]')`), mapped to labels via `SKILLS_OPTIONS`, shown as small badges (max 4)
  - Live-in / Back & Forth / Fleksibel badges (using emerald, cyan, amber — no blue/indigo per styling rules)
  - "Pilih Pembantu" button (cyan, links to `selectHelperHref`)
  - "Lihat Profil" outline button (links to `selectHelperHref`)
- Bottom CTA "Lihat Semua Pembantu" button

TASK 2a - Helper registration (`/src/app/helper/register/page.tsx`):
- Added `Image` import from `next/image`, `Home` icon from lucide-react
- Defined `STEPS` array mapping step num → image path + title + desc
  - Step 1: `/images/how-it-works/step1-register.png` ("Daftar" / "Maklumat Diri")
  - Step 2: `/images/how-it-works/step2-profile.png` ("Profil" / "Borang A")
- Defined reusable className constants `inputCls` (`bg-white/5 border-white/10 text-white placeholder:text-slate-500`) and `labelCls` (`text-slate-300`)
- Result (success) screen: dark gradient `from-[#0d1f33] to-[#0a1828]` with cyan/blue blobs; card uses `glass-dark text-white`; credential box uses `bg-[#00bcd4]/10 border border-[#00bcd4]/20 text-[#00bcd4]`
- Main return: dark `bg-[#0d1f33] text-slate-100` with decorative cyan + blue blobs; sticky header with brand badge showing "Daftar Sebagai Pembantu"
- Progress bar styled cyan over white/10 track (`[&>div]:bg-[#00bcd4]`)
- Step indicator grid (2 cols) at top: each item shows a 48x48 thumbnail of the step image, step number, title, desc; active step highlighted cyan, completed step highlighted emerald with CheckCircle2 icon
- Each step card now has a header strip with the step image as background (h-28/h-32, opacity-60, gradient overlay) + icon + title overlay
- All Input/Textarea/SelectTrigger fields use `inputCls` for dark styling
- All Labels use `labelCls` (text-slate-300)
- Checkbox/Radio option labels restyled with dark borders (`border-white/10 bg-white/5`) and cyan highlight when selected (`border-[#00bcd4] bg-[#00bcd4]/10`)
- Date input gets `[color-scheme:dark]` for dark date picker
- Buttons: cyan primary (`bg-[#00bcd4] hover:bg-[#00a5bb]`), ghost buttons styled for dark bg

TASK 2b - Employer registration (`/src/app/employer/register/page.tsx`):
- Added `Image` import from `next/image`; added `Home`, `Search`, `Calendar`, `PenTool`, `Rocket` icons
- Defined `JOURNEY` array (5 visual steps: Daftar → Cari → Temuduga → Kontrak → Mula) for the journey indicator
- Defined reusable className constants `inputCls` and `labelCls` (same as helper)
- Result (success) screen: same dark gradient + glass-dark card + cyan credential box (matches helper page styling for consistency)
- Main return: dark `bg-[#0d1f33] text-slate-100` with decorative cyan + blue blobs; sticky header with brand badge "Daftar Sebagai Majikan"
- Hero image strip at top using `/images/how-it-works/step1-register.png` (h-32/h-40, opacity-50, left-to-right gradient) with badge "Langkah 1 - Daftar", title "Mula Perjalanan Anda", subtitle
- Journey step indicator: 5 circles connected by lines; step 1 ("Daftar") active cyan, others muted; shows icon, title, desc (desc hidden on mobile)
- Card 1 "Maklumat Diri Majikan": glass-dark text-white, cyan icon header, all inputs/labels dark-styled
- Card 2 "Keperluan Perkhidmatan": glass-dark text-white, amber icon header; RadioGroup service-type options restyled dark with cyan highlight; salary info box restyled cyan (`bg-[#00bcd4]/10 border-[#00bcd4]/20 text-[#00bcd4]`); all inputs/labels dark-styled
- Date input gets `[color-scheme:dark]`
- Buttons: cyan primary + ghost styled for dark bg

Verification:
- Ran `bun run lint` — passed cleanly with no errors or warnings
- All UI text in Malay language
- Existing form logic preserved (state, validation, submit, result flow) — only styling + visual additions
- Page remains a server component (added `async`); imports `db` + `getSession`
- All images use relative paths from `/public/images/`

Files modified:
- `/home/z/my-project/src/app/page.tsx` (TASK 1)
- `/home/z/my-project/src/app/helper/register/page.tsx` (TASK 2a)
- `/home/z/my-project/src/app/employer/register/page.tsx` (TASK 2b)

Summary: Successfully added a "Pembantu Terpilih" featured-helpers section to the landing page (server component fetching active helpers from DB) and refreshed both registration pages with a cohesive dark theme that matches the rest of the MIM Portal, complete with step-by-step imagery from the `/images/how-it-works/` asset set.
