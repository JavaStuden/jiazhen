#!/usr/bin/env bash
set -euo pipefail

cd /opt/taihexing-home-service
set -a
source ./.env
set +a

base=https://voice.yourunshi.online/taihexing/api

status=$(curl -sS -o /dev/null -w '%{http_code}' "$base/admin/dashboard")
[[ "$status" == 401 ]]
echo "Unauthenticated admin API: $status"

printf '{"username":"%s","password":"%s"}' "$ADMIN_USERNAME" "$ADMIN_PASSWORD" \
  | curl -sS -D /tmp/taihexing-login-headers -c /tmp/taihexing-cookie \
      -H 'Content-Type: application/json' --data-binary @- "$base/auth/login" >/dev/null
cookie_header=$(grep -i '^set-cookie: JSESSIONID=' /tmp/taihexing-login-headers | tr -d '\r')
[[ "$cookie_header" == *"HttpOnly"* && "$cookie_header" == *"Secure"* && "$cookie_header" == *"SameSite=Lax"* ]]
echo 'Admin login: secure HttpOnly SameSite=Lax session cookie'
dashboard=$(curl -fsS -b /tmp/taihexing-cookie "$base/admin/dashboard")
echo "Authenticated dashboard: $dashboard"

web_status=$(curl -sS -o /tmp/taihexing-index.html -w '%{http_code}' https://voice.yourunshi.online/taihexing/)
[[ "$web_status" == 200 ]]
asset=$(grep -oE '/taihexing/assets/[^" ]+\.js' /tmp/taihexing-index.html | head -1)
[[ -n "$asset" ]]
asset_status=$(curl -sS -o /dev/null -w '%{http_code}' "https://voice.yourunshi.online$asset")
[[ "$asset_status" == 200 ]]
echo "Admin web and bundle: $web_status / $asset_status"

services_status=$(curl -sS -o /dev/null -w '%{http_code}' "$base/public/services")
[[ "$services_status" == 200 ]]
create_status=$(curl -sS -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' \
  --data '{"serviceId":2,"customerName":"未登录测试","phone":"00000000000","address":"test","scheduledAt":"2099-01-01 12:00"}' \
  "$base/public/orders")
[[ "$create_status" == 404 || "$create_status" == 405 ]]
echo "Public service catalog: $services_status; anonymous order creation unavailable: $create_status"

health=$(curl -fsS "$base/public/health")
echo "Public health: $health"
docker compose ps
