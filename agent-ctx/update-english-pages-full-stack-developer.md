# Task: update-english-pages

## Agent: full-stack-developer

## Summary
Updated the outdated English pages (`/src/app/en/page.tsx` and `/src/app/en/for-maids/page.tsx`) to match the latest BM (Malay) page structure. Also added a new "Smart Features" section at the bottom of the English landing page suggesting 8 new features for finding maids/employers.

## Files Changed

### 1. `/src/app/en/page.tsx` (English Landing Page)
Completely rewrote to mirror the BM landing page (`/src/app/page.tsx`) with English translations. Key updates:

- **Logo**: Replaced Home icon with `<Image src="/logo-mim.png" .../>` in header and footer
- **Video Background**: Added YouTube iframe background using English video ID `3-M09WyY6Rw`
- **Hero Image**: Uses `/images/pixar/hero.png`
- **Why Choose (Benefits) Section**: All 8 cards now have images:
  - `/images/pixar/why-safety.png` - "Safe & Secure"
  - `/images/pixar/why-search.png` - "Search & Choose Yourself"
  - `/images/pixar/why-time.png` - "Save Time"
  - `/images/pixar/why-support.png` - "24/7 Support"
  - `/images/pixar/why-training.png` - "Trained Helpers"
  - `/images/pixar/why-contract.png` - "Auto Contract"
  - `/images/pixar/why-payment.png` - "Organized Payments"
  - `/images/pixar/why-matchmaker.png` - "AI Matchmaker"
  - Each card uses `aspect-square` for image (NOT `h-36`)
  - Icon badge overlaid on image bottom-left
- **How It Works**: Uses wide step images (`/images/steps-pixar/step1-register-wide.png` etc.)
- **Promo Video**: Uses English video `https://www.youtube.com/embed/3-M09WyY6Rw`
- **Services**: Uses Pixar images (`/images/pixar/maid.png`, `/images/pixar/babysitter.png`, `/images/pixar/caregiver.png`)
- **AI Agents**: Uses `/images/pixar/ai-agents.png`
- **Flyer Download section**: Added with `/downloads/flyers-front.jpg` and `/downloads/flyers-back.jpg`
- **Language toggle**: "MY | EN" where EN is active (bold cyan)
- **Footer**: Uses `<Image src="/logo-mim.png" .../>`

### 2. `/src/app/en/for-maids/page.tsx` (English Maid Page)
Completely rewrote to mirror the BM maid page (`/src/app/for-maids/page.tsx`) with English translations. Key updates:

- **Logo**: Replaced Home icon with `<Image src="/logo-mim.png" .../>` in header and footer
- **Hero image**: Uses `/images/pixar/maid.png`
- **Training image**: Uses `/images/pixar/why-training.png`
- **Promo Video**: Uses English video `https://www.youtube.com/embed/iSrqa6J_C0w`
- **Language toggle**: "MY | EN" where EN is active (bold cyan)

## New Feature Added: Smart Features Section

Added a new "Smart Features" section at the bottom of the English landing page (after Flyer Download, before Footer) with 8 suggested features:

1. **Smart Match Alerts** (Bell icon) - Get WhatsApp notification when AI finds a perfect match for you
2. **Verified Badge System** (BadgeCheck icon) - Helpers with verified IC, medical records, and background checks get a blue checkmark
3. **Trial Period** (CalendarClock icon) - 7-day trial period before committing to full contract
4. **Video Profile** (Video icon) - Helpers can record 30-second video introducing themselves
5. **Instant Chat** (MessageCircle icon) - Chat directly with helper before booking (via WhatsApp integration)
6. **Rating & Reviews** (Star icon) - See real reviews from previous employers
7. **Background Check** (ScanSearch icon) - AI-powered background verification for all helpers
8. **Replacement Guarantee** (RefreshCw icon) - Free replacement within 30 days if match doesn't work out

The section uses:
- Dark gradient background matching theme (`from-[#0a1828] via-[#0d1f33] to-[#102943]`)
- 4-column responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
- `glass-dark` cards with `hover:border-[#00bcd4]/30` transition
- Cyan icon badges that scale on hover and turn solid cyan on hover
- New imports added: `Bell, BadgeCheck, CalendarClock, ScanSearch, RefreshCw`

## Verification

- **Lint**: `bun run lint` passes with no errors
- **Dev server**: Both pages return HTTP 200 (`/en` and `/en/for-maids`)
- **Compile**: Both pages compile successfully with Turbopack
- **Note**: Prisma `DATABASE_URL` env warning appears for both EN and BM pages (pre-existing environment config issue, not introduced by these changes)

## Theme Consistency Maintained
- Background: `bg-[#0d1f33]` (dark navy)
- Primary accent: `#00bcd4` (cyan)
- Glass cards: `glass-dark` class
- Gradient text: `gradient-text` class
- Sticky footer using `mt-auto` with `min-h-screen flex flex-col` root wrapper

## Async Server Components
Both pages remain `async` server components and use `next/image` for all images, as required.
