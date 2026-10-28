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

## Deploying

On the server, from `/srv/erp`:

```bash
infra/deploy.sh production   # or staging
```

The script pulls the checked-out branch with `--ff-only`, runs `npm ci`, builds, applies migrations, then reloads the PM2 app (or starts it the first time). A reload restarts the single process, so expect a few seconds of downtime per deploy.

## Operating

```bash
pm2 status                   # is it up, how many restarts
pm2 logs erp-production      # app logs
pm2 restart erp-staging      # restart without a new build
sudo tail -f /var/log/caddy/erp.log   # request log (JSON)
sudo caddy validate --config /etc/caddy/Caddyfile
```

## Rules

- Never run two app processes against one SQLite file. `instances` is `1` on purpose.
- Migrations run before the app restarts. Never change a migration after it has run on a server.
- Don't put secrets in `ecosystem.config.cjs`; it is committed. This app has no secrets yet. When it does, load them from a file outside the repo.
- Back up `/var/lib/erp/<env>/app.db` before a risky migration. Backups are not automated yet (see decision 0008).
