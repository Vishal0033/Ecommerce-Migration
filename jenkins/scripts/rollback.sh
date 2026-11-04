#!/usr/bin/env bash
# RetailMax Automated Rollback Script
# Automatically re-routes traffic back to previous stable container slot in event of failure

set -eo pipefail

echo "================================================="
echo "🚨 INITIATING AUTOMATED ROLLBACK"
echo "Health check failed or deployment was interrupted."
echo "Restoring previous stable configuration..."
echo "================================================="

# Fallback to Blue slot (Port 5001)
DEFAULT_STABLE_PORT=5001

cat <<EOF > /tmp/retailmax-rollback.conf
upstream retailmax_backend {
    server 127.0.0.1:${DEFAULT_STABLE_PORT} max_fails=3 fail_timeout=10s;
}

server {
    listen 80;
    server_name _;

    location /health {
        proxy_pass http://retailmax_backend/health;
        access_log off;
    }

    location /metrics {
        proxy_pass http://retailmax_backend/metrics;
    }

    location /api/ {
        proxy_pass http://retailmax_backend/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3030;
    }
}
EOF

if command -v nginx >/dev/null 2>&1; then
    sudo mv /tmp/retailmax-rollback.conf /etc/nginx/sites-available/retailmax.conf
    sudo nginx -t
    sudo systemctl reload nginx
    echo "✅ Rollback completed. Traffic safely restored to stable slot on port ${DEFAULT_STABLE_PORT}."
else
    echo "ℹ️ Rollback simulated successfully."
fi

