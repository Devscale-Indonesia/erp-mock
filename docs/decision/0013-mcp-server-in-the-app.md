# 0013: MCP server inside the app

- Status: Accepted. The auth rule (off unless a token is set) is superseded by [0015](0015-mcp-open-by-default.md).
- Date: 2026-10-29

## Context

We want AI clients (Claude and others) to read and work with the ERP. The business rules live in the TanStack server functions in each module's `server.ts`, and those only run inside the web server (they need the Start request context). A separate MCP process would have to copy the rules.

## Decision

- Serve MCP over HTTP from the app itself: `src/routes/api.mcp.ts` (`/api/mcp`), using `@modelcontextprotocol/server`. The module `src/modules/mcp/` is split by role: `types.ts` (what each tool accepts, as Zod schemas), `services.ts` (plain functions that call the existing server functions, so validation, transactions and stock rules stay in one place), and `tools.ts` (registers each tool and wires the other two together).
- Tools are actions a person would take, not a copy of the API. Each is one flat `registerTool` call, written in plain code on purpose so students can read it:
  `see_business`, `find`, `open_sales_order`, `open_purchase_order`, `take_order`, `move_sales_order`, `buy_stock`, `move_purchase_order`, `add_customer`, `add_vendor`, `add_product`, `add_employee`.
  `find` returns rows with their `id`; the other tools take those ids. There is no delete and no edit: the app has none.
- `/api/mcp` is off (404) unless `MCP_AUTH_TOKEN` is set, and then needs `Authorization: Bearer <token>`. The ERP itself has no login, so this token is the only thing between the internet and write access.
- Stateless: each request is independent, no sessions.

## Consequences

- No second process or deploy. Same SQLite file, same process.
- Anyone with the token can create orders and records. Keep it per environment and out of the repo. On a server, put `MCP_AUTH_TOKEN=...` in `/var/lib/erp/<env>/secrets.env`; `infra/deploy.sh` loads that file if it exists.
- Connect Claude Code: `claude mcp add --transport http erp-staging https://erp-staging.devscale.id/api/mcp --header "Authorization: Bearer <token>"`.
- Local: `MCP_AUTH_TOKEN=dev npm run dev`, then use `http://localhost:3000/api/mcp`.
- Adding a tool means a schema in `types.ts`, a function in `services.ts`, and one `registerTool` call in `tools.ts`. A new server function is not exposed until a tool calls it.
- The `/mcp` page (`src/routes/mcp.tsx`, in the sidebar) is documentation only: how to turn the server on and connect a client. The endpoint moved from `/mcp` to `/api/mcp` so the page could have that URL.
