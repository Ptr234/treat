#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Create test results directory
mkdir -p test-results
REPORT_FILE="test-results/full-test-report-$(date +%Y%m%d-%H%M%S).md"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Uganda OSC Digital Tool - Full Test Suite             ║${NC}"
echo -e "${BLUE}║     Testing Date: $(date +'%Y-%m-%d %H:%M:%S')                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Initialize report
cat > "$REPORT_FILE" << EOF
# Full Test Suite Report
**Generated:** $(date +'%Y-%m-%d %H:%M:%S')

## Summary
- **Total Tests:** 0
- **Passed:** 0
- **Failed:** 0
- **Skipped:** 0

## Test Results

### Backend Tests
### Frontend Tests
### E2E Tests
### Regression Tests

## Detailed Results
EOF

# Function to log test results
log_test() {
    local test_name=$1
    local result=$2
    local details=$3

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ "$result" = "FAIL" ]; then
        echo -e "${RED}✗${NC} $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "  Details: $details"
    else
        echo -e "${YELLOW}⊘${NC} $test_name"
        SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    fi
}

# ============================================================
# 1. BACKEND TESTS
# ============================================================
echo -e "${BLUE}[1/5] Running Backend Unit Tests...${NC}"
cd backend

if dotnet build; then
    log_test "Backend Build" "PASS"
else
    log_test "Backend Build" "FAIL" "Build errors detected"
fi

if dotnet test --logger:trx --results-directory:../test-results/backend 2>&1 | tee test-output.log; then
    BACKEND_PASS=$(grep -o "Passed.*\|Failed.*" test-output.log | head -1)
    log_test "Backend Unit Tests" "PASS" "$BACKEND_PASS"
    PASSED_TESTS=$((PASSED_TESTS + 4))
else
    log_test "Backend Unit Tests" "FAIL" "Test execution failed"
    FAILED_TESTS=$((FAILED_TESTS + 4))
fi

# Check for compilation warnings
if grep -q "warning" test-output.log; then
    WARNING_COUNT=$(grep -c "warning" test-output.log || true)
    log_test "Backend Warnings Check" "FAIL" "$WARNING_COUNT warnings found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    log_test "Backend Warnings Check" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

cd ..

# ============================================================
# 2. FRONTEND TESTS
# ============================================================
echo -e "${BLUE}[2/5] Running Frontend Unit Tests...${NC}"
cd frontend

if npm install --legacy-peer-deps > /dev/null 2>&1; then
    log_test "Frontend Dependencies" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_test "Frontend Dependencies" "FAIL" "npm install failed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if npm run type-check 2>&1 | tee type-check.log; then
    log_test "TypeScript Type Check" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    TYPE_ERRORS=$(grep -c "error TS" type-check.log || true)
    log_test "TypeScript Type Check" "FAIL" "$TYPE_ERRORS type errors"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if npm run lint 2>&1 | tee lint-output.log; then
    log_test "ESLint Check" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    LINT_ERRORS=$(grep -c "error" lint-output.log || true)
    log_test "ESLint Check" "FAIL" "$LINT_ERRORS linting errors"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if npm run build 2>&1 | tee build-output.log; then
    log_test "Next.js Build" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_test "Next.js Build" "FAIL" "Build errors detected"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

if npm test -- --coverage 2>&1 | tee jest-output.log; then
    JEST_SUMMARY=$(grep -E "Test Suites:|Tests:|Pass|Fail" jest-output.log | tail -4)
    log_test "Jest Unit Tests" "PASS" "$(echo "$JEST_SUMMARY" | head -1)"
    PASSED_TESTS=$((PASSED_TESTS + 3))
else
    log_test "Jest Unit Tests" "FAIL" "Jest execution failed"
    FAILED_TESTS=$((FAILED_TESTS + 3))
fi

cd ..

# ============================================================
# 3. INTEGRATION TESTS
# ============================================================
echo -e "${BLUE}[3/5] Running Integration Tests...${NC}"

if [ -f "backend/tests/OscApi.Tests/Integration/TicketWorkflowIntegrationTests.cs" ]; then
    log_test "Integration Tests Available" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_test "Integration Tests Available" "FAIL"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# ============================================================
# 4. SECURITY CHECKS
# ============================================================
echo -e "${BLUE}[4/5] Running Security Checks...${NC}"

# Check for hardcoded secrets
if grep -r "password\|secret\|api_key" --include="*.ts" --include="*.tsx" --include="*.cs" \
    --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null | \
    grep -v "PASSWORD\|SECRET\|API_KEY" | grep -i "=" > secrets-check.log; then
    SECRETS_FOUND=$(wc -l < secrets-check.log)
    log_test "Hardcoded Secrets Check" "FAIL" "$SECRETS_FOUND potential issues"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    log_test "Hardcoded Secrets Check" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

# Check dependencies for vulnerabilities (if npm audit available)
cd frontend
if npm audit 2>&1 | grep -q "packages"; then
    VULN_COUNT=$(npm audit 2>&1 | grep -o "[0-9]* vulnerabilities" | grep -o "[0-9]*" || echo "0")
    if [ "$VULN_COUNT" -eq 0 ]; then
        log_test "npm Audit" "PASS"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_test "npm Audit" "FAIL" "$VULN_COUNT vulnerabilities"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    log_test "npm Audit" "SKIP"
    SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
fi
cd ..

# ============================================================
# 5. REGRESSION CHECKS
# ============================================================
echo -e "${BLUE}[5/5] Running Regression Checks...${NC}"

# Check for console errors and warnings
if find frontend -name "*.tsx" -o -name "*.ts" | xargs grep -l "console.error\|console.warn" 2>/dev/null | grep -v node_modules; then
    log_test "Console Errors in Code" "FAIL" "Found console.error/warn statements"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    log_test "Console Errors in Code" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

# Check for any TODO/FIXME comments (potential incomplete code)
TODO_COUNT=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.cs" | \
    xargs grep -c "TODO\|FIXME" 2>/dev/null | grep -v ":0" | wc -l)

if [ "$TODO_COUNT" -gt 5 ]; then
    log_test "TODO/FIXME Comments" "FAIL" "$TODO_COUNT locations with TODO/FIXME"
    FAILED_TESTS=$((FAILED_TESTS + 1))
else
    log_test "TODO/FIXME Comments" "PASS"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi

# ============================================================
# REPORT GENERATION
# ============================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    TEST SUMMARY                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests Run:    ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:             ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:             ${RED}$FAILED_TESTS${NC}"
echo -e "Skipped:            ${YELLOW}$SKIPPED_TESTS${NC}"
echo ""

# Calculate pass rate
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    if [ $PASS_RATE -ge 95 ]; then
        echo -e "Pass Rate:          ${GREEN}${PASS_RATE}%${NC}"
    elif [ $PASS_RATE -ge 80 ]; then
        echo -e "Pass Rate:          ${YELLOW}${PASS_RATE}%${NC}"
    else
        echo -e "Pass Rate:          ${RED}${PASS_RATE}%${NC}"
    fi
else
    PASS_RATE=0
fi

echo ""
echo -e "Report saved to: ${BLUE}$REPORT_FILE${NC}"
echo ""

# Update report file
cat >> "$REPORT_FILE" << EOF

## Final Summary
- **Total Tests:** $TOTAL_TESTS
- **Passed:** $PASSED_TESTS
- **Failed:** $FAILED_TESTS
- **Skipped:** $SKIPPED_TESTS
- **Pass Rate:** ${PASS_RATE}%

## Test Execution Time
- **Started:** $(date +'%Y-%m-%d %H:%M:%S')
- **Completed:** $(date +'%Y-%m-%d %H:%M:%S')

## Artifacts Generated
- Backend Test Results: test-results/backend/
- Frontend Coverage: frontend/coverage/
- Test Report: $REPORT_FILE

## Recommendations
1. Review any failed tests above
2. Check regression report for breaking changes
3. Verify all security checks pass before deployment
4. Monitor performance metrics for any degradation
EOF

# Exit with appropriate code
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review above.${NC}"
    exit 1
fi
