import { createMcpHandler } from '@modelcontextprotocol/server'
import { createFileRoute } from '@tanstack/react-router'
import { timingSafeEqual } from 'node:crypto'
import { createMcpServer } from '@/modules/mcp/tools'

// MCP over HTTP at /api/mcp. (The /mcp page explains how to connect.) The tools call the same server functions as the pages.
// Off unless MCP_AUTH_TOKEN is set; callers send `Authorization: Bearer <token>`.
const handler = createMcpHandler(() => createMcpServer())

function authorized(request: Request) {
  const token = process.env.MCP_AUTH_TOKEN
  if (!token) return false
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const want = Buffer.from(`Bearer ${token}`)
  return given.length === want.length && timingSafeEqual(given, want)
}

export const Route = createFileRoute('/api/mcp')({
  server: {
    handlers: {
      ANY: ({ request }) => {
        if (!process.env.MCP_AUTH_TOKEN) return new Response('MCP is not enabled', { status: 404 })
        if (!authorized(request)) return new Response('Unauthorized', { status: 401 })
        return handler.fetch(request)
      },
    },
  },
})
