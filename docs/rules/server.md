# Server rules

Server code is TanStack server functions (`createServerFn`) in each module's `server.ts`.

## Shape of a server function

```ts
export const createCustomer = createServerFn({ method: 'POST' })
  .validator((data: CustomerInput) => data)
  .handler(async ({ data }) => {
    // validate, then write
  })
```

1. Every input goes through `.validator`. The type annotation there is not validation: check values with the helpers in `src/lib/validation.ts` (`requireText`, `requireInt`).
2. Wrap inserts that can hit a unique index in `withUniqueCheck`, so the user sees "A record with this email already exists" and not a SQLite error.
3. Use `GET` for reads and `POST` for writes. A `GET` with input sends it in the `payload` query string, so keep those inputs small.
4. Throw `Error` with a message a user can read. The message is shown in the UI as-is.

## Database work

1. `better-sqlite3` is synchronous. Use `db.transaction((tx) => ...)` with the synchronous `tx` API. Never `await` inside a transaction.
2. Anything that changes more than one row (creating an order and its lines, changing stock) runs in one transaction. A half-written order is worse than a failed request.
3. Check the state before you change it. Example: an order that is `cancelled` cannot change, and a `received` purchase order cannot change.
4. Aggregates come back as strings or `null`. Convert them: `Number(row.total ?? 0)`.
5. Order and purchase numbers are derived from the row id (`SO-0001`, `PO-0001`). Insert with a placeholder, then update the number inside the same transaction.

## Money and dates

- Money is whole rupiah in integer columns. Never store floats for money.
- Dates are `YYYY-MM-DD` text. Parse them as local dates on the client.

See [Database rules](database.md) and [Decision 0004](../decision/0004-money-and-dates.md).
