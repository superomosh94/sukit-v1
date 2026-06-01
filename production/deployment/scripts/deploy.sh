#!/bin/bash
set -euo pipefail

ENV="${1:-staging}"
APP="sukit"
REGISTRY="${REGISTRY:-ghcr.io/sukit}"
TAG="$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')"
IMAGE="${REGISTRY}/${APP}:${TAG}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           SUKIT Deployment Script v1.0.0                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  Environment: ${ENV}"
echo "  Image:       ${IMAGE}"
echo "  Tag:         ${TAG}"
echo ""

# ─── Pre-deploy checks ──────────────────────────────────────────

echo "  [1/6] Running pre-deploy checks..."
if ! command -v docker &> /dev/null; then echo "ERROR: docker not found"; exit 1; fi
if ! command -v kubectl &> /dev/null; then echo "WARNING: kubectl not found, skipping K8s deploy"; fi
if [ ! -f Dockerfile ]; then echo "ERROR: Dockerfile not found"; exit 1; fi
echo "  ✓ All checks passed"

# ─── Build Docker image ─────────────────────────────────────────

echo "  [2/6] Building Docker image..."
docker build \
  --platform linux/amd64 \
  --cache-from ${REGISTRY}/${APP}:latest \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t ${IMAGE} \
  -t ${REGISTRY}/${APP}:latest \
  -f Dockerfile .
echo "  ✓ Build complete"

# ─── Push to registry ───────────────────────────────────────────

echo "  [3/6] Pushing to registry..."
docker push ${IMAGE}
docker push ${REGISTRY}/${APP}:latest
echo "  ✓ Push complete"

# ─── Database migrations ────────────────────────────────────────

echo "  [4/6] Running database migrations..."
if command -v npx &> /dev/null; then
  npx prisma migrate deploy
  echo "  ✓ Migrations complete"
else
  echo "  - Skipping migrations (npx not available)"
fi

# ─── Deploy to Kubernetes ───────────────────────────────────────

echo "  [5/6] Deploying to Kubernetes..."
if command -v kubectl &> /dev/null; then
  NAMESPACE="${ENV}"
  kubectl set image deployment/${APP} ${APP}=${IMAGE} -n ${NAMESPACE} --record
  kubectl rollout status deployment/${APP} -n ${NAMESPACE} --timeout=300s
  echo "  ✓ Deployment complete"
else
  echo "  - Skipping K8s deploy (kubectl not available)"
fi

# ─── Post-deploy health check ───────────────────────────────────

echo "  [6/6] Running health check..."
DOMAIN="${ENV}.app.sukit.dev"
if [ "${ENV}" = "production" ]; then DOMAIN="app.sukit.dev"; fi

for i in $(seq 1 30); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/api/health" 2>/dev/null || echo "000")
  if [ "${STATUS}" = "200" ]; then
    echo "  ✓ Health check passed (attempt ${i})"
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║           Deployment successful!                            ║"
    echo "║                                                             ║"
    echo "║  URL:     https://${DOMAIN}                                ║"
    echo "║  Image:   ${IMAGE}                                         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    exit 0
  fi
  echo "  - Waiting for health check... (attempt ${i}/30)"
  sleep 2
done

echo "ERROR: Health check failed!"
exit 1
