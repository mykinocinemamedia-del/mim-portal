# Task pricing-and-aida — full-stack-developer

## Task
1. Create a Pricing Page at `/pricing` with 3 tiers (FREE, BASIC, PREMIUM), scarcity tactics, comparison table, social proof, FAQ — matching the dark blue/teal landing page theme.
2. Add "Harga" navigation link to the landing page header (between Perkhidmatan and AI Agents).
3. Enhance Aida AI Chatbot to auto-open after 5 seconds on the landing page only (not on dashboard/login/register pages), showing a welcome message.
4. Give Aida database access — when user asks about finding maids/helpers, query `db.helper` for matching active helpers and include their info (name, service type, rating, area) in the AI's response.

## Files Read First
- `/home/z/my-project/worklog.md` — previous work history
- `/home/z/my-project/src/app/page.tsx` — landing page (dark theme reference, header nav pattern)
- `/home/z/my-project/src/components/shared/ai-chatbot.tsx` — existing chatbot component
- `/home/z/my-project/src/app/api/ai/chat/route.ts` — existing chat API (Groq-based)
- `/home/z/my-project/src/app/layout.tsx` — confirms `<AiChatbot />` is mounted globally
- `/home/z/my-project/prisma/schema.prisma` — `Helper` model fields (fullName, serviceType, rating, city, state, workArea, residencyState, religion, liveIn, backAndForth, status, etc.)
- `/home/z/my-project/src/lib/db.ts` — Prisma client export
- `/home/z/my-project/src/lib/utils.ts` — `waCompanyLink`, `formatMYR` helpers
- `/home/z/my-project/src/app/globals.css` — custom classes: `glass-dark`, `gradient-text`, `btn-rounded`, `wave-bg`, `dot-pattern`

## Work Log

### Task 1 — Pricing Page
- Created `/src/app/pricing/page.tsx` (server component, ~640 lines).
- Dark blue/teal theme matches landing page exactly:
  - Background: `bg-[#0d1f33]` → `bg-[#102943]` gradients per section
  - Text: white / slate-300 / slate-400 / slate-500
  - Accent: `#00bcd4` (bright cyan)
  - Cards: `border border-white/10 glass-dark` with `hover:border-[#00bcd4]/40`
  - Buttons: `btn-rounded bg-[#00bcd4] hover:bg-[#00a5bb] text-white`
  - Highlight text: `gradient-text` class
- **3 Pricing Tiers** (PlanCard component, repeated for each plan):
  1. **FREE** — RM0/bulan, "Untuk Cubaan" badge, Home icon, 5 features with CheckCircle2, 4 limitations with X + line-through + opacity-50, CTA "Mula Percuma" → `/employer/register`.
  2. **BASIC** (highlighted) — RM49/bulan or RM490/tahun (save 17%), "PALING POPULAR" cyan badge top-right, Zap icon, `lg:scale-105`, cyan glow shadow `shadow-[0_0_40px_rgba(0,188,212,0.25)]`, top gradient accent line, 7 features, flame scarcity badge (amber) "⚠️ Harga naik ke RM79/bulan selepas 50 pendaftaran pertama", CTA "Pilih Basic" → `/employer/register?plan=basic`.
  3. **PREMIUM** — RM99/bulan or RM990/tahun (save 17%), "TERBAIK" badge, Crown icon (amber), 10 features, lock scarcity badge (rose) "🔒 Hanya 20 slot Premium tersedia bulan ini", CTA "Pilih Premium" → `/employer/register?plan=premium`.
- **Scarcity section** (amber gradient): Flame icon in gradient box, "Offaran Terhad" badge + "BERAKHIR MALAM INI" tag, "50% DISKAUN untuk 100 pendaftaran pertama", live counter "93/100 pendaftaran telah diisi" + "7 slot tinggal!", Progress bar with amber→cyan gradient fill at 93%, dual CTA (Daftar Sekarang + Tanya WhatsApp via `waCompanyLink`).
- **Social proof**: 5 gradient avatar circles (Users2 icon) + "Dipercayai oleh 200+ keluarga Malaysia" with filled amber Star.
- **Comparison Table** (`CompareCategoryRows` sub-component, 20 rows in 5 categories):
  - Categories: Pencarian & Profil, Temuduga, AI Features, Kontrak & Dokumen, Sokongan.
  - Responsive `overflow-x-auto`, `min-w-[700px]`.
  - Header row: FREE (slate), BASIC (cyan border + POPULAR badge + `bg-[#00bcd4]/5`), PREMIUM (amber Crown).
  - Cells: boolean → CheckCircle2 (cyan for BASIC column, emerald for others) or X (slate-600); string → centered text.
  - Category header rows: `bg-[#0a1828]/60`, cyan uppercase tracking-wider.
- **FAQ section**: 4 questions (tukar pakej, harga naik selepas promosi, bulanan vs tahunan, percuma benar-benar percuma), Accordion glass-dark cards, "Tanya WhatsApp" CTA below.
- **Final CTA**: ShieldCheck icon, "Bersedia Memulakan?" gradient headline, dual CTA (Mula Percuma Sekarang → /employer/register, Kembali ke Laman Utama → /).
- **Footer**: `mt-auto` sticky-bottom pattern, MIM Portal branding + copyright.

### Task 1b — Landing Page Nav Update
- Edited `/src/app/page.tsx` header nav: inserted `<Link href="/pricing" ...>Harga</Link>` between "Perkhidmatan" and "AI Agents".

### Task 2 — Aida AI Chatbot Auto-Open
- Updated `/src/components/shared/ai-chatbot.tsx`:
  - Added `import { usePathname } from 'next/navigation'`.
  - Added `useEffect` that:
    - Only schedules timer when `pathname === '/'` (landing page).
    - Uses `setTimeout(5000)` to call `setOpen(true)` + replace messages with WELCOME_MESSAGE.
    - Guarded by `hasAutoOpenedRef` (useRef) so it fires only once per session.
    - Cleanup function clears timer when navigating away from `/` or on unmount.
  - Renamed bot display name to "Aida" + "AI Assistant • Online".
  - New WELCOME_MESSAGE: "Hai! Saya Aida, AI assistant MIM Portal. 👋 Saya boleh bantu anda cari pembantu rumah, pengasuh, atau penjaga orang tua yang sesuai. Apa yang anda cari hari ini?"
  - Updated quick questions to include "Cari pembantu rumah di KL" (showcases DB capability).
  - Added `whitespace-pre-line` to message bubbles so multi-line replies render properly.
  - Added `aria-label` to close button and send button for accessibility.

### Task 2b — Aida Database Access
- Updated `/src/app/api/ai/chat/route.ts`:
  - Added `import { db } from '@/lib/db'`.
  - Updated SYSTEM_PROMPT: bot is now "Aida" with explicit helper-search protocol (check criteria → query DB → suggest 2-3 helpers with name/service/rating/area → tell user to register for full profile). Includes exact response format for match/no-match cases.
  - Built `buildHelperContext(message: string): Promise<HelperContext>`:
    - `STATE_KEYWORDS` map: 16 Malaysian states + common cities (KL, PJ, Subang, Cheras, Ampang, Klang, Ipoh, Penang, Johor Bahru, etc.).
    - `SERVICE_KEYWORDS` map: maid/pembantu rumah, babysitter/pengasuh/jaga bayi, caregiver/penjaga orang tua/warga emas.
    - Intent detection: matches if any state or service keyword found, OR regex for cari/mencari/perlu/pembantu yang/saya nak/etc.
    - Queries `db.helper.findMany({ where: { status: 'active', OR: [...] }, take: 8, orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }], select: { ... } })`.
    - Combines service + state filters with `AND` of two `OR` arrays when both present.
    - Case-insensitive `contains` filters on `serviceType`, `state`, `city`, `workArea`, `residencyState`.
    - Fallback: if no exact matches, queries top-rated active helpers (any location/service) and tells AI to inform user "no exact match, but here are other active helpers".
    - Empty DB case: returns context telling AI "no helpers available yet, ask user to register for notifications".
    - Formats helpers as numbered list: "1. [Nama] - [Jenis] - Rating: [X.X] - [City, State] [Religion] [Live-in/Back&Forth] [Exp: ...]".
    - Wraps DB query in try/catch — on failure, returns empty context (AI still responds using general knowledge).
  - Injects `contextText` into the dynamic system prompt as `[DATABASE INFO]` block before sending to Groq.
  - Backward-compatible: if `GROQ_API_KEY` missing, returns useful canned response (mentions `/employer/register` if helper context exists).

## Verification
- `bun run lint` → **zero errors** (exit code 0).
- All UI text in Malay.
- Dark blue/teal theme consistent with landing page across all pricing page sections.
- Aida auto-open only fires once per session on `/`, never on dashboard/login/register pages.
- Aida now queries live DB for helpers when user asks about finding maids/pengasuh/caregivers, with state + service filtering.

## Files Modified
1. `/home/z/my-project/src/app/pricing/page.tsx` — **NEW** (~640 lines)
2. `/home/z/my-project/src/app/page.tsx` — added 1 line (Harga nav link)
3. `/home/z/my-project/src/components/shared/ai-chatbot.tsx` — rewritten (auto-open + welcome + Aida rename + whitespace-pre-line + a11y)
4. `/home/z/my-project/src/app/api/ai/chat/route.ts` — rewritten (DB access + helper context injection + updated system prompt)
