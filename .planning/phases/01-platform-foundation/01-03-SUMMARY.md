---
phase: 01-platform-foundation
plan: 03
subsystem: api-routes
tags: [next-api-routes, sanity, vercel, deployment, tickets, events, projects, agencies]

# Dependency graph
requires:
  - 01-01 (sanity-client.ts, sanity-queries.ts, types/sanity.ts)
  - 01-02 (firebase-free codebase)
provides:
  - 8 Next.js App Router API routes replacing Firebase Cloud Functions
  - GET /api/health (deployment verification)
  - GET+POST /api/tickets (list + create with SLA deadlines)
  - GET /api/tickets/[id] (fetch by reference number)
  - GET /api/events, GET /api/events/[id]
  - GET /api/projects (with sector/mapOnly filters)
  - GET /api/agencies
  - GET /api/dashboard (live stats + config)
affects:
  - tickets/create/page.tsx (POSTs to /api/tickets — now functional)
  - All downstream phases using Sanity data

# Tech tracking
tech-stack:
  upgraded:
    - "next-sanity@9.12.3 -> 11.6.12 (Next.js 15 + sanity v4 compatibility)"
    - "sanity@5.12.0 -> 4.22.0 (useEffectEvent issue in v5 with stable React 19)"
    - "@sanity/vision@5.12.0 -> 4.22.0 (matching sanity v4)"
    - "styled-components@^6.1 (added — peer dep of next-sanity@11)"
  patterns:
    - "Next.js App Router API routes: export named GET/POST functions"
    - "SLA deadline calculation: hours by category (general_inquiry:24h to vip:1h)"
    - "Reference number format: UIA-YYYY-NNNN (padded sequential counter)"
    - "Cache strategy: no-store for dashboard, 1h for events, 24h for projects/agencies"
    - "Dual-client usage: client.fetch for reads, serverClient.create for writes"
    - "Build-time safety: placeholder projectId for NEXT_PUBLIC_SANITY_PROJECT_ID"

key-files:
  created:
    - "treat/frontend/src/app/api/health/route.ts"
    - "treat/frontend/src/app/api/tickets/route.ts"
    - "treat/frontend/src/app/api/tickets/[id]/route.ts"
    - "treat/frontend/src/app/api/events/route.ts"
    - "treat/frontend/src/app/api/events/[id]/route.ts"
    - "treat/frontend/src/app/api/projects/route.ts"
    - "treat/frontend/src/app/api/agencies/route.ts"
    - "treat/frontend/src/app/api/dashboard/route.ts"
  modified:
    - "treat/frontend/src/lib/sanity-client.ts (placeholder projectId for build safety)"
    - "treat/frontend/package.json (next-sanity v11, sanity v4, styled-components)"
    - "treat/frontend/package-lock.json"

key-decisions:
  - "Upgraded next-sanity to v11.6.12: sanity@5 uses useEffectEvent from React (not in stable React 19.1.0); next-sanity@11 is the only line supporting next@^15 + sanity@^4"
  - "Downgraded sanity to v4.22.0: next-sanity@11 requires sanity@^4.x; v5 is incompatible"
  - "Placeholder projectId in sanity-client.ts: @sanity/client v4 throws synchronously on createClient when projectId is undefined; placeholder defers error to runtime fetch"
  - "Cache-Control no-store for /api/dashboard: live ticket counts must not be cached"
  - "24h cache for /api/projects: 9,922 licensed projects are static data; CDN caching is essential"

requirements-completed:
  - PLAT-02 (partial — code deployed locally; Vercel deployment awaiting user setup)
  - PLAT-03 (partial — Sanity Studio exists; project creation awaiting user setup)

# Metrics
duration: 9min (Task 1 only)
completed: 2026-03-01
---

# Phase 1 Plan 03: API Routes & Vercel Deployment Summary

**8 Next.js API routes wired to Sanity via dual-client pattern, with upgraded next-sanity@11+sanity@4 for Next.js 15 compatibility — build passes locally, awaiting Sanity project creation and Vercel deployment**

## Performance

- **Duration:** 9 min (Task 1 completed)
- **Started:** 2026-03-01T12:35:29Z
- **Completed:** 2026-03-01T12:44:49Z (partial — checkpoint reached)
- **Tasks:** 1/2 complete (Task 2 is human checkpoint)
- **Files created:** 8 API route files
- **Files modified:** 3 (sanity-client.ts, package.json, package-lock.json)

## Accomplishments

### Task 1 Complete: All 8 API routes created and build passes

- `GET /api/health` — returns `{status:"ok", timestamp, version:"1.0.0"}` — Vercel health probe
- `GET /api/tickets` — paginated ticket list from Sanity (from/to params), `POST /api/tickets` creates ticket with SLA deadline calculation matching Cloud Functions logic
- `GET /api/tickets/[id]` — fetch ticket by reference number (UIA-YYYY-NNNN), includes messages thread
- `GET /api/events` — list published events (1h CDN cache)
- `GET /api/events/[id]` — event by `_id` or slug
- `GET /api/projects` — licensed projects with sector filter + mapOnly mode (24h cache)
- `GET /api/agencies` — agency list (24h cache)
- `GET /api/dashboard` — live ticket stats + dashboard config (no-store cache)

**All routes verified:**
- tsc --noEmit: zero errors
- ESLint: zero warnings
- npm run build: 89 static pages generated, zero errors

## Task Commits

1. **Task 1: Create all Next.js API routes replacing Cloud Functions** - `dafd3d0` (feat)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Upgraded next-sanity@9 -> 11.6.12 and sanity@5 -> 4.22.0**
- **Found during:** Task 1 (build verification step)
- **Issue:** `sanity@5.12.0` (installed by Plan 01) imports `useEffectEvent` from React in its lib/index.js. This API exists in React 19 canary/experimental builds but NOT in stable React 19.1.0. Build fails with "Attempted import error: 'useEffectEvent' is not exported from 'react'"
- **Root cause:** Plan 01 installed `sanity` without version constraint — npm grabbed latest (v5). `next-sanity@9.12.3` peer dep is `sanity@^3.99.0`. Mismatch was hidden by `--legacy-peer-deps`. The v5 incompatibility only surfaces at webpack bundle time.
- **Fix:** Upgraded `next-sanity` to v11.6.12 (supports `next@^15.1` + `sanity@^4.x`), downgraded `sanity` to v4.22.0 (no `useEffectEvent` usage), installed matching `@sanity/vision@4.22.0`
- **Files modified:** package.json, package-lock.json
- **Commit:** dafd3d0

**2. [Rule 3 - Blocking] Fixed sanity-client.ts placeholder projectId for build safety**
- **Found during:** Task 1 (second build attempt after package fix)
- **Issue:** `@sanity/client v4` throws synchronously in `createClient()` when `projectId` is undefined. Build-time module evaluation fails with "Configuration must contain `projectId`"
- **Fix:** Changed `process.env.NEXT_PUBLIC_SANITY_PROJECT_ID` to use nullish coalescing with `'placeholder-project-id'` — defers real validation to runtime when actual queries are executed with live env vars
- **Files modified:** `treat/frontend/src/lib/sanity-client.ts`
- **Commit:** dafd3d0

**3. [Rule 3 - Blocking] Installed missing styled-components peer dependency**
- **Found during:** Task 1 (first build attempt)
- **Issue:** `@sanity/vision` requires `styled-components@^6.1` but it wasn't installed
- **Fix:** `npm install styled-components --legacy-peer-deps`
- **Files modified:** package.json, package-lock.json
- **Commit:** dafd3d0

### Checkpoint Reached

**Task 2 (checkpoint:human-verify):** Requires user to:
1. Create Sanity project at sanity.io
2. Get API write token
3. Set env vars in .env.local
4. Import repo to Vercel with Root Directory = treat/frontend
5. Add env vars to Vercel

**Resume signal:** "deployed https://your-vercel-url.vercel.app" to continue Phase 1 completion.

## User Setup Required

The following must be completed by the user before PLAT-02 and PLAT-03 are verified:

### Sanity Project Setup
1. Create project at https://sanity.io/manage → "Create new project"
   - Name: "UIA One-Stop Centre"
   - Dataset: production (default)
2. API → Tokens → Add API Token: Name "Next.js App", Permission "Editor"
3. Add to `treat/frontend/.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
   SANITY_API_TOKEN=your-write-token
   ```

### Vercel Deployment
1. https://vercel.com/new → Import Git Repository → select treat repo
2. Set Root Directory to `treat/frontend`
3. Add same 4 env vars in Vercel → Settings → Environment Variables
4. Deploy

### Admin Invites
- sanity.io/manage → Members → Invite admin staff with "Editor" role

### Verification
- `GET https://your-vercel-url.vercel.app/api/health` → `{"status":"ok",...}`
- `GET https://your-vercel-url.vercel.app/api/tickets` → `{"success":true,"data":[]}`
- `https://your-vercel-url.vercel.app/studio` → Sanity Studio loads

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `src/app/api/health/route.ts` | FOUND |
| `src/app/api/tickets/route.ts` | FOUND |
| `src/app/api/tickets/[id]/route.ts` | FOUND |
| `src/app/api/events/route.ts` | FOUND |
| `src/app/api/events/[id]/route.ts` | FOUND |
| `src/app/api/projects/route.ts` | FOUND |
| `src/app/api/agencies/route.ts` | FOUND |
| `src/app/api/dashboard/route.ts` | FOUND |
| Commit dafd3d0 (Task 1) | FOUND |
| tsc --noEmit | PASS (zero errors) |
| ESLint | PASS (zero warnings) |
| npm run build | PASS (89 pages, zero errors) |

---
*Phase: 01-platform-foundation*
*Completed: 2026-03-01 (Task 1 only — Task 2 awaiting user setup)*
