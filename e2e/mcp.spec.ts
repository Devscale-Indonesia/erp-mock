import { expect, test } from '@playwright/test'
import { snap } from './helpers'

test('mcp page explains how to connect', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'MCP' }).click()
  await expect(page).toHaveURL(/\/mcp$/)
  await expect(page.getByRole('heading', { name: 'MCP', exact: true })).toBeVisible()
  await expect(page.getByText('1. Connect')).toBeVisible()
  await expect(page.getByText('claude mcp add --transport http erp http://localhost:3100/api/mcp')).toBeVisible()
  await expect(page.getByText('take_order')).toBeVisible()
  await snap(page, testInfo, '01-mcp-page')
})

test('the mcp endpoint answers without a token', async ({ request }) => {
  const response = await request.post('/api/mcp', {
    headers: { Accept: 'application/json, text/event-stream' },
    data: { jsonrpc: '2.0', id: 1, method: 'tools/list' },
  })
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('take_order')
})
