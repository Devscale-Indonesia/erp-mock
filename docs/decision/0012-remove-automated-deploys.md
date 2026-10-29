# 0012: Remove automated deploys from CI

- Status: Accepted. The `staging` branch it mentions was removed by [0014](0014-single-branch-main.md).
- Date: 2026-10-29

## Context

[Decision 0009](0009-ci-cd-with-github-actions.md) deployed `main` and `staging` from GitHub Actions over SSH. The servers have been shut down, so every push ran a deploy job that could only fail.

## Decision

- Delete the `deploy` job from `.github/workflows/ci.yml`. The workflow is now `CI`: the `check` job (typecheck, e2e, report upload) on pull requests and on pushes to `main` and `staging`.
- Pushing or merging to `main` or `staging` no longer deploys anything.
- Keep `infra/deploy.sh`, PM2 and Caddy config. Deploys are manual again, as in [decision 0008](0008-deploy-with-pm2-and-caddy.md).

## Consequences

- The GitHub environments `production` and `staging` and their secrets and variables (`SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`, `SSH_HOST`, `SSH_USER`) are unused. Delete them in the repo settings, and remove the forced-command keys from the servers' `authorized_keys`, when the servers come back or are retired.
- To bring automated deploys back, restore the job from git history (`ci.yml` before this change) and supersede this decision.
