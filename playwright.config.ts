import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for The Strategy Stack.
 *
 * Two things worth knowing:
 *
 * 1. **Tests run against `out/`.** `webServer` builds the static export and serves it
 *    with `tests/serve.mjs`, so the walks exercise the artefact that actually ships
 *    rather than a dev server with different semantics (02-architecture).
 * 2. **The browser is pinned by path.** This environment ships Chromium 1194 while
 *    Playwright 1.62 expects 1234, so auto-resolution finds nothing. `executablePath`
 *    points at the installed build; override with `CHROMIUM_PATH` elsewhere.
 */

const CHROMIUM =
  process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const PORT = Number(process.env.PORT ?? 4321);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    launchOptions: { executablePath: CHROMIUM },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: CHROMIUM } },
    },
  ],
  webServer: {
    command: 'npm run build && node tests/serve.mjs',
    url: `http://127.0.0.1:${PORT}/recipes`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
