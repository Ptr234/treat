# Deploying OSC Digital Tool

Two independent deployments: the **frontend** (Cloudflare Workers) deploys itself; the
**backend** (a VPS) does not — it's a manual publish-and-swap, documented below.

> ⚠️ Never commit real secret values to this file or to `appsettings.json`/`appsettings.Development.json`.
> Production secrets live only in `appsettings.Production.json` on the server (see §3) and in
> Cloudflare's dashboard (see §2) — neither is in git.

---

## 1. Frontend — Cloudflare Workers (automatic)

- **Trigger:** every push to `main` on `github.com/Ptr234/treat`. Cloudflare's own Git
  integration builds and deploys automatically — there is no GitHub Actions workflow for this
  and there should not be one; a duplicate was removed for exactly that reason.
- **Build:** `npm ci --legacy-peer-deps && npm run cf:build` (OpenNext for Cloudflare), from
  `frontend/`, defined in `frontend/wrangler.jsonc`. The deployed Worker is named `treat` — not
  `osc-frontend` or anything else; `wrangler.jsonc`'s `name` field must keep matching the
  Worker that actually owns the `oscdigitaltool.com` / `www.oscdigitaltool.com` custom domains,
  or new deploys silently stop reaching the live site.
- **How long:** builds have taken anywhere from under a minute to several minutes in practice.
  Check the Cloudflare dashboard → the `treat` Worker → **Deployments** tab for real status;
  don't assume a push has landed just because it was pushed.
- **Confirming from a terminal:** poll the live HTML for something the change introduced, e.g.
  `curl -s https://oscdigitaltool.com/ | grep -c osc-logo` (the 2026-10-10 logo change went live
  ~5 minutes after the push). A hard refresh (Ctrl+F5) clears a browser's cached copy.
- **Prerendered pages are served from a cache, not re-rendered.** Almost every page is
  prerendered at build time. Until 2026-10-10 the Worker had no incremental cache and rendered
  each page on every request, which exceeded the Workers CPU limit: about half of all page loads
  failed (Cloudflare error 1102, or a hang). `frontend/open-next.config.ts` now uses OpenNext's
  static-assets cache with cache interception, and `npm run cf:build` copies the prerendered
  pages into the Worker's assets (`opennextjs-cloudflare populateCache local`). Check with
  `curl -sI https://oscdigitaltool.com/about/ | grep -i x-opennext-cache` → `HIT`.
  This cache is read-only: a page that adds time-based `revalidate` (ISR) needs an R2 or KV
  incremental cache instead.
- **Next.js 16 upgrade: tried and rolled back (2026-10-11).** Findings for the next attempt:
  - Next.js 16.4.0 writes a `preview-props.json` manifest that OpenNext 1.20.10 can't load, so
    every server-rendered route returned 500. 16.3.8 (the lowest version OpenNext supports)
    builds and passed every check under local `wrangler dev`.
  - Deployed, the 16.3.8 build served prerendered pages and API routes fine, but every route
    the middleware handles (`/dashboard`, `/agency-chat`, the closed `/api/...` routes) and
    `/studio` failed with error 1102 or hung. Local `wrangler dev` has no CPU limit, so it
    can't catch this. Reverted (commit `3d19e97`); the Next.js 15 build handles them in ~0.25 s.
  - Before trying again: check the Workers plan's CPU limit (Workers Paid allows far more than
    the free plan), and test the *deployed* Worker, e.g. with a preview deployment, on
    `/dashboard/`, `/studio/` and an `/api/...` route.
- **Security headers** for the site are set in `frontend/next.config.ts` (the API sets its own).
- **The Next.js routes the backend replaced** (`/api/auth`, `/api/tickets`, `/api/investors`,
  `/api/upload`, `/api/messages`, `/api/dashboard`, `/api/health`) return 404 whenever
  `NEXT_PUBLIC_BACKEND_URL` is set (`frontend/src/middleware.ts`). They're kept only for local
  development without a backend.

### Frontend environment variables (Cloudflare dashboard → `treat` Worker → Settings → Variables and Secrets)

`NEXT_PUBLIC_*` variables are **build-time** — Next.js inlines them into the browser bundle.
Changing one does nothing until the next build runs. If you've just added or changed one and
need it live immediately, trigger a build (push anything to `main`, including an empty commit:
`git commit --allow-empty -m "chore: trigger rebuild"`).

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Points the frontend at the VPS backend (`https://api.oscdigitaltool.com`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Sign-In client ID (public, not secret) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` / `_API_VERSION` | Sanity CMS connection |
| `JWT_SECRET` | **Must be byte-for-byte identical** to the backend's `Jwt:Secret` — the frontend's own middleware verifies the session cookie independently |
| `SANITY_API_TOKEN` | Server-side Sanity write access, used by the (mostly superseded) Next.js API routes |

Set `JWT_SECRET` and `SANITY_API_TOKEN` as type **Secret**, not **Variable** — a plain Variable's
value sits in cleartext in the dashboard.

`GOOGLE_CLIENT_SECRET` exists here too but is **unused**: the old email-sending routes that read it
are bypassed once `NEXT_PUBLIC_BACKEND_URL` is set, since the browser calls the real backend directly.
**`GROQ_API_KEY` should be deleted from this Worker.** The Next.js `/api/chatbot` route that read it
was removed (2026-10-10), because it called Groq for anyone with no sign-in check. The assistant is
now served only by the backend, which requires a signed-in session.

---

## 2. Backend — the VPS (manual)

### Server

| | |
|---|---|
| Host | `ubuntu@57.129.67.69` (OVH, Frankfurt) — key-only SSH, passwordless sudo |
| Shared with | This box also runs **Women in Design** (`wid-api`, port 3001) and the **Ngyero ERP** — it is not dedicated to this project. Be mindful of resources and don't assume you're the only thing running. |
| Backend service | `osc-api.service` (systemd), bound to `127.0.0.1:3003`, not exposed directly |
| Reverse proxy | nginx, `/etc/nginx/sites-available/osc` → `https://api.oscdigitaltool.com`, TLS via certbot (auto-renews) |
| Database | PostgreSQL 16, local, database `osc_db`, role `osc_user` |
| Live code | `/var/www/osc/aspnet/` (self-contained `linux-x64` publish — the VPS does not build .NET from source) |
| Config | `/var/www/osc/aspnet/appsettings.Production.json` — **not in git**, owned by `www-data`, mode `640` |
| Uploads | `/var/www/osc/uploads/` (persistent, symlinked into the live dir on every deploy) |
| Data Protection keys | `/var/www/osc/keys/` (persisted across restarts — see the systemd unit's `PrivateTmp`/`ReadWritePaths` notes if touching this) |

### Deploying a backend change

Deploy only **committed and pushed** code. Each step below is safe to stop after, except the swap.

**SSH from Windows:** use Windows OpenSSH (PowerShell), with the key `~/.ssh/id_ed25519_osc`.
Git Bash's bundled `ssh`/`scp` is refused with the same key. When piping a script written on
Windows to the server, strip CRLF and any byte-order mark, or bash fails with
`sudo: command not found`:
`Get-Content -Raw script.sh | ssh -i $K ubuntu@57.129.67.69 "tr -d '\r' | sed '1s/^\xEF\xBB\xBF//' | bash -s"`.

```bash
# 1. Publish self-contained from a CLEAN export of the commit, not the working tree,
#    so uncommitted local edits can never ship. (.NET 8 SDK needed; the VPS doesn't build.)
SHA=$(git rev-parse --short HEAD)          # must already be pushed to main
rm -rf /tmp/osc-export /tmp/osc-publish && mkdir -p /tmp/osc-export
git archive $SHA backend | tar x -C /tmp/osc-export
cd /tmp/osc-export/backend/src/OscApi
dotnet publish OscApi.csproj -r linux-x64 --self-contained true -c Release -o /tmp/osc-publish

# 2. Package and upload
cd /tmp/osc-publish && tar czf ../osc-publish.tar.gz . && cd ..
scp -i ~/.ssh/id_ed25519_osc osc-publish.tar.gz ubuntu@57.129.67.69:/tmp/osc-publish.tar.gz

# 3. Stage it on the VPS and take a pre-deploy DB backup (doesn't touch the live service)
ssh ubuntu@57.129.67.69 '
  set -e
  sudo rm -rf /var/www/osc/aspnet.new && sudo mkdir -p /var/www/osc/aspnet.new
  sudo tar xzf /tmp/osc-publish.tar.gz -C /var/www/osc/aspnet.new
  sudo rm -f /var/www/osc/aspnet.new/appsettings.Development.json
  sudo chmod +x /var/www/osc/aspnet.new/OscApi
  rm -f /tmp/osc-publish.tar.gz
  sudo cp /var/www/osc/aspnet/appsettings.Production.json /var/www/osc/aspnet.new/appsettings.Production.json
  sudo chown -R www-data:www-data /var/www/osc/aspnet.new
  sudo chmod 640 /var/www/osc/aspnet.new/appsettings.Production.json
  # migrations run on startup, so keep a restorable copy of the schema they change
  TS=$(date +%Y%m%d-%H%M%S)
  sudo -u postgres pg_dump -Fc osc_db -f /tmp/osc_db-predeploy-$TS.dump
  sudo mv /tmp/osc_db-predeploy-$TS.dump /var/backups/osc/
  echo "live service still: $(systemctl is-active osc-api)"
'

# 4. Swap and restart, rolling back automatically if the new release isn't healthy in 60 s.
#    This is the actual cutover: run it deliberately, not as a background step.
ssh ubuntu@57.129.67.69 '
  set -u
  TS=$(date +%Y%m%d-%H%M%S); BAK=/var/www/osc/aspnet.bak-$TS
  healthy() { for i in $(seq 1 30); do curl -s -m 5 http://127.0.0.1:3003/api/health | grep -q "\"status\":\"ok\"" && return 0; sleep 2; done; return 1; }
  sudo systemctl stop osc-api
  sudo mv /var/www/osc/aspnet "$BAK"
  sudo mv /var/www/osc/aspnet.new /var/www/osc/aspnet
  sudo ln -sfn /var/www/osc/uploads /var/www/osc/aspnet/uploads
  sudo chown -R www-data:www-data /var/www/osc/aspnet
  sudo systemctl start osc-api
  if healthy; then
    echo "NEW RELEASE HEALTHY - rollback copy: $BAK"
  else
    echo "NOT HEALTHY - rolling back"
    sudo journalctl -u osc-api -n 40 --no-pager | grep -iE "error|exception|fail" | tail -15
    sudo systemctl stop osc-api
    sudo mv /var/www/osc/aspnet /var/www/osc/aspnet.failed-$TS
    sudo mv "$BAK" /var/www/osc/aspnet
    sudo systemctl start osc-api
    healthy && echo "rolled back, old release healthy" || echo "ROLLBACK ALSO UNHEALTHY"
  fi
  sudo -u postgres psql -d osc_db -tAc "select \"MigrationId\" from \"__EFMigrationsHistory\" order by 1 desc limit 3"
  for s in osc-api wid-api erp-api erp-web nginx; do printf "%-9s %s\n" $s "$(systemctl is-active $s)"; done
'
```

If `EF Core` migrations are pending, they run automatically on startup
(`RunMigrationsOnStartup: true` in the config); there is no separate migration step. The
pre-deploy dump from step 3 (`/var/backups/osc/osc_db-predeploy-<TS>.dump`) is what you restore
if a migration damages data; rolling back the binary alone does not undo a migration.

The last check lists the other apps on this box (`wid-api`, `erp-api`, `erp-web`) because a deploy
must not disturb them.

### Config-only change (no new binary)

Edit `/var/www/osc/aspnet/appsettings.Production.json` directly on the server, then
`sudo systemctl restart osc-api`. No need to republish or swap directories.

### ⚠️ The mistake that caused the Oct 2026 Google Sign-In outage — don't repeat it

`appsettings.json` (committed, in git) and `appsettings.Production.json` (on the server, not in
git) are **layered** — ASP.NET Core applies `appsettings.json` first, then
`appsettings.{Environment}.json` **on top of it**, for the keys that file actually sets. A fix
committed to `appsettings.json` — e.g. adding the apex domain to `Cors.AllowedOrigins` — does
**not** take effect on the live server if `appsettings.Production.json` already sets that same
key, because the Production file wins. The committed fix landed in git and looked deployed, but
the live server kept running the old value until someone manually edited the Production file too.

**Rule:** any config key that's been explicitly set in `appsettings.Production.json` on the VPS
has to be updated there by hand when you change its default in the committed `appsettings.json`.
Check with:
```bash
ssh ubuntu@57.129.67.69 'sudo python3 -c "import json; print(json.load(open(\"/var/www/osc/aspnet/appsettings.Production.json\")))"'
```

### Rollback

```bash
ssh ubuntu@57.129.67.69 '
  sudo systemctl stop osc-api
  sudo mv /var/www/osc/aspnet /var/www/osc/aspnet.failed
  sudo mv /var/www/osc/aspnet.bak-<TS> /var/www/osc/aspnet
  sudo systemctl start osc-api
'
```
List available backups: `ssh ubuntu@57.129.67.69 'ls -d /var/www/osc/aspnet.bak-*'`.

### Backups (already running, nothing to set up)

- `osc-db-backup.sh` — nightly `pg_dump` of `osc_db` at 02:35, 14-day retention, to
  `/var/backups/osc/` (root-only).
- `osc-deploy-backup-cleanup.sh` — prunes `aspnet.bak-*` dirs older than 14 days, 02:50 nightly.
- **Off-site copy** (added 2026-10-10): `osc-offsite-backup.sh` at 03:05 nightly
  (`/etc/cron.d/osc-offsite-backup`, log `/var/log/osc-offsite-backup.log`) encrypts each new dump
  with GPG (AES-256) and uploads it to **Cloudflare R2, bucket `osc-backups`, prefix `osc_db/`**;
  keeps 90 days off-site. Run `sudo osc-offsite-backup.sh --all` to upload every local dump.
  - R2 credentials: `/root/.config/rclone/rclone.conf` (root-only). Token scoped to that bucket.
    Ubuntu's rclone 1.60 needs `no_head = true` there (R2 rejects its post-upload versioned HEAD).
  - Encryption passphrase: `/root/.osc-backup-passphrase` (root-only) **and the password manager**
    — without it the off-site copies are unreadable if the server is lost.
  - Restore from R2 (anywhere with rclone + gpg + the passphrase):
    ```bash
    rclone copyto r2:osc-backups/osc_db/osc_db-YYYY-MM-DD.dump.gpg ./x.gpg
    gpg --decrypt -o osc_db.dump x.gpg            # prompts for the passphrase
    createdb osc_restore && pg_restore --no-owner -d osc_restore osc_db.dump
    ```
  - Verified 2026-10-10: copy downloaded from R2, decrypted byte-identical to the local dump,
    restored into a temporary database with matching row counts.

### The investor assistant (chatbot)

- Served only by the backend (`/api/v1/chatbot`), for **signed-in accounts only**. It calls Groq
  with `Groq:ApiKey` and `Groq:Model` from the Production config. Production runs
  `openai/gpt-oss-120b`, not the LLaMA model named in CLAUDE.md.
- **It must not quote figures from the model's memory.** In a 2026-10-10 production test it stated
  an outdated minimum investment capital. Its instructions now forbid stating amounts, fees, tax
  rates, penalties, processing times and deadlines; it names the responsible agency and the UIA
  One Stop Centre line (+256 414 301 000) instead.
- **`Chatbot:VerifiedFacts`** (a list of strings, empty by default) holds the only figures it may
  quote. Add a figure there **only once it has been confirmed with the agency**, as a
  config-only change (above):
  ```json
  "Chatbot": { "VerifiedFacts": [ "Minimum investment for a foreign investor licence: US$… (Investment Code Act 2019)" ] }
  ```
- **Checking it end to end** needs a signed-in account: sign up a throwaway address on the
  reserved `.invalid` domain (e.g. `smoke-123@smoke.invalid`), mark it verified with
  `UPDATE users SET "EmailVerified" = true WHERE "Email" = '…'`, sign in and chat, then delete its
  rows from `chat_enquiries`, `email_outbox` and `users`. Never leave test accounts behind.
- **Checking the Groq key from the server:** call `https://api.groq.com/openai/v1/models` with the
  key and send a `User-Agent` header, because Cloudflare (in front of Groq) returns 403 to Python's
  default one.

### Tests that need a real PostgreSQL

The suite runs on EF's in-memory database, which has no row locking. The check that concurrent
SLA workers flag each breach only once (`SlaBreachConcurrencyPostgresTests`) needs a real server
and passes trivially without one. Run it before changing the SLA monitor, against the local
Docker container (`osc-postgres`), with a `.runsettings` file that sets the variable (plain
environment variables and `dotnet test -e` did not reach the test host on Windows):

```xml
<RunSettings><RunConfiguration><EnvironmentVariables>
  <OSC_TEST_POSTGRES>Host=localhost;Username=postgres;Password=postgres</OSC_TEST_POSTGRES>
</EnvironmentVariables></RunConfiguration></RunSettings>
```
`dotnet test tests/OscApi.Tests --filter SlaBreachConcurrencyPostgresTests --settings pg.runsettings -v n`
(the run should take seconds, not "< 1 ms"; it creates and drops its own database).

### Verifying a deploy

```bash
ssh ubuntu@57.129.67.69 '
  curl -s https://api.oscdigitaltool.com/api/health
  curl -s -i -X OPTIONS https://api.oscdigitaltool.com/api/v1/auth/login \
    -H "Origin: https://oscdigitaltool.com" -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type" | grep -i access-control
'
```
Check CORS from **both** `https://oscdigitaltool.com` and `https://www.oscdigitaltool.com` — the
frontend's canonical URLs use the bare apex with no redirect to `www`, so both must work.

---

## 3. Required backend secrets (names only — values live only on the server)

Set in `/var/www/osc/aspnet/appsettings.Production.json`: `ConnectionStrings:DefaultConnection`,
`Jwt:Secret` (must match the frontend's `JWT_SECRET` exactly), `Google:ClientId`,
`Resend:ApiKey`/`FromAddress`/`AdminEmail`, `Groq:ApiKey`/`Model`, `Cors:AllowedOrigins`,
`SiteUrl`, `Cookie:Domain`, `DataProtection:KeysDirectory`, `Uploads:Directory`. Optional:
`Chatbot:VerifiedFacts` (see "The investor assistant" above). Not yet configured:
`Recaptcha:SecretKey`, `Sentry:Dsn`, `S3:SignedUrlSecret`, `Flutterwave:*`.

**`Uploads:Directory`** is set to `/var/www/osc/uploads` (absolute, live since 2026-10-10). Ticket documents are
written there directly, so they no longer depend on step 4's `ln -sfn .../uploads` symlink being
recreated on every deploy (a skipped symlink would have put new uploads inside the release
directory, where the next deploy or rollback loses them). If the systemd unit uses
`ProtectSystem`/`ReadWritePaths`, the directory must be listed in `ReadWritePaths`. Storage is
local disk: running more than one backend instance would need object storage instead.
