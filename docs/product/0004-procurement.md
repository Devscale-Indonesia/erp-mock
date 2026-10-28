# Product 0004: Procurement (vendors and purchase orders)

- Status: Accepted
- Date: 2026-10-28

## Vendors

- A vendor has a unique email, city, category, and payment terms (for example `Net 30`).
- Vendor totals show the number of purchase orders and their total spend. Cancelled orders are included in both, because the query does not filter by status. Decide whether that is intended.
- A product can have one vendor (`vendorId`). The seed assigns each product the first vendor in its category.

## Purchase orders

Lifecycle:

```
draft ──► ordered ──► received
  │          │
  └──────────┴──► cancelled
```

- **Create**: a purchase order starts as `ordered`. Only products supplied by the chosen vendor can be added.
- **Unit cost** is entered per line. The last cost entered for a product wins when the same product is repeated.
- **Receive**: adds each line's quantity to the product's stock, once, in one transaction. A received order cannot change.
- **Cancel**: allowed until the order is received. Nothing was received, so no stock changes.

## Open questions

- The server accepts any move between open statuses (for example `draft` straight to `received`, or `ordered` to `ordered`). The UI only offers valid moves, but the server does not enforce the lifecycle. Enforce it on the server before relying on it.
- Purchase orders are not linked to sales. Stock received here is not tied to any customer order.
