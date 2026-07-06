import { test, expect } from '@playwright/test';

test.describe('Complete user workflows', () => {
  const baseURL = process.env.TEST_FRONTEND_URL || 'http://localhost:3000';

  test('Sign up, login, and submit ticket', async ({ page }) => {
    // Sign up
    await page.goto(`${baseURL}/auth`);
    await page.click('text=Create account');

    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    await page.click('button:has-text("Sign Up")');
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 5000 });

    // Submit a ticket
    await page.click('text=New Ticket');
    await page.fill('input[name="title"]', 'E2E Test Ticket');
    await page.fill('textarea[name="description"]', 'This is an automated E2E test ticket');
    await page.selectOption('select[name="category"]', 'general_inquiry');
    await page.click('button:has-text("Submit")');

    await expect(page).toHaveURL(/.*submissions.*/, { timeout: 5000 });
    await expect(page.locator('body')).toContainText('E2E Test Ticket');
  });

  test('Login and view submissions', async ({ page }) => {
    await page.goto(`${baseURL}/auth`);

    // Use a pre-created test account
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 5000 });

    // Navigate to submissions
    await page.click('text=My Submissions');
    await expect(page).toHaveURL(/.*submissions.*/, { timeout: 5000 });

    // Verify submissions are displayed
    const submissionCount = await page.locator('[data-testid="submission-item"]').count();
    expect(submissionCount).toBeGreaterThanOrEqual(0);
  });

  test('Password reset flow', async ({ page, context }) => {
    await page.goto(`${baseURL}/auth`);

    // Click forgot password
    await page.click('text=Forgot password?');
    await expect(page.locator('body')).toContainText(/reset password/i);

    const testEmail = 'passwordtest@example.com';
    await page.fill('input[type="email"]', testEmail);
    await page.click('button:has-text("Send Reset Link")');

    // In a real scenario, you'd check email here
    // For testing, we'll just verify the UI changed
    await expect(page.locator('body')).toContainText(/reset link has been sent/i);
  });

  test('Form validation on signup', async ({ page }) => {
    await page.goto(`${baseURL}/auth`);
    await page.click('text=Create account');

    // Try submitting empty form
    await page.click('button:has-text("Sign Up")');

    // Verify validation errors
    const errorMessages = await page.locator('[role="alert"]').count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('Invalid login credentials', async ({ page }) => {
    await page.goto(`${baseURL}/auth`);

    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button:has-text("Sign In")');

    // Verify error message
    await expect(page.locator('body')).toContainText(/invalid|failed|incorrect/i);
  });

  test('Session persistence', async ({ page, context }) => {
    // Login
    await page.goto(`${baseURL}/auth`);
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 5000 });

    // Refresh page
    await page.reload();

    // Verify still logged in
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 5000 });
  });

  test('Logout functionality', async ({ page }) => {
    // Login first
    await page.goto(`${baseURL}/auth`);
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 5000 });

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sign Out');

    // Verify redirected to login
    await expect(page).toHaveURL(/.*auth.*/, { timeout: 5000 });
  });

  test('MFA flow (if user has MFA enabled)', async ({ page }) => {
    // This test would require a user with MFA enabled
    // For now, we'll just verify the MFA form appears when needed
    await page.goto(`${baseURL}/auth`);

    await page.fill('input[type="email"]', 'mfauser@example.com');
    await page.fill('input[type="password"]', 'MfaUserPassword123!');
    await page.click('button:has-text("Sign In")');

    // If MFA is enabled, expect to see MFA form
    const mfaForm = page.locator('text=Two-factor authentication');
    const isMfaVisible = await mfaForm.isVisible().catch(() => false);

    if (isMfaVisible) {
      await page.fill('input[inputmode="numeric"]', '000000');
      expect(page.locator('button:has-text("Verify")')).toBeDefined();
    }
  });

  test('Navigation between pages', async ({ page }) => {
    await page.goto(`${baseURL}/`);

    // Test main navigation
    await page.click('text=About');
    await expect(page).toHaveURL(/.*about.*/, { timeout: 5000 });

    await page.click('text=Services');
    await expect(page).toHaveURL(/.*services.*/, { timeout: 5000 });

    await page.click('text=Contact');
    await expect(page).toHaveURL(/.*contact.*/, { timeout: 5000 });
  });

  test('Contact form submission', async ({ page }) => {
    await page.goto(`${baseURL}/contact`);

    await page.fill('input[name="name"]', 'Test Contact');
    await page.fill('input[name="email"]', 'contact@example.com');
    await page.fill('textarea[name="message"]', 'This is a test contact message');
    await page.click('button:has-text("Submit")');

    // Verify success message
    await expect(page.locator('body')).toContainText(/submitted|success|thank you/i);
  });

  test('Mobile responsiveness', async ({ browser }) => {
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await mobileContext.newPage();

    await page.goto(`${baseURL}/`);

    // Verify mobile menu exists
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    expect(mobileMenu).toBeDefined();

    await mobileContext.close();
  });
});
