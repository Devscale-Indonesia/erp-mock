# Product 0002: Dashboard metrics

- Status: Accepted
- Date: 2026-10-28

## Rules

- **Net order value**: sum of order totals for the last six months, excluding cancelled orders. The delta compares the latest month with the month before it.
- **Average order**: net order value divided by the number of those orders. The delta compares the averages of the last two months.
- **Total orders**: count of those orders. The delta compares the last two months.
- **Paid revenue**: sum of totals for orders with status `paid`. Not a time range; all time.
- **Overall sales chart**: monthly order value (or order count, with the metric switch). "Last period" is the previous month, for comparison.
- **Conversion rate**: paid orders divided by all orders, including drafts and cancelled ones. Shown as two decimals.
- **Funnel**: "Confirmed" counts confirmed, shipped, and paid orders. "Shipped" counts shipped and paid. "Paid" counts paid. These are cumulative: a paid order is counted at every stage.
- **Stock health**: a product is in stock when its stock is above zero. "Out of stock" lists products at zero.
- **Product list**: the top sellers by units sold, excluding cancelled orders.

## Open questions

- The conversion rate and funnel count cancelled orders in the total, but the dashboard note says cancelled orders are excluded. One of the two is wrong. Decide the rule, then fix the code and the note together.
- The funnel uses the order's current status, not its history. An order that was shipped and then cancelled is not counted as shipped. A status history table would fix this.
