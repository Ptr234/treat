# ROADMAP: UIA One-Stop Centre Digital Tool

**Scope:** v1 release — 51 requirements across 9 categories
**Depth:** Standard (8 phases)
**Last Updated:** 2026-03-01

---

## Phases

- [ ] **Phase 1: Platform Foundation** - Migrate from Firebase to Sanity + Vercel, admin auth, clean codebase
- [ ] **Phase 2: Core Ticket System** - Foundational inquiry/ticket tracking enabling all analytics and dashboards
- [ ] **Phase 3: Inquiry Analytics & Intelligence** - Geographic heat maps, sector distribution, investment funnel, trends
- [ ] **Phase 4: UIA Assistant Chatbot** - AI-powered assistance with scope restriction and multilingual support
- [ ] **Phase 5: Licensed Projects Database & Map** - 9,922+ projects searchable with Leaflet interactive map
- [ ] **Phase 6: Events & Investment Activities** - Event management with calendar sync and post-event resources
- [ ] **Phase 7: Inter-Agency Collaboration Hub** - Officer messaging, case channels, unified investor profiles, cross-agency SLA
- [ ] **Phase 8: Director General Dashboard & Polish** - Executive real-time metrics, alerts, UI/UX refresh, production readiness

---

## Phase Details

### Phase 1: Platform Foundation

**Goal:** Migrate infrastructure from Firebase to Sanity CMS + Vercel, establish admin authentication, and clean the codebase to production-ready state.

**Depends on:** Nothing (foundational)

**Requirements:** PLAT-01, PLAT-02, PLAT-03, PLAT-04, PLAT-05, PLAT-06

**Success Criteria** (what must be TRUE when complete):

1. Sanity CMS schema deployed with all content type definitions (events, projects, agencies, tickets, analytics metadata, dashboard configuration)
2. Next.js app deployed on Vercel with all API routes functional and working (no Firebase dependencies remain)
3. Admin staff can log into Sanity Studio and edit content — authentication required for all sensitive operations
4. All pages render without console errors, broken links, or dead features — codebase is clean and functional
5. Responsive design verified on mobile (375px), tablet (768px), and desktop (1440px) viewports — all layouts adapt correctly

**Plans:** 2/4 plans executed (01-03 partial — Task 1 done, checkpoint reached)

Plans:
- [x] 01-01-PLAN.md — Sanity CMS setup: install packages, define all 9 content type schemas, configure Sanity client and GROQ queries
- [x] 01-02-PLAN.md — Firebase removal: uninstall firebase package, remove all 9 Firebase-dependent source files, replace AuthContext with stub
- [~] 01-03-PLAN.md — API routes + Vercel deployment: 8 API routes created, build passes locally; awaiting Sanity project creation + Vercel deployment (human checkpoint)
- [ ] 01-04-PLAN.md — Codebase cleanup + responsive audit: fix all lint/TS errors, zero console errors across all pages, responsive at 375/768/1440px

---

### Phase 2: Core Ticket System

**Goal:** Build foundational issue tracking system enabling investors to submit inquiries, track status in real-time, and enabling all downstream analytics and dashboards.

**Depends on:** Phase 1 (platform and auth infrastructure)

**Requirements:** TICK-01, TICK-02, TICK-03, TICK-04, TICK-05, TICK-06, TICK-07, TICK-08, TICK-09, TICK-10

**Success Criteria** (what must be TRUE when complete):

1. Investor can submit inquiry/ticket without logging in and immediately receives unique reference number (e.g., UIA-2026-0001)
2. Investor can track ticket status in real-time using reference number — all lifecycle stages (NEW > ASSIGNED > IN PROGRESS > PENDING EXTERNAL > RESOLVED > CLOSED) are visible and update correctly
3. Full communication history is available on ticket detail view — investor sees all officer responses and system messages chronologically
4. Investor can upload documents and view resolution satisfaction rating form after closure — admin can see all artifacts
5. Admin can manage all tickets through Sanity Studio — create, assign, update status, respond, escalate, and monitor SLA compliance per category/priority

**Plans:** TBD

---

### Phase 3: Inquiry Analytics & Intelligence

**Goal:** Build analytics dashboards with geographic heat maps, sector distribution, investment funnel, and time-series trends to enable data-driven decision-making.

**Depends on:** Phase 2 (requires ticket data pipeline), Phase 1 (infrastructure)

**Requirements:** ANLY-01, ANLY-02, ANLY-03, ANLY-04, ANLY-05, ANLY-06

**Success Criteria** (what must be TRUE when complete):

1. World map displays inquiry density heat map (color intensity by region) — geospatial distribution of inquiries is immediately visible
2. Dashboard shows sector-wise distribution as pie/bar charts and investment funnel visualization (Inquiry > Facilitation > Application > Licensing > Operation) with accurate conversion rates
3. Time-series trend analysis displays MoM and YoY comparisons with trend indicators — historical context is clear for decision-makers
4. Analytics captures and displays inquiry metadata: geographic origin, sector, investment size, investor profile, inquiry channel — data is comprehensive
5. Admin can view and filter analytics data in Sanity Studio by date range, sector, region, priority — filtering enables custom reports

**Plans:** TBD

---

### Phase 4: UIA Assistant Chatbot

**Goal:** Deploy AI-powered chatbot branded as "UIA Assistant" with strict scope restriction, multilingual support, and human escalation pathways.

**Depends on:** Phase 1 (deployment infrastructure), Phase 2 (for escalation context)

**Requirements:** CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08

**Success Criteria** (what must be TRUE when complete):

1. Persistent chatbot widget is accessible on every page — user can open chat from any location without page reload or loss of context
2. Chatbot responds only to UIA/OSC/Uganda investment topics — off-topic queries are refused with helpful redirect to appropriate resource or human support
3. Chatbot supports multilingual input/output in English, French, Arabic, Chinese, and Swahili — language auto-detection works or user can select
4. Chatbot knowledge base covers investment procedures, incentives, sector opportunities, and licensing requirements — responses are accurate and contextual
5. User can escalate to human officer from chat interface — full conversation context transfers to officer for seamless handoff

**Plans:** TBD

---

### Phase 5: Licensed Projects Database & Map

**Goal:** Import and surface 9,922+ licensed projects with searchable database and interactive Leaflet map enabling investors to discover investment opportunities.

**Depends on:** Phase 1 (infrastructure and Sanity CMS for data storage)

**Requirements:** PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05, PROJ-06, PROJ-07, PROJ-08, PROJ-09

**Success Criteria** (what must be TRUE when complete):

1. 9,922+ licensed projects extracted from PDF files and successfully imported into Sanity CMS — data is accessible via API
2. User can search and browse project database with full-text search on company name, sector, location — search results are fast and relevant
3. Interactive Leaflet map displays project markers with cluster visualization for density — user can zoom, pan, and click markers for details
4. Projects are filterable by sector, region, investment size category, and operational status — filter combinations work correctly and update map in real-time
5. Map displays industrial parks overlay and infrastructure proximity indicators (roads, power, water) — geographic context is clear
6. User can export filtered project data to CSV/Excel for research — export contains all relevant fields and is parseable

**Plans:** TBD

---

### Phase 6: Events & Investment Activities

**Goal:** Enable event discovery, registration, and calendar synchronization for events (forums, missions, symposiums, EAC summits, global events, webinars).

**Depends on:** Phase 1 (infrastructure)

**Requirements:** EVNT-01, EVNT-02, EVNT-03, EVNT-04, EVNT-05

**Success Criteria** (what must be TRUE when complete):

1. User can browse events filtered by category (UIA forums, government missions, sector symposiums, EAC summits, global events, webinars) — all categories are discoverable and descriptions are clear
2. User can register/RSVP for events online — registration is confirmed with email and reference number
3. User can sync events to personal calendar (iCal, Google Calendar, Outlook) with correct date/time and event details — sync is automatic or one-click
4. Post-event resources (presentations, recordings, attendee materials) are accessible in event detail view — all resources download correctly
5. Admin can create, edit, and manage events through Sanity Studio — all event fields are editable and publish/unpublish controls work

**Plans:** TBD

---

### Phase 7: Inter-Agency Collaboration Hub

**Goal:** Build officer-to-officer messaging, per-investor case channels, and unified cross-agency profiles enabling seamless inter-agency collaboration on investor cases.

**Depends on:** Phase 2 (ticket/case context), Phase 1 (infrastructure and auth)

**Requirements:** AGCY-01, AGCY-02, AGCY-03, AGCY-04, AGCY-05, AGCY-06

**Success Criteria** (what must be TRUE when complete):

1. Officers can send instant messages to officers at other OSC agencies — messages are persisted, searchable, and marked read/unread
2. Per-investor case channels enable cross-agency collaboration — officers from multiple agencies can view shared case context and comment
3. Officers can share documents within case channels — document upload, preview, and download all work reliably
4. Unified investor profile is visible across all agencies (UIA, URSB, URA, DCIC, NEMA, KCCA, Ministry of Lands, UNBS, ERA) — investor's full case history is visible regardless of which agency views it
5. Cross-agency SLA monitoring tracks response times between agencies — dashboard shows which agencies are meeting/breaching SLAs

**Plans:** TBD

---

### Phase 8: Director General Dashboard & Polish

**Goal:** Build real-time executive dashboard with performance metrics, alert system, and complete UI/UX refresh to production-ready state.

**Depends on:** Phase 2 (ticket data), Phase 3 (analytics data), Phase 7 (agency collaboration data)

**Requirements:** DGLV-01, DGLV-02, DGLV-03, DGLV-04, DGLV-05, UIUX-01, UIUX-02, UIUX-03, UIUX-04, UIUX-05

**Success Criteria** (what must be TRUE when complete):

1. Dashboard displays real-time metrics: live inquiry counter, active facilitation cases, pending approvals by agency, investment pipeline value in USD — all counters update as data changes
2. Dashboard displays performance indicators: response rates, conversion funnel percentages, agency scorecards (response time, resolution rate), SLA compliance rates — metrics are actionable
3. Alert system triggers notifications for: VIP inquiry delays (>8h), SLA breaches, high-volume days (>150% average), large investments (>$50M) — alerts are visible and dismissible
4. Executive can intervene on cases (assign, reassign, prioritize), flag cases, and generate custom reports — executive actions execute and persist
5. Homepage refreshed with modern design and live statistics banner (9,922 projects, $49.5B investments, 1.25M jobs) — design is contemporary and metrics are compelling
6. All existing tool pages are functional (ROI calculator, tax calculator, invoice generator, document checklist) — tools work and are wired correctly
7. Loading states, error states, and empty states are handled gracefully on every page — no users see broken UI or confusing blank screens

**Plans:** TBD

---

## Coverage Validation

| Category | Requirements | Phase | Status |
|----------|--------------|-------|--------|
| Platform & Infrastructure | PLAT-01 to PLAT-06 | Phase 1 | Planned |
| UIA Assistant Chatbot | CHAT-01 to CHAT-08 | Phase 4 | Pending |
| Events & Investment Activities | EVNT-01 to EVNT-05 | Phase 6 | Pending |
| Inquiry Analytics & Intelligence | ANLY-01 to ANLY-06 | Phase 3 | Pending |
| Issue Tracking System | TICK-01 to TICK-10 | Phase 2 | Pending |
| Inter-Agency Collaboration Hub | AGCY-01 to AGCY-06 | Phase 7 | Pending |
| Licensed Projects Database | PROJ-01 to PROJ-09 | Phase 5 | Pending |
| Director General Dashboard | DGLV-01 to DGLV-05 | Phase 8 | Pending |
| UI & UX | UIUX-01 to UIUX-05 | Phase 8 | Pending |

**Total Mapped:** 51/51 requirements ✓

---

## Progress Tracking

| Phase | Goal | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 1 | 2/4 | In Progress|  | — |
| 2 | Core Ticket System | TBD | Not started | — |
| 3 | Inquiry Analytics & Intelligence | TBD | Not started | — |
| 4 | UIA Assistant Chatbot | TBD | Not started | — |
| 5 | Licensed Projects Database & Map | TBD | Not started | — |
| 6 | Events & Investment Activities | TBD | Not started | — |
| 7 | Inter-Agency Collaboration Hub | TBD | Not started | — |
| 8 | Director General Dashboard & Polish | TBD | Not started | — |

---

*Roadmap created: 2026-03-01*
*Phase 1 planned: 2026-03-01 — 4 plans, 2 waves*
