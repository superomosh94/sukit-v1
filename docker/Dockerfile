FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY apps/server/package.json apps/server/package.json
COPY apps/cli/package.json apps/cli/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/blocks/package.json packages/blocks/package.json
COPY packages/modules-core/package.json packages/modules-core/package.json
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY . .
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
RUN pnpm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/turbo.json ./turbo.json

COPY --from=builder /app/apps/web/next.config.js ./apps/web/next.config.js
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json

COPY --from=builder /app/apps/cli/dist ./apps/cli/dist
COPY --from=builder /app/apps/cli/package.json ./apps/cli/package.json

COPY --from=builder /app/packages ./packages

RUN mkdir -p /app/storage /app/exports /app/modules

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sukit
USER sukit

EXPOSE 3000

CMD ["pnpm", "run", "start"]
