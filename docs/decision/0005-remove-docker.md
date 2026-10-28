# 0005: Remove Docker packaging for now

- Status: Accepted
- Date: 2026-10-28

## Context

We had a `Dockerfile` and `docker-compose.yml` that ran migrations and seeded data on start, with the database in a named volume. Nobody on the team uses the container yet, and the deployment target is not decided.

## Decision

Remove the Docker files. Run the app with `npm install`, `npm run db:migrate`, and `npm run dev` (or `npm run build` then `npm start`).

## Consequences

- One less thing to maintain while the app is still changing quickly.
- Local data is `data/app.db` on the developer's machine.
- When a deployment target is chosen, a new decision will decide how to package and migrate the app. The old Dockerfile is in git history if needed.
