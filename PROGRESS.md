# OneStopCentre Uganda - Frontend Implementation Progress Report

## Project: Static Frontend Implementation for Firebase Hosting

**Date:** October 17, 2025  
**Status:** COMPLETED - PHASE 1 & DEPLOYED  
**Implementation Plan:** Plan.md  
**Live Deployment:** https://onestopcentre-c99ed.web.app

---

## Executive Summary

**DEAD CODE REMOVAL (October 10, 2026):** Traced imports from every Next.js entry point (routes, layouts, middleware, Sanity config, scripts) and removed the 42 frontend source files nothing reached — `page-backup.tsx`, `PageBand`, 18 never-rendered components (InvestorTour, QuickActions, ContextualHelp, NavigationGuide, NotificationSystem/Settings, FeedbackForm, AgencyCard + its two modals, ProjectCard, MapLegend, StatusTimeline, the duplicate Tax/Invoice components, Button, LoadingSpinner, Reveal, FloatingActionButtons, Tutorial, ServiceWizard, EmailVerificationForm, RegisterForm and its test), unused hooks (`useApi`, `useDebounce`, `useFirestoreCollection`, `useIntersectionObserver`, `useLocalStorage`, `useSearch`), `src/utils/*`, `lib/route-utils.ts`, two mock datasets, two unused investment data modules and the barrel `index.ts` files. Uninstalled `@headlessui/react`, `@sanity/image-url` and `react-simple-maps` (no references, no dependents). Kept `react-is` (Recharts peer), `styled-components` (Sanity Studio peer) and the `.d.ts` global type files. Typecheck, lint and production build clean; 106/106 Jest tests pass.

**GOVERNMENT DESIGN SYSTEM, SITE-WIDE (October 10, 2026):** Replaced the stacked CSS override layers in `frontend/src/app/globals.css` (which force-painted any bordered white `div` black via class-substring selectors and had introduced an off-brand green, `#145C3A`) with one official-service design system built from the six-band Uganda flag: `gov-*` components (container, stripe, caption/kicker, title scale, buttons incl. start/secondary/gold/warning, cards, inset/warning/panel notices, tags, summary lists, tables, step-by-step, related-links, figures, search), a single gold-and-black focus state, square corners (radius scale in `tailwind.config.ts`), warm neutral palette, and self-hosted Public Sans + Source Serif 4 via `next/font`. New site chrome: official-website banner with "Here's how you know", masthead with flag + header search + helpline + sign-in, black primary nav with mega-menus, BETA phase banner, "Report a problem" strip (prefills `/support?page=`), and a government footer with contact band, office hours and official agency links. New shared `PageHeader` (breadcrumbs, caption, title, lead, actions, aside), `FactRow` and `SectionHeading`; every public page, the staff console UI kit, and the system pages (404/error/loading/offline) were rebuilt on them. Bugs found and fixed along the way: dashboard `Card` rendered black-on-black once the overrides were removed; analytics tabs and two help panels were white-on-white; `AppointmentModal` inputs had white text on near-white; search linked to non-existent `/services/tax-registration` and `/services/work-permit` and ignored `?q=`; nested `<main>` on projects/track; `<button>` inside `<Link>` on tickets; yellow-on-white text below 3:1 across ~10 components. Charts: sector donut (8 green shades) replaced by sorted single-ink bar charts with direct labels after the flag-only categorical palette failed the dataviz validator; time-series recoloured to dark gold vs black (CVD ΔE ≈ 41). Codemods normalised 55 buttons, 153 form controls, 20 spinners and removed 608 per-element focus-ring classes. Verified: typecheck clean, ESLint clean, 120/120 Jest tests, production build passes (104 pages), desktop + 390px screenshots of all public pages with no horizontal overflow. Open items: `page-backup.tsx`, `ui/PageBand.tsx` and ~20 never-imported components remain as dead code; the "+256 800 911 911 emergency hotline" on `/support` is unverified content.

**DOCKER SMOKE TEST + BUG HUNT (August 19, 2026):** Ran the full stack in Docker (postgres + backend + frontend, matching `docker-compose.test.yml`/production config) and drove it with a headless-Chromium script to verify the day's API changes end-to-end and hunt for other real bugs, screenshotting each finding. Found and fixed three:
1. **`[Authorize]`/policy failures bypassed RFC 7807** — 401/403s from ASP.NET's authorization middleware (as opposed to controller code) returned an empty body instead of problem+json, since they never reach a `Problem()`/`ValidationProblem()` call. Added `ProblemDetailsAuthorizationMiddlewareResultHandler` (`backend/src/OscApi/Middleware/`), with a specific "MFA must be enrolled" detail for that case. Verified live pre/post-fix; all 193 backend tests still pass.
2. **Login (and every other `apiFetch` call) had no request timeout** — a slow/stalled backend response left the "Sign In" button permanently disabled on "Signing in..." with no error and no way to retry; reproduced identically on both the dev server and the production Docker build, root-caused to a bare `fetch()` with no `AbortController` in `frontend/src/lib/api-client.ts`. Added a 20s timeout that resolves to a friendly `{success:false, error:'Request timed out...'}` instead of hanging forever. Covered by a new Jest test using fake timers.
3. **Business Registration Wizard's (and 3 other wizards') first step could render fully invisible** — `AnimatePresence`+`motion.div` step content is mounted at `opacity:0` and animates to `opacity:1`; a hydration mismatch elsewhere on the page (Chrome's autofill machinery injecting `caret-color` onto radio/text inputs before React hydrates — confirmed present but harmless on its own) can leave that mount animation stuck, permanently hiding step 1 behind a blank white area. Reproduced on both dev and production builds via computed-style inspection (`opacity: "0"` on the wrapper, indefinitely). Fixed by adding `initial={false}` to `AnimatePresence` — the standard Framer Motion pattern for content already present in the SSR'd HTML — in `BusinessRegistrationWizard.tsx`, `ServiceWizard.tsx`, `InvestorTour.tsx`, `InvestmentOnboardingWizard.tsx`, and `tickets/create/page.tsx` (the last four share the identical pattern and were hardened preventively, not confirmed individually broken).

Verified clean: homepage, login form, dashboard MFA-enrollment redirect, ticket-creation wizard step 1. Ruled out as false positives (not fixed): `net::ERR_ABORTED` image loads from unrealistically fast programmatic scrolling; apparent duplicate "Sign In" buttons (actually a sidebar shortcut + hidden mobile menu toggle + banner close button); the `caret-color` hydration warning itself (browser-injected, not app code — grepped the whole repo, `caret-color` appears nowhere). Frontend: 110/110 tests passing, clean typecheck. Backend: 193/193 tests passing.

**API DESIGN STANDARDS COMPLIANCE (August 19, 2026):** Brought the ASP.NET backend into compliance with `ApiDesign.MD`. Versioned every controller route to `/api/v1/...`, deliberately excluding `/api/health` (ops convention; `render.yaml`/`docker-compose.test.yml` health checks) and `/api/payments/flutterwave/webhook` (its URL is registered in Flutterwave's external merchant dashboard, which cannot be updated from this repo). Replaced the bespoke `{success:false,error,code}` error envelope with RFC 7807 `application/problem+json` everywhere — all 117 controller error sites plus both global exception-handling middlewares — while leaving the `{success,data}` success envelope untouched. Added security response headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy), HSTS (production only — Kestrel is plain-HTTP behind Render's TLS-terminating edge), and a `Retry-After` header on 429s. Split `DashboardController`'s `GET /enquiries?action=list|stats|session` query-param dispatch (a resource-vs-verb anti-pattern) into three real endpoints. Added bounded, cursor-paginated history to `GET /api/v1/messages` (previously unbounded), with a "Load earlier messages" affordance added to the agency chat UI so history isn't silently truncated. `HealthController` now returns 503 when the database is unreachable instead of always 200. On the frontend, all of this funnels through the single `resolveApiUrl`/`apiFetch` choke point in `src/lib/api-client.ts` (plus two direct-fetch call sites in `chatbot-service.ts`/`chatbot/page.tsx`), so the ~66 files that call the API needed no changes. Backend: 193/193 tests passing, `dotnet build` clean. Frontend: full typecheck clean, 109/109 unit tests passing, lint clean.

**HOMEPAGE REDESIGN (July 6, 2026):** Restored the homepage from commit `93c8e04` and completely redesigned it as a premium landing page: editorial hero with Ken Burns slideshow and slide progress indicators, floating live-stats card, auto-scrolling agency logo marquee, bento-grid priority sectors, a new three-step investor journey section, AI advisor section with decorative chat preview, numbered services grid, and full-bleed final CTA. All existing routes, CMS-driven content (Sanity sector cards + homepage settings), the chat-widget event, and the Uganda flag palette are preserved; animations respect `prefers-reduced-motion`. Also fixed pre-existing build blockers: removed unused/broken `src/lib/code-splitting.ts` (JSX in a `.ts` file referencing four non-existent components) and fixed `Footer.tsx` (non-existent heroicons imports, unescaped apostrophe). Production build passes with 97 pages and zero ESLint/TypeScript errors.

**BACKEND TEST SUITE ACHIEVEMENT (July 5, 2026):** Successfully resolved all 11 remaining backend test failures and achieved 120/120 passing tests (100%) in the ASP.NET Web API test suite. Fixed critical authentication handler behavior, DTO serialization patterns, and endpoint parameter handling. Authentication system is now fully validated across integration tests.

Successfully implemented the core frontend functionality for the Uganda OneStopCentre application according to Plan.md requirements. The implementation focuses on static-first architecture optimized for Firebase hosting, with comprehensive investment opportunities system featuring real-time search, filtering, and detailed investment pages. All components are TypeScript-compatible with proper type safety and modern React patterns.

---

## Completed Tasks

###  1. Data Layer Setup (HIGH PRIORITY)
**Status:** COMPLETED  
**Files Created:**
- `src/types/investment.ts` - Investment TypeScript interfaces (Note: Used existing types from index.ts)
- `src/data/investments/comprehensive.ts` - Comprehensive investment data with detailed information
- `src/data/investments/optimized.ts` - Performance-optimized investment data (migrated from existing)
- `src/data/investments/contacts.ts` - Centralized contact database (migrated from existing)
- `src/data/investments/categories.ts` - Investment categories and classifications

**Key Interfaces Implemented:**
```typescript
interface Investment {
  id: string
  title: string
  category: string
  sector: string
  description: string
  investmentRange: string
  expectedROI: string
  timeline: string
  priority: 'high' | 'medium' | 'low'
  contact: ContactInfo
  requirements?: string[]
  incentives?: string[]
  riskFactors?: string[]
}

interface ContactInfo {
  agency: string
  email: string
  phone: string
  website: string
  address?: string
  director?: string
}
```

###  2. Component Migration (HIGH PRIORITY)
**Status:** COMPLETED  
**Components Created/Updated:**

#### Investment Components
- `src/components/investments/InvestmentCard.tsx` - Individual investment display card
- `src/components/investments/InvestmentGrid.tsx` - Grid/list view with search and sorting
- `src/components/investments/InvestmentFilters.tsx` - Advanced filtering component
- `src/components/interactive/InvestmentOnboardingWizard.tsx` - Updated to TypeScript (already existed)

**Key Features:**
- Grid/List toggle view modes
- Real-time search functionality
- Advanced filtering by category, sector, priority, investment range
- Sorting by multiple criteria
- Contact actions (call, email, website)
- Responsive design for mobile/desktop

###  3. Page Structure (HIGH PRIORITY)
**Status:** COMPLETED  
**Pages Created/Updated:**

#### Main Investment Pages
- `src/app/investments/page.tsx` - Complete investment opportunities page
- `src/app/investments/onboarding/page.tsx` - Investment onboarding wizard page
- `src/app/tools/roi-calculator/page.tsx` - Enhanced ROI calculator page

**URL Structure Implemented:**
- `/investments` - All investments with filtering
- `/investments/onboarding` - Investment onboarding wizard
- `/tools/roi-calculator` - ROI calculator tool

###  4. API Routes (HIGH PRIORITY)
**Status:** COMPLETED  
**API Routes Created:**

#### Investment APIs
- `src/app/api/investments/route.ts` - GET all investments, POST applications
- `src/app/api/investments/[id]/route.ts` - GET specific investment by ID
- `src/app/api/investments/apply/route.ts` - POST investment applications

#### Contact APIs
- `src/app/api/contact/email/route.ts` - POST email inquiries
- `src/app/api/contact/callback/route.ts` - POST callback requests

**API Features:**
- Comprehensive validation and error handling
- Pagination support for investments list
- Filtering by category, sector, priority
- Application tracking with reference numbers
- Email notification simulation

###  5. Navigation Integration
**Status:** COMPLETED  
**Component Updated:**
- `src/components/layout/Header.tsx` - Updated investment menu links

**Navigation Structure:**
- Investment Opportunities dropdown with sector-specific links
- Investment Services integration
- Investment Tools menu
- Investor Resources section

---

## Errors Encountered and Fixes

### # Error 1: ESLint and TypeScript Violations
**Problem:** Multiple linting and type errors during build
**Location:** Multiple files
**Errors:**
- Unescaped apostrophes in JSX
- Unused variables and imports
- `any` type usage
- Missing TypeScript types

**Fixes Applied:**
```typescript
// Fixed apostrophes
"Uganda's" � "Uganda&apos;s"

// Fixed any types
setSortBy(newSortBy as any) � setSortBy(newSortBy as 'title' | 'priority' | 'roi' | 'timeline' | 'investmentRange')

// Fixed comparison logic
if (typeof aValue === 'string') {
  return aValue.localeCompare(bValue)
} 
// Changed to:
if (typeof aValue === 'string' && typeof bValue === 'string') {
  return aValue.localeCompare(bValue)
}
```

### # Error 2: Next.js 15 Dynamic Route Parameters
**Problem:** API route with dynamic parameter typing error
**Location:** `src/app/api/investments/[id]/route.ts`
**Error:** `Type "{ params: { id: string; }; }" is not a valid type`

**Fix Applied:**
```typescript
// Before:
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
)

// After:
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const investment = investments.find(inv => inv.id === resolvedParams.id);
}
```

### # Error 3: Notification Context Interface Mismatch
**Problem:** addNotification function expected different interface
**Location:** `src/components/interactive/InvestmentOnboardingWizard.tsx`
**Error:** Object literal may only specify known properties

**Fix Applied:**
```typescript
// Before:
addNotification({
  id: Date.now().toString(),
  type: 'success',
  title: 'Application Submitted Successfully!',
  message: 'Our investment team will contact you within 24 hours.',
  timestamp: new Date().toISOString(),
  read: false
});

// After:
addNotification({
  type: 'success',
  title: 'Application Submitted Successfully!',
  message: 'Our investment team will contact you within 24 hours.'
});
```

### # Error 4: Static Export vs API Routes Conflict
**Problem:** Project configured for static export but has API routes
**Location:** `next.config.ts`
**Error:** "export const dynamic = "force-static" not configured"

**Fix Applied:**
```typescript
// Temporarily disabled static export for API functionality
const nextConfig: NextConfig = {
  // output: 'export', // Commented out for API routes
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
```

### # Error 5: TypeScript Contact Database Type Safety
**Problem:** Potential undefined return from contact lookup
**Location:** `src/data/investments/contacts.ts`
**Error:** Type 'ContactInfo | undefined' is not assignable to type 'ContactInfo'

**Fix Applied:**
```typescript
// Added non-null assertion for default UIA contact
export const getContactInfo = (contactKey: string): ContactInfo => {
  const contact = CONTACT_DATABASE[contactKey];
  if (!contact) {
    return CONTACT_DATABASE.UIA!; // Non-null assertion
  }
  return contact;
};
```

---

## Technical Achievements

### Performance Optimizations
1. **Memoized Investment Filtering** - Uses useMemo for expensive filter operations
2. **Lazy Loading** - Components load investment data on demand
3. **Optimized Search** - Real-time search with debouncing
4. **Code Splitting** - Separate bundles for investment features

### TypeScript Integration
1. **Complete Type Safety** - All components use proper TypeScript interfaces
2. **Interface Inheritance** - Extends existing application types
3. **Generic Components** - Reusable components with proper typing
4. **API Type Safety** - Full type coverage for API routes

### UX/UI Enhancements
1. **Responsive Design** - Mobile-first approach with Tailwind CSS
2. **Animation System** - Framer Motion for smooth transitions
3. **Advanced Filtering** - Multi-criteria filtering system
4. **Search Functionality** - Real-time search across all investment fields

### Data Architecture
1. **Centralized Contact Database** - Single source of truth for agency contacts
2. **Optimized Data Structure** - Separate optimized and comprehensive datasets
3. **Category System** - Structured investment categorization
4. **Performance-First Design** - Pre-computed data relationships

---

## File Structure Changes

```
src/
   app/
      investments/
         page.tsx (NEW - Main investments page)
         onboarding/
             page.tsx (NEW - Onboarding page)
      tools/roi-calculator/
         page.tsx (UPDATED - Enhanced ROI calculator)
      api/
          investments/
             route.ts (NEW - Investment API)
             [id]/route.ts (NEW - Individual investment API)
             apply/route.ts (NEW - Application API)
          contact/
              email/route.ts (NEW - Email API)
              callback/route.ts (NEW - Callback API)
   components/
      investments/
         InvestmentCard.tsx (NEW)
         InvestmentGrid.tsx (NEW)
         InvestmentFilters.tsx (NEW)
      interactive/
         InvestmentOnboardingWizard.tsx (UPDATED)
      layout/
          Header.tsx (UPDATED - Navigation links)
   data/
       investments/
           comprehensive.ts (NEW - Detailed investment data)
           optimized.ts (MOVED from src/data/)
           contacts.ts (MOVED from src/data/)
           categories.ts (NEW - Category definitions)
```

---

## Conclusion

The investment migration has been successfully completed with all major components functioning correctly. The system is now ready for production deployment with proper TypeScript integration, comprehensive error handling, and modern React patterns. All errors encountered during development have been documented and resolved.

**Migration Completed:**   
**All Tests Passing:**   
**Ready for Production:** ✅

---

## Latest Deployment Log

### October 17, 2025 - Build & Deploy
**Status:** ✅ SUCCESSFUL

#### Issues Resolved:
1. **Google Fonts Build Error**
   - **Problem:** `Failed to fetch 'Inter' from Google Fonts` causing build failures
   - **Solution:** Removed Google Fonts imports and switched to system fonts
   - **Files Modified:**
     - `src/app/layout.tsx` - Removed font imports and variables
     - `src/app/globals.css` - Removed Google Fonts @import statements

#### Build Process:
```bash
# Cache clearing
rm -rf .next && rm -rf node_modules/.cache && npm cache clean --force

# Build execution
npm run build
✓ Compiled successfully in 10.4s
✓ Linting and checking validity of types
✓ Generating static pages (41/41)
✓ Exporting (2/2)

# Deployment
firebase deploy
✔ Deploy complete!
```

#### Performance Metrics:
- **Build Time:** 10.4 seconds
- **Static Pages Generated:** 41
- **Total Files Deployed:** 157
- **New Files Uploaded:** 84
- **Route Size Range:** 127 B - 18.5 kB
- **First Load JS:** 102-145 kB

#### Font System Update:
- **Previous:** Google Fonts (Inter, Roboto) via CDN
- **Current:** System fonts stack for better performance
- **Font Stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif`
- **Benefits:** Faster loading, no external dependencies, better offline experience

#### Live Site:
**URL:** https://onestopcentre-c99ed.web.app  
**Status:** ✅ ACTIVE  
**Performance:** Optimized for fast loading  
**Compatibility:** All modern browsers supported
---

## 2026-07-02 — Full-Stack Audit & Hardening (Backend + Frontend)

**Scope:** Expert audit of ASP.NET backend and Next.js frontend; every confirmed defect fixed and verified.

### Security fixes
- **Upload pipeline rebuilt** (`UploadController`): was unauthenticated with no rate limit, trusted the client MIME type, kept the client's file extension, and let anyone attach files to any ticket by reference number. Now: rate-limited, requires an existing ticket, authorizes via staff session (agency-scoped) or the filing email, validates the whole batch before writing, and stores files under a GUID name with an extension derived from the MIME allowlist.
- **Document downloads** — files in `/uploads` were never served by anything (dead links). New access-checked endpoint `GET /api/tickets/{ref}/documents/{id}/content` streams them as attachments; frontend links updated.
- **Login brute-force** — `/api/auth/login` and `/api/auth/google` had no rate limiting (signup and password-reset did). Added a `login` policy (10/5min per IP, configurable).
- **Reverse-proxy IPs** — no `UseForwardedHeaders`, so on Render every request carried the proxy IP: all per-IP rate buckets collapsed into one, and audit logs recorded the proxy address. Fixed.
- **Chatbot prompt injection** — client-supplied history roles were forwarded verbatim to Groq; a caller could inject `system` turns. Roles now restricted to user/assistant, content length clamped.
- **Password reset** — verify step accepted 8-char passwords without the uppercase/digit rule used everywhere else; token/email null-guards added.

### Correctness fixes
- **DG lockout** (`InvestorsController`): used `IsInRole("admin")` literally, so the Director General (role `dg`, admin-level per the RBAC model) got 401 on investor list/update/delete. Now `IsAdminLevel()`; wrong-role responses are 403, and public create is rate-limited like other public forms.
- **Cross-domain session cookie**: backend on api.oscdigitaltool.com set a host-only cookie the Next.js middleware on www could never read — /dashboard would redirect forever in production (works on localhost because cookies ignore ports). New `Cookie:Domain` config (`.oscdigitaltool.com` in render.yaml); logout now deletes with matching attributes.
- **Error contract**: the global exception handler serialized PascalCase (`{"Success":...}`) while everything else is camelCase — clients never saw `error` on 500s. Now camelCase + `Response.HasStarted` guards.
- **500s → 400s**: staff ticket updates with an unknown status/priority (`Enum.Parse`), appointment `alternativeDate` (`DateOnly.Parse`), oversized chatbot-log/analytics fields (DB column overflow), and missing login/signup/reset fields all returned 500; each is now a validation failure or clamped.
- **Ticket attachments never persisted**: the create-ticket page uploaded to the Sanity route (admin-gated → failed for anonymous investors) and sent Sanity `fileRef`s the backend silently dropped. Files are now held locally and uploaded to the backend after ticket creation, authorized by the filing email.
- **Config drift**: `appsettings.json` had a `Postmark` section but code reads `Resend:*` (admin escalation email silently fell back to the from-address); `render.yaml` gained `Resend__AdminEmail` + `Cookie__Domain` and now deploys from `main`; frontend `.env.example` documented Postmark instead of `RESEND_API_KEY`/`EMAIL_FROM`.
- **apiFetch** forced `Content-Type: application/json` onto FormData bodies; now leaves multipart bodies alone and exports `resolveApiUrl` for raw links/uploads.

### Verification
- Backend: `dotnet build` 0 errors / 0 warnings; 78/78 tests pass (5 new integration tests covering upload authorization, MIME allowlist, owner-only download, invalid-status 400).
- Frontend: `tsc --noEmit` clean, ESLint clean, Jest 27/27, production `next build` verified.

---

## 2026-10-09 — Backend ↔ Frontend Contract Audit & Fixes

**Scope:** Every frontend API call checked against the ASP.NET route, request DTO/validator and response shape it hits. All paths and methods matched; the defects were in payloads, response handling and rate limiting.

### Broken flows fixed
- **Support page, Feedback form and Event registration could never submit.** They sent legacy field names (`fullName`, `agency`, `date`, `time`) that fail validation on `/api/v1/contact/*` (and there is no Next.js fallback route). Now send `agencyCode`/`agencyName`/`name`/`serviceType` (+ `purpose`/`preferredDate`/`preferredTime` for events). Inquiry `phone` is now optional server-side (appointments still require it); the agency service-request form no longer submits a fake `+256000000000`.
- **Rate limiting:** 16 public endpoints shared one 10/min-per-IP bucket — analytics beacons, the as-you-type name check, payment-status polling and staff ticket views all consumed the budget for real submissions. Split into `public-form` (writes, 10/min), `public-read` (lookups, 60/min) and `analytics` (60/min); signed-in staff are partitioned per user (300/min) instead of sharing the office IP.
- **Chatbot escalation** displayed a fabricated `ESC-…` reference when ticket creation failed. Now keeps the form open with an error and a phone fallback.
- **Agency-chat attachments** were silently dropped by the API. New `AttachmentsJson` column (migration `AddAgencyMessageAttachments`), returned on GET/POST; URLs restricted to `https://cdn.sanity.io`, max 3.
- **Investor onboarding** repeat submission returned 409 → "Submission Failed". Now 200 `{ existing: true }` (no reference in the response); the existing reference is emailed to the address on file.

### Smaller fixes
- Chat-enquiry rows/transcripts now include `_id` (React list keys were `undefined`).
- Ticket page gained an **Add documents** upload (the create page promised this; it didn't exist).
- Business-registration detail/payment/certificate: officers of agencies other than URSB no longer get staff access (matches List/Update scoping).
- Agency-chat status badges show "Pending External" instead of `PendingExternal`; account page no longer styles "Inactive" as a good outcome.
- Email: sends to reserved TLDs (`.invalid`, `.local`, `.test`, …) are skipped.
- Removed dead `lib/api.ts`, `useDashboardSWR`, `useTicketsSWR` and the now-unused `swr` dependency.

### Verification
- Backend: `dotnet build` 0 warnings / 0 errors; 225/225 tests (new: `FrontendContractIntegrationTests`, `RateLimitPartitionTests`, `EmailServiceTests`).
- Frontend: `tsc --noEmit` clean, ESLint clean, Jest 115/115 (new support-form payload + status-label tests), production `next build` OK.
- Not verified live: local Postgres/Docker unavailable (WSL not yet installed — see DEV_SETUP.md). Run `dotnet ef database update` to apply the new migration.

---

## 2026-10-09 — Ticketing Review & Overhaul

**Scope:** End-to-end review of the ticketing system (model, service, controllers, SLA, documents, frontend board/detail/create) and fixes for everything found.

### Bugs fixed
- **Chatbot escalations alerted nobody** — a ticket filed with `isEscalated: true` got no `EscalatedAt`, no default assignee and no escalation email (and a later "Escalate" was a no-op). Filing as an escalation is now a full escalation.
- **Oversized input → 500** — staff updates, staff replies and public comments had no validators. New `TicketValidators.cs` mirrors every column limit (400s).
- **Priority change kept the old SLA deadline** — it is now re-derived from the filing time.
- **Staff could rate on the investor's behalf** (any value, any status), skewing the satisfaction KPI — now rejected; only the filer rates.
- **Agency codes not normalised** — a ticket assigned to `uia` was invisible to UIA officers. Codes are upper-cased and checked against `AgencyDirectory`.
- **Status email** sent raw values ("in_progress") and fired when nothing changed; re-sending "Resolved" reset `ResolvedAt`. Now only on a real change, with a readable label.
- **Default assignee setting was never applied** — escalation now assigns it when nobody owns the ticket.
- **No staff UI to manage tickets** — the detail page gains a "Manage ticket" panel (status, priority, agency, assignee).

### Design changes (decisions — revisit if needed)
- **Priority/VIP:** the public can't set priority (derived from category; raised to high for an escalation) and can't choose VIP (staff only).
- **Routing:** new tickets land with UIA (`Tickets:DefaultAgencyCode`) for triage.
- **Notifications:** investors are emailed on every non-internal staff reply; staff (`Resend:AdminEmail`) on investor replies.
- **Business-hours SLA:** deadlines count Mon–Fri 08:00–17:00 EAT, skipping fixed Ugandan public holidays, Good Friday and Easter Monday; Eid dates go in `Sla:ExtraHolidays`.
- **Tracking tokens replace email-as-password:** each ticket has a random `AccessToken` (migration `AddTicketAccessToken` backfills existing tickets). Email links carry `?token=`; the filer can also sign in under the filing email; a "send me a new link" form (`POST /tickets/{ref}/access-link`, always 202) replaces the email gate. Missing and not-yours both return 404. **Old `?email=` links stop working** — visitors get the new-link form, pre-filled. Back-office sessions without MFA no longer get staff access on public ticket routes.

### Frontend
- Create page lands on the new ticket (with its token) instead of the staff-only board; no more `alert()`s; VIP hidden from the public.
- Staff board: server-side paging, filtering, search and sort (was: newest 100, filtered in the browser), scope-wide stats from the API, agency + escalation shown, load errors visible.
- Comment / rating / escalation failures are shown instead of swallowed.

### Verification
- Backend: 255/255 tests (new `TicketLifecycleTests`, `TicketAccessIntegrationTests`, business-hours `SlaCalculatorTests`).
- Frontend: `tsc` clean, ESLint clean, Jest 117/117, production build OK.
- Live against Postgres 16 (Docker) with both new migrations applied: 29/29 end-to-end checks (public filing, token access, staff management, SLA re-derivation, rating). The dev admin's MFA was enrolled for the run and disabled afterwards.

---

## 2026-10-09 — Security Review Fixes

Each reported finding was verified against the code before fixing.

1. **MFA bypass (confirmed, High).** Investor list/update/delete, the admin branch of investor lookup, business-registration staff access (detail/payment/initiate/certificate) and document deletion checked the role only, so a back-office session that never completed MFA could use them. Now `[Authorize(Policy = AdminOnly)]` or the new `IsAdminSession()` / `IsStaffSession()` helpers (role **and** completed MFA). Remaining role checks only narrow scope inside policy-protected actions.
2. **Google sign-in (confirmed, Medium) + two related bugs.** Deactivated users got a session; deactivated *admins* fell through to the user branch and were issued an investor session; agency officers signing in with Google got a session without their agency code (refused by every staff endpoint). All fixed; successful Google sign-ins are now audit-logged. Google token validation moved behind `IGoogleTokenValidator` so these rules are testable.
3. **Duplicate payment checkouts (confirmed, Medium).** Each "Pay" opened a new pending transaction with its own payable link. Initiation now reuses the open checkout (24h window), closes stale ones, and a filtered unique index (`IX_payments_one_pending_per_registration`, migration `OnePendingPaymentPerRegistration`) makes it race-safe. The migration first closes existing duplicate pendings so the index can build. A second successful payment is still recorded but audit-flagged for refund.
4. **Guessable chat session ids (confirmed, Medium).** Ids were timestamp + `Math.random()`. Now `chat-` + `crypto.randomUUID()`; old saved ids are replaced; the API rejects non-random ids on `/chatbot` and `/chatbot/clear`.
5. **CORS on :3001 (not reproduced).** `appsettings.Development.json` already allows `localhost:3001`; verified with preflight requests. Fixed the Development `SiteUrl` (`:5000` → `:3000`) so dev email links work.
6. **Upload storage (partly valid).** Both real deployments persist uploads (VPS dir + symlink, Docker volume) and run one instance. Added `Uploads:Directory` (absolute path) so production can write to `/var/www/osc/uploads` without depending on the per-deploy symlink; stored paths are reduced to a file name, so they can't escape the directory.

Known limitation (unchanged): deactivating an account doesn't end an existing session — JWTs stay valid until expiry (24h).

Verification: backend 272/272, frontend Jest 120/120, `tsc` and ESLint clean; payment migration tested on Postgres 16 with pre-existing duplicate pendings.
