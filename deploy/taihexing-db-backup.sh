#!/usr/bin/env bash
set -euo pipefail

cd /opt/taihexing-home-service
set -a
source ./.env
set +a

backup_dir=/var/backups/taihexing
install -d -m 700 "$backup_dir"
backup_file="$backup_dir/taihexing-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"

docker compose exec -T -e MYSQL_PWD="$DB_PASSWORD" db \
  mysqldump --user=taihexing --single-transaction --routines --triggers taihexing \
  | gzip -c > "$backup_file"
chmod 600 "$backup_file"
find "$backup_dir" -maxdepth 1 -type f -name 'taihexing-*.sql.gz' -mtime +14 -delete
