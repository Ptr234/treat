# Uganda OneStop Centre (UIA)

A production-grade Next.js 15 platform for the **Uganda Investment Authority** — streamlining investor services, inter-agency coordination, and executive oversight across 9 government agencies.

**Production**: https://frontend-beast4.vercel.app
**Sanity Studio**: https://uia-onestop-centre.sanity.studio

---

## Achievements at a Glance

- 25+ pages and routes (public + admin)
- 46 React components
- 14 Sanity CMS schema types with 56+ seeded documents
- 40+ GROQ queries powering real-time data
- 20+ API routes with auth protection
- 13 custom React hooks
- 50+ TypeScript interfaces for full type safety
- 100+ investment opportunities cataloged
- 9 government agencies integrated
- 5-language multilingual AI chatbot (Groq LLaMA 3.3 70B)
- Interactive Leaflet GIS map with licensed projects
- Full support ticket system with SLA tracking
- DG Live Dashboard with real-time KPIs and agency scorecards
- CSV/PDF analytics export
- Email notifications via Postmark
- Google OAuth + email/password authentication
- WCAG 2.1 AA accessibility compliance target
- 100% TypeScript coverage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.5 (App Router, TypeScript 5.3) |
| CMS | Sanity v4 (GROQ queries, real-time studio) |
| Auth | JWT (jose) + HTTP-only cookies + Google OAuth + Next.js middleware |
| AI Chatbot | Groq API (LLaMA 3.3 70B) with multilingual support |
| Maps | Leaflet / react-leaflet (CARTO dark tiles) |
| Email | Postmark (transactional emails) |
| Charts | Recharts 3.7 |
| Animations | Framer Motion 11.11 |
| Validation | Zod 4.3 |
| UI | Tailwind CSS 4.0, Heroicons, Lucide React |
| Deployment | Vercel (frontend) + Sanity Cloud (CMS) |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (server-side)
│   │   ├── auth/           # Login, logout, Google OAuth, session (JWT)
│   │   ├── dashboard/      # DG Dashboard metrics
│   │   ├── projects/       # Licensed projects (Sanity)
│   │   ├── tickets/        # Issue tracking + messages
│   │   ├── events/         # Investment events
│   │   ├── agencies/       # Government agencies
│   │   ├── messages/       # Inter-agency chat
│   │   ├── chatbot/        # AI assistant (Groq LLaMA 3.3 70B)
│   │   └── health/         # Health check
│   ├── dashboard/          # DG Live Dashboard (admin)
│   ├── agency-chat/        # Inter-agency messaging (admin)
│   ├── projects/           # Licensed Projects Map (public)
│   ├── tickets/            # Issue Tracking (admin view + public submit)
│   ├── investments/        # Investment opportunities + onboarding
│   ├── events/             # Investment events calendar
│   ├── agencies/           # OSC Hub — 9 agencies
│   ├── chatbot/            # Multilingual AI Investor Assistant
│   ├── analytics/          # Inquiry Analytics Dashboard with CSV export
│   ├── services/           # Government services catalog
│   ├── downloads/          # Downloadable resources (forms, guides)
│   ├── business/           # Business registration wizard
│   ├── tools/              # ROI calculator, tax calculator, etc.
│   ├── profile/            # User profile management
│   ├── search/             # Global full-text search
│   └── studio/             # Embedded Sanity Studio
├── components/
│   ├── auth/               # AuthModal, LoginForm, GoogleSignInButton
│   ├── layout/             # Header, Footer, LayoutShell, NewsBar
│   ├── projects/           # LeafletMap, DynamicLeafletMap, MapLegend
│   ├── analytics/          # Charts, funnel, heatmap, benchmarks
│   ├── chatbot/            # ChatWidget, LanguageSelector
│   ├── tickets/            # TicketCard, StatusTimeline, SLAIndicator
│   ├── events/             # EventCard, CalendarExport
│   ├── agency/             # AgencyCard, ContactModal, AppointmentModal
│   ├── investments/        # InvestmentCard, InvestmentGrid, Filters
│   └── tools/              # ROI, Tax, Invoice, Checklist components
├── contexts/               # AuthContext, ThemeContext, NotificationContext, MobileContext
├── hooks/                  # 13 custom hooks (useProjects, useDashboard, useTickets, etc.)
├── lib/                    # Sanity client, GROQ queries, auth utils, email service, validations
├── types/                  # 50+ TypeScript interfaces
└── data/mock/              # Fallback mock data for all modules
sanity/
├── schemaTypes/            # 14 Sanity document schemas
└── env.ts                  # Sanity env config
```

---

## Features

### Public Pages (no auth required)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with live stats (FDI, investments, satisfaction, sectors), key services overview |
| Investments | `/investments` | 100+ investment opportunities with advanced filtering, search, grid/list views |
| Investment Onboarding | `/investments/onboarding` | 6-step investor profiling wizard |
| Investment Details | `/investments/[id]` | Dynamic investment opportunity pages with contacts and metrics |
| Services | `/services` | Government services directory |
| Agencies (OSC Hub) | `/agencies` | 9 government agencies with services and contact info |
| Agency Details | `/agencies/[id]` | Individual agency profiles with service request forms |
| Events | `/events` | Investment events, forums, missions, and webinars |
| Event Details | `/events/[id]` | Event information with registration and resource downloads |
| Projects Map | `/projects` | Interactive Leaflet GIS map of licensed projects with heatmap and clustering |
| AI Assistant | `/chatbot` | Groq LLaMA 3.3 70B chatbot in 5 languages (EN, FR, AR, ZH, SW) |
| Tools | `/tools` | ROI calculator, tax calculator, document checklist, invoice generator |
| Downloads | `/downloads` | Downloadable resources, registration forms, and guides |
| Business Registration | `/business/registration` | Step-by-step business registration wizard |
| Support | `/support` | Contact and support info |
| Search | `/search` | Full-text search across investments, agencies, services, events, projects |
| Tickets | `/tickets/create` | Submit support tickets with file attachments |

### Admin Pages (requires sign-in)

| Page | Route | Description |
|------|-------|-------------|
| DG Dashboard | `/dashboard` | Live KPIs, agency scorecard, SLA alerts, escalated tickets, activity feed |
| Dashboard Enquiries | `/dashboard/enquiries` | Admin inquiry management and tracking |
| Agency Chat | `/agency-chat` | Inter-agency messaging by ticket channel with file attachments |
| Issue Tracking | `/tickets` | Full ticket management with SLA tracking, assignment, escalation |
| Ticket Detail | `/tickets/[id]` | Ticket conversation thread with internal/external messages |
| Analytics | `/analytics` | Inquiry analytics with geographic, sector, funnel, and time-series views + CSV export |
| Profile | `/profile` | Update name, change password, view Google profile picture |
| Admin Panel | `/admin` | System administration |
| Sanity Studio | `/studio` | Embedded CMS content management |

---

## Key Feature Details

### Investment Ecosystem

- **100+ investment opportunities** across 8 sectors (agriculture, tourism, manufacturing, energy, mining, ICT, health, real estate)
- **Advanced filtering**: category, sector, priority, investment range, ROI
- **Grid and list view modes** with multi-level sorting
- **6-step onboarding wizard**: investor profile, capacity evaluation, sector interests, personal details, readiness assessment, submission
- **Investment cards** with agency logos and direct contact actions
- **Contact database** with 10+ government agency contacts

### AI Chatbot (Groq LLaMA 3.3 70B)

- **5-language support**: English, French, Arabic, Swahili, Chinese
- **Knowledge base**: 50+ Q&A pairs covering investment topics in Uganda
- **Automatic translation** of knowledge base entries to user's selected language
- **Sentiment analysis** on every message (positive/neutral/negative)
- **Scope restriction**: enforced topic boundaries (investment queries only)
- **Rate limiting**: 20 requests per minute per IP
- **Quick topics**: Investment Procedures, Tax Incentives, Business Registration, Work Permits, Industrial Parks, Sector Opportunities
- **Graceful fallbacks** with translated error messages

### Support Ticket System

- **Ticket creation** with categories, priority levels, descriptions, and file attachments
- **Unique reference numbers**: `UIA-YYYY-NNNN` format
- **6 status levels**: New, Assigned, In Progress, Pending External, Resolved, Closed
- **4 priority levels**: Low, Medium, High, Critical
- **6 ticket categories**: General Inquiry, Procedure Query, Application Support, License Delay, Complaint, VIP
- **SLA tracking** with automatic deadline calculation per category:
  - General Inquiry: 24h | Procedure Query: 8h | Application Support: 4h
  - License Delay: 2h | Complaint: 2h | VIP: 1h
- **Escalation system** with priority boost (4h SLA for escalated tickets)
- **Message threads** with internal/external comments
- **Satisfaction ratings** (1-5 stars)
- **Email notifications**: confirmation, status updates, escalation alerts (via Postmark)

### DG Live Dashboard

- **Real-time metrics**: inquiries, active cases, pending approvals, pipeline value, response rate, conversion rate, SLA compliance, satisfaction score
- **Agency scorecard**: performance scores, active cases, resolved today, avg response time, SLA compliance — sortable and filterable
- **Alert system**: priority-based alerts (VIP delays, SLA breaches, high volume, large investments, system issues) with acknowledge/dismiss
- **Escalated tickets section** with priority highlighting and quick actions
- **Activity feed**: real-time logging of inquiries, approvals, escalations, resolutions
- **Auto-refresh**: configurable intervals (5s, 15s, 30s, manual)
- **Tab views**: Active Cases, Escalations, Forecasting

### Analytics & Reporting

- **Geographic analysis**: inquiries by country/region with investment values
- **Sector distribution**: breakdown by sector with trends
- **Investment funnel**: inquiries → facilitation → applications → licensing → operational
- **Time series**: trends over time with conversions and investment value
- **Benchmarking**: current vs target metrics across regions
- **CSV export** for all analytics data
- **Date range filtering**: 30 days, 90 days, 12 months, all time

### Licensed Projects Map

- **Interactive Leaflet.js map** with CARTO dark tiles
- **Heatmap layer** showing investment density
- **Cluster markers** for zoomed-out views
- **Project data**: company, sector, region, investment value, employment, license date, investor nationality
- **Sector-based filtering** and status tracking (active, under construction, planned, completed)

### Business Tools

| Tool | Description |
|------|-------------|
| ROI Calculator | Sector-specific multipliers, tax incentives, risk-adjusted ROI, payback period, economic impact |
| Tax Calculator | Business tax obligations, incentive calculations, regional differences, sector-specific rates |
| Invoice Generator | Professional invoice creation with line items, tax calculations, print/export |
| Document Checklist | Requirements checklist for registration, licensing, and tax compliance |

### Inter-Agency Communication

- **Agency chat** with message channels organized by ticket
- **File attachments** via Sanity Assets API
- **Internal/external message types**
- **9 agencies integrated**: UIA, URSB, URA, DCIC, NEMA, KCCA, MLHUD, UNBS, ERA

### Email Notifications (Postmark)

- Ticket confirmation emails on creation
- Status update emails on ticket changes
- Escalation notification emails to admin/officers
- Investor welcome emails

### Downloadable Resources

- Registration forms and application templates
- Investment guides and sector briefs
- Legal and compliance documents
- Managed via Sanity CMS (`downloadableResource` schema)

---

## Authentication System

### How It Works

1. **Sign in** via the "Sign In" button in the header (email/password or Google)
2. Credentials verified against `adminUser` documents in Sanity CMS
3. On success, JWT token set as HTTP-only cookie (`osc-session`, 24h expiry)
4. Session persists across page refreshes (cookie-based)
5. Next.js middleware protects admin routes server-side
6. Google profile pictures automatically loaded for Google sign-ins

### Auth Architecture

```
Client (AuthContext)           Server
  │                              │
  ├─ POST /api/auth/login/ ────► Sanity: lookup adminUser by email
  │                              │ verify password hash (PBKDF2, 100K iterations)
  │                              │ create JWT (jose, HS256, 24h expiry)
  │  ◄── Set-Cookie: osc-session │
  │                              │
  ├─ POST /api/auth/google/ ───► Verify Google ID token
  │                              │ Match email to Sanity adminUser
  │                              │ Fetch Google profile picture
  │  ◄── Set-Cookie: osc-session │
  │                              │
  ├─ GET /api/auth/me/ ────────► Verify JWT from cookie
  │  ◄── { user: {...} }        │
  │                              │
  ├─ POST /api/auth/logout/ ───► Clear cookie (maxAge: 0)
  │                              │
  └─ Middleware ────────────────► Verify JWT on protected routes
                                 │ Redirect to / if invalid
```

### Protected Routes (Middleware)

| Route | Protection |
|-------|-----------|
| `/dashboard/*` | Redirect to `/` if not admin |
| `/agency-chat/*` | Redirect to `/` if not admin |
| `/admin/*` | Redirect to `/` if not admin |
| `/api/dashboard/*` | 401 JSON if not admin |
| `/api/messages/*` | 401 JSON if not admin |
| `/api/upload/*` | 401 JSON if not admin |

---

## Sanity CMS

### Schemas (14 document types)

| Schema | Description |
|--------|-------------|
| `adminUser` | Admin users with hashed passwords |
| `agency` | Government agencies (UIA, URSB, URA, etc.) |
| `agencyProfile` | Agency SLA configs and response times |
| `agencyMessage` | Inter-agency chat messages |
| `event` | Investment events and forums |
| `licenseProject` | Licensed investment projects |
| `ticket` | Support/issue tracking tickets |
| `ticketMessage` | Ticket conversation messages |
| `analyticsMetadata` | Analytics period summaries |
| `dashboardConfig` | Dashboard configuration |
| `investorProfile` | Investor profiles from onboarding wizard |
| `chatEnquiry` | Chatbot conversation logs |
| `investmentOpportunity` | Investment opportunities catalog |
| `downloadableResource` | Downloadable documents and guides |

### Sanity Configuration

- **Project ID**: `juhrlluw`
- **Dataset**: `production`
- **Studio**: https://uia-onestop-centre.sanity.studio
- **Embedded Studio**: Available at `/studio` route in the app

### Seeded Data

56+ documents seeded via `scripts/seed-sanity.mjs`:
- 9 agencies (UIA, URSB, URA, DCIC, NEMA, KCCA, MLHUD, UNBS, ERA)
- 12 licensed projects (TotalEnergies $4B, Liao Shen $220M, etc.)
- 8 investment events
- 6 support tickets with agency assignments
- 3 ticket messages
- 2 analytics periods
- 9 dashboard configs
- 7 agency profiles with SLA settings

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login/` | Public | Email/password login (returns JWT cookie) |
| POST | `/api/auth/google/` | Public | Google OAuth sign-in |
| GET | `/api/auth/me/` | Cookie | Session validation + user profile |
| POST | `/api/auth/logout/` | Cookie | Clear session |
| POST | `/api/auth/profile/` | Cookie | Update profile |
| GET | `/api/dashboard/` | Admin | DG dashboard metrics + agency scorecard |
| GET | `/api/projects/` | Public | Licensed projects from Sanity |
| GET | `/api/tickets/` | Public | Support tickets (paginated) |
| POST | `/api/tickets/` | Public | Create ticket (with SLA + email notification) |
| GET | `/api/tickets/[id]/` | Public | Ticket detail |
| POST | `/api/tickets/[id]/` | Public | Update ticket status/assignment |
| GET | `/api/tickets/[id]/messages/` | Public | Ticket conversation messages |
| POST | `/api/tickets/[id]/messages/` | Public | Add message to ticket thread |
| GET | `/api/events/` | Public | Investment events |
| GET | `/api/events/[id]/` | Public | Event detail |
| POST | `/api/events/` | Admin | Create event |
| GET | `/api/agencies/` | Public | Government agencies |
| POST | `/api/agencies/` | Admin | Create/update agency |
| GET, POST | `/api/messages/` | Admin | Inter-agency chat messages |
| POST | `/api/chatbot/` | Public | AI assistant (Groq, rate-limited) |
| POST | `/api/chatbot/log/` | Public | Log chatbot conversation |
| POST | `/api/upload/` | Admin | File upload to Sanity Assets |
| GET | `/api/health/` | Public | Health check |

---

## Environment Variables

### `.env.local` (server-side, gitignored)

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=juhrlluw
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_TOKEN=sk...  # Server write token

# Auth
JWT_SECRET=your-jwt-secret-here

# AI Chatbot (Groq)
GROQ_API_KEY=your-groq-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Email (Postmark)
POSTMARK_API_TOKEN=your-postmark-token
```

---

## Development

### Prerequisites

- Node.js 18+ (Node 24 via nvm for Sanity CLI)
- npm

### Setup

```bash
cd treat/frontend
npm install
cp .env.example .env.local  # Add your tokens
npm run dev                  # http://localhost:3000
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `node scripts/seed-sanity.mjs` | Seed CMS with sample data |
| `node scripts/seed-admin.mjs` | Create admin user in Sanity |
| `node scripts/seed-resources.ts` | Seed downloadable resources |

### Sanity Studio Deployment

```bash
nvm use 24
npx sanity deploy  # Deploys to uia-onestop-centre.sanity.studio
```

---

## Document Uploads

Files are uploaded to **Sanity Assets API** and served via `cdn.sanity.io`.

### How It Works

```
Client                              Server (/api/upload/)
  │                                    │
  ├─ POST FormData { file } ─────────► Validate type + size
  │                                    │ Upload to Sanity Assets API
  │  ◄── { assetId, url, fileRef }     │ Return CDN URL + Sanity reference
  │                                    │
  └─ Include fileRef in ticket/message payload
```

### Supported File Types

| Type | Extensions |
|------|-----------|
| Documents | PDF, DOC, DOCX, TXT |
| Images | PNG, JPG, JPEG |
| Spreadsheets | XLS, XLSX |

### Limits

| Constraint | Value |
|-----------|-------|
| Max file size | 10 MB |
| Max files per ticket | 5 |
| Max files per chat message | 3 |

### Where Uploads Are Used

| Feature | Schema Field | Description |
|---------|-------------|-------------|
| Ticket creation | `ticket.documents` | Investors attach business plans, certificates, IDs when submitting issues |
| Agency chat | `agencyMessage.attachments` | Officers share documents in inter-agency channels |
| Ticket messages | `ticketMessage.attachments` | Attachments in ticket conversation threads |

---

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useApi` | API request wrapper with caching |
| `useDashboard` | Admin dashboard data management with real-time refresh |
| `useSearch` | Global full-text search across all content types |
| `useEvents` | Event data management and filtering |
| `useProjects` | Licensed projects with map integration |
| `useLocalStorage` | Browser local storage wrapper |
| `useVoiceInput` | Voice input using Web Speech API |
| `useChatEngine` | Chatbot conversation management |
| `useTickets` | Ticket system CRUD and filtering |
| `useIntersectionObserver` | Lazy loading detection for performance |
| `useDebounce` | Debounced values for search input |
| `useFirestoreCollection` | Firestore document syncing |

---

## Contexts & Providers

| Context | Purpose |
|---------|---------|
| `AuthContext` | User authentication state, login/logout, session persistence |
| `ThemeContext` | Light/dark mode theming |
| `NotificationContext` | Toast notification system |
| `MobileContext` | Mobile device detection and responsive behavior |

---

## Deployment

### Vercel

The app deploys automatically on push to `main`. Make sure environment variables are set in Vercel.

### Sanity CORS

Required CORS origins in Sanity project settings:
- `http://localhost:3000`
- `https://frontend-beast4.vercel.app`
- `https://uia-onestop-centre.sanity.studio`

---

## How the App Works

### Overview

The Uganda OneStop Centre is a **dual-audience platform**:

1. **Public-facing** — Investors and business owners browse services, explore 100+ opportunities, submit support tickets, use AI-assisted tools, and register businesses. No login required.
2. **Admin-facing** — UIA administrators manage tickets, coordinate across 9 government agencies, monitor KPIs via a live dashboard, and export analytics. Requires sign-in.

### User Journeys

#### General Public (Investors / Business Owners)

```
Investor visits site
  |
  |-- Browse ---------- /services       -> Government services catalog
  |                     /investments     -> 100+ investment opportunities (filter, search, sort)
  |                     /agencies        -> 9 OSC agencies (UIA, URSB, URA, etc.)
  |                     /events          -> Investment events calendar
  |                     /projects        -> Interactive GIS map of licensed projects
  |                     /downloads       -> Registration forms, guides, templates
  |
  |-- Use Tools ------- /tools/roi-calculator       -> Sector-specific ROI estimation
  |                     /tools/tax-calculator        -> Uganda tax breakdown
  |                     /tools/document-checklist    -> Required documents list
  |                     /tools/invoice-generator     -> Professional invoice creation
  |
  |-- Get AI Help ----- /chatbot        -> Groq LLaMA 3.3 70B AI assistant
  |                                       (5 languages: EN, FR, AR, ZH, SW)
  |                                       50+ knowledge base entries
  |                                       Rate-limited: 20 requests/min per IP
  |
  |-- Start Investing - /investments/onboarding -> 6-step wizard
  |                                       Collects: investor profile, capacity,
  |                                       sector interest, personal details,
  |                                       readiness assessment, submission
  |
  |-- Register -------- /business/registration -> Step-by-step business registration
  |
  +-- Submit a Ticket - /tickets/create -> Multi-step support request form
                                          Collects: category, description, contact
                                          info, nationality, sector, investment size
                                          -> Saved to Sanity CMS with SLA tracking
                                          -> Email confirmation via Postmark
                                          -> Returns reference number (e.g. UIA-2026-0001)
```

#### Admin (UIA Staff)

```
Admin signs in (header "Sign In" button)
  |
  |-- Email + Password - POST /api/auth/login  -> Verify against Sanity adminUser
  |                                               -> Issue JWT cookie (24h)
  |-- Google Sign-In --- POST /api/auth/google -> Verify Google ID token
  |                                               -> Match email to Sanity adminUser
  |                                               -> Fetch Google profile picture
  |                                               -> Issue JWT cookie (24h)
  |
  |-- Dashboard -------- /dashboard     -> Live KPIs, SLA alerts, agency scorecard,
  |                                       pipeline value, activity feed, escalations
  |                       /dashboard/enquiries -> Inquiry management
  |
  |-- Ticket Mgmt ------ /tickets       -> View, assign, escalate, resolve tickets
  |                       /tickets/[id]  -> Ticket detail + conversation thread
  |                                       + SLA indicators + satisfaction ratings
  |
  |-- Agency Chat ------ /agency-chat   -> Inter-agency messaging by ticket channel
  |                                       File attachments via Sanity Assets
  |
  |-- Analytics -------- /analytics     -> Geographic, sector, funnel, time-series
  |                                       analysis with CSV export
  |
  |-- Profile ---------- /profile       -> Update name, change password, Google pic
  |
  +-- Sanity Studio ---- /studio        -> Direct CMS content management
```

---

## How Data Is Collected

### Data Collection Points

| Source | What Is Collected | Where It Goes | Who Can Access |
|--------|-------------------|---------------|----------------|
| **Ticket Form** (`/tickets/create`) | Name, email, phone, nationality, sector, investment size, description, file attachments | Sanity CMS (`ticket` documents) + email confirmation via Postmark | Admin dashboard + Sanity Studio |
| **Onboarding Wizard** (`/investments/onboarding`) | Investor type, experience, investment amount, risk tolerance, sector interest, personal details, capital source, support needed | Sanity CMS (`investorProfile`) + email to UIA | UIA staff |
| **AI Chatbot** (`/chatbot`) | User messages + conversation history | Sent to Groq API per-session. Conversations logged to Sanity (`chatEnquiry`) | Admin via Sanity Studio |
| **Agency Chat** (`/agency-chat`) | Messages between admin officers, file attachments | Sanity CMS (`agencyMessage` documents) | Authenticated admins only |
| **Admin Profile** (`/profile`) | Name updates, password changes | Sanity CMS (`adminUser` documents) | The admin themselves |
| **Business Registration** (`/business/registration`) | Business info, documents, contact details | Sanity CMS | Admin via Sanity Studio |

### What Is NOT Collected

- **No public user accounts** — general public never signs up or logs in
- **No cookies for public users** — session cookies are only set on admin login
- **No analytics/tracking scripts** — no Google Analytics, Facebook Pixel, etc.
- **No payment data** — no payment processing in the current version
- **No IP logging** — IP addresses are used for chatbot rate-limiting only (in-memory, cleared every 5 minutes)

### Data Storage

| Store | Type | Contents |
|-------|------|----------|
| **Sanity CMS** (Sanity Cloud) | Primary database | All tickets, projects, agencies, events, messages, admin users, investor profiles, chat logs |
| **Sanity Assets** (cdn.sanity.io) | File storage | Uploaded documents (PDFs, images, spreadsheets) |
| **Browser cookie** (`osc-session`) | Session | JWT token for admin auth (httpOnly, 24h TTL) |
| **Groq API** | Transient | Chat messages sent per-request, not stored by the app |
| **Postmark** | Transient | Email delivery (not stored by the app) |
| **Vercel** | Hosting | Application code + environment variables (encrypted) |

### Security Measures

| Measure | Implementation |
|---------|---------------|
| Password hashing | PBKDF2 with random salt (100,000 iterations) |
| Session tokens | JWT signed with HS256, httpOnly cookie, 24h expiry |
| Input sanitization | All user inputs sanitized via `sanitizeString()` before storage |
| Input validation | Zod schemas for all API inputs (tickets, chat, queries) |
| File validation | Type whitelist (PDF, DOC, PNG, JPG) + 10MB size limit |
| Rate limiting | AI chatbot: 20 req/min per IP (in-memory) |
| Route protection | Next.js middleware verifies JWT on admin routes |
| Google OAuth | Google ID token verification for sign-in |
| API token isolation | Public Sanity client (read-only CDN) vs server client (write token, server-side only) |
| XSS prevention | Input sanitization + React's built-in escaping |

---

## Performance Optimizations

- **Code splitting** by route (Next.js App Router)
- **Image optimization** via Next.js `<Image>` component
- **Lazy loading** with Intersection Observer
- **Memoization** for expensive operations
- **Debounced search** input to reduce API calls
- **Server-side rendering** where applicable
- **Mock data fallbacks** if Sanity is unreachable
- **Caching strategies** for API responses

---

## Accessibility

- WCAG 2.1 AA compliance target
- Semantic HTML throughout
- ARIA labels and roles on interactive elements
- Keyboard navigation support
- Voice input support (Web Speech API)
- Color contrast compliance (dark green/white palette)
- Loading state indicators and skeleton screens

---

## Architecture Decisions

1. **Admin-only auth**: No public registration. Admins seeded into Sanity via script. JWT in HTTP-only cookies for security. Google OAuth for convenience.
2. **Sanity as backend**: All content (projects, tickets, events, agencies, investor profiles, chat logs) stored in Sanity. No separate database needed.
3. **Groq over Gemini**: Switched from Google Gemini to Groq (LLaMA 3.3 70B) for faster inference, better multilingual performance, and reduced costs.
4. **Server-side middleware**: Protected routes enforced at the edge via Next.js middleware — not just client-side checks.
5. **Mock fallbacks**: All data hooks fall back to mock data if Sanity is unreachable, ensuring the app always renders.
6. **Leaflet over Google Maps**: No API key required, CARTO dark tiles match the app theme.
7. **Postmark for email**: Reliable transactional email delivery for ticket notifications and escalation alerts.
8. **Zod validation**: Runtime type checking at API boundaries for defense-in-depth.
9. **Trailing slashes**: `trailingSlash: true` in Next.js config — all API calls must use trailing slashes.
