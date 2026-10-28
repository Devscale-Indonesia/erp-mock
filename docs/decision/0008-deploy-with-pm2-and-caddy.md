# 0008: Deploy with PM2 and Caddy, one server per environment

- Status: Accepted
- Date: 2026-10-28

## Context

Docker was removed in [decision 0005](0005-remove-docker.md). We still need to run the app on a server, with HTTPS, for two environments: `erp.devscale.id` (production) and `erp-staging.devscale.id` (staging). The app writes to a single SQLite file, so it must run as one process.

## Decision

- Each environment runs on its own server. The server runs one PM2 process (`erp-production` or `erp-staging`) with `srvx` as the Node server.
- Caddy is the public entry point: it terminates TLS, renews certificates, and proxies to `127.0.0.1` on the app's port (3000 for production, 3001 for staging).
- Config is committed under `infra/`: a PM2 ecosystem file, one Caddyfile per domain, and `infra/deploy.sh`.
- The database file lives outside the repo at `/var/lib/erp/<env>/app.db`, so deploys never overwrite it.
- Deploy = pull, `npm ci`, build, migrate, then reload. Migrations run before the new code starts.

## Consequences

- Each server is simple to rebuild: install the tools, clone, run `deploy.sh`. See [infra/README.md](../../infra/README.md).
- SQLite allows only one writer, so PM2 runs one instance. Scaling out would need a different database; that would be a new decision.
- A reload restarts the process, so each deploy has a short downtime. Acceptable for an internal mock app; revisit if users need zero-downtime deploys.
- Database backups are not automated. Until they are, back up the file manually before risky migrations.
- Production deploys from `main`; staging deploys from `staging`. Open: decide whether production should deploy from a tag instead.
