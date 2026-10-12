#!/usr/bin/env bash
# Runs on the VPS (piped over ssh by deploy-vps.ps1). Installs the website
# bundle uploaded to /tmp/osc-web/ next to the live one, then swaps it in only
# if it answers, rolling back otherwise.  Usage: vps-install.sh <sharp-version>
set -euo pipefail
SHARP_VERSION="$1"
UP=/tmp/osc-web
ROOT=/var/www/osc
LIVE=$ROOT/web
NEW=$ROOT/web.new
TS=$(date +%Y%m%d-%H%M%S)
BAK=$ROOT/web.bak-$TS

# ── One-time setup (idempotent) ──────────────────────────────────────────
if ! sudo test -f /etc/osc-web/env; then
  # The site verifies the session cookie itself, so it needs the API's JWT
  # secret. Copied server-side into a root-only file; never printed.
  sudo mkdir -p /etc/osc-web
  sudo python3 - <<'PY'
import json, os
secret = json.load(open('/var/www/osc/aspnet/appsettings.Production.json'))['Jwt']['Secret']
fd = os.open('/etc/osc-web/env', os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
os.write(fd, ('JWT_SECRET=' + secret + '\n').encode())
os.close(fd)
PY
  echo "created /etc/osc-web/env (JWT_SECRET from the API config)"
fi
tr -d '\r' < "$UP/osc-web.service" | sudo tee /etc/systemd/system/osc-web.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable osc-web >/dev/null 2>&1 || true
if ! sudo test -f /etc/nginx/sites-available/osc-web; then
  # Only installed once: certbot edits it afterwards to add HTTPS.
  tr -d '\r' < "$UP/nginx-osc-web.conf" | sudo tee /etc/nginx/sites-available/osc-web >/dev/null
  sudo ln -sfn /etc/nginx/sites-available/osc-web /etc/nginx/sites-enabled/osc-web
  sudo nginx -t
  sudo systemctl reload nginx
  echo "installed nginx site osc-web"
fi

# ── Stage ─────────────────────────────────────────────────────────────────
sudo rm -rf "$NEW"
sudo mkdir -p "$NEW"
sudo tar xzf "$UP/osc-web.tar.gz" -C "$NEW"

# The bundle is built on Windows; put Linux builds of sharp (image
# optimisation, the only native module) in place of the Windows one.
TMP=$(mktemp -d)
( cd "$TMP" && npm init -y >/dev/null && npm install --no-audit --no-fund --loglevel=error "sharp@$SHARP_VERSION" >/dev/null )
sudo rm -rf "$NEW/node_modules/sharp" "$NEW/node_modules/@img"
sudo cp -r "$TMP/node_modules/sharp" "$NEW/node_modules/sharp"
sudo cp -r "$TMP/node_modules/@img" "$NEW/node_modules/@img"
sudo cp -rn "$TMP/node_modules/." "$NEW/node_modules/" 2>/dev/null || true
rm -rf "$TMP"
# Carry over the previous release's hashed assets (never overwriting new
# ones): browser tabs opened before the deploy still request the old script
# names, and would otherwise get 404s until they reload.
# Timestamps are kept (-p) so files carried over again and again age out
# after 30 days; the new build's own files are fresh.
if sudo test -d "$LIVE/.next/static"; then
  sudo cp -rnp "$LIVE/.next/static/." "$NEW/.next/static/"
  sudo find "$NEW/.next/static" -type f -mtime +30 -delete
fi
sudo chown -R www-data:www-data "$NEW"
echo "staged $(sudo du -sh "$NEW" | cut -f1) in $NEW"

# ── Swap ──────────────────────────────────────────────────────────────────
healthy() {
  for _ in $(seq 1 30); do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' -m 5 http://127.0.0.1:3010/)" = 200 ] &&
       [ "$(curl -s -o /dev/null -w '%{http_code}' -m 5 http://127.0.0.1:3010/about/)" = 200 ]; then
      return 0
    fi
    sleep 2
  done
  return 1
}

sudo systemctl stop osc-web 2>/dev/null || true
if sudo test -d "$LIVE"; then sudo mv "$LIVE" "$BAK"; fi
sudo mv "$NEW" "$LIVE"
sudo systemctl start osc-web

if healthy; then
  echo "NEW WEBSITE RELEASE HEALTHY"
  # (an `if`, not `test && echo`: on a first install there is no copy, and a
  # false `test` as the branch's last command would trip `set -e`)
  if sudo test -d "$BAK"; then echo "rollback copy: $BAK"; fi
else
  echo "!! new website release NOT healthy"
  sudo journalctl -u osc-web -n 30 --no-pager | tail -15
  if sudo test -d "$BAK"; then
    sudo systemctl stop osc-web
    sudo mv "$LIVE" "$ROOT/web.failed-$TS"
    sudo mv "$BAK" "$LIVE"
    sudo systemctl start osc-web
    healthy && echo "ROLLED BACK - previous release healthy" || echo "!! ROLLBACK ALSO UNHEALTHY"
  fi
  exit 1
fi

# Keep the three newest rollback copies.
ls -dt "$ROOT"/web.bak-* 2>/dev/null | tail -n +4 | xargs -r sudo rm -rf
rm -rf "$UP"
echo "== services"
for s in osc-web osc-api wid-api erp-api erp-web nginx; do printf '%-9s %s\n' "$s" "$(systemctl is-active "$s")"; done
