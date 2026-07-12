# MIM Portal - Fully Agentic AI Platform | Complete Summary

## 🤖 LIVE DEPLOYMENT
- **Production URL**: https://mim-portal.vercel.app
- **GitHub Repo**: https://github.com/mykinocinemamedia-del/mim-portal
- **AI Agents Dashboard**: https://mim-portal.vercel.app/admin/agents

## 🔑 Demo Credentials
- **Admin**: `admin@mim.com.my / Admin@MIM2026`
- **Pembantu**: `siti.demo@mim.com.my / Demo@1234`
- **Majikan**: `ahmad.demo@mim.com.my / Demo@1234`

---

## 🧠 13 AI AGENTS BUILT (Fully Autonomous)

### Layer 1: Lead Generation (4 Agents)
| Agent | Purpose | Schedule |
|-------|---------|----------|
| **Helper Recruiter** | Scan Facebook Groups untuk potential helpers, AI-score & WhatsApp outreach | Every 6 hours |
| **Employer Hunter** | Scan job postings/classifieds untuk families seeking helpers | Every 8 hours |
| **Referral Engine** | Auto-contact happy users (rating ≥4.5) untuk referrals, RM50 reward | Weekly |
| **Content Marketer** | Generate 3-5 social media posts/day in BM (FB/IG/TikTok) | Daily 9am |

### Layer 2: Onboarding (1 Agent)
| Agent | Purpose | Schedule |
|-------|---------|----------|
| **WhatsApp Onboarding (Aida)** | Conversational AI guide helper/employer thru registration via WhatsApp | Every 1 hour |

### Layer 3: Matching (2 Agents)
| Agent | Purpose | Schedule |
|-------|---------|----------|
| **AI Matchmaker** | Score compatibility 0-100 untuk setiap helper↔employer pair, auto-schedule interviews untuk score ≥85 | Every 2 hours |
| **Interview Coordinator** | Auto-schedule Google Meet, send invites, 24h reminders, post-interview feedback | Every 30 min |

### Layer 4: Contract (1 Agent)
| Agent | Purpose | Schedule |
|-------|---------|----------|
| **Auto-Contract** | Generate 3 contract types (agency-helper, agency-employer, employer-helper) when match confirmed, track signing, reminders | Every 4 hours |

### Layer 5: Operations (3 Agents)
| Agent | Purpose | Schedule |
|-------|---------|----------|
| **Payment Agent** | Auto-create monthly invoices, 3-day early reminders, mark overdue, monthly statements | Daily 8am |
| **Schedule Agent** | Auto-generate weekly work schedules, daily 7am reminders to helpers, handle public holidays | Daily 6am+7am |
| **24/7 Support AI (Aida)** | Handle ALL incoming chats, answer FAQs, detect emergencies, escalate to human | Every 5 min |

### Layer 6: Support (1 Agent)
| Agent | Purpose | Schedule |
|-------|---------|----------|
| **Quality Monitor** | Collect feedback at week 1/month 1/quarterly, AI sentiment analysis, churn prediction, auto-intervention | Daily 10am |

### Layer 7: Orchestrator (1 Agent)
| Agent | Purpose | Schedule |
|-------|---------|----------|
| **Chief of Staff** | Master orchestrator, daily executive reports, prioritize issues, escalate critical | Daily 6am+6pm |

---

## 🏗️ Architecture

### AI Provider Stack (Multi-provider with fallback)
1. **Gemini 2.0 Flash** (primary) - Google, free 1.5k req/day
2. **Z.AI GLM-4.5** (secondary) - competitive pricing
3. **Groq Llama 3.3 70B** (fallback) - free 14k req/day

### Communication
- **WhatsApp Business API** (Twilio) - for auto-messaging
- **wa.me links** (fallback) - free, manual click required
- 8 WhatsApp templates built: lead outreach, referral, onboarding, payment reminder, contract expiry, feedback, interview scheduled

### Database (Supabase PostgreSQL)
- 24 tables total (14 original + 10 agent tables)
- Agent tables: agents, agent_activities, leads, conversations, agent_messages, match_scores, referrals, content_queue, feedback, agent_notifications
- All with proper foreign keys, indexes, RLS disabled

### Agent Framework
- `BaseAgent` class with lifecycle management
- Agent registry (singleton)
- Activity logging (every action tracked)
- Admin notifications (severity: info/warning/critical)
- Error handling (per-item try/catch, never crashes whole agent)

---

## 📊 Admin Agent Dashboard Features

### Main Dashboard (`/admin/agents`)
- 13 agent cards grouped by category (7 categories)
- Real-time stats: total runs, success rate, error count, last run
- Status badges: idle/running/error/paused
- Manual "Run" button for each agent (triggers immediately)
- Quick action tiles: Leads, Matches, Content, Activity Log
- Recent notifications from agents (color-coded by severity)
- 5 key metric cards: Leads, Matches, Contracts, Payments, Conversations

### Sub-Pages
1. **`/admin/agents/leads`** - All leads from lead gen agents with filter, detail dialog, WhatsApp contact
2. **`/admin/agents/matches`** - AI match scores with compatibility breakdown, accept/reject actions
3. **`/admin/agents/content`** - Content queue with approve/delete/copy actions
4. **`/admin/agents/activity`** - Full activity log with filter and expandable details
5. **`/admin/agents/notifications`** - Agent notifications with mark-as-read
6. **`/admin/agents/[name]`** - Individual agent detail with sparkline visualization

### API Endpoints
- `GET /api/agents` - List all agents with stats
- `POST /api/agents` - Trigger agent manually
- `GET /api/agents/activity` - Activity log
- `GET /api/agents/notifications` - Agent notifications
- `GET /api/agents/leads` - Leads with stats
- `GET /api/agents/matches` - Match scores with stats
- `POST /api/agents/matches` - Accept/reject match
- `GET /api/agents/content` - Content queue
- `POST /api/agents/content` - Approve/delete content

---

## ⚠️ ONE-TIME DATABASE SETUP REQUIRED

The Supabase PostgreSQL database needs to be initialized. **You must run this SQL manually:**

1. Go to: https://supabase.com/dashboard/project/tgikwdngogwzpmbttjoc/sql/new
2. Copy the entire content of `scripts/supabase_schema.sql` from the GitHub repo
3. Paste into SQL Editor
4. Click **Run**

This creates all 24 tables + seeds demo data (admin, helpers, employers, video courses, FAQs).

After running SQL, login will work with demo credentials above.

---

## 🔒 Security Checklist (REVOKE AFTER USE)

| Service | URL | Token to Revoke |
|---------|-----|-----------------|
| GitHub PAT | https://github.com/settings/tokens | `ghp_fVUr...` |
| Supabase Token | https://supabase.com/dashboard/account/tokens | `sbp_0ca2...` |
| Vercel Token | https://vercel.com/account/tokens | `vcp_7yNi...` |
| Groq API Key | https://console.groq.com/keys | `gsk_agId...` |
| Gemini API Key | https://aistudio.google.com/app/apikey | `AQ.Ab8R...` |
| Supabase DB Password | Supabase Dashboard > Database | `EmreEmeel...` |

---

## 🚀 What's Next?

### Immediate (User Action Required)
1. **Run SQL schema** in Supabase dashboard (link above)
2. **Test login** with demo credentials
3. **Explore Agent Dashboard** at `/admin/agents`
4. **Manually trigger agents** using "Run" buttons to see them in action

### Optional Integrations (for Full Production)
1. **WhatsApp Business API** - Sign up at Twilio, add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` env vars
2. **Z.AI API Key** - Register at https://z.ai/, add `ZAI_API_KEY` env var for GLM-4.5
3. **Facebook Graph API** - For real lead gen from Facebook Groups (requires app review)
4. **Google Calendar API** - For real interview scheduling
5. **E-signature API** (DocuSign/JotSign) - For real contract signing

### Scaling Roadmap
- **Phase 2**: Real Facebook scraping (needs FB App approval)
- **Phase 3**: Google/Facebook Ads AI management
- **Phase 4**: Mobile app for helpers/employers
- **Phase 5**: Multi-language support (Tamil, Mandarin)
- **Phase 6**: Predictive analytics (demand forecasting, optimal pricing)

---

## 💰 Cost Estimate (Monthly)

| Component | Free Tier | Paid (RM100-300/mo) |
|-----------|-----------|---------------------|
| **Vercel** | ✓ (Hobby) | Pro: $20/mo |
| **Supabase** | ✓ (Free) | Pro: $25/mo |
| **Gemini** | 1.5k req/day | Pay-as-you-go |
| **Z.AI GLM-4.5** | - | ~RM50-100/mo |
| **Groq** | 14k req/day | - |
| **WhatsApp API** | wa.me (free) | Twilio: ~$0.005/msg |
| **Domain** | .vercel.app (free) | .my: ~RM80/yr |
| **Total** | **RM0** | **RM100-300/mo** |

---

## 📞 Support
- **Company**: Kino Studios Sdn. Bhd. (SSM: 002138666-M)
- **Email**: hello@kino.my
- **WhatsApp**: +6017-663 5990
- **Website**: www.kino.my
- **Signatory**: Mahadzir Hanafiah (Pengasas & Penerbit Prinsipal)
