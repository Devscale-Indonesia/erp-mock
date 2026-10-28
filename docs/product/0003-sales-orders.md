# Product 0003: Sales orders

- Status: Accepted
- Date: 2026-10-28

## Lifecycle

```
confirmed ──► shipped ──► paid
    │            │          │
    └────────────┴──────────┴──► cancelled
```

- **Create**: a new order is `confirmed` immediately. Its stock is reserved at once: each line decrements the product's stock inside one transaction.
- **Duplicate lines** for the same product are merged before saving.
- **Insufficient stock** rejects the whole order. Nothing is partially saved.
- **Ship**, **pay**: status changes only. Stock does not change.
- **Cancel**: allowed from any status except `cancelled`. A cancelled order cannot change again.

## Open questions

- Cancelling a `shipped` or `paid` order does not return its stock. This is the current behaviour, and it may be wrong: the goods may have physically come back. Decide the rule before changing the code.
- A `draft` status exists in the data model, but new orders never start as draft. Either remove it or add a way to create drafts.
