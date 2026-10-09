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

`GOOGLE_CLIENT_SECRET` and `GROQ_API_KEY` exist here too but are **unused**: the routes that read
them (`/api/chatbot`, old email-sending routes) are bypassed once `NEXT_PUBLIC_BACKEND_URL` is
set, since the browser calls the real backend directly instead.

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

```bash
# 1. Publish self-contained from wherever you have the .NET 8 SDK (not the VPS)
cd backend/src/OscApi
dotnet publish OscApi.csproj -r linux-x64 --self-contained true -c Release -o /tmp/osc-publish

# 2. Package and upload
cd /tmp/osc-publish && tar czf ../osc-publish.tar.gz . && cd ..
scp osc-publish.tar.gz ubuntu@57.129.67.69:/tmp/osc-publish.tar.gz

# 3. Stage it on the VPS (safe — doesn't touch the live service yet)
ssh ubuntu@57.129.67.69 '
  set -e
  sudo rm -rf /var/www/osc/aspnet.new && sudo mkdir -p /var/www/osc/aspnet.new
  sudo tar xzf /tmp/osc-publish.tar.gz -C /var/www/osc/aspnet.new
  sudo chmod +x /var/www/osc/aspnet.new/OscApi
  rm -f /tmp/osc-publish.tar.gz
  sudo cp /var/www/osc/aspnet/appsettings.Production.json /var/www/osc/aspnet.new/appsettings.Production.json
  sudo chown -R www-data:www-data /var/www/osc/aspnet.new
  sudo chmod 640 /var/www/osc/aspnet.new/appsettings.Production.json
'

# 4. Swap and restart (the actual cutover — do this deliberately, not as a background step)
ssh ubuntu@57.129.67.69 '
  set -e
  TS=$(date +%Y%m%d-%H%M%S)
  sudo systemctl stop osc-api
  sudo mv /var/www/osc/aspnet /var/www/osc/aspnet.bak-$TS
  sudo mv /var/www/osc/aspnet.new /var/www/osc/aspnet
  sudo ln -sfn /var/www/osc/uploads /var/www/osc/aspnet/uploads
  sudo chown -R www-data:www-data /var/www/osc/aspnet
  sudo systemctl start osc-api
  sleep 5
  systemctl is-active osc-api
  curl -s http://127.0.0.1:3003/api/health; echo
  sudo journalctl -u osc-api -n 20 --no-pager | grep -iE "error|exception" || echo "clean"
'
```

If `EF Core` migrations are pending, they run automatically on startup
(`RunMigrationsOnStartup: true` in the config) — no separate migration step.

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
`SiteUrl`, `Cookie:Domain`, `DataProtection:KeysDirectory`, `Uploads:Directory`. Optional/not yet configured:
`Recaptcha:SecretKey`, `Sentry:Dsn`, `S3:SignedUrlSecret`, `Flutterwave:*`.

**`Uploads:Directory`** — set it to `/var/www/osc/uploads` (absolute). Ticket documents are then
written there directly, so they no longer depend on step 4's `ln -sfn .../uploads` symlink being
recreated on every deploy (a skipped symlink would have put new uploads inside the release
directory, where the next deploy or rollback loses them). If the systemd unit uses
`ProtectSystem`/`ReadWritePaths`, the directory must be listed in `ReadWritePaths`. Storage is
local disk: running more than one backend instance would need object storage instead.
