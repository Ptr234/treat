import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. Drives the already-running local server (frontend :3000 →
 * backend :5082 → Neon). Service workers are blocked so tests always hit the
 * live server rather than the PWA cache.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    serviceWorkers: 'block',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
