#!/usr/bin/env sh
# Builds the app, resets the e2e database, and serves it on port 3100.
# Called by Playwright (playwright.config.ts). Never points at data/app.db.
set -eu
cd "$(dirname "$0")/.."

export DATABASE_URL="./data/e2e.db"
export NODE_ENV=production
rm -f "$DATABASE_URL" "$DATABASE_URL-wal" "$DATABASE_URL-shm"

npm run build
npm run db:migrate
npm run db:seed -- --force

exec node node_modules/srvx/bin/srvx.mjs serve --prod --port=3100 --static=../client --entry=dist/server/server.js
