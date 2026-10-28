import { expect, test } from '@playwright/test'
import { snap, stamp } from './helpers'

test('create a product and see its stock', async ({ page }, testInfo) => {
  const name = `E2E Product ${stamp()}`
  const sku = `E2E-${stamp()}`.slice(0, 14)

  await page.goto('/products')
  await snap(page, testInfo, '01-products-list')

  await page.getByRole('button', { name: 'New product' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('SKU', { exact: true }).fill(sku)
  await dialog.getByLabel('Name', { exact: true }).fill(name)
  await dialog.getByLabel('Category', { exact: true }).fill('Testing')
  await dialog.getByLabel('Unit price (IDR)', { exact: true }).fill('250000')
  await dialog.getByLabel('Opening stock', { exact: true }).fill('12')
  await snap(page, testInfo, '02-new-product-form')

  await dialog.getByRole('button', { name: 'Save product' }).click()
  await expect(page.locator("table").getByText(name, { exact: true })).toBeVisible()
  await snap(page, testInfo, '03-product-created')
})
