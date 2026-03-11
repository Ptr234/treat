# Uganda OneStopCentre (UIA)

A Next.js 15 platform for the Uganda Investment Authority — streamlining investor services, inter-agency coordination, and executive oversight.

**Production**: https://frontend-beast4.vercel.app
**Sanity Studio**: https://uia-onestop-centre.sanity.studio

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| CMS | Sanity v4 (GROQ queries, real-time studio) |
| Auth | JWT (jose) + HTTP-only cookies + Next.js middleware |
| Maps | Leaflet / react-leaflet (CARTO dark tiles) |
| AI Chatbot | Google Gemini API |
| UI | Tailwind CSS, Framer Motion, Heroicons |
| Deployment | Vercel (frontend) + Sanity Cloud (CMS) |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (server-side)
│   │   ├── auth/           # Login, logout, session (JWT)
│   │   ├── dashboard/      # DG Dashboard metrics
│   │   ├── projects/       # Licensed projects (Sanity)
│   │   ├── tickets/        # Issue tracking
│   │   ├── events/         # Investment events
│   │   ├── agencies/       # Government agencies
│   │   ├── messages/       # Inter-agency chat
│   │   ├── chatbot/        # AI assistant (Gemini)
│   │   └── health/         # Health check
│   ├── dashboard/          # DG Live Dashboard (admin)
│   ├── agency-chat/        # Inter-agency messaging (admin)
│   ├── projects/           # Licensed Projects Map (public)
│   ├── tickets/            # Issue Tracking (admin view + public submit)
│   ├── investments/        # Investment opportunities + onboarding
│   ├── events/             # Investment events calendar
│   ├── agencies/           # OSC Hub — 16 agencies
│   ├── chatbot/            # AI Investor Assistant
│   ├── analytics/          # Inquiry Analytics Dashboard
│   ├── services/           # Government services catalog
│   ├── tools/              # ROI calculator, tax calculator, etc.
│   └── studio/             # Embedded Sanity Studio
├── components/
│   ├── auth/               # AuthModal, LoginForm
│   ├── layout/             # Header, Footer
│   └── projects/           # LeafletMap, DynamicLeafletMap
├── contexts/               # AuthContext (JWT session management)
├── hooks/                  # useProjects, useDashboard, etc.
├── lib/                    # Sanity client, queries, auth utils
├── types/                  # TypeScript interfaces
└── data/mock/              # Fallback mock data
sanity/
├── schemaTypes/            # 10 Sanity document schemas
└── env.ts                  # Sanity env config
```

---

## Features

### Public Pages (no auth required)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with UIA branding |
| Investments | `/investments` | Investment opportunities catalog |
| Investment Onboarding | `/investments/onboarding` | 5-step investor wizard |
| Services | `/services` | Government services directory |
| Agencies (OSC Hub) | `/agencies` | 16 government agencies |
| Events | `/events` | Investment events calendar |
| Projects Map | `/projects` | Interactive Leaflet GIS map of 12+ licensed projects |
| AI Assistant | `/chatbot` | Gemini-powered investment chatbot |
| Tools | `/tools` | ROI calculator, tax calculator, document checklist, invoice generator |
| Support | `/support` | Contact and support info |
| Search | `/search` | Full-text site search |

### Admin Pages (requires sign-in)

| Page | Route | Description |
|------|-------|-------------|
| DG Dashboard | `/dashboard` | Live KPIs, agency scorecard, SLA alerts, activity feed |
| Agency Chat | `/agency-chat` | Inter-agency messaging by ticket channel |
| Issue Tracking | `/tickets` | Full ticket management with SLA tracking |
| Admin Panel | `/admin` | System administration |
| Sanity Studio | `/studio` | CMS content management |

---

## Authentication System

### How It Works

1. **Admin signs in** via the "Sign In" button in the header
2. Credentials are verified against `adminUser` documents in Sanity CMS
3. On success, a JWT token is set as an HTTP-only cookie (`osc-session`)
4. The session persists across page refreshes (cookie-based)
5. Next.js middleware protects admin routes server-side

### Auth Architecture

```
Client (AuthContext)           Server
  │                              │
  ├─ POST /api/auth/login/ ────► Sanity: lookup adminUser by email
  │                              │ verify password hash (SHA-256)
  │                              │ create JWT (jose, HS256, 24h expiry)
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

### Default Admin Credentials

```
Email:    admin@uia.go.ug
Password: OneStop2026!
```

To create additional admins:
```bash
node scripts/seed-admin.mjs --email user@uia.go.ug --password SecurePass123 --name "Jane Doe"
```

### Protected Routes (Middleware)

| Route | Protection |
|-------|-----------|
| `/dashboard/*` | Redirect to `/` if not admin |
| `/agency-chat/*` | Redirect to `/` if not admin |
| `/admin/*` | Redirect to `/` if not admin |
| `/api/dashboard/*` | 401 JSON if not admin |
| `/api/messages/*` | 401 JSON if not admin |

---

## Sanity CMS

### Schemas (10 document types)

| Schema | Description |
|--------|-------------|
| `adminUser` | Admin users with hashed passwords |
| `agency` | Government agencies (UIA, URSB, URA, etc.) |
| `agencyProfile` | Agency SLA configs and response times |
| `agencyMessage` | Inter-agency chat messages |
| `event` | Investment events and forums |
| `licenseProject` | Licensed investment projects (12 seeded) |
| `ticket` | Support/issue tracking tickets |
| `ticketMessage` | Ticket conversation messages |
| `analyticsMetadata` | Analytics period summaries |
| `dashboardConfig` | Dashboard configuration |

### Sanity Configuration

- **Project ID**: `juhrlluw`
- **Dataset**: `production`
- **Studio**: https://uia-onestop-centre.sanity.studio
- **Embedded Studio**: Available at `/studio` route in the app

### Seeded Data

56 documents seeded via `scripts/seed-sanity.mjs`:
- 9 agencies (UIA, URSB, URA, DCIC, NEMA, KCCA, MLHUD, UNBS, ERA)
- 12 licensed projects (TotalEnergies $4B, Liao Shen $220M, etc.)
- 8 investment events
- 6 support tickets with agency assignments
- 3 ticket messages
- 2 analytics periods
- 9 dashboard configs
- 7 agency profiles with SLA settings

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

# AI Chatbot
GEMINI_API_KEY=your-gemini-key
GOOGLE_API_KEY=your-google-key
```

### Vercel Environment Variables

Set these in Vercel dashboard > Settings > Environment Variables:
- `SANITY_API_TOKEN`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- All `NEXT_PUBLIC_*` vars are embedded at build time

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

### Sanity Studio Deployment

```bash
nvm use 24
npx sanity deploy  # Deploys to uia-onestop-centre.sanity.studio
```

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login/` | Public | Admin login (returns JWT cookie) |
| GET | `/api/auth/me/` | Cookie | Session validation |
| POST | `/api/auth/logout/` | Cookie | Clear session |
| GET | `/api/dashboard/` | Admin | DG dashboard metrics |
| GET | `/api/projects/` | Public | Licensed projects from Sanity |
| GET | `/api/tickets/` | Public | Support tickets |
| POST | `/api/tickets/` | Public | Create ticket |
| GET | `/api/tickets/[id]/` | Public | Ticket detail |
| GET | `/api/events/` | Public | Investment events |
| GET | `/api/agencies/` | Public | Government agencies |
| GET,POST | `/api/messages/` | Admin | Inter-agency chat messages |
| POST | `/api/upload/` | Public | File upload to Sanity Assets |
| POST | `/api/chatbot/` | Public | AI assistant (Gemini) |
| GET | `/api/health/` | Public | Health check |

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

### Storage

All files are stored in Sanity's managed asset pipeline:
- **CDN-delivered** globally via `cdn.sanity.io`
- **No additional storage costs** within Sanity plan limits
- **Permanent URLs** — files persist as long as the Sanity project exists
- **Referenced by documents** — deleting a ticket/message does not delete the uploaded file (Sanity garbage collects unreferenced assets)

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

1. **Public-facing** — Investors and business owners browse services, explore opportunities, submit support tickets, and use AI-assisted tools. No login required.
2. **Admin-facing** — UIA administrators manage tickets, coordinate across government agencies, and monitor KPIs via a live dashboard. Requires sign-in.

### User Journeys

#### General Public (Investors / Business Owners)

```
Investor visits site
  |
  |-- Browse ---------- /services       -> Government services catalog
  |                     /investments     -> Investment opportunities
  |                     /agencies        -> 16 OSC agencies (UIA, URSB, URA, etc.)
  |                     /events          -> Investment events calendar
  |                     /projects        -> Interactive GIS map of licensed projects
  |
  |-- Use Tools ------- /tools/roi-calculator       -> Estimate return on investment
  |                     /tools/tax-calculator        -> Uganda tax breakdown
  |                     /tools/document-checklist    -> Required documents list
  |                     /tools/invoice-generator     -> Invoice creation tool
  |
  |-- Get AI Help ----- /chatbot        -> Gemini-powered AI assistant
  |                                       (5 languages: EN, FR, AR, ZH, SW)
  |                                       Rate-limited: 20 requests/min per IP
  |
  |-- Start Investing - /investments/onboarding -> 5-step wizard
  |                                       Collects: investor profile, capacity,
  |                                       sector interest, personal details,
  |                                       readiness assessment
  |                                       -> Opens mailto: to UIA with summary
  |
  +-- Submit a Ticket - /tickets/create -> Multi-step support request form
                                          Collects: category, description, contact
                                          info, nationality, sector, investment size
                                          -> Saved to Sanity CMS with SLA tracking
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
  |                                               -> Issue JWT cookie (24h)
  |
  |-- Dashboard -------- /dashboard     -> Live KPIs, SLA alerts, agency scorecard,
  |                                       pipeline value, activity feed
  |
  |-- Ticket Mgmt ------ /tickets       -> View, assign, escalate, resolve tickets
  |                       /tickets/[id]  -> Ticket detail + conversation thread
  |
  |-- Agency Chat ------ /agency-chat   -> Inter-agency messaging by ticket channel
  |                                       File attachments via Sanity Assets
  |
  |-- Profile ---------- /profile       -> Update name, change password
  |
  +-- Sanity Studio ---- /studio        -> Direct CMS content management
```

### How Auth Protects Routes

```
Request arrives
  |
  |-- Middleware checks pathname against PROTECTED_ROUTES
  |   (/dashboard, /agency-chat, /admin)
  |
  |-- If protected -> read JWT from "osc-session" cookie
  |   |-- Valid admin JWT -> allow through
  |   +-- Missing or invalid -> redirect to /?auth=required
  |
  |-- API routes (/api/dashboard, /api/messages, /api/upload)
  |   |-- Valid admin JWT -> allow through
  |   +-- Missing or invalid -> 401 JSON response
  |
  +-- All other routes -> pass through (public)
```

---

## How Data Is Collected

### Data Collection Points

| Source | What Is Collected | Where It Goes | Who Can Access |
|--------|-------------------|---------------|----------------|
| **Ticket Form** (`/tickets/create`) | Name, email, phone, nationality, sector, investment size, description, file attachments | Sanity CMS (`ticket` documents) | Admin dashboard + Sanity Studio |
| **Onboarding Wizard** (`/investments/onboarding`) | Investor type, experience, investment amount, risk tolerance, sector interest, personal details, capital source, support needed | Sent via `mailto:` to `invest@onestopcentre.ug` (not stored in DB) | UIA staff via email only |
| **AI Chatbot** (`/chatbot`) | User messages + conversation history | Sent to Google Gemini API per-session. **Not persisted** — conversations are lost on page refresh | No one (ephemeral) |
| **Agency Chat** (`/agency-chat`) | Messages between admin officers, file attachments | Sanity CMS (`agencyMessage` documents) | Authenticated admins only |
| **Admin Profile** (`/profile`) | Name updates, password changes | Sanity CMS (`adminUser` documents) | The admin themselves |

### Data Flow Diagram

```
                    PUBLIC                          ADMIN
                      |                               |
  Ticket Form --------|                               |
  (name, email,       |     +-------------+           |
   phone, sector,     |---->|  Sanity CMS |<----------|-- Agency Chat messages
   attachments)       |     |  (Sanity    |           |-- Ticket assignments
                      |     |   Cloud)    |           |-- Profile updates
  AI Chatbot ---------|     +------+------+           |
  (messages)          |            |                   |
        |             |     Served via CDN             |
        v             |     (cdn.sanity.io)            |
  Google Gemini API   |                                |
  (ephemeral, not     |     +-------------+           |
   stored)            |     |   Vercel    |           |
                      |     |  (Next.js)  |           |
  Onboarding ---------|     +-------------+           |
  Wizard              |            |                   |
        |             |     JWT cookies stored         |
        v             |     in browser (httpOnly,      |
  mailto: to UIA      |     24h expiry)                |
  (email only)        |                                |
```

### What Is NOT Collected

- **No public user accounts** — general public never signs up or logs in
- **No cookies for public users** — session cookies are only set on admin login
- **No analytics/tracking scripts** — no Google Analytics, Facebook Pixel, etc.
- **No payment data** — no payment processing in the current version
- **No chatbot history persistence** — AI conversations are not saved server-side
- **No IP logging** — IP addresses are used for chatbot rate-limiting only (in-memory, cleared every 5 minutes)

### Data Storage

| Store | Type | Contents |
|-------|------|----------|
| **Sanity CMS** (Sanity Cloud) | Primary database | All tickets, projects, agencies, events, messages, admin users |
| **Sanity Assets** (cdn.sanity.io) | File storage | Uploaded documents (PDFs, images, spreadsheets) |
| **Browser cookie** (`osc-session`) | Session | JWT token for admin auth (httpOnly, 24h TTL) |
| **Google Gemini** | Transient | Chat messages sent per-request, not stored by the app |
| **Vercel** | Hosting | Application code + environment variables (encrypted) |

### Security Measures

| Measure | Implementation |
|---------|---------------|
| Password hashing | PBKDF2 with random salt (100,000 iterations) |
| Session tokens | JWT signed with HS256, httpOnly cookie, 24h expiry |
| Input sanitization | All user inputs sanitized via `sanitizeString()` before storage |
| File validation | Type whitelist (PDF, DOC, PNG, JPG) + 10MB size limit |
| Rate limiting | AI chatbot: 20 req/min per IP (in-memory) |
| Route protection | Next.js middleware verifies JWT on admin routes |
| API token isolation | Public Sanity client (read-only CDN) vs server client (write token, server-side only) |

---

## Architecture Decisions

1. **Admin-only auth**: No public registration. Admins are seeded into Sanity via script. JWT in HTTP-only cookies for security.
2. **Sanity as backend**: All content (projects, tickets, events, agencies) stored in Sanity. No separate database needed.
3. **Server-side middleware**: Protected routes enforced at the edge via Next.js middleware — not just client-side checks.
4. **Mock fallbacks**: All data hooks fall back to mock data if Sanity is unreachable, ensuring the app always renders.
5. **Leaflet over Google Maps**: No API key required, CARTO dark tiles match the app theme.
6. **Trailing slashes**: `trailingSlash: true` in Next.js config — all API calls must use trailing slashes.
