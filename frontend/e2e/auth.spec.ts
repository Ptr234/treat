import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@uia.go.ug';
const ADMIN_PASSWORD = 'Admin@2026!';

test.describe('Admin authentication (frontend ↔ backend ↔ Neon)', () => {
  test('unauthenticated dashboard redirects home with auth flag', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\?auth=required/);
  });

  test('admin logs in via the footer modal and reaches the dashboard', async ({ page }) => {
    await page.goto('/');

    // Open the admin sign-in modal from the footer.
    const adminButton = page.getByRole('button', { name: /^Admin$/ });
    await adminButton.scrollIntoViewIfNeeded();
    await adminButton.click();

    // Scope to the modal ("Admin Sign In").
    const modal = page.locator('div.fixed').filter({ hasText: 'Admin Sign In' });
    await expect(modal).toBeVisible();

    await modal.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await modal.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await modal.getByRole('button', { name: /sign in/i }).click();

    // The modal closes only after a successful login (session cookie set).
    await expect(modal).toBeHidden();

    // The session cookie must be stored in the browser for middleware auth.
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'osc-session')).toBeTruthy();

    // Now the protected dashboard loads (no redirect to home).
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /Director General Dashboard/i })).toBeVisible();
  });
});
