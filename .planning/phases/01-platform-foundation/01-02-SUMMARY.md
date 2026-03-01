---
phase: 01-platform-foundation
plan: 02
subsystem: frontend-firebase-removal
tags: [firebase, cleanup, auth, stub, migration]
dependency_graph:
  requires: [01-01]
  provides: [firebase-free-frontend, auth-stub, sanity-ready-codebase]
  affects: [all-frontend-pages, AuthContext, chatbot-service, dashboard-hook]
tech_stack:
  added: []
  removed: [firebase@12.4.0]
  patterns: [admin-stub-auth, fetch-api-stub, mock-data-fallback]
key_files:
  deleted:
    - treat/frontend/src/lib/firebase.ts
    - treat/frontend/firebase.json
    - treat/frontend/firestore.indexes.json
    - treat/frontend/firestore.rules
    - treat/frontend/storage.rules
  modified:
    - treat/frontend/src/contexts/AuthContext.tsx
    - treat/frontend/src/hooks/useDashboard.ts
    - treat/frontend/src/hooks/useFirestoreCollection.ts
    - treat/frontend/src/lib/chatbot-service.ts
    - treat/frontend/src/app/analytics/page.tsx
    - treat/frontend/src/app/events/[id]/EventDetailClient.tsx
    - treat/frontend/src/app/tickets/create/page.tsx
    - treat/frontend/src/app/tickets/[id]/TicketDetailClient.tsx
    - treat/frontend/package.json
    - treat/frontend/eslint.config.mjs
decisions:
  - "Kept AuthContextType interface identical — only replaced Firebase SDK calls with stubs"
  - "useFirestoreCollection stub preserves full API shape (data, loading, error, add, update, getById, refresh)"
  - "useDashboard returns DGDashboardMetrics from mockDashboardMetrics — same shape as before"
  - "chatbot-service.ts uses NEXT_PUBLIC_API_URL instead of getFunctionsBaseUrl() — chatbot still functional via KB fallback"
  - "tickets/create now POSTs to /api/tickets — gracefully handles non-existent endpoint (Plan 03 will wire it)"
  - "ESLint argsIgnorePattern added for _ prefix — standard TypeScript convention, zero warnings"
metrics:
  duration_minutes: 15
  completed_date: "2026-03-01"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 10
  files_deleted: 6
  requirements_satisfied: [PLAT-06]
---

# Phase 1 Plan 02: Firebase Removal Summary

**One-liner:** Complete Firebase SDK removal from all 9 source files — replaced with identical-interface stubs ready for Sanity/API wiring in Plan 03.

## What Was Done

Complete removal of the `firebase` npm package and all Firebase infrastructure from the Next.js frontend. The codebase went from 9 files importing from `firebase/*` subpaths to zero — verified by `grep -r "from.*firebase" src/` returning no matches.

### Task 1: Firebase Package and Config Removal

- Removed `firebase@12.4.0` from `package.json` dependencies
- Removed 5 Firebase deploy scripts from `package.json` scripts section
- Deleted `firebase.json`, `firestore.indexes.json`, `firestore.rules`, `storage.rules`
- Deleted `service-account.json` from disk (was already in `.gitignore`)
- Deleted `src/lib/firebase.ts` (Firebase SDK initialization module)

**Commit:** `109fc72`

### Task 2: Source File Stub Replacements

**AuthContext.tsx** — Replaced the entire 354-line Firebase Auth implementation with a 75-line admin stub. The exported `AuthContextType` interface shape is identical (login, register, logout, verifyEmail, googleSignIn, resendVerificationCode, clearError, clearVerification, refreshUser, pendingVerification). All functions return stub errors explaining that admin auth is wired in Plan 03.

**useFirestoreCollection.ts** — Replaced 146-line Firestore real-time listener hook with a 55-line stub. Preserves full return API: `{ data, loading, error, add, update, getById, refresh }`. Returns fallback data immediately with `loading: false`.

**useDashboard.ts** — Replaced 63-line Firestore + Cloud Function hook with a 16-line stub. Returns `{ metrics, loading, error }` with `mockDashboardMetrics` as the data source.

**chatbot-service.ts** — Removed the `getFunctionsBaseUrl()` import from `firebase.ts`. Replaced with a local `getChatbotBaseUrl()` function using `NEXT_PUBLIC_API_URL`. Chatbot still functions via 3-tier fallback (API → local KB → static fallback).

**analytics/page.tsx** — Removed Firestore `onSnapshot` listener and `useEffect`. Page now uses mock analytics data directly (no runtime Firebase dependency).

**EventDetailClient.tsx** — Removed `getDoc`/`doc` Firestore imports and the `useEffect` that fetched from Firestore. Component now uses the `initialEvent` prop provided by the server component.

**tickets/create/page.tsx** — Removed `addDoc`/`collection` Firestore imports. Replaced Firestore write with a `fetch('/api/tickets', { method: 'POST' })` call. Gracefully handles the non-existent endpoint with a fallback ticket ID.

**TicketDetailClient.tsx** — Removed `getDoc`/`doc` Firestore imports and the `useEffect` that fetched from Firestore. Component now uses `initialTicket` prop from the server component.

**eslint.config.mjs** — Added `argsIgnorePattern: "^_"` and `varsIgnorePattern: "^_"` to `@typescript-eslint/no-unused-vars` rule. This is the TypeScript convention for intentionally unused parameters.

**package.json** — Fixed trailing comma in `scripts` object that caused `EJSONPARSE` error (introduced when removing Firebase scripts).

**Commit:** `4ded65d`

## Verification Results

```
grep -r "from.*firebase" src/ → PASS: No Firebase imports
grep "firebase" package.json  → PASS: Not in package.json
npm run type-check             → PASS: Zero TypeScript errors
npm run lint                   → PASS: No ESLint warnings or errors
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed trailing comma in package.json**
- **Found during:** Task 2 (npm run type-check returned EJSONPARSE)
- **Issue:** Removing Firebase scripts left a trailing comma after `"test:coverage"` entry — invalid JSON
- **Fix:** Removed trailing comma to restore valid JSON
- **Files modified:** `treat/frontend/package.json`
- **Commit:** `4ded65d`

**2. [Rule 2 - Missing Config] Added ESLint argsIgnorePattern for underscore prefix**
- **Found during:** Task 2 lint check (8 warnings for `_`-prefixed parameters)
- **Issue:** ESLint `no-unused-vars` rule was reporting `_email`, `_password`, `_eventId`, etc. as warnings — these are intentionally unused stub params following TypeScript convention
- **Fix:** Added `argsIgnorePattern: "^_"` and `varsIgnorePattern: "^_"` to eslint.config.mjs
- **Files modified:** `treat/frontend/eslint.config.mjs`
- **Commit:** `4ded65d`

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| AuthContext.tsx exists | FOUND |
| useDashboard.ts exists | FOUND |
| useFirestoreCollection.ts exists | FOUND |
| chatbot-service.ts exists | FOUND |
| firebase.ts deleted | CONFIRMED |
| firebase.json deleted | CONFIRMED |
| Commit 109fc72 (Task 1) | FOUND |
| Commit 4ded65d (Task 2) | FOUND |
| Zero Firebase imports in src/ | PASS |
