# 0015: MCP is open by default

- Status: Accepted
- Date: 2026-10-29

## Context

[Decision 0013](0013-mcp-server-in-the-app.md) made `/api/mcp` return 404 unless `MCP_AUTH_TOKEN` was set, and then required a bearer token. For a teaching app that is one more step for students, and the rest of the ERP has no login either ([product 0001](../product/0001-erp-mock-scope.md)).

## Decision

- `/api/mcp` works with no token. Clients connect with just the URL.
- Setting `MCP_AUTH_TOKEN` still locks it: requests then need `Authorization: Bearer <token>`. No other code changes.
- The `/mcp` page shows the no-token connect command and a warning, plus how to lock it.

## Consequences

- Anyone who can reach the app can read and write through MCP (create orders, change statuses, add records). That matches what anyone can already do in the UI, but an AI client makes it faster.
- Only run it open on a private network (our tailnet). For anything public, set `MCP_AUTH_TOKEN`.
- Default flips from closed to open: a server that forgets the token is open, not off.
