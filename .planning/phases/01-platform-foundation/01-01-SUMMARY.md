---
phase: 01-platform-foundation
plan: 01
subsystem: database
tags: [sanity, cms, groq, typescript, next-sanity, content-types, schema]

# Dependency graph
requires: []
provides:
  - Sanity CMS schema for all 9 content types (8 document types defined)
  - Configured Sanity client (CDN read + server write)
  - GROQ query library for all content types
  - TypeScript interfaces for all Sanity types
  - Embedded Sanity Studio at /studio route
affects:
  - 02-ticket-system (ticket + ticketMessage schemas)
  - 03-analytics (analyticsMetadata schema)
  - 05-projects (licenseProject schema)
  - 06-events (event schema)
  - 07-agencies (agencyProfile + agency schemas)
  - 08-dashboard (dashboardConfig schema)

# Tech tracking
tech-stack:
  added:
    - "@sanity/client@7.16.0"
    - "next-sanity@9.12.3"
    - "sanity@3.x (peer dep)"
    - "@sanity/vision (GROQ explorer plugin)"
    - "@sanity/image-url"
    - "@sanity/cli (devDep)"
  patterns:
    - "Sanity schema: defineType + defineField pattern for all content types"
    - "Dual-client pattern: public CDN client + token-gated server client"
    - "Named GROQ query exports for each content type (ALL-CAPS convention)"
    - "TypeScript interfaces in src/types/sanity.ts mirror Sanity schema"

key-files:
  created:
    - "treat/frontend/sanity/env.ts"
    - "treat/frontend/sanity/sanity.config.ts"
    - "treat/frontend/sanity/schemaTypes/event.ts"
    - "treat/frontend/sanity/schemaTypes/licenseProject.ts"
    - "treat/frontend/sanity/schemaTypes/agency.ts"
    - "treat/frontend/sanity/schemaTypes/ticket.ts"
    - "treat/frontend/sanity/schemaTypes/ticketMessage.ts"
    - "treat/frontend/sanity/schemaTypes/analyticsMetadata.ts"
    - "treat/frontend/sanity/schemaTypes/dashboardConfig.ts"
    - "treat/frontend/sanity/schemaTypes/agencyProfile.ts"
    - "treat/frontend/sanity/schemaTypes/index.ts"
    - "treat/frontend/src/lib/sanity-client.ts"
    - "treat/frontend/src/lib/sanity-queries.ts"
    - "treat/frontend/src/types/sanity.ts"
    - "treat/frontend/src/app/studio/[[...tool]]/page.tsx"
    - "treat/frontend/.env.local.example"
  modified:
    - "treat/frontend/next.config.ts (removed static export, added CDN remote pattern)"
    - "treat/frontend/package.json (added Sanity dependencies)"

key-decisions:
  - "Used next-sanity@9.12.3 (not v12 which requires Next 16) for Next.js 15 compatibility"
  - "Installed sanity + @sanity/vision as peer deps of next-sanity (not auto-installed)"
  - "Removed output: export from next.config.ts — incompatible with Sanity Studio SSR and API routes planned for Vercel"
  - "Dual-client pattern: useCdn:true for public reads, token-gated serverClient for writes"
  - "8 document types defined (not 9 — the plan's index.ts comment says 9 types but only 8 distinct document schemas exist)"

patterns-established:
  - "Schema pattern: all defineType use defineField with validation callbacks for required fields"
  - "GROQ convention: ALL_CAPS named exports, arrow queries using Sanity projection syntax"
  - "Type safety: src/types/sanity.ts interfaces match schema field-for-field"
  - "Studio embed: /studio route via next-sanity/studio NextStudio component"

requirements-completed:
  - PLAT-01

# Metrics
duration: 26min
completed: 2026-03-01
---

# Phase 1 Plan 01: Sanity CMS Schema & Client Setup Summary

**8 Sanity document schemas (event, licenseProject, agency, ticket, ticketMessage, analyticsMetadata, dashboardConfig, agencyProfile) with typed GROQ queries and TypeScript interfaces, unblocking all 6 downstream phases**

## Performance

- **Duration:** 26 min
- **Started:** 2026-03-01T06:06:39Z
- **Completed:** 2026-03-01T06:33:31Z
- **Tasks:** 3
- **Files modified:** 16

## Accomplishments

- All 8 Sanity content type schemas defined and registered in sanity.config.ts
- Sanity client configured with dual-client pattern (CDN read / token-gated write)
- GROQ query library with 15 named queries covering all content types
- TypeScript interfaces for all 8 types — zero type errors
- Sanity Studio embedded at /studio via NextStudio component
- next.config.ts updated from Firebase static export to Vercel SSR mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Sanity dependencies and initialize project config** - `80f868b` (feat)
2. **Task 2: Define all 9 Sanity schema types and TypeScript interfaces** - `1ed4933` (feat)
3. **Task 3: Configure Sanity client and GROQ query library** - `6f9ffae` (feat)

## Files Created/Modified

- `treat/frontend/sanity/env.ts` - projectId/dataset/apiVersion with assertValue guard
- `treat/frontend/sanity/sanity.config.ts` - Sanity Studio config with structure + vision plugins
- `treat/frontend/sanity/schemaTypes/event.ts` - Event schema (Phase 6 dependency)
- `treat/frontend/sanity/schemaTypes/licenseProject.ts` - Licensed Project schema (Phase 5: 9,922+ projects)
- `treat/frontend/sanity/schemaTypes/agency.ts` - Agency schema (9 OSC agencies)
- `treat/frontend/sanity/schemaTypes/ticket.ts` - Ticket schema matching Cloud Functions shape (Phase 2)
- `treat/frontend/sanity/schemaTypes/ticketMessage.ts` - Ticket thread messages
- `treat/frontend/sanity/schemaTypes/analyticsMetadata.ts` - Analytics period summaries (Phase 3)
- `treat/frontend/sanity/schemaTypes/dashboardConfig.ts` - Dashboard KV config store (Phase 8)
- `treat/frontend/sanity/schemaTypes/agencyProfile.ts` - Agency officer profiles (Phase 7)
- `treat/frontend/sanity/schemaTypes/index.ts` - Barrel export of all 8 schema types
- `treat/frontend/src/lib/sanity-client.ts` - CDN client + serverClient exports
- `treat/frontend/src/lib/sanity-queries.ts` - 15 GROQ named query exports
- `treat/frontend/src/types/sanity.ts` - 8 TypeScript interfaces mirroring schemas
- `treat/frontend/src/app/studio/[[...tool]]/page.tsx` - Embedded Sanity Studio route
- `treat/frontend/.env.local.example` - Documents all 4 required Sanity env vars
- `treat/frontend/next.config.ts` - Removed static export, added Sanity CDN remote pattern

## Decisions Made

- **next-sanity version**: Used v9.12.3 (supports Next.js ^14.2 || ^15.0.0-0). v12 requires Next.js 16 which doesn't exist yet.
- **Missing peer deps**: `sanity` and `@sanity/vision` are peer dependencies of next-sanity but not auto-installed by npm — installed explicitly.
- **Static export removal**: `output: 'export'` in next.config.ts was incompatible with both Sanity Studio (needs SSR) and the API routes planned for Phases 2-8. Removed to enable Vercel deployment.
- **Dual-client pattern**: `client` (useCdn: true) for public component reads, `serverClient` (token) for admin writes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed `output: 'export'` from next.config.ts**
- **Found during:** Task 1 (Step 7 — next.config.ts review)
- **Issue:** `output: 'export'` enables static export for Firebase Hosting, incompatible with Sanity Studio (requires server-side rendering) and future API routes
- **Fix:** Removed `output: 'export'`, kept `trailingSlash: true`, added Sanity CDN remote pattern
- **Files modified:** treat/frontend/next.config.ts
- **Verification:** TypeScript compiles, ESLint passes
- **Committed in:** 80f868b (Task 1 commit)

**2. [Rule 3 - Blocking] Installed missing peer dependencies `sanity` and `@sanity/vision`**
- **Found during:** Task 2 (TypeScript type-check revealed `Cannot find module 'sanity'`)
- **Issue:** npm does not auto-install peer dependencies; `sanity` and `@sanity/vision` are required peer deps of next-sanity but not in package.json
- **Fix:** `npm install sanity @sanity/vision --legacy-peer-deps`
- **Files modified:** package.json, package-lock.json
- **Verification:** tsc --noEmit: zero errors
- **Committed in:** 1ed4933 (Task 2 commit)

**3. [Rule 3 - Blocking] Used `--legacy-peer-deps` for all Sanity installs**
- **Found during:** Task 1 (npm install failed with peer conflict)
- **Issue:** `react-simple-maps@3.0.0` (existing dependency) has a peer conflict with React 19; same conflict affects Sanity packages
- **Fix:** All Sanity installs used `--legacy-peer-deps` flag (consistent with existing project pattern)
- **Files modified:** None beyond what was already planned
- **Verification:** Packages install and type-check succeeds

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All fixes essential for correctness. Removing static export is a planned migration step (Firebase -> Vercel). Peer dep installs were missing from plan but required for compilation.

## Issues Encountered

- npm v12 `next-sanity` requires Next.js 16 (not released) — resolved by using next-sanity@9.12.3 which explicitly supports Next.js 15

## User Setup Required

Before Sanity Studio works, create `treat/frontend/.env.local` with:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=<from sanity.io dashboard>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_TOKEN=<write token from sanity.io>
```

See `treat/frontend/.env.local.example` for reference. The Sanity project must be created at https://sanity.io before deploying.

## Next Phase Readiness

- Phase 2 (Tickets): `ticket` and `ticketMessage` schemas ready. GROQ queries available.
- Phase 3 (Analytics): `analyticsMetadata` schema ready.
- Phase 5 (Projects): `licenseProject` schema ready with coordinates + sector fields.
- Phase 6 (Events): `event` schema ready with category options and resource attachments.
- Phase 7 (Agencies): `agency` and `agencyProfile` schemas ready.
- Phase 8 (Dashboard): `dashboardConfig` schema ready.
- **Blocker for all phases**: Sanity project credentials must be configured in `.env.local` before any Sanity queries will work at runtime.

## Self-Check: PASSED

All 16 files exist on disk. All 3 task commits verified in git log. tsc --noEmit: zero errors. ESLint: zero warnings/errors.

---
*Phase: 01-platform-foundation*
*Completed: 2026-03-01*
