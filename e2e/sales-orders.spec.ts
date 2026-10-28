import { expect, test } from '@playwright/test'
import { snap } from './helpers'

test('create a sales order, then cancel it', async ({ page }, testInfo) => {
  await page.goto('/sales-orders/new')
  await expect(page.getByRole('heading', { name: 'New sales order' })).toBeVisible()

  await page.getByLabel('Customer').click()
  await page.getByRole('option', { name: /Aruna Textiles/ }).click()

  await page.getByLabel('Product', { exact: true }).first().click()
  await page.getByRole('option', { name: /Webcam 1080p/ }).click()
  await page.getByLabel('Qty', { exact: true }).first().fill('2')
  await snap(page, testInfo, '01-new-order-filled')

  await page.getByRole('button', { name: 'Create order' }).click()
  await expect(page).toHaveURL(/\/sales-orders\/\d+$/)
  await expect(page.getByText('confirmed').first()).toBeVisible()
  await snap(page, testInfo, '02-order-created')

  await page.getByRole('button', { name: 'Cancel order' }).click()
  await page.getByRole('button', { name: 'Yes, cancel order' }).click()
  await expect(page.getByText('cancelled').first()).toBeVisible()
  await snap(page, testInfo, '03-order-cancelled')
})
