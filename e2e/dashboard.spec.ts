import { expect, test } from '@playwright/test'
import { snap } from './helpers'

test('dashboard shows sales and stock at a glance', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('Net order value')).toBeVisible()
  await expect(page.getByText('Overall sales')).toBeVisible()
  await expect(page.getByText('Product list')).toBeVisible()
  await snap(page, testInfo, '01-dashboard')
})
