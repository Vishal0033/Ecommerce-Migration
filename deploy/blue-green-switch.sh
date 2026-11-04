#!/usr/bin/env bash
# RetailMax Blue-Green Switch Utility
# Usage: ./blue-green-switch.sh [blue|green|status]

set -eo pipefail

ACTION="${1:-status}"
NGINX_CONF="/etc/nginx/sites-available/retailmax.conf"

show_status() {
    echo "============================================="
    echo "🔍 RetailMax Deployment Slot Status"
    echo "============================================="
    
    if [ -f "$NGINX_CONF" ]; then
        if grep -q "5001" "$NGINX_CONF"; then
            echo "Current Active Slot: [BLUE] (Port 5001)"
        elif grep -q "5002" "$NGINX_CONF"; then
            echo "Current Active Slot: [GREEN] (Port 5002)"
        else
            echo "Current Active Slot: [UNKNOWN / CUSTOM]"
        fi
    else
        echo "Nginx configuration not found at $NGINX_CONF"
    fi

    echo ""
    echo "Container Health Probes:"
    curl -s http://127.0.0.1:5001/health | jq . 2>/dev/null && echo "  - Blue (5001): Responding" || echo "  - Blue (5001): Inactive/Down"
    curl -s http://127.0.0.1:5002/health | jq . 2>/dev/null && echo "  - Green (5002): Responding" || echo "  - Green (5002): Inactive/Down"
}

case "$ACTION" in
    blue)
        echo "Switching live traffic to BLUE slot (Port 5001)..."
        ./jenkins/scripts/cutover.sh blue
        ;;
    green)
        echo "Switching live traffic to GREEN slot (Port 5002)..."
        ./jenkins/scripts/cutover.sh green
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {blue|green|status}"
        exit 1
        ;;
esac
