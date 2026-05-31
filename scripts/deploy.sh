#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file '$ENV_FILE' not found."
  echo "Usage: $0 [env-file]"
  exit 1
fi

echo "==> Loading environment from $ENV_FILE"
set -a
source "$ENV_FILE"
set +a

echo "==> Pulling latest images..."
docker compose -f docker/docker-compose.yml pull

echo "==> Building and starting services..."
docker compose -f docker/docker-compose.yml up -d --build

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Checking service health..."
sleep 5
docker compose -f docker/docker-compose.yml ps

echo "==> Deployment complete!"
