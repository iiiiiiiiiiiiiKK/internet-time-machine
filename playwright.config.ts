import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config.
 *
 * The suite runs against a real production build served by `vite preview`,
 * which also mounts the local CDX proxy so archive-backed specs can run
 * exactly as they would against the deployed Pages Function.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testMatch: /app\.spec\.ts/,
    },
    {
      // Real iPhone viewport, DPR and UA: this is the mobile gate the brief
      // asks for. `browserName` is pinned to Chromium because that is the only
      // engine installed for this suite; the emulation itself is unchanged.
      name: 'iphone-14',
      use: { ...devices['iPhone 14'], browserName: 'chromium' },
      testMatch: /mobile\.spec\.ts/,
    },
  ],

  webServer: {
    // `--host 127.0.0.1` matters: on Windows `localhost` may resolve to ::1
    // only, which makes the readiness probe on 127.0.0.1 time out.
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    // Always start a fresh server: reusing a stale build would silently test
    // outdated code. `reuseExistingServer` stays false so CI and local runs
    // behave identically.
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})