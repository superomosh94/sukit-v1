#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing dependencies..."
pnpm install

echo "==> Generating Prisma client..."
pnpm db:generate

echo "==> Running database migrations..."
pnpm db:migrate

echo "==> Seeding database..."
pnpm db:seed

echo "==> Setup complete!"
