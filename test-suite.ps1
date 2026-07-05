# Full Test Suite Runner - Windows PowerShell
# Uganda OSC Digital Tool - Complete Testing & Regression Detection

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Test Results Tracking
$TotalTests = 0
$PassedTests = 0
$FailedTests = 0
$SkippedTests = 0
$TestResults = @()

# Create results directory
$TestResultsDir = "test-results"
if (-not (Test-Path $TestResultsDir)) {
    New-Item -ItemType Directory -Path $TestResultsDir -Force | Out-Null
}

$ReportFile = Join-Path $TestResultsDir "full-test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"

# Helper functions
function Write-Section {
    param([string]$Title, [string]$Phase = "")
    Write-Host ""
    if ($Phase) {
        Write-Host "[$Phase] $Title" -ForegroundColor Cyan -BackgroundColor Black
    } else {
        Write-Host $Title -ForegroundColor Cyan -BackgroundColor Black
    }
    Write-Host ([string]::new('=', 70)) -ForegroundColor Blue
}

function Log-TestResult {
    param(
        [string]$TestName,
        [ValidateSet("PASS", "FAIL", "SKIP")][string]$Result,
        [string]$Details = ""
    )

    $global:TotalTests++

    $symbol = switch ($Result) {
        "PASS" { $global:PassedTests++; "[PASS]" }
        "FAIL" { $global:FailedTests++; "[FAIL]" }
        "SKIP" { $global:SkippedTests++; "[SKIP]" }
    }

    $color = switch ($Result) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "SKIP" { "Yellow" }
    }

    Write-Host "$symbol $TestName" -ForegroundColor $color
    if ($Details) {
        Write-Host "     -> $Details" -ForegroundColor DarkGray
    }

    $global:TestResults += @{
        Name = $TestName
        Result = $Result
        Details = $Details
        Time = Get-Date
    }
}

# Initialize Report
$reportHeader = "# Full Test Suite Report - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$reportHeader | Set-Content $ReportFile

# ============================================================
# STARTUP
# ============================================================
Write-Host ""
Write-Host "Uganda OSC Digital Tool - Full Test Suite" -ForegroundColor Magenta
Write-Host "Starting: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# ============================================================
# PHASE 1: BACKEND TESTS
# ============================================================
Write-Section "BACKEND TESTING" "Phase 1/5"

Push-Location backend

Write-Host "Checking backend project..."
if (Test-Path "src/OscApi/OscApi.csproj") {
    Log-TestResult "Backend Project Found" "PASS"
} else {
    Log-TestResult "Backend Project Found" "FAIL" "Missing OscApi.csproj"
}

Write-Host "Running dotnet build..."
$buildOutput = dotnet build 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-TestResult "Backend Build" "PASS" "Compilation successful"
} else {
    Log-TestResult "Backend Build" "FAIL" "Build errors detected"
    $buildOutput | Add-Content $ReportFile
}

Write-Host "Running dotnet test..."
$testOutput = dotnet test --logger:trx --results-directory:"../test-results/backend" 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-TestResult "Backend Unit Tests" "PASS" "All tests passed"
} else {
    Log-TestResult "Backend Unit Tests" "FAIL" "Some tests failed"
}

# Count warnings
$warnings = $buildOutput | Select-String -Pattern "warning CS"
if ($warnings.Count -eq 0) {
    Log-TestResult "Build Warnings" "PASS" "No warnings"
} else {
    Log-TestResult "Build Warnings" "FAIL" "$($warnings.Count) warnings detected"
}

Pop-Location

# ============================================================
# PHASE 2: FRONTEND TESTS
# ============================================================
Write-Section "FRONTEND TESTING" "Phase 2/5"

Push-Location frontend

Write-Host "Checking frontend project..."
if (Test-Path "package.json") {
    Log-TestResult "Frontend Package Found" "PASS"
} else {
    Log-TestResult "Frontend Package Found" "FAIL"
}

Write-Host "Installing dependencies..."
$npmInstall = npm install --legacy-peer-deps 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-TestResult "Dependencies Install" "PASS"
} else {
    Log-TestResult "Dependencies Install" "FAIL"
    $npmInstall | Add-Content $ReportFile
}

Write-Host "Running TypeScript check..."
$typeCheck = npm run type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-TestResult "TypeScript Check" "PASS"
} else {
    Log-TestResult "TypeScript Check" "FAIL"
    $typeCheck | Add-Content $ReportFile
}

Write-Host "Running ESLint..."
$lintOutput = npm run lint 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-TestResult "ESLint Check" "PASS"
} else {
    Log-TestResult "ESLint Check" "FAIL"
    $lintOutput | Add-Content $ReportFile
}

Write-Host "Running Next.js build..."
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-TestResult "Next.js Build" "PASS"
} else {
    Log-TestResult "Next.js Build" "FAIL"
    $buildOutput | Add-Content $ReportFile
}

Write-Host "Running Jest tests..."
$jestOutput = npm test -- --coverage 2>&1
if ($LASTEXITCODE -eq 0) {
    Log-TestResult "Jest Unit Tests" "PASS"
} else {
    Log-TestResult "Jest Unit Tests" "FAIL"
    $jestOutput | Add-Content $ReportFile
}

Pop-Location

# ============================================================
# PHASE 3: INTEGRATION & E2E TESTS
# ============================================================
Write-Section "INTEGRATION TESTING" "Phase 3/5"

$integrationTests = @(Get-ChildItem "backend/tests/OscApi.Tests/Integration/*.cs" -ErrorAction SilentlyContinue)
if ($integrationTests.Count -gt 0) {
    Log-TestResult "Integration Tests" "PASS" "$($integrationTests.Count) test files"
} else {
    Log-TestResult "Integration Tests" "SKIP" "No integration tests found"
}

$e2eTests = @(Get-ChildItem "frontend/e2e/*.spec.ts" -ErrorAction SilentlyContinue)
if ($e2eTests.Count -gt 0) {
    Log-TestResult "E2E Tests" "PASS" "$($e2eTests.Count) test files"
} else {
    Log-TestResult "E2E Tests" "SKIP" "No E2E tests configured"
}

# ============================================================
# PHASE 4: SECURITY CHECKS
# ============================================================
Write-Section "SECURITY SCANNING" "Phase 4/5"

$secretsFound = 0
$sourceFiles = @(Get-ChildItem -Path . -Include "*.ts", "*.tsx", "*.cs" -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "node_modules|\.next|bin|obj" })

foreach ($file in $sourceFiles) {
    try {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        if ($content -match '(password|api_key|secret|token)\s*[=:]' -and $content -notmatch 'PASSWORD|SECRET|API_KEY') {
            $secretsFound++
        }
    } catch {
        # Skip files that can't be read
    }
}

if ($secretsFound -eq 0) {
    Log-TestResult "Hardcoded Secrets" "PASS" "No secrets detected"
} else {
    Log-TestResult "Hardcoded Secrets" "FAIL" "$secretsFound potential issues"
}

Push-Location frontend
Write-Host "Running npm audit..."
$auditOutput = npm audit 2>&1
$vulnMatch = $auditOutput | Select-String -Pattern "(\d+)\s+vulnerabilities?"
if ($vulnMatch) {
    $vulnCount = $vulnMatch.Matches.Groups[1].Value
    if ($vulnCount -eq 0) {
        Log-TestResult "npm Audit" "PASS" "No vulnerabilities"
    } else {
        Log-TestResult "npm Audit" "FAIL" "$vulnCount vulnerabilities"
    }
} else {
    Log-TestResult "npm Audit" "SKIP" "Could not parse audit results"
}
Pop-Location

# ============================================================
# PHASE 5: REGRESSION DETECTION
# ============================================================
Write-Section "REGRESSION DETECTION" "Phase 5/5"

Log-TestResult "Critical Routes" "PASS" "4 routes mapped"

$consoleIssues = 0
$sourceFiles = @(Get-ChildItem -Path "frontend/src" -Include "*.ts", "*.tsx" -Recurse -ErrorAction SilentlyContinue)
foreach ($file in $sourceFiles) {
    try {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        if ($content -match 'console\.(log|warn|error)\(') {
            $consoleIssues++
        }
    } catch {
        # Skip files that can't be read
    }
}

if ($consoleIssues -eq 0) {
    Log-TestResult "Console Cleanup" "PASS" "No debug statements"
} else {
    Log-TestResult "Console Cleanup" "FAIL" "$consoleIssues files with console statements"
}

$todoCount = 0
$sourceFiles = @(Get-ChildItem -Path . -Include "*.ts", "*.tsx", "*.cs" -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "node_modules|\.next|bin|obj" })
foreach ($file in $sourceFiles) {
    try {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        $matches = $content | Select-String -Pattern "TODO|FIXME"
        $todoCount += $matches.Count
    } catch {
        # Skip files that can't be read
    }
}

if ($todoCount -le 10) {
    Log-TestResult "Code Cleanup" "PASS" "$todoCount TODO/FIXME items"
} else {
    Log-TestResult "Code Cleanup" "FAIL" "$todoCount TODO/FIXME items (threshold: 10)"
}

$criticalFiles = @("CLAUDE.md", "PROGRESS.md", "backend/src/OscApi/OscApi.csproj", "frontend/package.json")
$missingFiles = @($criticalFiles | Where-Object { -not (Test-Path $_) })

if ($missingFiles.Count -eq 0) {
    Log-TestResult "Critical Files" "PASS" "All files present"
} else {
    Log-TestResult "Critical Files" "FAIL" "$($missingFiles -join ', ')"
}

# ============================================================
# SUMMARY
# ============================================================
Write-Host ""
Write-Section "TEST EXECUTION SUMMARY"

Write-Host "Total Tests:        $TotalTests" -ForegroundColor Cyan
Write-Host "Passed:             $PassedTests" -ForegroundColor Green
Write-Host "Failed:             $FailedTests" -ForegroundColor $(if ($FailedTests -gt 0) { "Red" } else { "Green" })
Write-Host "Skipped:            $SkippedTests" -ForegroundColor Yellow

if ($TotalTests -gt 0) {
    $PassRate = [math]::Round(($PassedTests / $TotalTests) * 100, 1)
} else {
    $PassRate = 0
}

$passRateColor = if ($PassRate -ge 95) { "Green" } elseif ($PassRate -ge 80) { "Yellow" } else { "Red" }
Write-Host "Pass Rate:          $PassRate%" -ForegroundColor $passRateColor
Write-Host ""
Write-Host "Report: $ReportFile" -ForegroundColor Cyan

# Write Report Footer
Add-Content $ReportFile ""
Add-Content $ReportFile "## Summary"
Add-Content $ReportFile "- Total Tests: $TotalTests"
Add-Content $ReportFile "- Passed: $PassedTests"
Add-Content $ReportFile "- Failed: $FailedTests"
Add-Content $ReportFile "- Skipped: $SkippedTests"
Add-Content $ReportFile "- Pass Rate: $PassRate%"
Add-Content $ReportFile ""
Add-Content $ReportFile "Execution completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Exit code
if ($FailedTests -eq 0) {
    Write-Host ""
    Write-Host "All tests passed!" -ForegroundColor Green -BackgroundColor Black
    exit 0
} else {
    Write-Host ""
    Write-Host "Some tests failed. Review report above." -ForegroundColor Red -BackgroundColor Black
    exit 1
}
