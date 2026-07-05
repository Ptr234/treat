# Comprehensive Test Suite Guide

## Overview

The Uganda OSC Digital Tool now has a professional, comprehensive test suite covering:
- **Frontend**: Unit tests, component tests, E2E tests, accessibility tests
- **Backend**: Integration tests, API endpoint tests, RBAC/Security tests
- **Coverage**: Auth flows, form validation, error handling, security, accessibility

---

## Frontend Tests

### Unit Tests (src/lib/__tests__/)

#### 1. api-client.test.ts
Tests the API client routing and response handling:
- URL resolution based on backend configuration
- Routing migrated endpoints to backend
- Non-migrated routes stay on same origin
- Error response normalization

**Run:**
```bash
npm test -- api-client.test.ts
```

#### 2. validations.test.ts
Tests form validation utilities:
- Email validation
- Password strength validation
- Required field validation
- Custom validation rules

**Run:**
```bash
npm test -- validations.test.ts
```

#### 3. error-handling.test.ts
**NEW** - Tests error scenarios:
- Network timeouts and failures
- HTTP error codes (400, 401, 403, 404, 409, 500, 503)
- Malformed responses
- Retry logic
- Timeout handling

**Run:**
```bash
npm test -- error-handling.test.ts
```

#### 4. accessibility.test.ts
**NEW** - Tests WCAG 2.1 AA compliance:
- Semantic HTML usage
- Form label associations
- Heading hierarchy
- Keyboard navigation
- ARIA attributes
- Color contrast (manual verification needed)
- Screen reader compatibility

**Run:**
```bash
npm test -- accessibility.test.ts
```

### Component Tests (src/components/**/__tests__/)

#### 1. LoginForm.test.tsx
**ENHANCED** - Tests the login form with multiple scenarios:

**Basic Login Flow:**
- Email/password input rendering
- Form submission
- Success callback
- Error message display
- Loading state
- Error clearing on input change

**MFA Flow:**
- MFA form display when required
- 6-digit code input (numeric only)
- Submit button state (disabled when incomplete)
- Return to login from MFA
- MFA code submission

**Password Reset:**
- Password reset form display
- Email-based reset request
- Success message after request
- Password validation (min 8 chars)
- Token and password verification
- Return to login from reset

**Run:**
```bash
npm test -- LoginForm.test.tsx
```

#### 2. RegisterForm.test.tsx
**NEW** - Tests user registration:

**Form Rendering:**
- All required fields present
- Sign up button visible

**Validation:**
- Weak password rejection
- Non-matching password rejection
- Invalid email format rejection
- Required field validation

**Successful Registration:**
- Valid data submission
- Success callback
- Loading state during submission

**Error Handling:**
- Duplicate email error
- Generic error messages
- Error clearing on form change

**Password Strength:**
- Weak indicator
- Strong indicator

**Terms & Conditions:**
- Requires acceptance
- Enables submit when accepted

**Run:**
```bash
npm test -- RegisterForm.test.tsx
```

#### 3. UserAuthForm.test.tsx
Already exists - Tests combined auth form behavior

### End-to-End Tests (e2e/)

#### 1. home.spec.ts
Tests home page functionality

#### 2. auth.spec.ts
Tests authentication flows

#### 3. user-workflow.spec.ts
**NEW** - Tests complete user workflows:

- **Sign up flow**: Register, verify email, redirect to dashboard
- **Login flow**: Login, session verification, navigation
- **Password reset**: Request reset, token verification, new password
- **Form validation**: Empty form rejection, field validation
- **Invalid credentials**: Error messages on wrong password
- **Session persistence**: Cookie-based session across page reloads
- **Logout**: Clear session, redirect to login
- **MFA flow**: If enabled, verify MFA prompt and submission
- **Navigation**: Main menu navigation works correctly
- **Contact form**: Submission and success message
- **Mobile responsiveness**: Mobile menu and viewport handling

**Run:**
```bash
npm run test:e2e
```

---

## Backend Tests

### Integration Tests (backend/tests/OscApi.Tests/Integration/)

#### 1. AuthMeIntegrationTests.cs
Tests authentication and profile endpoints:
- Signup sets session and /me returns submissions
- Weak password rejection
- Duplicate email conflict
- Unauthenticated /me returns 401
- Admin login grants dashboard access
- Admin login with wrong password returns 401
- Dashboard requires authentication
- Draft save/get round-trip
- Ticket submission appears in user submissions

**Run:**
```bash
cd backend
dotnet test OscApi.Tests --filter "AuthMeIntegrationTests"
```

#### 2. ApiEndpointTests.cs
**NEW** - Tests all API endpoints:

**Health & Errors:**
- Health check returns 200
- Invalid route returns 404

**Ticket Endpoints:**
- Get tickets requires auth (401)
- Create ticket without auth succeeds
- Invalid category rejected
- Missing required fields rejected

**Auth Endpoints:**
- Invalid credentials return 401
- Valid signup returns 200
- Invalid email rejected
- Weak password rejected

**Profile Endpoints:**
- Unauthenticated /me returns 401
- Update profile with valid data returns 200
- Delete account removes user
- Logout clears session

**Pagination:**
- Valid params return 200
- Invalid page size rejected

**Concurrency & Size:**
- Concurrent requests succeed
- Large payloads rejected

**Run:**
```bash
dotnet test OscApi.Tests --filter "ApiEndpointTests"
```

#### 3. RbacSecurityTests.cs
**NEW** - Tests role-based access control and security:

**RBAC:**
- Regular user cannot access admin endpoints
- Admin can access dashboard
- Users cannot view other users' data
- Users cannot modify other user profiles
- Ticket access control enforced

**Security:**
- Session tampering rejected
- SQL injection attempts safely handled
- XSS attempts stripped/escaped
- CSRF token validation
- Password hashing (not plaintext)
- Rate limiting on excessive requests
- Large string rejection
- Admin can delete user accounts
- Environment variables not exposed

**Run:**
```bash
dotnet test OscApi.Tests --filter "RbacSecurityTests"
```

#### 4. MfaIntegrationTests.cs
Tests two-factor authentication:
- MFA setup and verification
- MFA enforcement
- MFA bypass with correct code

#### 5. TicketWorkflowIntegrationTests.cs
Tests ticket submission workflow

#### 6. UploadIntegrationTests.cs
Tests file upload functionality

#### 7. RbacIntegrationTests.cs
Tests role-based access control details

---

## Running All Tests

### Frontend

**All tests:**
```bash
cd frontend
npm test
```

**Coverage report:**
```bash
npm run test:coverage
```

**Watch mode (re-runs on file changes):**
```bash
npm test -- --watch
```

**Specific test file:**
```bash
npm test -- LoginForm.test.tsx
```

**E2E tests:**
```bash
npm run test:e2e
```

### Backend

**All tests:**
```bash
cd backend
dotnet test
```

**Specific test class:**
```bash
dotnet test --filter "ClassName"
```

**Verbose output:**
```bash
dotnet test --verbosity=detailed
```

**With coverage (requires coverlet):**
```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

### Docker

**Complete test suite:**
```bash
docker-compose -f docker-compose.test.yml up --build
```

---

## Test Coverage Goals

| Area | Current | Target |
|------|---------|--------|
| Frontend Unit Tests | ~20 tests | 50+ tests |
| Frontend Components | ~5 tests | 30+ tests |
| Frontend E2E | 3 scenarios | 15+ scenarios |
| Backend Integration | ~20 tests | 40+ tests |
| RBAC/Security | ~10 tests | 25+ tests |
| **Overall Coverage** | **~60%** | **>80%** |

---

## Common Issues & Solutions

### jest-axe not installed
```bash
npm install jest-axe --save-dev
```

### Tests timing out
- Increase Jest timeout: `jest.setTimeout(10000)`
- Check async/await syntax

### Mock modules not working
- Ensure `jest.mock()` is at top of file
- Mock must come before import

### E2E tests fail with timeout
- Ensure test server is running: `npm run dev`
- Check that FRONTEND_URL matches actual server
- Increase timeout: `test.setTimeout(30000)`

### Backend tests fail with database issues
- Ensure test database is created
- Check ApiFactory database setup
- Verify connection string in test config

---

## Continuous Integration

Tests should run automatically on:
- **Pull requests**: All tests must pass before merge
- **Main branch**: Full test suite runs after merge
- **Nightly**: Extended test suite with stress tests

Configure in `.github/workflows/test.yml`:
```yaml
- name: Run Frontend Tests
  run: cd frontend && npm ci && npm test -- --coverage
  
- name: Run Backend Tests
  run: cd backend && dotnet test
```

---

## Best Practices

1. **Write tests as you code** - Don't leave testing for later
2. **Test behavior, not implementation** - Test what users see/do
3. **Keep tests focused** - One concept per test
4. **Use descriptive names** - `it('should reject weak passwords')`
5. **Avoid hardcoding** - Use fixtures and factories
6. **Test error cases** - Don't just test the happy path
7. **Maintain tests** - Update when requirements change
8. **Mock external APIs** - Don't test third-party services

---

## Next Steps

1. **Run the test suite**: `npm test` (frontend) and `dotnet test` (backend)
2. **Review coverage**: Identify untested areas
3. **Add more tests**: Prioritize critical paths
4. **Integrate with CI/CD**: Automate on every commit
5. **Monitor results**: Track coverage trends

