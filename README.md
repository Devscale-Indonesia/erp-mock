# ERP Mock

A mock ERP for demos and teaching: sales, customers, products, procurement, and staff, on TanStack Start + Drizzle ORM + SQLite. All data is seeded and fake.

Shared team context (decisions, product rules, code conventions) lives in [`docs/`](docs/README.md).

## Stack

- TanStack Start (React, file-based routes, server functions)
- shadcn/ui on Tailwind CSS 4
- Drizzle ORM with `better-sqlite3` (SQLite file)
- `srvx` as the production server

## Getting started

```bash
npm install
npm run db:migrate   # creates data/app.db and applies migrations
npm run db:seed      # fills it with mock data (skipped if data exists)
npm run dev          # http://localhost:3000
```

Scripts:

- `npm run dev`: development server
- `npm run build` then `npm start`: production build served locally
- `npm run typecheck`
- `npm run db:generate -- --name short_description`: new migration after editing `src/db/schema.ts`
- `npm run db:migrate`: apply pending migrations
- `npm run db:seed -- --force`: wipe the ERP tables and reseed
- `npm run db:studio`: open Drizzle Studio

## Layout

```
src/routes/              Pages (TanStack file routes); page code is written here
src/modules/<feature>/   One business feature: components/, server.ts, types.ts
src/components/erp/      Shared app components used by several pages
src/components/layout/   App shell: sidebar, header, command menu, theme toggle, nav
src/components/ui/       shadcn/ui components (generated)
src/db/                  Drizzle schema, connection, seed
src/lib/                 Formatters, validation helpers, shared constants
docs/                    Decisions, product rules, code conventions
```

## Mock app

| Module | Routes | What it does |
| --- | --- | --- |
| Dashboard | `/` | Sales and stock health at a glance |
| Customers | `/customers`, `/customers/:id` | Add customers, view their orders |
| Products | `/products` | Catalogue with stock levels (IDR prices) |
| Sales orders | `/sales-orders`, `/sales-orders/new`, `/sales-orders/:id` | Multi-line orders; creating one decrements stock; cancelling restores it |
| Vendors | `/vendors` | Suppliers with payment terms and total spend |
| Purchase orders | `/purchase-orders`, `/purchase-orders/new`, `/purchase-orders/:id` | Buy from a vendor; receiving adds stock |
| Employees | `/employees` | Staff directory |

Seed data is deterministic: the same records every time. The rules behind each module are in [`docs/product/`](docs/product/).

Money is whole rupiah stored as integers. Dates are `YYYY-MM-DD` text.
