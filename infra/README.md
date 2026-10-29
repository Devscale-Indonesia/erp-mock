# Infra

How the app runs on the servers. One server per environment:

| Environment | Domain | Server process | Port | Database file |
| --- | --- | --- | --- | --- |
| production | `erp.devscale.id` | PM2 app `erp-production` | 3000 | `/var/lib/erp/production/app.db` |
| staging | `erp-staging.devscale.id` | PM2 app `erp-staging` | 3001 | `/var/lib/erp/staging/app.db` |

Caddy terminates TLS on port 443 and proxies to the PM2 process on localhost. See [decision 0008](../docs/decision/0008-deploy-with-pm2-and-caddy.md).

```
infra/
  pm2/ecosystem.config.cjs   PM2 process definitions for both environments
  caddy/erp.Caddyfile        production site
  caddy/erp-staging.Caddyfile staging site
  deploy.sh                  pull, install, build, migrate, reload
```

## One-time server setup

Do this once on each server. The steps are the same; only the environment name changes.

1. Install Node 22.12 or newer, `pm2` (`npm i -g pm2`), and Caddy.
2. DNS: point the domain's A record at the server (`erp.devscale.id` on the production server, `erp-staging.devscale.id` on the staging server).
3. Clone the repo to `/srv/erp` and check out `main`.
4. Create the data and log folders. Use `production` or `staging` for this server:
   ```bash
   sudo mkdir -p /var/lib/erp/<env> /var/log/caddy
   sudo chown -R $USER /var/lib/erp
   sudo chown caddy:caddy /var/log/caddy   # Caddy must own its log folder, or it fails to start
   ```
   The database lives outside the repo, so deploys never touch it.
5. Install the Caddyfile for this server:
   ```bash
   sudo cp infra/caddy/erp.Caddyfile /etc/caddy/Caddyfile          # production server
   # or: sudo cp infra/caddy/erp-staging.Caddyfile /etc/caddy/Caddyfile   # staging server
   sudo caddy validate --config /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```
6. First deploy, then make PM2 start on boot:
   ```bash
   infra/deploy.sh production        # or: infra/deploy.sh staging
   pm2 startup                       # run the command it prints, with sudo
   pm2 save
   ```
7. Seed mock data only on staging, once: `DATABASE_URL=/var/lib/erp/staging/app.db npm run db:seed`. Production should start empty unless the team decides otherwise.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs typecheck and e2e on pull requests and on pushes to `main` and `staging`. It does not deploy: automated deploys were removed ([decision 0012](../docs/decision/0012-remove-automated-deploys.md)). Deploy by hand as below.

## Deploying

On the server, from `/srv/erp`:

```bash
infra/deploy.sh production   # or staging
```

Error tracking ([decision 0010](../docs/decision/0010-error-tracking-with-glitchtip.md)) is built into the browser bundle. `deploy.sh` sets `VITE_SENTRY_DSN` and `VITE_SENTRY_ENV` for the build, so no server setup is needed. To use another DSN, change it in `deploy.sh`.

The script checks out the environment's branch (`main` for production, `staging` for staging) and pulls it with `--ff-only`, runs `npm ci`, builds into `dist.next` (the live app keeps serving `dist` meanwhile), applies migrations, swaps `dist.next` into `dist`, then reloads the PM2 app (or starts it the first time). A reload restarts the single process, so expect a few seconds of downtime per deploy.

## Operating

```bash
pm2 status                   # is it up, how many restarts
pm2 logs erp-production      # app logs
pm2 restart erp-staging      # restart without a new build
sudo tail -f /var/log/caddy/erp.log   # request log (JSON)
sudo caddy validate --config /etc/caddy/Caddyfile
```

## Monitoring

Grafana, Prometheus and Loki run on the `grafana` tailnet host ([decision 0011](../docs/decision/0011-monitoring-with-grafana-loki-prometheus.md)). Open `https://grafana.tail9a7b40.ts.net` and pick the **ERP machine monitor** dashboard, then Staging or Production in the Environment selector. The admin password is in `~/grafana-admin-password` on the `grafana` host.

```
infra/monitoring/
  install-server.sh     install and configure the stack on the grafana host
  install-agent.sh      install Alloy on an ERP server: install-agent.sh staging|production
  server/               Loki, Prometheus and Grafana settings
  agent/config.alloy    Alloy config (metrics and logs, labelled env and host)
  grafana/              datasource, dashboard provider and dashboard JSON
```

To update the server after changing these files, copy `infra/monitoring` to the host and rerun `install-server.sh` (it is safe to repeat). On each ERP server, run `infra/monitoring/install-agent.sh <env>` from `/srv/erp` once.

## Rules

- Never run two app processes against one SQLite file. `instances` is `1` on purpose.
- Migrations run before the app restarts. Never change a migration after it has run on a server.
- Don't put secrets in `ecosystem.config.cjs`; it is committed. This app has no secrets yet. When it does, load them from a file outside the repo.
- Back up `/var/lib/erp/<env>/app.db` before a risky migration. Backups are not automated yet (see decision 0008).
