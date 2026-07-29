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
    // Overridable so the suite can also run from inside a container, where the
    // app is reached by service name (http://frontend:3000) rather than localhost.
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    serviceWorkers: 'block',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
