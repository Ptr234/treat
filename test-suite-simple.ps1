# Professional Test Suite Runner - Simplified Version
# Uganda OSC Digital Tool - Comprehensive Testing

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$reportPath = "test-results"

if (-not (Test-Path $reportPath)) {
    New-Item -ItemType Directory -Path $reportPath -Force | Out-Null
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$reportFile = Join-Path $reportPath "test-results-$timestamp.txt"

# Test results
$results = @()

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Uganda OSC - Professional Test Suite" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Cyan

# PHASE 1: BACKEND BUILD
Write-Host "[Phase 1/4] BACKEND BUILD" -ForegroundColor Cyan
Push-Location backend

$buildOutput = dotnet build 2>&1
$buildErrors = $buildOutput | Where-Object { $_ -match "error CS\d+" }

if ($buildErrors.Count -gt 0) {
    Write-Host "FAIL: $($buildErrors.Count) compilation errors`n" -ForegroundColor Red
    $results += "CRITICAL: Backend build failed - $($buildErrors.Count) errors"
} else {
    Write-Host "PASS: Backend built successfully`n" -ForegroundColor Green
    $results += "PASS: Backend build"
}

Pop-Location

# PHASE 2: FRONTEND LINT & TYPE CHECK
Write-Host "[Phase 2/4] FRONTEND QUALITY" -ForegroundColor Cyan
Push-Location frontend

$typeOutput = npm run type-check 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: TypeScript errors found`n" -ForegroundColor Red
    $results += "HIGH: TypeScript type errors"
} else {
    Write-Host "PASS: TypeScript check`n" -ForegroundColor Green
    $results += "PASS: TypeScript check"
}

$lintOutput = npm run lint 2>&1
$eslintErrors = $lintOutput | Where-Object { $_ -match "Error" } | Measure-Object | Select-Object -ExpandProperty Count
if ($eslintErrors -gt 0) {
    Write-Host "FAIL: $eslintErrors ESLint errors`n" -ForegroundColor Red
    $results += "HIGH: ESLint found $eslintErrors errors"
} else {
    Write-Host "PASS: ESLint clean`n" -ForegroundColor Green
    $results += "PASS: ESLint check"
}

# Check npm audit
$auditOutput = npm audit --json 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue
if ($auditOutput -and $auditOutput.metadata.vulnerabilities.total -gt 0) {
    $vulnCount = $auditOutput.metadata.vulnerabilities.total
    Write-Host "WARN: npm audit found $vulnCount vulnerabilities`n" -ForegroundColor Yellow
    $results += "CRITICAL: npm vulnerabilities - $vulnCount issues"
}

Pop-Location

# PHASE 3: SECURITY SCAN
Write-Host "[Phase 3/4] SECURITY SCAN" -ForegroundColor Cyan

# Check for console statements
$sourceFiles = Get-ChildItem -Path "frontend/src" -Include "*.ts", "*.tsx" -Recurse -ErrorAction SilentlyContinue
$consoleCount = 0
foreach ($file in $sourceFiles) {
    $content = Get-Content $file -ErrorAction SilentlyContinue
    $matches = $content | Select-String -Pattern 'console\.(log|warn|error)' -ErrorAction SilentlyContinue
    if ($matches.Count -gt 0) {
        $consoleCount += $matches.Count
    }
}

if ($consoleCount -gt 0) {
    Write-Host "WARN: Found $consoleCount console statements`n" -ForegroundColor Yellow
    $results += "LOW: Code quality - $consoleCount console statements"
} else {
    Write-Host "PASS: No console statements`n" -ForegroundColor Green
    $results += "PASS: Console cleanup"
}

# PHASE 4: SUMMARY
Write-Host "[Phase 4/4] SUMMARY" -ForegroundColor Cyan
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$critical = ($results | Where-Object { $_ -match "CRITICAL" }).Count
$high = ($results | Where-Object { $_ -match "HIGH" }).Count
$low = ($results | Where-Object { $_ -match "LOW" }).Count
$pass = ($results | Where-Object { $_ -match "^PASS" }).Count

Write-Host "Critical Issues:  $critical" -ForegroundColor Red
Write-Host "High Issues:      $high" -ForegroundColor Yellow
Write-Host "Low Issues:       $low" -ForegroundColor Green
Write-Host "Passing Tests:    $pass" -ForegroundColor Green
Write-Host "`nDetailed Results:`n" -ForegroundColor Cyan

foreach ($result in $results) {
    if ($result -match "CRITICAL") {
        Write-Host "  - $result" -ForegroundColor Red
    } elseif ($result -match "HIGH") {
        Write-Host "  - $result" -ForegroundColor Yellow
    } elseif ($result -match "PASS") {
        Write-Host "  - $result" -ForegroundColor Green
    } else {
        Write-Host "  - $result" -ForegroundColor Cyan
    }
}

# Save report
$results | Out-File $reportFile
Write-Host "`nReport saved: $reportFile`n" -ForegroundColor Green
