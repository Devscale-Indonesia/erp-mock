# Product 0001: ERP mock scope

- Status: Accepted
- Date: 2026-10-28

## Purpose

A mock ERP for demos and teaching. It shows how a small business runs sales, stock, purchasing, and staff in one app. All data is seeded and fake.

## Modules

| Module | Routes | Purpose |
| --- | --- | --- |
| Dashboard | `/` | Health of sales and stock at a glance |
| Customers | `/customers`, `/customers/:id` | Who buys from us, and what they bought |
| Products | `/products` | What we sell, and how much we have |
| Sales orders | `/sales-orders`, `/new`, `/:id` | Taking orders and moving them through their lifecycle. See [0003](0003-sales-orders.md) |
| Vendors | `/vendors` | Suppliers and their payment terms |
| Purchase orders | `/purchase-orders`, `/new`, `/:id` | Buying stock from vendors. See [0004](0004-procurement.md) |
| Employees | `/employees` | Staff directory |

## Out of scope

- Authentication and roles. The sidebar shows a fixed demo user.
- Payments, invoices, shipping, and accounting.
- Multiple warehouses. Stock is one number per product.
- Real email. The "Email" buttons open a `mailto:` link.

## Data

Seed data is deterministic and in Indonesian rupiah. Re-running the seed with `--force` gives the same records.
