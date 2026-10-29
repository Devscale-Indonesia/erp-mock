#!/usr/bin/env bash
# Deploy the app on this server.
#   infra/deploy.sh production
#   infra/deploy.sh staging
set -euo pipefail

ENV="${1:-}"
case "$ENV" in
  production|staging) ;;
  *) echo "usage: infra/deploy.sh production|staging" >&2; exit 1 ;;
esac

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="erp-$ENV"
case "$ENV" in
  production) BRANCH=main ;;
  staging) BRANCH=main ;; # there is no staging branch; a staging server runs main too
esac
export DATABASE_URL="/var/lib/erp/$ENV/app.db"
export NODE_ENV=production
# Secrets kept outside the repo (e.g. MCP_AUTH_TOKEN, decision 0013). Optional.
if [ -f "/var/lib/erp/$ENV/secrets.env" ]; then set -a; . "/var/lib/erp/$ENV/secrets.env"; set +a; fi
# Error tracking (decision 0010). Vite bakes these into the browser bundle at build time.
# The DSN is a public client key and the host is only reachable on our private tailnet.
export VITE_SENTRY_DSN="https://47d47e04bcbb4c039260ef94e355e89e@ubuntu-wsl.tail9a7b40.ts.net:8443/2"
export VITE_SENTRY_ENV="$ENV"

mkdir -p "$(dirname "$DATABASE_URL")"
cd "$ROOT"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
npm ci --include=dev   # the build needs devDependencies even with NODE_ENV=production
# Build into dist.next so the running app keeps serving dist (a build into dist
# would delete the assets the live process still serves). Swap just before reload.
rm -rf dist.next
npx vite build --outDir dist.next
npm run db:migrate   # migrations run before the new code starts
rm -rf dist.prev
[ -d dist ] && mv dist dist.prev
mv dist.next dist

if pm2 describe "$APP" >/dev/null 2>&1; then
  pm2 reload infra/pm2/ecosystem.config.cjs --only "$APP" --update-env
else
  pm2 start infra/pm2/ecosystem.config.cjs --only "$APP"
fi
pm2 save

echo "deployed $APP ($BRANCH) from $(git rev-parse --short HEAD)"
