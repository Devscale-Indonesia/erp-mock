import { expect, test } from '@playwright/test'
import { snap } from './helpers'

test('mcp page explains how to connect', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'MCP' }).click()
  await expect(page).toHaveURL(/\/mcp$/)
  await expect(page.getByRole('heading', { name: 'MCP', exact: true })).toBeVisible()
  await expect(page.getByText('1. Turn it on')).toBeVisible()
  await expect(page.getByText('claude mcp add --transport http erp http://localhost:3100/api/mcp')).toBeVisible()
  await expect(page.getByText('take_order')).toBeVisible()
  await snap(page, testInfo, '01-mcp-page')
})

test('the mcp endpoint is off without MCP_AUTH_TOKEN', async ({ request }) => {
  const response = await request.post('/api/mcp', { data: {} })
  expect(response.status()).toBe(404)
})
