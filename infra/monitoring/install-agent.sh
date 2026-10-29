#!/usr/bin/env bash
# Install Grafana Alloy on an ERP server. Run as a sudoer from the repo root:
#   infra/monitoring/install-agent.sh staging|production
set -euo pipefail
ENV="${1:-}"
case "$ENV" in production|staging) ;; *) echo "usage: install-agent.sh production|staging" >&2; exit 1 ;; esac
cd "$(dirname "$0")"

# PM2 logs live in the deploy user's home. The deploy user is whoever owns /srv/erp.
DEPLOY_USER="$(stat -c %U /srv/erp)"
PM2_LOG_DIR="$(getent passwd "$DEPLOY_USER" | cut -d: -f6)/.pm2/logs"

sudo apt-get update
sudo apt-get install -y apt-transport-https gpg curl acl
curl -fsSL https://apt.grafana.com/gpg.key | sudo gpg --dearmor --yes -o /usr/share/keyrings/grafana.gpg
echo "deb [signed-by=/usr/share/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list >/dev/null
sudo apt-get update
sudo apt-get install -y alloy

sudo install -m 644 agent/config.alloy /etc/alloy/config.alloy
printf 'CONFIG_FILE="/etc/alloy/config.alloy"\nCUSTOM_ARGS="--disable-reporting"\nRESTART_ON_UPGRADE=true\nENV="%s"\nPM2_LOG_DIR="%s"\n' "$ENV" "$PM2_LOG_DIR" | sudo tee /etc/default/alloy >/dev/null

# Let the alloy user read the logs (ACLs, so no group or ownership changes).
sudo setfacl -m u:alloy:x "$(dirname "$PM2_LOG_DIR")" "$(dirname "$(dirname "$PM2_LOG_DIR")")"
sudo setfacl -R -m u:alloy:rX "$PM2_LOG_DIR"
sudo setfacl -R -d -m u:alloy:rX "$PM2_LOG_DIR"
sudo setfacl -R -m u:alloy:rX /var/log/caddy
sudo setfacl -d -m u:alloy:rX /var/log/caddy

sudo systemctl enable --now alloy
sudo systemctl restart alloy
systemctl is-active alloy
