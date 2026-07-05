# Test Automation & CI/CD Guide
## Uganda OSC Digital Tool - Professional Testing Framework

---

## Overview

This guide documents the professional test automation setup for the Uganda OSC Digital Tool. It includes:

- ✅ Automated test suite runners
- ✅ GitHub Actions CI/CD pipeline
- ✅ Comprehensive bug reporting
- ✅ Security scanning integration
- ✅ Code quality gates

---

## Quick Start

### Running Tests Locally

#### Simple Test Suite (Recommended)
```bash
# Navigate to project root
cd d:\treat

# Run simplified professional test suite
.\test-suite-simple.ps1

# View results
cat test-results\test-results-*.txt
```

#### Advanced Professional Test Suite
```bash
# (Currently has formatting issues - use simple version)
.\test-suite-professional.ps1 -Verbose
```

### Test Individual Components

**Backend:**
```bash
cd backend
dotnet build
dotnet test
```

**Frontend:**
```bash
cd frontend
npm run type-check    # TypeScript check
npm run lint          # ESLint
npm run build         # Build verification
npm test              # Unit tests
npm run test:coverage # With coverage report
npm run test:e2e      # End-to-end tests
```

---

## Test Artifacts

### Generated Files

After running tests, you'll find these artifacts in `test-results/`:

```
test-results/
├── test-results-20260705-170702.txt      # Main test report
├── full-test-report-20260705-*.md         # Detailed findings
├── test-summary-20260705-*.json           # Structured data
├── backend-test-results/                  # .NET test results
├── npm-audit.json                         # npm vulnerability report
└── test-output.log                        # Full execution log
```

### Viewing Reports

```bash
# Text report
type test-results\test-results-*.txt

# JSON report
Select-String -Path test-results\test-summary-*.json

# HTML conversion (optional)
npm install -g markdown-to-html
md-to-html full-test-report-*.md
```

---

## Current Test Status (2026-07-05)

### Summary
```
Critical Issues:  2
High Issues:      2
Low Issues:       1

Blocking Issues: YES
Status: NOT READY FOR MERGE
```

### Issues Found

**Critical (Must Fix):**
1. ❌ Backend build failed - 118 compilation errors in TestTickets.cs
2. ❌ npm has 42 security vulnerabilities

**High (Should Fix):**
1. TypeScript type errors detected
2. ESLint violations (8 errors)

**Low (Nice to Fix):**
1. Console statements in source (71 instances)

---

## Fixing Issues - Action Plan

### Immediate Actions (Today - 2-3 hours)

#### 1. Fix Backend Build (Highest Priority)

**Problem:** `TestTickets.cs` fixture has property mismatches

**Location:** `backend/tests/OscApi.Tests/Fixtures/TestTickets.cs`

**Steps:**
```bash
# 1. Review current model structure
code backend/src/OscApi/Models/Ticket.cs
code backend/src/OscApi/Models/TicketDocument.cs

# 2. Open fixture and update properties
code backend/tests/OscApi.Tests/Fixtures/TestTickets.cs

# 3. Fix property names to match models
# Example: Change 'Reference' to 'TicketId' if that's the model property

# 4. Verify build
cd backend
dotnet build

# 5. Commit fix
git add .
git commit -m "fix: update test fixture schema to match model definitions"
```

#### 2. Fix npm Vulnerabilities

```bash
cd frontend

# 1. Check vulnerability details
npm audit

# 2. Try automatic fix
npm audit fix

# 3. If fixes are needed, test thoroughly
npm run build
npm run test

# 4. Commit dependency updates
git add package-lock.json
git commit -m "fix: resolve 42 npm security vulnerabilities"
```

#### 3. Fix ESLint Issues

```bash
cd frontend

# 1. Review specific violations
npm run lint

# 2. Auto-fix what can be fixed
npx eslint --fix

# 3. Manually fix remaining issues
npm run lint

# 4. Commit changes
git add .
git commit -m "fix: resolve ESLint violations"
```

---

## CI/CD Pipeline Configuration

### GitHub Actions Setup

The comprehensive test suite is configured in `.github/workflows/comprehensive-test.yml`

**Workflow Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`
- Nightly schedule (2 AM UTC)

**Jobs Run:**
1. Backend build & compile
2. Frontend build & quality
3. Security & vulnerability scanning
4. E2E tests
5. Code quality report
6. Docker validation
7. Full stack integration test
8. Dependency audit
9. Test results publication
10. Branch protection checks

### Viewing CI/CD Results

```bash
# Check GitHub Actions
# 1. Navigate to: https://github.com/your-org/treat/actions
# 2. Click on the workflow run
# 3. View job logs and artifacts

# OR check locally via GitHub CLI
gh run view --log
```

---

## Test Coverage Goals

### Current Status
```
Frontend Unit Tests:     ~20 tests (TARGET: 50+)
Frontend Components:     ~5 tests  (TARGET: 30+)
Frontend E2E:           3 scenarios (TARGET: 15+)
Backend Integration:    ~20 tests  (TARGET: 40+)
RBAC/Security:          ~10 tests  (TARGET: 25+)
Overall Coverage:       ~60%       (TARGET: >80%)
```

### Improving Coverage

```bash
# Run with coverage report
cd frontend
npm run test:coverage

# View coverage report
open coverage/index.html

# Backend coverage
cd backend
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

---

## Security Scanning

### npm Audit

```bash
cd frontend

# Check for vulnerabilities
npm audit

# View in JSON format
npm audit --json > npm-audit.json

# Fix known vulnerabilities
npm audit fix --legacy-peer-deps

# Force upgrades (use with caution)
npm audit fix --force
```

### Secret Detection

Secrets scanning runs automatically in GitHub Actions using:
- TruffleHog (credential detection)
- Semgrep (SAST rules)
- Custom patterns

**Pre-commit Prevention:**

```bash
# Install git-secrets (macOS/Linux)
brew install git-secrets
git secrets --install
git secrets --register-aws

# Or use npm package
npm install -D detect-secrets
```

---

## Best Practices

### Pre-Commit Workflow

```bash
# 1. Make your changes
# 2. Run local tests
npm run lint
npm run type-check
npm test

# 3. Fix any issues
npm run lint -- --fix

# 4. Commit changes
git add .
git commit -m "feat: descriptive commit message"

# 5. Push and create PR
git push origin your-branch
# Create PR via GitHub
```

### Code Review Checklist

Before merging, ensure:
- ✅ All tests pass locally
- ✅ No lint errors or warnings
- ✅ TypeScript type checks pass
- ✅ No console.log statements
- ✅ No hardcoded secrets
- ✅ Security vulnerabilities addressed
- ✅ Test coverage maintained/improved

### Deployment Pipeline

```
Develop Branch
    ↓
[Automated Tests]
    ↓
    ✅ PASS → Main Branch
    ❌ FAIL → Review & Fix
    ↓
[Release Tests]
    ↓
    ✅ PASS → Production
    ❌ FAIL → Investigate & Patch
```

---

## Troubleshooting

### Build Fails with "error CS0117"

**Problem:** Property doesn't exist on model

**Solution:**
```bash
# 1. Check model definition
grep -n "public.*{" backend/src/OscApi/Models/Ticket.cs

# 2. Update test fixture to match
# 3. Rebuild
dotnet build
```

### ESLint Won't Run

**Problem:** Next.js ESLint configuration deprecated

**Solution:**
```bash
cd frontend

# Migrate to ESLint CLI
npx @next/codemod@canary next-lint-to-eslint-cli .

# Update package.json lint script to:
# "lint": "eslint ."

npm run lint
```

### npm Vulnerabilities Not Fixing

**Problem:** Dependencies have breaking changes

**Solution:**
```bash
cd frontend

# 1. Check specific vulnerability
npm audit --json | jq '.vulnerabilities'

# 2. Review package changelogs
# 3. Update manually
npm install package-name@latest

# 4. Test thoroughly
npm run build
npm run test

# 5. If breaking: check PR or file issue
```

### Tests Timeout

**Problem:** Tests taking too long

**Solutions:**
```bash
# Increase timeout for specific test
jest.setTimeout(30000);

# Or skip slow tests in CI
npm test -- --testNamePattern="^((?!slow).)*$"

# Or run in parallel
npm test -- --maxWorkers=4
```

---

## Environment Configuration

### Local Development

Create `.env.local` for frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development
```

Create `appsettings.Development.json` for backend:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=osc_dev;User Id=sa;Password=YourPassword;"
  }
}
```

### Testing Environment

```env
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
DATABASE_URL=postgresql://user:pass@localhost/osc_test
NODE_ENV=test
```

---

## Continuous Improvement

### Metrics to Track

- **Build Time:** Target < 10 minutes (all jobs)
- **Test Execution:** Target < 5 minutes (frontend + backend)
- **Security Issues:** Target 0 critical/high
- **Code Coverage:** Target > 80%
- **Lint Violations:** Target 0 errors, < 5 warnings

### Regular Reviews

- **Weekly:** Check metrics dashboard
- **Monthly:** Review test coverage gaps
- **Quarterly:** Security audit and dependency update

### Optimization Opportunities

```bash
# Cache npm dependencies in CI
npm ci --prefer-offline --no-audit

# Parallel test execution
npm test -- --maxWorkers=4

# Run only changed tests
npm test -- --onlyChanged

# Skip non-critical tests in PR
npm test -- --testPathIgnorePatterns=e2e
```

---

## Support & Documentation

### Files in This Project

| File | Purpose |
|------|---------|
| `test-suite-simple.ps1` | Main test runner (Windows) |
| `test-suite-professional.ps1` | Advanced test runner with reporting |
| `.github/workflows/comprehensive-test.yml` | GitHub Actions CI/CD |
| `BUG_REPORT.md` | Current test findings |
| `TEST_AUTOMATION_GUIDE.md` | This document |

### External Resources

- [Jest Testing Docs](https://jestjs.io/docs/getting-started)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [npm Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [.NET Testing](https://learn.microsoft.com/en-us/dotnet/core/testing/)

---

## Next Steps

1. ✅ Review BUG_REPORT.md for current issues
2. ✅ Fix critical backend build errors
3. ✅ Address npm vulnerabilities
4. ✅ Set up GitHub Actions secrets (if using CI)
5. ✅ Run `./test-suite-simple.ps1` regularly
6. ✅ Integrate tests into development workflow
7. ✅ Expand test coverage toward 80% target

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-05  
**Status:** Active
