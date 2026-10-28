# 0007: srvx as the production server

- Status: Accepted
- Date: 2026-10-28

## Context

TanStack Start builds a server handler and static client assets. The default production path goes through Nitro. At the time, Nitro's published release was a beta.

## Decision

Serve the build with `srvx` (`npm start`), pointing it at `dist/server/server.js` and `dist/client`.

## Consequences

- A stable, small server with no beta dependency.
- If Nitro becomes stable and we need its features (edge deploys, presets), revisit this decision.
