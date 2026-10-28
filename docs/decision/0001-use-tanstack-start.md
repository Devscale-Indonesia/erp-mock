# 0001: Use TanStack Start for the app

- Status: Accepted
- Date: 2026-10-28

## Context

We need one codebase for pages, data loading, and server-side writes. The team is React-first and wants typed routes and no separate API layer for an internal app.

## Decision

Use TanStack Start with file-based routes (`src/routes/`) and `createServerFn` for server work. Loaders call server functions directly, so there is no hand-written REST API.

## Consequences

- Server functions are typed end to end; the client gets the same types as the server.
- Route ids are generated into `routeTree.gen.ts`. Don't edit that file.
- Start is young. Track its releases and read the changelog before upgrading.
- Route pages must stay in `src/routes/` because the router requires it. See [architecture rules](../rules/architecture.md).
