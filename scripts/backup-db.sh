#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_URL="${DATABASE_URL:-postgresql://sukite:password@localhost:5432/sukit}"

mkdir -p "$BACKUP_DIR"

echo "==> Backing up database..."
pg_dump "$DB_URL" > "$BACKUP_DIR/sukit_backup_$TIMESTAMP.sql"
gzip "$BACKUP_DIR/sukit_backup_$TIMESTAMP.sql"

echo "==> Backup created: $BACKUP_DIR/sukit_backup_$TIMESTAMP.sql.gz"
