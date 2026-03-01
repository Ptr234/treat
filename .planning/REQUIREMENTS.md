# Requirements: UIA One-Stop Centre Digital Tool

**Defined:** 2026-03-01
**Core Value:** Investors can find information, submit inquiries, and track their issues through a single reliable platform — with zero broken features.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Platform & Infrastructure

- [ ] **PLAT-01**: Sanity CMS schema deployed with all content types (events, projects, agencies, tickets, analytics, dashboard config)
- [ ] **PLAT-02**: Next.js app deployed on Vercel with all API routes functional (replacing Firebase Cloud Functions)
- [ ] **PLAT-03**: Admin authentication — staff can log in to Sanity Studio to manage all content
- [ ] **PLAT-04**: All existing pages render without console errors, broken links, or dead features
- [ ] **PLAT-05**: Responsive design works correctly on mobile, tablet, and desktop
- [ ] **PLAT-06**: All Firebase dependencies removed — no references to Firebase SDK, Firestore, or Cloud Functions remain

### UIA Assistant (AI Chatbot)

- [ ] **CHAT-01**: User can interact with UIA Assistant on any page via persistent widget
- [ ] **CHAT-02**: Chatbot responds only to UIA/OSC/Uganda investment topics — refuses or redirects off-topic queries
- [ ] **CHAT-03**: Chatbot supports multilingual input/output (English, French, Arabic, Chinese, Swahili)
- [ ] **CHAT-04**: Chatbot knowledge base covers investment procedures, incentives, sector opportunities, licensing requirements
- [ ] **CHAT-05**: User can escalate chatbot conversation to human officer with full context transfer
- [ ] **CHAT-06**: Chatbot performs sentiment analysis on investor interactions for satisfaction tracking
- [ ] **CHAT-07**: Chatbot supports voice input for accessibility
- [ ] **CHAT-08**: Chatbot powered by Gemini free tier API

### Events & Investment Activities

- [ ] **EVNT-01**: User can browse events by category (UIA forums, government missions, sector symposiums, EAC summits, global events, webinars)
- [ ] **EVNT-02**: User can register/RSVP for events online
- [ ] **EVNT-03**: User can sync events to personal calendar (iCal, Google Calendar, Outlook)
- [ ] **EVNT-04**: User can access post-event resources (presentations, recordings)
- [ ] **EVNT-05**: Admin can create, edit, and manage events through Sanity Studio

### Inquiry Analytics & Intelligence Dashboard

- [ ] **ANLY-01**: Dashboard displays world map with inquiry heat density (geographic distribution)
- [ ] **ANLY-02**: Dashboard displays sector-wise distribution charts (pie/bar)
- [ ] **ANLY-03**: Dashboard displays investment funnel (Inquiry > Facilitation > Application > Licensing > Operation)
- [ ] **ANLY-04**: Dashboard displays time-series trend analysis with MoM and YoY comparisons
- [ ] **ANLY-05**: Analytics captures inquiry data: geographic origin, sector, investment size, investor profile, inquiry channel
- [ ] **ANLY-06**: Admin can view and filter analytics data in Sanity Studio

### Issue Tracking System

- [ ] **TICK-01**: Investor can submit inquiry/ticket without logging in
- [ ] **TICK-02**: Investor receives unique reference number after submission
- [ ] **TICK-03**: Investor can track ticket status in real-time using reference number
- [ ] **TICK-04**: Ticket follows full lifecycle: NEW > ASSIGNED > IN PROGRESS > PENDING EXTERNAL > RESOLVED > CLOSED
- [ ] **TICK-05**: SLA monitoring enforced per category/priority (General: 24h/5d, Procedure: 8h/3d, Application: 4h/2d, License Delay: 2h/5d, Complaint: 2h/3d, VIP: 1h/same day)
- [ ] **TICK-06**: Investor can view full communication history on their ticket
- [ ] **TICK-07**: Investor can upload additional documents to their ticket
- [ ] **TICK-08**: Investor can rate resolution satisfaction after ticket closure
- [ ] **TICK-09**: Investor can request escalation on their ticket
- [ ] **TICK-10**: Admin can manage tickets (assign, update status, respond) through Sanity Studio or admin panel

### Inter-Agency Engagement Hub

- [ ] **AGCY-01**: Officers can send instant messages to officers at other OSC agencies
- [ ] **AGCY-02**: Per-investor case channels enable cross-agency collaboration on specific cases
- [ ] **AGCY-03**: Officers can share documents within case channels
- [ ] **AGCY-04**: Unified investor profile visible across all agencies (UIA, URSB, URA, DCIC, NEMA, KCCA, Ministry of Lands, UNBS, ERA)
- [ ] **AGCY-05**: Cross-agency SLA monitoring tracks response times between agencies
- [ ] **AGCY-06**: Admin can manage agency profiles and officer accounts

### Licensed Projects Database & Investment Map

- [ ] **PROJ-01**: User can search and browse database of 9,922+ licensed projects
- [ ] **PROJ-02**: User can view interactive Leaflet map of Uganda with project markers
- [ ] **PROJ-03**: User can filter projects by sector, region, investment size, operational status
- [ ] **PROJ-04**: Map displays industrial parks overlay with available plots
- [ ] **PROJ-05**: Map displays infrastructure proximity indicators (roads, power, water)
- [ ] **PROJ-06**: User can view project details (company name, sector, investment value range, employment, location, status)
- [ ] **PROJ-07**: User can export filtered project data for research
- [ ] **PROJ-08**: Admin can manage project data through Sanity Studio
- [ ] **PROJ-09**: Project data extracted from PDF files and imported into Sanity

### Director General Live Dashboard

- [ ] **DGLV-01**: Dashboard displays real-time metrics: live inquiry counter, active facilitation cases, pending approvals by agency, investment pipeline value
- [ ] **DGLV-02**: Dashboard displays performance indicators: response rates, conversion funnel, agency scorecards, SLA compliance rates
- [ ] **DGLV-03**: Alert system triggers notifications for: VIP inquiry delays (>8h), SLA breaches, high-volume days (>150% average), large investments (>$50M)
- [ ] **DGLV-04**: Executive can intervene on cases, flag priority, and generate reports
- [ ] **DGLV-05**: Dashboard requires admin authentication to access

### UI & UX

- [ ] **UIUX-01**: Homepage refreshed with modern design, live statistics banner (9,922 projects, $49.5B investments, 1.25M jobs)
- [ ] **UIUX-02**: Navigation is clear and consistent across all pages
- [ ] **UIUX-03**: All existing tool pages functional (ROI calculator, tax calculator, invoice generator, document checklist)
- [ ] **UIUX-04**: Loading states, error states, and empty states handled gracefully on every page
- [ ] **UIUX-05**: Consistent visual language — typography, colors, spacing, components

## v2 Requirements

### Notifications

- **NOTF-01**: Email notifications for ticket status changes
- **NOTF-02**: SMS notifications for VIP alerts and SLA breaches
- **NOTF-03**: Push notifications for admin dashboard alerts

### Advanced Features

- **ADVN-01**: Predictive analytics and ML-based trend forecasting
- **ADVN-02**: Full eBiz portal integration (bidirectional data)
- **ADVN-03**: Mobile native app (iOS/Android)
- **ADVN-04**: Video conferencing built into inter-agency hub
- **ADVN-05**: Social media feed integration

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first with responsive design covers mobile needs |
| eBiz portal rebuild | Separate platform (ebiz.go.ug) — link to it, don't rebuild |
| Paid cloud services | Must use free tiers only (Sanity, Vercel, Gemini) |
| Public user accounts | Admin-only auth — investors use reference numbers for ticket tracking |
| Google Maps / Mapbox | Using Leaflet (open source, no API costs) |
| Email/SMS sending | Requires paid services — defer to v2 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-01 | Phase 1 | Pending |
| PLAT-02 | Phase 1 | Pending |
| PLAT-03 | Phase 1 | Pending |
| PLAT-04 | Phase 1 | Pending |
| PLAT-05 | Phase 1 | Pending |
| PLAT-06 | Phase 1 | Pending |
| CHAT-01 | Phase 4 | Pending |
| CHAT-02 | Phase 4 | Pending |
| CHAT-03 | Phase 4 | Pending |
| CHAT-04 | Phase 4 | Pending |
| CHAT-05 | Phase 4 | Pending |
| CHAT-06 | Phase 4 | Pending |
| CHAT-07 | Phase 4 | Pending |
| CHAT-08 | Phase 4 | Pending |
| EVNT-01 | Phase 6 | Pending |
| EVNT-02 | Phase 6 | Pending |
| EVNT-03 | Phase 6 | Pending |
| EVNT-04 | Phase 6 | Pending |
| EVNT-05 | Phase 6 | Pending |
| ANLY-01 | Phase 3 | Pending |
| ANLY-02 | Phase 3 | Pending |
| ANLY-03 | Phase 3 | Pending |
| ANLY-04 | Phase 3 | Pending |
| ANLY-05 | Phase 3 | Pending |
| ANLY-06 | Phase 3 | Pending |
| TICK-01 | Phase 2 | Pending |
| TICK-02 | Phase 2 | Pending |
| TICK-03 | Phase 2 | Pending |
| TICK-04 | Phase 2 | Pending |
| TICK-05 | Phase 2 | Pending |
| TICK-06 | Phase 2 | Pending |
| TICK-07 | Phase 2 | Pending |
| TICK-08 | Phase 2 | Pending |
| TICK-09 | Phase 2 | Pending |
| TICK-10 | Phase 2 | Pending |
| AGCY-01 | Phase 7 | Pending |
| AGCY-02 | Phase 7 | Pending |
| AGCY-03 | Phase 7 | Pending |
| AGCY-04 | Phase 7 | Pending |
| AGCY-05 | Phase 7 | Pending |
| AGCY-06 | Phase 7 | Pending |
| PROJ-01 | Phase 5 | Pending |
| PROJ-02 | Phase 5 | Pending |
| PROJ-03 | Phase 5 | Pending |
| PROJ-04 | Phase 5 | Pending |
| PROJ-05 | Phase 5 | Pending |
| PROJ-06 | Phase 5 | Pending |
| PROJ-07 | Phase 5 | Pending |
| PROJ-08 | Phase 5 | Pending |
| PROJ-09 | Phase 5 | Pending |
| DGLV-01 | Phase 8 | Pending |
| DGLV-02 | Phase 8 | Pending |
| DGLV-03 | Phase 8 | Pending |
| DGLV-04 | Phase 8 | Pending |
| DGLV-05 | Phase 8 | Pending |
| UIUX-01 | Phase 8 | Pending |
| UIUX-02 | Phase 8 | Pending |
| UIUX-03 | Phase 8 | Pending |
| UIUX-04 | Phase 8 | Pending |
| UIUX-05 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 51 total
- Mapped to phases: 51
- Unmapped: 0

---

*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after roadmap creation*
