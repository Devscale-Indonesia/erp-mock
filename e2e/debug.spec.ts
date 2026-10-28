import { expect, test } from '@playwright/test'
import { snap } from './helpers'

// Demo pages for showing an error tracker. Each button fails on purpose.
test.describe('error demo', () => {
  test('click handler and promise errors reach the browser without breaking the page', async ({ page }, testInfo) => {
    await page.goto('/debug/errors')
    await expect(page.getByRole('heading', { name: 'Error demo' })).toBeVisible()
    await snap(page, testInfo, '01-error-demo')

    const clickError = page.waitForEvent('pageerror')
    await page.getByRole('button', { name: 'Throw in click handler' }).click()
    expect((await clickError).message).toContain('click handler threw')

    const rejection = page.waitForEvent('pageerror')
    await page.getByRole('button', { name: 'Reject a promise' }).click()
    expect((await rejection).message).toContain('unhandled promise rejection')

    await expect(page.getByRole('heading', { name: 'Error demo' })).toBeVisible()
    await snap(page, testInfo, '02-page-still-works')
  })

  test('a failing server function shows a toast', async ({ page }, testInfo) => {
    await page.goto('/debug/errors')
    await page.getByRole('button', { name: 'Call failing server function' }).click()
    await expect(page.getByText('Sentry demo: server function failed')).toBeVisible()
    await snap(page, testInfo, '01-server-error-toast')
  })

  test('a render error replaces the page with the error screen', async ({ page }, testInfo) => {
    await page.goto('/debug/errors')
    await page.getByRole('button', { name: 'Crash the page' }).click()
    await expect(page.getByText('Something went wrong!')).toBeVisible()
    await page.getByRole('button', { name: 'Show Error' }).click()
    await expect(page.getByText('Sentry demo: component crashed while rendering')).toBeVisible()
    await snap(page, testInfo, '01-render-error')
  })

  test('a failing loader shows the error screen', async ({ page }, testInfo) => {
    await page.goto('/debug/errors')
    await page.getByRole('link', { name: 'Open a broken page' }).click()
    await expect(page.getByText('Something went wrong!')).toBeVisible()
    await page.getByRole('button', { name: 'Show Error' }).click()
    await expect(page.getByText('Sentry demo: route loader failed')).toBeVisible()
    await snap(page, testInfo, '01-broken-page')
  })
})
