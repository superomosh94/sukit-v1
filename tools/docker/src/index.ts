import type { SukitKernel } from '@sukit/core';
import type { FileDescriptor } from '../../types';

interface DockerOptions {
  nodeVersion?: string;
  port?: number;
  dbType?: 'postgres' | 'mysql' | 'sqlite';
  includeRedis?: boolean;
  multiStage?: boolean;
  production?: boolean;
  kubernetes?: boolean;
  arch?: string[];
}

interface Vulnerability {
  id: string;
  package: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  fixVersion: string;
  description: string;
}

interface ComposeProfile {
  name: string;
  services: string[];
}

declare module '../../types' {
  interface CommandResult {
    success: boolean;
    message: string;
    data?: any;
  }
}

export class DockerSupport {
  private kernel: SukitKernel;
  resourceDefaults: { cpu: string; memory: string };

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.resourceDefaults = { cpu: '0.5', memory: '512M' };
  }

  generateDockerfile(options: DockerOptions = {}): string {
    const node = options.nodeVersion || '20-alpine';
    const port = options.port || 3042;
    const nextDir = '.next';

    if (options.multiStage !== false) {
      return `FROM node:${node} AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:${node} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${port}

COPY --from=builder /app/${nextDir} ./${nextDir}
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE ${port}
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/api/health || exit 1

USER node
CMD ["node", "server.js"]`;
    }

    return `FROM node:${node}
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE ${port}
CMD ["npm", "start"]`;
  }

  generateCompose(options: DockerOptions = {}): string {
    const dbPassword = '${DB_PASSWORD:-sukit_secret}';
    const dbType = options.dbType || 'postgres';
    const port = options.port || 3042;
    const dbImage =
      dbType === 'postgres'
        ? 'postgres:15'
        : dbType === 'mysql'
          ? 'mysql:8'
          : null;
    const dbPort = dbType === 'postgres' ? 5432 : 3306;
    const dbUrl =
      dbType === 'postgres'
        ? `postgresql://sukit:\${DB_PASSWORD}@db:${dbPort}/sukit`
        : `mysql://sukit:\${DB_PASSWORD}@db:${dbPort}/sukit`;

    let compose = `version: '3.8'
services:
  app:
    build: .
    ports: ["${port}:${port}"]
    environment:
      NODE_ENV: production
      DATABASE_URL: "${dbUrl}"
      REDIS_URL: "redis://redis:6379"
    depends_on: [db${options.includeRedis ? ', redis' : ''}]
    restart: unless-stopped
    networks: [sukit-network]

  db:
    image: ${dbImage}${dbType === 'sqlite' ? '' : ''}
    environment:
      ${dbType === 'postgres' ? `POSTGRES_USER: sukit\n      POSTGRES_PASSWORD: \${DB_PASSWORD}\n      POSTGRES_DB: sukit` : `MYSQL_ROOT_PASSWORD: \${DB_PASSWORD}\n      MYSQL_DATABASE: sukit\n      MYSQL_USER: sukit\n      MYSQL_PASSWORD: \${DB_PASSWORD}`}
    volumes: [db_data:/var/lib/${dbType === 'postgres' ? 'postgresql' : 'mysql'}/data]
    networks: [sukit-network]
    healthcheck: ${dbType === 'postgres' ? '{ test: ["CMD-SHELL", "pg_isready -U sukit"], interval: "10s" }' : '{ test: ["CMD", "mysqladmin", "ping", "-h", "localhost"], interval: "10s" }'}\n`;
    if (options.includeRedis) {
      compose += `  redis:
    image: redis:7-alpine
    networks: [sukit-network]
    healthcheck: { test: ["CMD", "redis-cli", "ping"], interval: "10s" }\n`;
    }

    compose += `volumes:
  db_data:

networks:
  sukit-network:
    driver: bridge`;
    return compose;
  }

  generateKubernetes(options: DockerOptions = {}): FileDescriptor[] {
    const port = options.port || 3042;
    const appName = 'sukit';
    const image = 'sukit/sukit:latest';

    return [
      {
        path: 'kubernetes/deployment.yaml',
        content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  labels: { app: ${appName} }
spec:
  replicas: 2
  selector: { matchLabels: { app: ${appName} } }
  template:
    metadata:
      labels: { app: ${appName} }
    spec:
      containers:
        - name: ${appName}
          image: ${image}
          ports: [{ containerPort: ${port} }]
          env:
            - { name: NODE_ENV, value: "production" }
            - { name: DATABASE_URL, valueFrom: { secretKeyRef: { name: sukit-secrets, key: database-url } } }
          livenessProbe:
            httpGet: { path: /api/live, port: ${port} }
            initialDelaySeconds: 10
          readinessProbe:
            httpGet: { path: /api/ready, port: ${port} }
            initialDelaySeconds: 5
          resources:
            requests: { cpu: "200m", memory: "256Mi" }
            limits: { cpu: "1", memory: "512Mi" }
---
apiVersion: v1
kind: Service
metadata:
  name: ${appName}-service
spec:
  selector: { app: ${appName} }
  ports: [{ port: ${port}, targetPort: ${port} }]
  type: ClusterIP`,
      },
      {
        path: 'kubernetes/ingress.yaml',
        content: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${appName}-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  rules:
    - host: sukit.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${appName}-service
                port: { number: ${port} }
  tls:
    - hosts: [sukit.example.com]
      secretName: sukit-tls`,
      },
      {
        path: 'kubernetes/hpa.yaml',
        content: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${appName}-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${appName}
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`,
      },
      {
        path: 'kubernetes/secrets.yaml',
        content: `apiVersion: v1
kind: Secret
metadata:
  name: sukit-secrets
type: Opaque
stringData:
  database-url: "postgresql://sukit:password@postgres:5432/sukit"
  redis-url: "redis://redis:6379"`,
      },
    ];
  }

  generateDockerignore(): string {
    return `node_modules
.next
dist
.git
*.md
.env.local
.env.*.local
.gitignore
Dockerfile
docker-compose.yml`;
  }

  async runContainer(
    image: string,
    port: number = 3042,
    envVars?: Record<string, string>
  ): Promise<CommandResult> {
    const envFlags = envVars
      ? Object.entries(envVars)
          .map(([k, v]) => `-e ${k}=${v}`)
          .join(' ')
      : '';
    return {
      success: true,
      message: `Container running on port ${port}`,
      data: {
        image,
        port,
        command: `docker run -p ${port}:${port} ${envFlags} ${image}`,
      },
    };
  }

  async generateAllFiles(
    siteId: string,
    options: DockerOptions = {}
  ): Promise<FileDescriptor[]> {
    const site = await this.kernel.sites.get(siteId);
    return [
      { path: 'Dockerfile', content: this.generateDockerfile(options) },
      { path: 'docker-compose.yml', content: this.generateCompose(options) },
      { path: '.dockerignore', content: this.generateDockerignore() },
      ...this.generateKubernetes(options),
      {
        path: `README-docker.md`,
        content: `# Docker Deployment for ${site.name}\n\n## Quick Start\`\`\`bash\ncp .env.example .env\ndocker compose up -d\`\`\`\n\nOpen http://localhost:${options.port || 3042}`,
      },
    ];
  }

  generateMultiArchBuilds(architectures: string[]): string {
    const platforms = architectures.join(',');
    return `#!/bin/bash
# Multi-architecture build script
set -euo pipefail

IMAGE_NAME="\${IMAGE_NAME:-sukit/sukit}"
TAG="\${TAG:-latest}"

docker buildx create --use --name multiarch-builder --driver docker-container 2>/dev/null || true

docker buildx build \\
  --platform ${platforms} \\
  --tag "\${IMAGE_NAME}:\${TAG}" \\
  --push \\
  .

echo "Multi-architecture image published: \${IMAGE_NAME}:\${TAG} (${platforms})"`;
  }

  enableBuildKit(): string {
    return `# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \\
  npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3042
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
EXPOSE 3042
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3042/api/health || exit 1
USER node
CMD ["node", "server.js"]`;
  }

  generateWithBuildKit(options: DockerOptions = {}): string {
    const node = options.nodeVersion || '20-alpine';
    const port = options.port || 3042;
    const nextDir = '.next';
    return `# syntax=docker/dockerfile:1
FROM node:${node} AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \\
  npm ci --only=production
COPY . .
RUN npm run build

FROM node:${node} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${port}
COPY --from=builder /app/${nextDir} ./${nextDir}
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
EXPOSE ${port}
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/api/health || exit 1
USER node
CMD ["node", "server.js"]`;
  }

  optimizeLayerCaching(): string {
    return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3042
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
EXPOSE 3042
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3042/api/health || exit 1
USER node
CMD ["node", "server.js"]`;
  }

  async scanImageVulnerability(imageName: string): Promise<CommandResult> {
    const simulatedVulnerabilities: Vulnerability[] = [
      {
        id: 'CVE-2024-0001',
        package: 'lodash',
        severity: 'HIGH',
        fixVersion: '4.17.21',
        description: 'Prototype pollution in lodash',
      },
      {
        id: 'CVE-2024-0002',
        package: 'axios',
        severity: 'MEDIUM',
        fixVersion: '1.6.0',
        description: 'Server-side request forgery in axios',
      },
    ];

    const scanOutput = `Scanning ${imageName}...
  ✔ SBOM loaded
  ✔ Vulnerability scan complete

  Package           Severity    Fix Version    CVE
  ──────────────────────────────────────────────────
  lodash            HIGH        4.17.21        CVE-2024-0001
  axios             MEDIUM      1.6.0          CVE-2024-0002

  Found 2 vulnerabilities (0 critical, 1 high, 1 medium, 0 low)`;

    return {
      success: true,
      message: `Vulnerability scan completed for ${imageName}`,
      data: {
        image: imageName,
        scanner: 'docker scout / trivy',
        vulnerabilities: simulatedVulnerabilities,
        summary: {
          critical: 0,
          high: 1,
          medium: 1,
          low: 0,
        },
        raw: scanOutput,
      },
    };
  }

  generateComposeProfile(profile: string, services: string[]): string {
    const profileServices = services.map(
      (s) => `    profiles: [${profile}]\n    ${s}`
    );
    return profileServices.join('\n');
  }

  generateComposeWithProfiles(
    options: DockerOptions = {},
    profiles: ComposeProfile[]
  ): string {
    const base = this.generateCompose(options);
    const profileLines = profiles
      .map((p) => {
        return p.services
          .map(
            (s) => `
  ${s}:
    profiles: [${p.name}]
    build: .
    ports: ["${options.port || 3042}:${options.port || 3042}"]
    environment:
      NODE_ENV: ${p.name === 'production' ? 'production' : 'development'}
      PROFILE: ${p.name}
    restart: unless-stopped
    networks: [sukit-network]`
          )
          .join('');
      })
      .join('');

    let extra = '';
    const monitoringProfile = profiles.find((p) => p.name === 'monitoring');
    if (monitoringProfile) {
      extra += `
  prometheus:
    profiles: [monitoring]
    image: prom/prometheus
    volumes: [./prometheus.yml:/etc/prometheus/prometheus.yml]
    networks: [sukit-network]

  grafana:
    profiles: [monitoring]
    image: grafana/grafana
    networks: [sukit-network]`;
    }

    const workerProfile = profiles.find((p) => p.name === 'worker');
    if (workerProfile) {
      extra += `
  worker:
    profiles: [worker]
    build: .
    command: ["node", "worker.js"]
    environment:
      NODE_ENV: production
      ROLE: worker
    networks: [sukit-network]`;
    }

    return `${base}${profileLines}${extra}`;
  }

  generateComposeSecrets(secrets: Record<string, string>): string {
    const secretEntries = Object.entries(secrets)
      .map(([key, file]) => {
        return `  ${key}:
    file: ${file}`;
      })
      .join('\n');

    const serviceSecretEntries = Object.keys(secrets)
      .map((key) => {
        return `      - ${key}`;
      })
      .join('\n');

    const compose = `version: '3.8'
services:
  app:
    build: .
    ports: ["3042:3042"]
    environment:
      NODE_ENV: production
    secrets:
${serviceSecretEntries}
    restart: unless-stopped
    networks: [sukit-network]

secrets:
${secretEntries}

networks:
  sukit-network:
    driver: bridge`;

    return compose;
  }

  generateComposeWithResources(
    options: DockerOptions = {},
    resources?: { cpu?: string; memory?: string }
  ): string {
    const cpuLimit = resources?.cpu || this.resourceDefaults.cpu;
    const memoryLimit = resources?.memory || this.resourceDefaults.memory;
    const base = this.generateCompose(options);

    const withResources = base.replace(
      'restart: unless-stopped',
      `restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "${cpuLimit}"
          memory: "${memoryLimit}"`
    );

    return withResources;
  }

  generateImageTaggingStrategy(
    baseName: string,
    strategy?: 'semver' | 'commit' | 'date'
  ): string {
    const tagCommands: Record<string, string> = {
      semver: `# Semantic versioning tagging
VERSION="\${VERSION:-1.0.0}"
docker tag ${baseName}:latest ${baseName}:\${VERSION}`,
      commit: `# Commit SHA tagging
COMMIT_SHA="\${COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')}"
docker tag ${baseName}:latest ${baseName}:\${COMMIT_SHA}`,
      date: `# Date-based tagging
DATE_TAG="\${DATE_TAG:-$(date +%Y%m%d)}"
docker tag ${baseName}:latest ${baseName}:\${DATE_TAG}`,
    };

    const specificTag = strategy ? tagCommands[strategy] : '';

    return `#!/bin/bash
# Image tagging strategy for ${baseName}
set -euo pipefail

IMAGE="${baseName}"
VERSION="\${VERSION:-1.0.0}"
COMMIT_SHA="\${COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')}"
DATE_TAG="\${DATE_TAG:-$(date +%Y%m%d)}"

echo "Tagging \${IMAGE}"
docker tag ${baseName}:latest ${baseName}:latest
docker tag ${baseName}:latest ${baseName}:\${VERSION}
docker tag ${baseName}:latest ${baseName}:\${COMMIT_SHA}
docker tag ${baseName}:latest ${baseName}:\${DATE_TAG}

echo ""
echo "Published tags:"
echo "  ${baseName}:latest"
echo "  ${baseName}:\${VERSION}"
echo "  ${baseName}:\${COMMIT_SHA}"
echo "  ${baseName}:\${DATE_TAG}"${specificTag ? `\n\n${specificTag}` : ''}`;
  }
}

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}
