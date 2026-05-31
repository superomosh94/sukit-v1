#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <backup-file>"
  exit 1
fi

BACKUP_FILE="$1"
DB_URL="${DATABASE_URL:-postgresql://sukite:password@localhost:5432/sukit}"

if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "==> Restoring from compressed backup..."
  gunzip -c "$BACKUP_FILE" | psql "$DB_URL"
else
  echo "==> Restoring from backup..."
  psql "$DB_URL" < "$BACKUP_FILE"
fi

echo "==> Restore complete!"
