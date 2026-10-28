# 0009: CI/CD with GitHub Actions and per-environment SSH keys

- Status: Accepted
- Date: 2026-10-28

## Context

Deploys were run by hand on each server ([decision 0008](0008-deploy-with-pm2-and-caddy.md)). We want checks on every change and deploys that follow the branch: `main` is production, `staging` is staging.

## Decision

- `.github/workflows/ci.yml` runs on pull requests and on pushes to `main` and `staging`.
  - `check`: `npm ci`, `npm run typecheck`, `npm run e2e` (which builds the app). The e2e report is uploaded as an artifact, so every run keeps its proof.
  - `deploy`: on a push only, after `check` passes. `main` deploys production, `staging` deploys staging. It then requests the site URL and fails if it is not healthy.
- Each environment has its own SSH key pair and a GitHub environment (`production`, `staging`) holding `SSH_PRIVATE_KEY` and `SSH_KNOWN_HOSTS` (secrets) and `SSH_HOST` and `SSH_USER` (variables).
- On each server the public key sits in `~/.ssh/authorized_keys` with `command="cd /srv/erp && infra/deploy.sh <env>",restrict`. The key can run that one script and nothing else: no shell, no forwarding.
- The runner connects to the server's public IP. Tailscale is not used for deploys.

## Consequences

- A merge to `main` or `staging` deploys without anyone logging in to a server.
- A leaked key can only trigger a deploy of the branch already on GitHub.
- Deploys serialize per branch (`concurrency`), so two pushes never run `deploy.sh` at once.
- A deploy restarts the app, so there is a short downtime (see decision 0008).
- To rotate a key: generate a new pair, replace the line in `authorized_keys`, update the environment secret.
- Open: protect `main` and `staging` with required checks, and add required reviewers to the `production` environment if a manual approval is wanted.
