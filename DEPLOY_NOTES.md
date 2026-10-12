# Deploying OSC Digital Tool

Both halves run on the same VPS and are deployed by hand: the **website** with one PowerShell
command (§1), the **backend** with a publish-and-swap (§2). Cloudflare sits in front of both
for DNS, TLS and edge caching.

> ⚠️ Never commit real secret values to this file or to `appsettings.json`/`appsettings.Development.json`.
> Production secrets live only on the server: `appsettings.Production.json` for the backend (§3)
> and `/etc/osc-web/env` for the website (§1). Neither is in git.

---

## 1. Frontend (website) — the VPS (manual, one command)

Moved off Cloudflare Workers on 2026-10-12 (see "Why not Cloudflare Workers" below).

| | |
|---|---|
| Service | `osc-web.service` (systemd, user `www-data`), `node server.js` on `127.0.0.1:3010`. Unit file: `frontend/deploy/osc-web.service` |
| Code | `/var/www/osc/web/` — the Next.js standalone build (`output: 'standalone'`) plus `.next/static` and `public`. `BUILD` holds the deployed commit |
| Secrets | `/etc/osc-web/env` (root-only): `JWT_SECRET` (copied from the API's `Jwt:Secret` on first install; the middleware verifies the session cookie itself, so they must match) and `SANITY_API_TOKEN` (Editor token; staff create/edit events, downloads and agencies through it) |
| nginx | `/etc/nginx/sites-available/osc-web` — `oscdigitaltool.com` and `www`, TLS by certbot (renews automatically), `/_next/static/` served from disk with a one-year cache |
| DNS | Cloudflare: `@` and `www` A records → `57.129.67.69`, proxied. SSL mode must stay Full (strict) |
| Memory | ~140 MB; the unit caps it at 768 MB (the box also runs the API, Women in Design and the ERP) |

### Deploying a website change

Commit first; the script refuses uncommitted frontend changes so the live site always matches a
commit. Then, on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File frontend\deploy\deploy-vps.ps1
```

It builds with the public settings in `frontend/deploy/build.env`, packages the standalone
server, uploads it, and runs `frontend/deploy/vps-install.sh` on the server. That script stages
the release beside the live one, swaps in Linux builds of `sharp` (image processing; the bundle
is built on Windows), restarts `osc-web`, and checks `/` and `/about/`. If the new release
doesn't answer within 60 s it puts the previous one back. The three newest releases are kept as
`/var/www/osc/web.bak-<timestamp>`. A build takes ~5 minutes; `-SkipBuild` re-sends the last one
(useful when only the upload failed).

`NEXT_PUBLIC_*` values are compiled into the browser bundle, so changing one in `build.env`
means redeploying. Server-only secrets: edit `/etc/osc-web/env`, then
`sudo systemctl restart osc-web`.

Rollback by hand:
```bash
ssh ubuntu@57.129.67.69 'sudo systemctl stop osc-web && sudo mv /var/www/osc/web /var/www/osc/web.failed &&
  sudo mv /var/www/osc/web.bak-<TS> /var/www/osc/web && sudo systemctl start osc-web'
```

### Notes

- **Security headers** for the site are set in `frontend/next.config.ts` (the API sets its own).
- **The Next.js routes the backend replaced** (`/api/auth`, `/api/tickets`, `/api/investors`,
  `/api/upload`, `/api/messages`, `/api/dashboard`, `/api/health`) return 404 whenever
  `NEXT_PUBLIC_BACKEND_URL` is set (`frontend/src/middleware.ts`). They're kept only for local
  development without a backend.
- **The `treat` Worker on Cloudflare still exists** and still builds on every push to `main`,
  but it no longer serves the domain. Disconnect its Git integration (or delete the Worker) in
  the dashboard to stop the wasted builds. Its variables (`GROQ_API_KEY`, `GOOGLE_CLIENT_SECRET`,
  the old `SANITY_API_TOKEN`) can go with it; revoke that old Sanity token at sanity.io/manage.

### Why not Cloudflare Workers

The site ran on a Cloudflare Worker (OpenNext) until 2026-10-12. The free Workers plan allows
~10 ms of CPU per request, and rendering a Next.js page takes more:
- Until 2026-10-10 every page was rendered per request and about half of all loads failed
  (error 1102 or a hang). An OpenNext static-assets cache fixed prerendered pages
  (`frontend/open-next.config.ts`, `npm run cf:build`).
- Pages rendered on demand (ticket tracking, registration and event pages, the Studio, the
  content APIs) still failed intermittently, worst under bursts of traffic.
- A Next.js 16 / Sanity 6 upgrade (2026-10-11) made every middleware route and the Studio fail
  outright, and was reverted (commit `3d19e97`). Also found: Next.js 16.4.0 writes a
  `preview-props.json` manifest that OpenNext 1.20.10 can't load.
A paid Workers plan wasn't an option. On the VPS none of these limits apply, so Next.js 16 can
be retried there; test it with the deploy script, which rolls back on failure.

`npm run cf:build` and `frontend/wrangler.jsonc` still work if the site ever goes back.

---

## 2. Backend — the VPS (manual)

### Server

| | |
|---|---|
| Host | `ubuntu@57.129.67.69` (OVH, Frankfurt) — key-only SSH, passwordless sudo |
| Shared with | This box also runs **this project's website** (`osc-web`, port 3010, §1), **Women in Design** (`wid-api`, port 3001) and the **Ngyero ERP** — it is not dedicated to this project. Be mindful of resources and don't assume you're the only thing running. |
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
