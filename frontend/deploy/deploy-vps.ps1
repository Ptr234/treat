<#
Builds the website and deploys it to the VPS (osc-web.service).
Run from anywhere:  powershell -File frontend\deploy\deploy-vps.ps1
Options: -Force deploys even with uncommitted frontend changes (avoid it).
         -SkipBuild reuses the last .next build.
Needs: Node/npm, Windows OpenSSH (ssh, scp) and tar (built into Windows), and
the key ~/.ssh/id_ed25519_osc. See DEPLOY_NOTES.md section 1.
#>
param([switch]$Force, [switch]$SkipBuild)
$ErrorActionPreference = 'Stop'

$Frontend = Split-Path -Parent $PSScriptRoot
$Deploy = $PSScriptRoot
$HostName = 'ubuntu@57.129.67.69'
$Key = Join-Path $env:USERPROFILE '.ssh\id_ed25519_osc'
$Stage = Join-Path $env:TEMP 'osc-web-stage'
$Tarball = Join-Path $env:TEMP 'osc-web.tar.gz'

Push-Location $Frontend
try {
    # Deploy only what is committed, so the live site always matches a commit.
    $dirty = git status --porcelain -- . | Where-Object { $_ -notmatch '^\?\? ' }
    if ($dirty -and -not $Force) {
        throw "Uncommitted frontend changes; commit them first (or pass -Force):`n$($dirty -join "`n")"
    }
    $commit = git rev-parse --short HEAD

    if (-not $SkipBuild) {
        # Public build-time settings (NEXT_PUBLIC_* are compiled into the bundle).
        Get-Content (Join-Path $Deploy 'build.env') | Where-Object { $_ -match '^\s*[A-Z_]+=' } | ForEach-Object {
            $name, $value = $_ -split '=', 2
            Set-Item -Path "env:$($name.Trim())" -Value $value.Trim()
        }
        $env:NODE_OPTIONS = '--max-old-space-size=4096'
        if (Test-Path .next) { Remove-Item -Recurse -Force .next }
        Write-Host "== building $commit"
        npx next build
        if ($LASTEXITCODE -ne 0) { throw 'next build failed' }
    }

    # Standalone server + the static assets and public files it does not copy itself.
    Write-Host '== packaging'
    if (Test-Path $Stage) { Remove-Item -Recurse -Force $Stage }
    Copy-Item -Recurse .next\standalone $Stage
    Copy-Item -Recurse .next\static (Join-Path $Stage '.next\static')
    Copy-Item -Recurse public (Join-Path $Stage 'public')
    # Windows sharp binaries are replaced by Linux ones on the server.
    Remove-Item -Recurse -Force (Join-Path $Stage 'node_modules\@img') -ErrorAction SilentlyContinue
    $sharpVersion = (Get-Content (Join-Path $Stage 'node_modules\sharp\package.json') -Raw | ConvertFrom-Json).version
    Set-Content -Path (Join-Path $Stage 'BUILD') -Value $commit -Encoding ascii
    if (Test-Path $Tarball) { Remove-Item -Force $Tarball }
    tar -czf $Tarball -C $Stage .
    if ($LASTEXITCODE -ne 0) { throw 'tar failed' }
    Write-Host ("   {0:N0} MB, sharp {1}" -f ((Get-Item $Tarball).Length / 1MB), $sharpVersion)

    Write-Host '== uploading'
    ssh -i $Key $HostName 'rm -rf /tmp/osc-web && mkdir -p /tmp/osc-web'
    scp -q -i $Key $Tarball (Join-Path $Deploy 'osc-web.service') (Join-Path $Deploy 'nginx-osc-web.conf') "${HostName}:/tmp/osc-web/"
    if ($LASTEXITCODE -ne 0) { throw 'upload failed' }

    Write-Host '== installing on the server'
    # Strip CRLF/BOM: the script is written on Windows but runs in bash.
    Get-Content -Raw (Join-Path $Deploy 'vps-install.sh') |
        ssh -i $Key $HostName "tr -d '\r' | sed '1s/^\xEF\xBB\xBF//' | bash -s $sharpVersion"
    if ($LASTEXITCODE -ne 0) { throw 'install failed on the server (see output above)' }
    Write-Host "== deployed $commit"
}
finally {
    Pop-Location
    if (Test-Path $Stage) { Remove-Item -Recurse -Force $Stage -ErrorAction SilentlyContinue }
}
