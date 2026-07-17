# Task: automation-phase-2-5 — Build 4 Automation Features

## Context
Previous agents built:
- **Phase 1 (Tasks 1–8)**: Full helper/employer/admin Next.js pages, Prisma schema (Helper/Employer/Admin/Booking/Contract/Payment/Schedule/etc.), WhatsApp integration (sendWhatsApp + wa.me fallback), AI provider abstraction (Gemini→Z.AI→Groq).
- **Phase 1.5 (Tasks 9–12)**: 13 AI agents under `src/lib/agents/` (lead_gen, onboarding, matching, contract, operations, support, orchestrator) + agent dashboard + subpages.
- **Aida + Pricing + English pages**: WhatsApp webhook, English translations.

## Existing patterns to follow
- `BaseAgent` (`src/lib/agents/core/base-agent.ts`) — abstract `execute()`, `logActivity()`, `notify()`, `agentRegistry` singleton, self-register at end of file.
- `sendWhatsApp()` (`src/lib/agents/integrations/whatsapp.ts`) — Twilio API with wa.me fallback. Already has `sendBulkWhatsApp()` with 1-sec sleep rate limit. Templates object.
- `getSession()` (`src/lib/auth.ts`) — returns `SessionUser | null` with `role: 'admin'|'employer'|'helper'`.
- `db` (`src/lib/db.ts`) — Prisma client singleton.
- `aiChat()`/`parseAIJson()` (`src/lib/ai/provider.ts`) — multi-provider fallback, JSON extraction.
- API route pattern: `getSession()` + role check + `db.*` operations + `NextResponse.json()`.
- Company info via env vars: `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_COMPANY_PHONE`, `NEXT_PUBLIC_SIGNATORY`, etc.
- Contract model has `signedHelper`, `signedEmployer`, `signedAdmin` booleans + status (`draft`/`active`/`expired`).
- Payment model has `status` (`pending`/`paid`/`overdue`), `method`, `paidDate`.

## My task scope
1. **Phase 2 (WhatsApp)**: New `/api/whatsapp/send` (admin-only) + extend `whatsapp.ts` (bulk send with 1msg/sec rate limit for Twilio, new templates for payment_link, e_signature_link, video_interview, background_check_complete, auto_approved, auto_rejected, and `sendPaymentLink()` helper function).
2. **Phase 3 (ToyyibPay)**: Add `paymentLinkUrl` and `toyyibpayBillCode` to Payment model; create `/api/payment/create`, `/api/payment/callback`, `/api/payment/status` routes.
3. **Phase 4 (Auto-Screener)**: New `auto-screener.ts` agent — name `auto_screener`, category `operations`, schedule `Every 30 minutes`. Scores helpers (profile, IC, phone, skills, photo, video courses, Form A) and employers (profile, phone, salary, service). >=70 auto-approve → active; 40–69 pending + flag admin; <40 auto-reject with reason. WhatsApp notify. Register in `index.ts`.
4. **Phase 5 (E-Signature)**: New `/api/contract/sign` (generates signature token, records timestamp+IP, all-3-signed → activate) + `/api/contract/verify-signature` (GET verify). Update `contract-agent.ts` to send WhatsApp with e-signature link + track status.

## Constraints
- All user-facing text in **Bahasa Melayu**.
- API routes use relative paths only (no port in URL — gateway handles).
- Run `bun run lint` after changes.
- Append work log to `/home/z/my-project/worklog.md`.
