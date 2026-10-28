import { expect, test } from '@playwright/test'
import { snap, stamp } from './helpers'

test('create a vendor', async ({ page }, testInfo) => {
  const name = `E2E Vendor ${stamp()}`

  await page.goto('/vendors')
  await snap(page, testInfo, '01-vendors-list')

  await page.getByRole('button', { name: 'New vendor' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name', { exact: true }).fill(name)
  await dialog.getByLabel('Email', { exact: true }).fill(`vendor.${stamp()}@example.com`)
  await dialog.getByLabel('City', { exact: true }).fill('Bekasi')
  await dialog.getByLabel('Category', { exact: true }).fill('Testing')
  await snap(page, testInfo, '02-new-vendor-form')

  await dialog.getByRole('button', { name: 'Save vendor' }).click()
  await expect(page.locator("table").getByText(name, { exact: true })).toBeVisible()
  await snap(page, testInfo, '03-vendor-created')
})

test('raise a purchase order and receive it into stock', async ({ page }, testInfo) => {
  await page.goto('/purchase-orders/new')
  await expect(page.getByRole('heading', { name: 'New purchase order' })).toBeVisible()

  await page.getByLabel('Vendor').click()
  await page.getByRole('option', { name: /Tekno Nusantara/ }).click()

  await page.getByLabel('Product', { exact: true }).first().click()
  await page.getByRole('option', { name: /Laptop 14/ }).click()
  await page.getByLabel('Unit cost (IDR)', { exact: true }).first().fill('9000000')
  await snap(page, testInfo, '01-purchase-order-filled')

  await page.getByRole('button', { name: 'Raise purchase order' }).click()
  await expect(page).toHaveURL(/\/purchase-orders\/\d+$/)
  await snap(page, testInfo, '02-purchase-order-ordered')

  await page.getByRole('button', { name: 'Mark received' }).click()
  await expect(page.getByText('Received: stock was added for each line.')).toBeVisible()
  await snap(page, testInfo, '03-purchase-order-received')
})
