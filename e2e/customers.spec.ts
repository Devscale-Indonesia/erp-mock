import { expect, test } from '@playwright/test'
import { snap, stamp } from './helpers'

test('create a customer and find it in the list', async ({ page }, testInfo) => {
  const name = `E2E Customer ${stamp()}`

  await page.goto('/customers')
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible()
  await snap(page, testInfo, '01-customers-list')

  await page.getByRole('button', { name: 'New customer' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Name', { exact: true }).fill(name)
  await dialog.getByLabel('Email', { exact: true }).fill(`e2e.${stamp()}@example.com`)
  await dialog.getByLabel('City', { exact: true }).fill('Depok')
  await snap(page, testInfo, '02-new-customer-form')

  await dialog.getByRole('button', { name: 'Save customer' }).click()
  await expect(page.getByRole('link', { name })).toBeVisible()
  await snap(page, testInfo, '03-customer-created')
})
