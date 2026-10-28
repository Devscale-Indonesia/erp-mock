import type { Page, TestInfo } from '@playwright/test'

// Attaches a full-page screenshot to the test report, one per meaningful step.
// These show up in the HTML report next to the video and trace.
export async function snap(page: Page, testInfo: TestInfo, name: string) {
  const body = await page.screenshot({ fullPage: true })
  await testInfo.attach(name, { body, contentType: 'image/png' })
}

// Unique suffix so records created by repeated runs don't clash on unique emails/SKUs.
export const stamp = () => `${Date.now()}`
