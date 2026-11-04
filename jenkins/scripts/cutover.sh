#!/usr/bin/env bash
# RetailMax Zero-Downtime Traffic Cutover Script
# Atomically flips Nginx reverse proxy routing between Blue and Green slots

set -eo pipefail

NEW_SLOT="${1:-green}"
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

echo "================================================="
echo "🔀 Initiating Zero-Downtime Traffic Cutover"
echo "Target Active Slot: [${NEW_SLOT}]"
echo "================================================="

if [ "$NEW_SLOT" == "green" ]; then
    ACTIVE_PORT=5002
else
    ACTIVE_PORT=5001
fi

# Generate updated Nginx configuration
cat <<EOF > /tmp/retailmax.conf
upstream retailmax_backend {
    server 127.0.0.1:${ACTIVE_PORT} max_fails=3 fail_timeout=10s;
}

server {
    listen 80;
    server_name _;

    location /health {
        proxy_pass http://retailmax_backend/health;
        proxy_connect_timeout 2s;
        proxy_read_timeout 3s;
        access_log off;
    }

    location /metrics {
        proxy_pass http://retailmax_backend/metrics;
        proxy_set_header Host \$host;
    }

    location /api/ {
        proxy_pass http://retailmax_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3030;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Test configuration before applying
if command -v nginx >/dev/null 2>&1; then
    sudo mv /tmp/retailmax.conf "${NGINX_CONF_DIR}/retailmax.conf"
    sudo nginx -t
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully. Live traffic is now served by [${NEW_SLOT}] on port ${ACTIVE_PORT}."
else
    echo "ℹ️ Simulating Nginx cutover on non-Linux / local development host:"
    cat /tmp/retailmax.conf
fi
