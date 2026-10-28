#!/usr/bin/env bash
# Install Grafana, Prometheus and Loki on the monitoring server (Debian). Run as a sudoer from the repo root:
#   infra/monitoring/install-server.sh
# Everything listens on localhost; tailscale serve exposes Grafana (HTTPS 443) and the push ports 3100 and 9090.
set -euo pipefail
cd "$(dirname "$0")"

sudo apt-get update
sudo apt-get install -y apt-transport-https gpg curl
curl -fsSL https://apt.grafana.com/gpg.key | sudo gpg --dearmor --yes -o /usr/share/keyrings/grafana.gpg
echo "deb [signed-by=/usr/share/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list >/dev/null
sudo apt-get update
sudo apt-get install -y grafana loki prometheus

sudo install -m 644 server/prometheus-args /etc/default/prometheus
sudo install -D -m 644 server/loki.yaml /etc/loki/config.yml
sudo install -d -o loki /var/lib/loki
sudo install -d /etc/grafana/grafana.ini.d
sudo install -m 644 server/grafana-overrides.ini /etc/grafana/grafana.ini.d/erp.ini
sudo install -m 644 grafana/datasources.yaml /etc/grafana/provisioning/datasources/erp.yaml
sudo install -m 644 grafana/dashboards.yaml /etc/grafana/provisioning/dashboards/erp.yaml
sudo install -d -o grafana -g grafana /var/lib/grafana/dashboards
sudo install -m 644 -o grafana -g grafana grafana/dashboards/*.json /var/lib/grafana/dashboards/

sudo systemctl enable --now prometheus loki grafana-server
sudo systemctl restart prometheus loki grafana-server

sudo tailscale serve --bg --https=443 http://127.0.0.1:3000
sudo tailscale serve --bg --tcp=3100 tcp://127.0.0.1:3100
sudo tailscale serve --bg --tcp=9090 tcp://127.0.0.1:9090
tailscale serve status
