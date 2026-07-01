import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('renders the redesigned hero and key sections', async ({ page }) => {
    await page.goto('/');

    // Hero
    await expect(page.getByRole('heading', { name: /Excellence Hub/i })).toBeVisible();

    // Redesign additions
    await expect(page.getByText(/Backed by Uganda's leading government institutions/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Priority Investment Sectors/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Professional Investment Services/i })).toBeVisible();
  });

  test('primary calls-to-action are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Ask the AI Assistant/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Start Investment Journey/i }).first()).toBeVisible();
  });

  test('sector cards link into investments', async ({ page }) => {
    await page.goto('/');
    const sector = page.getByRole('link', { name: /Agriculture & Agro-Processing/i });
    await sector.scrollIntoViewIfNeeded();
    await expect(sector).toBeVisible();
  });
});
