#!/usr/bin/env bash
# RetailMax Automated Health Check Script
# Validates container readiness prior to traffic cutover

set -eo pipefail

PORT="${1:-5002}"
HOST="${2:-127.0.0.1}"
HEALTH_URL="http://${HOST}:${PORT}/health"
MAX_ATTEMPTS=15
DELAY_SECONDS=3

echo "================================================="
echo "🏥 Initiating RetailMax Health Check on: ${HEALTH_URL}"
echo "================================================="

for ((i=1; i<=MAX_ATTEMPTS; i++)); do
    echo "Attempt ${i}/${MAX_ATTEMPTS}: Probing ${HEALTH_URL}..."

    HTTP_RESPONSE=$(curl -s -o /tmp/health_body.json -w "%{http_code}" "${HEALTH_URL}" || true)

    if [ "$HTTP_RESPONSE" -eq 200 ]; then
        STATUS=$(grep -o '"status":"[^"]*"' /tmp/health_body.json | cut -d'"' -f4 || true)

        if [ "$STATUS" == "UP" ]; then
            echo "✅ Target slot is HEALTHY (HTTP 200, Status: UP)."
            cat /tmp/health_body.json
            echo ""
            exit 0
        else
            echo "⚠️ HTTP 200 received but database or service status is: ${STATUS}"
        fi
    else
        echo "⏳ Service returned HTTP ${HTTP_RESPONSE}. Retrying in ${DELAY_SECONDS}s..."
    fi

    sleep "$DELAY_SECONDS"
done

echo "❌ ERROR: Health check timed out after ${MAX_ATTEMPTS} attempts."
echo "Aborting deployment to protect customer traffic."
exit 1

