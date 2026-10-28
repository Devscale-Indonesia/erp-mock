// PM2 process file. Each server runs one environment:
//   pm2 start infra/pm2/ecosystem.config.cjs --only erp-production   (erp.devscale.id)
//   pm2 start infra/pm2/ecosystem.config.cjs --only erp-staging      (erp-staging.devscale.id)
const path = require('node:path')

const root = path.resolve(__dirname, '../..')

// The app is served by srvx, the same binary `npm start` uses.
// Static assets sit in dist/client, next to dist/server (see package.json "start").
const serve = (port) => ({
  script: path.join(root, 'node_modules/srvx/bin/srvx.mjs'),
  interpreter: 'node',
  cwd: root,
  args: ['serve', '--prod', `--port=${port}`, '--static=../client', '--entry=dist/server/server.js'],
  exec_mode: 'fork',
  instances: 1, // SQLite is single-writer: never run more than one process against the same file.
  autorestart: true,
  max_memory_restart: '512M',
  min_uptime: '10s',
  max_restarts: 10,
  kill_timeout: 5000,
  time: true,
})

module.exports = {
  apps: [
    {
      ...serve(3000),
      name: 'erp-production',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: '/var/lib/erp/production/app.db',
      },
    },
    {
      ...serve(3001),
      name: 'erp-staging',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: '/var/lib/erp/staging/app.db',
      },
    },
  ],
}
