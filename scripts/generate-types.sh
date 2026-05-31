#!/usr/bin/env bash
set -euo pipefail

echo "==> Generating Prisma client..."
pnpm exec prisma generate

echo "==> Running TypeScript type check..."
pnpm exec tsc --noEmit

echo "==> Type generation complete!"
