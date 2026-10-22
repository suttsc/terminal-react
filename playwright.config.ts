import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// The owner test mints a session with AUTH_SECRET; locally it lives in .env.
if (existsSync('.env')) {
  process.loadEnvFile('.env')
}

const port = Number(process.env.PORT ?? 3100)

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm start --port ${port}`,
    url: `http://127.0.0.1:${port}/about`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
