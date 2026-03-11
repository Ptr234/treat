# UIA One-Stop Centre Digital Tool

## What This Is

A comprehensive digital platform for the Uganda Investment Authority's One-Stop Centre Directorate (oscdigitaltool.com). It serves as the primary investor facilitation portal — providing AI-powered assistance, event management, inquiry tracking, analytics, inter-agency collaboration, a licensed projects database with interactive maps, and executive dashboards. Built for investors exploring Uganda, OSC staff managing inquiries, and UIA leadership monitoring operations.

## Core Value

Investors can find information, submit inquiries, and track their issues through a single reliable platform — with zero broken features, zero errors, fully production-ready.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Migrate from Firebase (Spark plan) to Sanity CMS + Vercel + Gemini free tier
- [ ] UIA Assistant (AI Chatbot) — branded as "UIA Assistant", scoped strictly to UIA/OSC/Uganda investment topics only, multilingual (English, French, Arabic, Chinese, Swahili), knowledge base on investment procedures/incentives/sectors/licensing, escalation to human officers, Gemini free tier
- [ ] Events & Investment Activities — event categories (UIA forums, government missions, sector symposiums, EAC summits, global events, webinars), online registration/RSVP, calendar sync (iCal, Google, Outlook), post-event resources
- [ ] Inquiry Analytics Dashboard — geographic heat map (world map with inquiry density), sector distribution charts, investment funnel (Inquiry > Facilitation > Application > Licensing > Operation), time-series trends, MoM/YoY benchmarks
- [ ] Issue Tracking System — full lifecycle (NEW > ASSIGNED > IN PROGRESS > PENDING EXTERNAL > RESOLVED > CLOSED), SLA monitoring per category/priority, public ticket submission without login, reference number tracking, communication history, document upload, satisfaction rating, escalation requests
- [ ] Inter-Agency Live Chat & Engagement Hub — officer-to-officer messaging, per-investor case channels, document sharing, unified investor profile across agencies (UIA, URSB, URA, DCIC, NEMA, KCCA, Ministry of Lands, UNBS, ERA), cross-agency SLA monitoring
- [ ] Licensed Projects Database & Investment Map — interactive searchable database of 9,922+ projects (data extracted from PDFs), Leaflet maps with project markers, filter by sector/region/investment size/status, industrial parks overlay, infrastructure proximity indicators, export capability
- [ ] Director General Live Dashboard — real-time metrics (inquiry counter, active cases, pending approvals, pipeline value), performance indicators (response rates, conversion funnel, agency scorecards, SLA compliance), alert system (VIP delays, SLA breaches, high-value inquiries), executive actions (case intervention, priority flagging, report generation)
- [ ] Admin-only authentication — staff/admin accounts to manage content in Sanity Studio, public site is read-only for investors
- [ ] UI refresh — modernize/polish existing Next.js frontend design while keeping layout structure
- [ ] Error-free production deployment — zero console errors, no broken pages, no dead links, no features that appear functional but aren't wired up

### Out of Scope

- Mobile native app — web-first, responsive design covers mobile
- Full eBiz portal integration — eBiz (ebiz.go.ug) is a separate platform, link to it but don't rebuild it
- Predictive analytics / ML models — use straightforward analytics visualizations
- Email/SMS notification sending — would require paid services; defer to v2
- Video conferencing built-in — link to external tools (Zoom/Teams) instead
- OAuth/social login for public users — no public user accounts needed

## Context

- **Client:** Christine Masika, Uganda Investment Authority, One-Stop Centre Directorate
- **Current state:** Next.js 15 + TypeScript + Tailwind CSS frontend exists in `treat/frontend/`. Firebase backend (Auth, Firestore, Cloud Functions, Storage, Hosting) is broken because Spark free plan doesn't support Cloud Functions. Multiple features non-functional.
- **Existing code:** ~100+ components/pages already built — auth flows, chatbot, events, tickets, analytics, dashboard, projects, agencies, tools (ROI calculator, tax calculator, invoice generator, document checklist). Most rely on Firebase backend that doesn't work.
- **Enhancement doc:** `treat/required.md` — comprehensive recommendations benchmarked against Invest India and GTAI Germany. All 7 recommendations are in scope for this build.
- **Data source:** Licensed projects data (9,922+ projects, $49.5B investments, 1.25M jobs since 1991) currently in PDF files in `treat/key_files/`. Needs extraction and import into Sanity.
- **Historical performance:** FY 2020/21-2024/25 data available. FY 2022/23 peak at US$10.05B planned investment.
- **Benchmark targets:** <4hr inquiry response, >85% satisfaction, >15% inquiry-to-license conversion, >90% SLA compliance, 10K+ monthly visitors, >70% chatbot resolution rate.

## Constraints

- **Cost**: Must use free tiers only — Sanity free plan, Vercel free plan, Gemini free API tier, Leaflet (open source)
- **AI scope**: Chatbot must ONLY answer questions about UIA, investment in Uganda, OSC services, licensing procedures. Must refuse/redirect off-topic queries.
- **Maps**: Leaflet (open source) — no Google Maps, no Mapbox
- **Quality**: Zero tolerance for errors. Every page must work. Every feature must be functional. Production-ready for client handoff.
- **Stack**: Next.js 15 + TypeScript + Tailwind CSS (frontend), Sanity CMS (content/data), Vercel (hosting + API routes), Gemini free tier (AI chatbot)
- **Existing code**: Preserve and adapt existing components where possible. Don't rebuild what works — rewire it.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Replace Firebase with Sanity CMS | Firebase Spark plan blocks Cloud Functions; Sanity free tier provides content management, API, and admin studio | — Pending |
| Deploy on Vercel instead of Firebase Hosting | Free tier includes serverless functions (API routes), perfect Next.js support, no cold starts | — Pending |
| Leaflet for maps | Open source, no API key costs, sufficient for project markers and interactive filtering | — Pending |
| Admin-only auth | Public investors don't need accounts; simplifies architecture; ticket tracking via reference numbers | — Pending |
| Scope-restricted AI chatbot | Client requirement — chatbot must stay on-topic for UIA/investment queries only | — Pending |
| Keep Gemini free tier | Already integrated via @google/generative-ai, free tier sufficient for chatbot volume | — Pending |
| UI refresh not rebuild | Existing components are extensive; refresh styling/polish, don't rewrite from scratch | — Pending |

---
*Last updated: 2026-03-01 after initialization*
