#!/usr/bin/env bash
# Debug SSL for the deployed Workers app. Usage: ./scripts/debug-ssl.sh [URL]
# Default URL: https://app.crimson-club.workers.dev/
set -e
URL="${1:-https://app.crimson-club.workers.dev/}"
HOST=$(echo "$URL" | sed -n 's|https\?://\([^/]*\).*|\1|p')
echo "=== Testing SSL for $HOST ==="
echo ""
echo "1. DNS resolution:"
dig +short "$HOST" 2>/dev/null || nslookup "$HOST" 2>/dev/null || true
echo ""
echo "2. curl (verbose) - TLS handshake:"
curl -vI --connect-timeout 10 "$URL" 2>&1 | head -40
echo ""
echo "3. openssl s_client - certificate and handshake:"
echo | openssl s_client -connect "${HOST}:443" -servername "$HOST" 2>&1 | head -50
