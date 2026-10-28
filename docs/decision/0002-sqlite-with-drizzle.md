# 0002: SQLite with Drizzle ORM and better-sqlite3

- Status: Accepted
- Date: 2026-10-28

## Context

This is a mock ERP for demos and teaching. It must run with `npm install` and no database server. Data must survive restarts.

## Decision

Use SQLite as a single file, accessed with `better-sqlite3` through Drizzle ORM. Schema and migrations live in `src/db/` and `drizzle/`.

## Consequences

- No database server to run. Data is a file in `data/`.
- `better-sqlite3` is synchronous, so transactions are simple and stock updates are atomic. Never `await` inside a transaction. See [server rules](../rules/server.md).
- SQLite is single-writer. Fine for a demo; a real multi-user deployment would need a different database. That would be a new decision.
- Drizzle generates migrations from the schema; we review the SQL before committing it.
