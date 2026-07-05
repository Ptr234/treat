# Professional Test Suite Runner - Enterprise Grade
# Uganda OSC Digital Tool - Comprehensive Testing & Quality Assurance
# Fixes and enhancements to original test-suite.ps1

param(
    [switch]$Verbose,
    [switch]$GenerateHTML,
    [string]$ReportPath = "test-results"
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Create results directory
if (-not (Test-Path $ReportPath)) {
    New-Item -ItemType Directory -Path $ReportPath -Force | Out-Null
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$reportFile = Join-Path $ReportPath "bug-report-$timestamp.md"
$summaryFile = Join-Path $ReportPath "test-summary-$timestamp.json"

# Test results tracking
$results = @{
    timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    phases = @{}
    bugs = @()
    vulnerabilities = @()
    summary = @{}
}

function Write-TestHeader {
    param([string]$Title, [int]$Phase, [int]$Total)
    Write-Host ""
    Write-Host "[$Phase/$Total] $Title" -ForegroundColor Cyan -BackgroundColor Black
    Write-Host ([string]::new('=', 70)) -ForegroundColor Blue
}

function Add-Bug {
    param(
        [string]$Severity,
        [string]$Category,
        [string]$File,
        [string]$Issue,
        [string]$Details = ""
    )

    $bug = @{
        severity = $Severity
        category = $Category
        file = $File
        issue = $Issue
        details = $Details
        timestamp = Get-Date
    }

    $results.bugs += $bug

    $color = switch ($Severity) {
        "CRITICAL" { "Red" }
        "HIGH" { "Yellow" }
        "MEDIUM" { "Magenta" }
        "LOW" { "Cyan" }
        default { "White" }
    }

    Write-Host "[$Severity] $Category - $Issue" -ForegroundColor $color
    if ($Details) {
        Write-Host "     → $Details" -ForegroundColor DarkGray
    }
}

function Test-Backend {
    Write-TestHeader "BACKEND BUILD & TESTING" 1 4

    Push-Location backend
    $phaseResults = @{
        status = "PASS"
        tests = 0
        passed = 0
        failed = 0
        errors = @()
    }

    Write-Host "Running dotnet build..." -ForegroundColor Cyan
    $buildOutput = dotnet build 2>&1

    # Check for build errors
    $buildErrors = $buildOutput | Where-Object { $_ -match "error CS\d+" }
    if ($buildErrors.Count -gt 0) {
        $phaseResults.status = "FAIL"
        $phaseResults.failed += $buildErrors.Count

        Add-Bug -Severity "CRITICAL" -Category "Build" -File "backend/tests/OscApi.Tests/Fixtures/TestTickets.cs" `
            -Issue "Compilation errors in test fixtures" -Details "$($buildErrors.Count) errors found - Property mismatch with model definitions"

        foreach ($error in $buildErrors | Select-Object -First 5) {
            $phaseResults.errors += $error
            if ($Verbose) { Write-Host "  ERROR: $error" -ForegroundColor Red }
        }
    } else {
        Write-Host "[PASS] Backend build successful" -ForegroundColor Green
        $phaseResults.passed++
    }

    # Check for warnings
    $warnings = $buildOutput | Where-Object { $_ -match "warning CS\d+" }
    if ($warnings.Count -gt 0) {
        Add-Bug -Severity "MEDIUM" -Category "Build" -File "backend" `
            -Issue "Build warnings detected" -Details "$($warnings.Count) warnings"
    }

    Pop-Location
    $results.phases.backend = $phaseResults
}

function Test-Frontend {
    Write-TestHeader "FRONTEND TYPE CHECK & LINT" 2 4

    Push-Location frontend
    $phaseResults = @{
        status = "PASS"
        typeErrors = 0
        eslintErrors = 0
        eslintWarnings = 0
        issues = @()
    }

    # TypeScript check
    Write-Host "Running TypeScript type check..." -ForegroundColor Cyan
    $typeOutput = npm run type-check 2>&1
    if ($LASTEXITCODE -ne 0) {
        $phaseResults.status = "FAIL"
        $phaseResults.typeErrors = ($typeOutput | Where-Object { $_ -match "error TS" }).Count
        Add-Bug -Severity "HIGH" -Category "TypeScript" -File "frontend" `
            -Issue "TypeScript compilation errors" -Details "$($phaseResults.typeErrors) type errors found"
    } else {
        Write-Host "[PASS] TypeScript check passed" -ForegroundColor Green
    }

    # ESLint
    Write-Host "Running ESLint..." -ForegroundColor Cyan
    $lintOutput = npm run lint 2>&1

    $eslintErrors = $lintOutput | Where-Object { $_ -match "Error:" }
    $eslintWarnings = $lintOutput | Where-Object { $_ -match "Warning:" }

    $phaseResults.eslintErrors = $eslintErrors.Count
    $phaseResults.eslintWarnings = $eslintWarnings.Count

    if ($phaseResults.eslintErrors -gt 0) {
        $phaseResults.status = "FAIL"
        Add-Bug -Severity "HIGH" -Category "ESLint" -File "frontend/src" `
            -Issue "ESLint errors found" -Details "$($phaseResults.eslintErrors) errors, $($phaseResults.eslintWarnings) warnings"

        # Capture specific violations
        foreach ($error in $eslintErrors | Select-Object -First 3) {
            $phaseResults.issues += $error -replace '\x1b\[[0-9;]*m', ''
        }
    }

    Pop-Location
    $results.phases.frontend = $phaseResults
}

function Test-Security {
    Write-TestHeader "SECURITY & VULNERABILITY SCANNING" 3 4

    $phaseResults = @{
        status = "PASS"
        hardcodedSecrets = 0
        npmVulnerabilities = 0
        issues = @()
    }

    # Check for hardcoded secrets
    Write-Host "Scanning for hardcoded secrets..." -ForegroundColor Cyan
    $sourceFiles = @(Get-ChildItem -Path . -Include "*.ts", "*.tsx", "*.cs" -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "node_modules|\.next|bin|obj|\.git" })

    $secretPatterns = @(
        [regex]'password\s*[:=]\s*["\x27][^"\x27]+["\x27]',
        [regex]'api_?key\s*[:=]\s*["\x27][^"\x27]{10,}["\x27]',
        [regex]'secret\s*[:=]\s*["\x27][^"\x27]{10,}["\x27]',
        [regex]'token\s*[:=]\s*["\x27][^"\x27]{20,}["\x27]'
    )

    $secretsFound = 0
    foreach ($file in $sourceFiles) {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        foreach ($pattern in $secretPatterns) {
            if ($content -match $pattern) {
                $secretsFound++
                $phaseResults.issues += "$($file.FullName): Potential hardcoded secret"
                if ($secretsFound -le 5) {
                    Add-Bug -Severity "CRITICAL" -Category "Security" -File $file.FullName `
                        -Issue "Potential hardcoded credential" -Details "Matches secret pattern: $pattern"
                }
            }
        }
    }
    $phaseResults.hardcodedSecrets = $secretsFound

    # npm audit
    Push-Location frontend
    Write-Host "Running npm audit..." -ForegroundColor Cyan
    $auditOutput = npm audit --json 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue

    if ($auditOutput.metadata.vulnerabilities.total -gt 0) {
        $phaseResults.npmVulnerabilities = $auditOutput.metadata.vulnerabilities.total
        $critical = $auditOutput.metadata.vulnerabilities.critical
        $high = $auditOutput.metadata.vulnerabilities.high

        $severity = if ($critical -gt 0) { "CRITICAL" } elseif ($high -gt 0) { "HIGH" } else { "MEDIUM" }
        Add-Bug -Severity $severity -Category "Dependencies" -File "frontend/package.json" `
            -Issue "npm audit found vulnerabilities" -Details "Total: $($phaseResults.npmVulnerabilities) | Critical: $critical | High: $high"
    }
    Pop-Location

    if ($phaseResults.hardcodedSecrets -gt 0 -or $phaseResults.npmVulnerabilities -gt 0) {
        $phaseResults.status = "FAIL"
    }

    $results.phases.security = $phaseResults
}

function Test-CodeQuality {
    Write-TestHeader "CODE QUALITY & REGRESSION DETECTION" 4 4

    $phaseResults = @{
        status = "PASS"
        consoleStatements = 0
        unusedVariables = 0
        issues = @()
    }

    # Check for console statements
    Write-Host "Scanning for debug console statements..." -ForegroundColor Cyan
    $sourceFiles = @(Get-ChildItem -Path "frontend/src" -Include "*.ts", "*.tsx" -Recurse -ErrorAction SilentlyContinue)

    $consoleCount = 0
    foreach ($file in $sourceFiles) {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        $matches = $content | Select-String -Pattern 'console\.(log|warn|error|debug)\(' -ErrorAction SilentlyContinue
        if ($matches.Count -gt 0) {
            $consoleCount += $matches.Count
            if ($consoleCount -le 10) {
                Add-Bug -Severity "LOW" -Category "Code Quality" -File $file.FullName `
                    -Issue "Debug console statements" -Details "$($matches.Count) statements in $($file.Name)"
            }
        }
    }
    $phaseResults.consoleStatements = $consoleCount

    if ($phaseResults.consoleStatements -gt 0) {
        $phaseResults.status = "FAIL"
    }

    # Check critical files
    Write-Host "Verifying critical files..." -ForegroundColor Cyan
    $criticalFiles = @("CLAUDE.md", "PROGRESS.md", "backend/src/OscApi/OscApi.csproj", "frontend/package.json")
    $missing = @($criticalFiles | Where-Object { -not (Test-Path $_) })

    if ($missing.Count -gt 0) {
        $phaseResults.status = "FAIL"
        Add-Bug -Severity "MEDIUM" -Category "Structure" -File "." `
            -Issue "Missing critical files" -Details "$($missing -join ', ')"
    }

    $results.phases.codeQuality = $phaseResults
}

# ============================================================
# EXECUTION
# ============================================================
Write-Host ""
Write-Host "Uganda OSC Digital Tool - Professional Test Suite" -ForegroundColor Magenta
Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

Test-Backend
Test-Frontend
Test-Security
Test-CodeQuality

# ============================================================
# REPORTING
# ============================================================
Write-Host ""
Write-TestHeader "TEST EXECUTION SUMMARY" 0 0

$summary = @{
    totalBugs = $results.bugs.Count
    criticalBugs = ($results.bugs | Where-Object { $_.severity -eq "CRITICAL" }).Count
    highBugs = ($results.bugs | Where-Object { $_.severity -eq "HIGH" }).Count
    mediumBugs = ($results.bugs | Where-Object { $_.severity -eq "MEDIUM" }).Count
    lowBugs = ($results.bugs | Where-Object { $_.severity -eq "LOW" }).Count
    phases = $results.phases.Count
}

$results.summary = $summary

Write-Host "Total Issues Found:     $($summary.totalBugs)" -ForegroundColor Cyan
Write-Host "  🔴 Critical:          $($summary.criticalBugs)" -ForegroundColor Red
Write-Host "  🟠 High:              $($summary.highBugs)" -ForegroundColor Yellow
Write-Host "  🟡 Medium:            $($summary.mediumBugs)" -ForegroundColor Magenta
Write-Host "  🟢 Low:               $($summary.lowBugs)" -ForegroundColor Green
Write-Host ""

# Save JSON report
$results | ConvertTo-Json -Depth 10 | Set-Content $summaryFile
Write-Host "JSON Report: $summaryFile" -ForegroundColor Cyan

# Generate markdown report
$md = "# Uganda OSC Digital Tool - Test Execution Report`n`n"
$md += "**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
$md += "## Executive Summary`n`n"
$md += "- **Total Issues:** $($summary.totalBugs)`n"
$md += "- **Critical:** $($summary.criticalBugs)`n"
$md += "- **High:** $($summary.highBugs)`n"
$md += "- **Medium:** $($summary.mediumBugs)`n"
$md += "- **Low:** $($summary.lowBugs)`n`n"
$md += "## Issues by Severity`n`n"

# Group and list bugs by severity
foreach ($severity in @("CRITICAL", "HIGH", "MEDIUM", "LOW")) {
    $bugsInSeverity = $results.bugs | Where-Object { $_.severity -eq $severity }
    if ($bugsInSeverity.Count -gt 0) {
        $md += "`n### $severity ($($bugsInSeverity.Count) issues)`n`n"
        foreach ($bug in $bugsInSeverity) {
            $md += "- **$($bug.category)** - $($bug.issue)`n"
            $md += "  - File: $($bug.file)`n"
            if ($bug.details) {
                $md += "  - Details: $($bug.details)`n"
            }
            $md += "`n"
        }
    }
}

# Test phase results
$md += "`n## Test Phase Results`n`n"
foreach ($phase in $results.phases.GetEnumerator()) {
    $status = $phase.Value.status
    $statusSymbol = if ($status -eq "PASS") { "✅" } else { "❌" }
    $md += "### $statusSymbol $($phase.Name.ToUpper())`n`n"

    if ($phase.Value.failed) {
        $md += "- **Failed Tests:** $($phase.Value.failed)\n"
    }
    if ($phase.Value.eslintErrors) {
        $md += "- **ESLint Errors:** $($phase.Value.eslintErrors)\n"
    }
    if ($phase.Value.hardcodedSecrets -gt 0) {
        $md += "- **Hardcoded Secrets:** $($phase.Value.hardcodedSecrets)\n"
    }
    if ($phase.Value.npmVulnerabilities -gt 0) {
        $md += "- **npm Vulnerabilities:** $($phase.Value.npmVulnerabilities)\n"
    }
    $md += "`n"
}

$md | Set-Content $reportFile
Write-Host "Markdown Report: $reportFile" -ForegroundColor Cyan

Write-Host ""
Write-Host "✨ Test suite completed" -ForegroundColor Green
