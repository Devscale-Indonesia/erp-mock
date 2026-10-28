import { defineConfig, devices } from '@playwright/test'

// Tests run against a production build with their own database (data/e2e.db).
// Playwright starts the server with e2e/serve.sh and stops it afterwards.
const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.spec.ts',
  outputDir: 'e2e/.results',
  // Specs share one database, and later steps depend on earlier writes, so run in order.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 90_000,
  reporter: [['list'], ['html', { outputFolder: 'e2e/report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 900 },
    // Proof for the PR: every test keeps a screenshot, a video, and a trace.
    screenshot: 'on',
    video: 'on',
    trace: 'on',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: 'sh e2e/serve.sh',
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
