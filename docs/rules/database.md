# Database rules

- Engine: SQLite through `better-sqlite3`. The file path comes from `DATABASE_URL` and defaults to `./data/app.db`.
- Schema: `src/db/schema.ts` is the only source of truth for tables.
- Migrations are generated, never hand-written in the database:
  1. Edit `schema.ts`.
  2. `npm run db:generate -- --name short_description`.
  3. Read the generated SQL in `drizzle/`, then commit it with the schema change.
  4. `npm run db:migrate` applies pending migrations.
- Never edit an applied migration file. Add a new one.
- Foreign keys are on (`PRAGMA foreign_keys = ON`) and the journal is WAL.
- Seed data: `npm run db:seed` does nothing if customers already exist. `npm run db:seed -- --force` wipes the ERP tables and reseeds. The seed is deterministic, so the same data comes out every time.
- Reseeding must reset the `sqlite_sequence` counters so IDs restart. The seed already does this.
- Dates are text (`YYYY-MM-DD`). Money is integer rupiah. See [Decision 0004](../decision/0004-money-and-dates.md).
- Local data lives in `data/` and is git-ignored. Never commit a `.db` file.
