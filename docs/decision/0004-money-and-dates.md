# 0004: Money as integer rupiah, dates as ISO text

- Status: Accepted
- Date: 2026-10-28

## Context

Prices and totals must add up exactly. Floats drift (`0.1 + 0.2`). IDR has no minor unit in daily use, so the smallest unit we need is one rupiah.

Dates need to sort correctly and be readable in the database.

## Decision

- Money columns are `integer` and hold whole rupiah. Format with `formatIDR`.
- Dates are `text` in `YYYY-MM-DD`. Parse them as local dates on the client (`new Date(\`${iso}T00:00:00\`)`) to avoid timezone shifts.
- The old `*Cents` names were removed; there is no cents conversion anywhere.

## Consequences

- Sums and comparisons are exact.
- Text dates sort lexically, so `ORDER BY order_date` works.
- Any future currency with minor units (for example USD) needs its own decision; the integer column would then hold cents.
