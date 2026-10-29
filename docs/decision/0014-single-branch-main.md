# 0014: One branch, `main`

- Status: Accepted
- Date: 2026-10-29

## Context

We had `main` (production) and `staging` (staging). Work went to `staging` first and was promoted to `main`, which left the two branches drifting apart (cherry-picks, duplicate commits). Automated deploys are gone ([decision 0012](0012-remove-automated-deploys.md)) and the servers are off, so a separate branch bought nothing.

## Decision

- `main` is the only long-lived branch. Branch from it, open pull requests into it.
- `staging` was merged into `main` (so Sentry, monitoring and the dashboard fix are on `main`) and the branch was deleted.
- CI (`ci.yml`) and Hammer review (`hammer-review.yml`) now run for pull requests into `main` and pushes to `main`.
- `infra/deploy.sh staging` still exists for a staging server, but deploys `main` to it.

## Consequences

- No promotion step and no drift between branches.
- Anything merged to `main` is production-ready by definition; protect `main` with required checks if that matters.
- Old decisions (0009, 0012) still mention `staging`; they are kept as history and point here.
- The `staging` environment *name* is unchanged in the monitoring and error-tracking setup ([0010](0010-error-tracking-with-glitchtip.md), [0011](0011-monitoring-with-grafana-loki-prometheus.md)): it labels a server, not a branch.
