# osc-api (Cloudflare Workers backend)

TypeScript/Hono replacement for `backend/` (ASP.NET), migrating one resource
at a time onto Cloudflare Workers. See the migration plan for the full
context and slice ordering — ask for it by name ("scalable-dazzling-abelson"
plan) if it's not at hand.

**Status: Phase 1 (foundations) + Phase 2 (Auth + Me) + Phase 3
(Tickets + Documents + Messages + Upload) written, type-checked, and
unit-tested — NOT yet verified against a real database, NOT deployed, and
the frontend is NOT pointed at it.** See "What has NOT been verified
against a real database" below before treating this as done.

Live routes:
- `/api/health`
- `/api/auth/*` — login, signup, google, logout, me, profile,
  mfa/enroll+verify+disable+status, password-reset+verify
- `/api/me/*` — submissions, drafts, profile, delete-account
- `/api/tickets/*` — list, create, get-by-ref, update, messages
  (get/staff-reply/public-comment), public self-service update
- `/api/tickets/:refNumber/documents/*` — list, download content, delete
- `/api/upload` — ticket attachment upload (byte-signature checked), now
  backed by R2 instead of ephemeral local disk
- `/api/messages/*` — agency officer/admin channel messaging

All of the above mirror their ASP.NET controller/service one-for-one,
including matching error messages/status codes and the exact JSON response
shape — see each route file's top comment for the specific `.cs` file it
was ported from.

## Why this exists before any real route is migrated

The single riskiest assumption in a strangler migration is "a session issued
by one backend works on the other." Rather than assume that and find out
during Phase 2 (Auth), the JWT/cookie/TOTP/password logic here was written
to mirror `backend/src/OscApi/Common/{JwtService,PasswordService,TotpService}.cs`
exactly and is covered by tests that assert the compatible bits directly
(`test/jwt.test.ts`, `test/password.test.ts`, `test/totp.test.ts`) — run
`npm test` to see them pass against a real `workerd` runtime, not just Node.

## One-time setup (do this before `npm run dev` will fully work)

You'll need a Cloudflare account with Workers + the following resources.
`wrangler.toml` has placeholder IDs (`REPLACE_WITH_...`) for each — replace
them with what these commands return:

```bash
npm install

# Postgres (Neon) access from Workers — point at your Neon POOLED connection string
npx wrangler hyperdrive create osc-db --connection-string="postgres://...neon.tech/neondb?sslmode=require"

# Object storage for ticket/document attachments (replaces the ASP.NET
# backend's ephemeral-disk /uploads simulation for good)
npx wrangler r2 bucket create osc-documents

# KV: rate-limit counters for windows >60s (login, password-reset) + light cache
npx wrangler kv namespace create RATE_LIMITS
```

Then set secrets — **these must match the ASP.NET backend's current values
exactly** for as long as both backends are live (see wrangler.toml's comment
on JWT_SECRET):

```bash
npx wrangler secret put JWT_SECRET          # same value as backend's Jwt:Secret
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put RECAPTCHA_SECRET_KEY
npx wrangler secret put SENTRY_DSN
npx wrangler secret put SEED_ADMIN_PASSWORD
```

For local dev, put the same values in a `.dev.vars` file (gitignored) instead
of real secrets — see `wrangler.toml`'s `[vars]` for the non-secret config
that goes there too if you want to override it locally.

⚠️ **Before verifying the rate-limiting bindings**: `wrangler.toml`'s
`[[unsafe.bindings]]` for `RL_CHATBOT`/`RL_PUBLIC_FORM` were written from
memory of Cloudflare's Rate Limiting binding shape at the time this was
scaffolded — that feature is newer and still evolving. Check
`wrangler docs` / the dashboard for the current syntax before your first
real deploy; it's very plausible the key names or table path have moved.

## Commands

```bash
npm run dev          # wrangler dev (local, needs the resources above)
npm test             # vitest, runs in a real workerd runtime via
                      # @cloudflare/vitest-pool-workers (wrangler.test.toml —
                      # a deliberately reduced config, see its top comment)
npm run build        # tsc --noEmit
npm run deploy        # wrangler deploy
npm run db:generate  # drizzle-kit generate, against DATABASE_URL (see
                      # drizzle.config.ts) — for schema changes going forward;
                      # the current schema.ts was hand-translated from EF Core
                      # models, not introspected (no DB network access while
                      # scaffolding) — diff it against the real Neon schema
                      # before trusting it for a migration slice.
```

## What has NOT been verified against a real database

This environment has no way to reach a live Postgres instance (no Docker,
no network path to Neon), so **nothing that touches the database has been
run against a real database** — only type-checked and unit-tested with the
DB calls unexercised. `npx vitest run` proves: the JWT/password/TOTP/
reset-token logic; pure business logic (`computeSla`, `stripHtml`,
`toPascalCase`, the unique-reference retry loop); Zod schema validation; and
routes' *pre-DB* gating (401s on missing/invalid session, 400s on malformed
bodies). It does NOT prove:

- That `schema.ts` actually matches the real Neon tables (see its own
  top-comment risk note — hand-translated, not introspected).
- That a full ticket lifecycle works end-to-end: create → SLA computed
  correctly → staff/public messages → escalation email → status update →
  satisfaction rating, against real data.
- That file upload → R2 → document list → download → delete round-trips
  correctly (needs a real R2 bucket, `wrangler dev` at minimum).
- That the agency-officer channel-scoping in `/api/messages` and the
  agency-scoping in `/api/tickets` behave correctly against real ticket/
  agency data (the logic is unit-testable in isolation via
  `resolveAgencyScope`, but the DB-query half of each check —
  `officerCanAccessChannel`, the `assignedAgencyCode` filters — is not).
- That a session cookie issued by the live ASP.NET backend is accepted here
  (the single riskiest assumption in the whole migration plan, called out
  since Phase 2 — still unverified).

**Before trusting Tickets/Documents/Messages specifically**, also confirm:
category/status snake_case→PascalCase conversion actually matches what's
stored in the real `tickets."Category"`/`"Status"` columns (see
`schema.ts`'s enum-casing risk note — this is the second-highest-risk
assumption after the JWT one, and nothing here can verify it without a real
row to read).

**Before trusting this slice overall**, provision Hyperdrive + R2 per the
setup section above, `npm run dev` against a real (ideally staging) Neon
branch, and manually exercise: login variants from Phase 2, then create a
ticket, attach a file, post a staff reply and a public comment, escalate it,
update its status, download and delete the attachment — and confirm a
session cookie from the live production site is accepted here. Only after
that should `frontend/src/lib/api-client.ts` be pointed at this backend for
the corresponding prefixes, and the matching Sanity-fallback routes deleted,
per the plan's migration sequence.

## What's deliberately NOT here yet

- Investors/Contact, Chatbot, and the admin surface (Dashboard/Settings/
  AdminUsers/Audit/Analytics) — later phases.
- HTML email templates (`EmailTemplates.cs`) — only the plain-text bodies
  are ported so far; see `lib/email.ts`'s top comment.
- Settings caching (`SettingsService.cs`'s in-memory cache layer) — the
  port in `lib/settings.ts` reads straight from the DB every time, since
  full Settings CRUD (with its own cache) is a later admin-surface slice.
- A verified rate-limiting binding config (see the warning above).
- Any change to the frontend — `api-client.ts` still points at ASP.NET for
  everything; nothing here is live traffic yet.

## Known flake in `npm test`

Occasionally a run fails with `Isolated storage failed. There should be
additional logs above.` from `@cloudflare/vitest-pool-workers`'s teardown
between test files — a known flake in that pool, not a real failure. Rerun;
all 62 tests pass consistently otherwise.

## Gotcha: `@cloudflare/workers-types`'s bare import resolves to its OLDEST snapshot

Hit while building `routes/upload.ts`: importing the bare
`"@cloudflare/workers-types"` package (no subpath) silently resolves to its
**oldest** dated type snapshot — from before `FormData.getAll()` typed its
return as including `File`. That broke every `.size`/`.type`/`.arrayBuffer()`
access on an uploaded file with confusing "`Property does not exist on type
'string'`" errors that have nothing to do with the actual code. Fixed by
pointing `tsconfig.json`'s `types` at `"@cloudflare/workers-types/latest"`
instead — but `@cloudflare/vitest-pool-workers` transitively bundles its own
nested `wrangler` dependency, which still pulls the oldest snapshot into the
global scope, so the two merge unpredictably regardless. `routes/upload.ts`
works around this with a local structural `UploadedFile` interface instead
of fighting the ambient `File` type — see its top comment. If a future route
needs `File`/`Blob`/`FormData` again, expect the same issue and reach for
the same fix rather than re-debugging it from scratch.

## Known cost/behavior data point

`bcryptjs` (pure JS, work factor 12, matching the ASP.NET backend) took
~1.6s for a single hash+verify round-trip in the test run used to validate
this scaffold. That's within Workers' CPU-time limits for a single request
but confirms the plan's flagged risk is real — load-test the login path
specifically before relying on it at any real traffic volume.
