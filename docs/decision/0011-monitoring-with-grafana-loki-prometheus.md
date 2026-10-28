# 0011: Monitoring with Grafana, Prometheus and Loki

- Status: Accepted
- Date: 2026-10-28

## Context

We had no view of machine health (CPU, RAM, disk) or of app logs across the two ERP servers. Logs were only readable by SSH-ing in.

## Decision

- One monitoring server (`grafana` on the tailnet) runs Grafana, Prometheus and Loki as apt packages (Grafana's apt repo for Grafana and Loki 3.x, Debian's Prometheus). All three listen on localhost. `tailscale serve` exposes Grafana at `https://grafana.tail9a7b40.ts.net` and the push ports 3100 (Loki) and 9090 (Prometheus remote write) to the tailnet only.
- Each ERP server runs Grafana Alloy only. It opens no ports and pushes: host metrics (`prometheus.exporter.unix`) by remote write, and logs (PM2 files, Caddy JSON logs) to Loki. Pushing keeps the ERP servers' public IPs free of exporters.
- Every metric and log line carries `env` (`staging` or `production`, same names as `deploy.sh`) and `host`. The dashboard has one `Environment` variable (Staging / Production) that filters both.
- Dashboard and datasources are provisioned from files in `infra/monitoring/`. The Grafana admin password is set on the server and is not committed.
- Retention: metrics 30 days, logs 14 days (small disk, 4 GB RAM box).

## Consequences

- Install steps live in `infra/README.md`; scripts are `infra/monitoring/install-server.sh` and `install-agent.sh <env>`.
- Anyone on the tailnet can push to Loki and Prometheus (no auth). Acceptable on a private tailnet; add tailscale ACLs if the tailnet grows.
- Single server, no backups, no alerting yet.
