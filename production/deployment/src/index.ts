import type { SukitKernel } from '@sukit/core';

export interface DeploymentConfig {
  appName: string;
  port: number;
  nodeVersion: string;
  registry: string;
  domains: { prod: string; staging: string; dev: string };
  cloudProvider: 'aws' | 'azure' | 'gcp' | 'digitalocean';
  dbConfig: { engine: 'postgres' | 'mysql'; version: string; port: number };
}

const DEFAULT_CONFIG: DeploymentConfig = {
  appName: 'sukit',
  port: 3042,
  nodeVersion: '20-alpine',
  registry: process.env.REGISTRY || 'ghcr.io/sukit',
  domains: {
    prod: 'app.sukit.dev',
    staging: 'staging.sukit.dev',
    dev: 'localhost',
  },
  cloudProvider: 'aws',
  dbConfig: { engine: 'postgres', version: '15', port: 5432 },
};

export class DeploymentSystem {
  private kernel: SukitKernel;
  private config: DeploymentConfig;

  constructor(kernel: SukitKernel, config?: Partial<DeploymentConfig>) {
    this.kernel = kernel;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateDockerfile(env: 'production' | 'development' = 'production'): string {
    const node = this.config.nodeVersion;
    const port = this.config.port;

    if (env === 'development') {
      return `FROM node:${node.replace('-alpine', '')}
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
EXPOSE ${port}
CMD ["pnpm", "dev"]`;
    }

    return `FROM node:${node} AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:${node} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${port}

RUN addgroup --system --gid 1001 sukit && adduser --system --uid 1001 sukit
COPY --from=builder --chown=sukit:sukit /app/apps/web/.next ./.next
COPY --from=builder --chown=sukit:sukit /app/apps/web/public ./public
COPY --from=builder --chown=sukit:sukit /app/apps/web/package.json ./package.json
COPY --from=builder --chown=sukit:sukit /app/node_modules ./node_modules
COPY --from=builder --chown=sukit:sukit /app/packages ./packages

USER sukit
EXPOSE ${port}
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:${port}/api/health || exit 1

CMD ["node", "apps/web/server.js"]`;
  }

  generateDockerCompose(
    env: 'production' | 'development' = 'development'
  ): string {
    const image = `${this.config.registry}/${this.config.appName}:latest`;
    const dbEngine = this.config.dbConfig.engine;
    const dbPort = this.config.dbConfig.port;
    const dbImage = dbEngine === 'postgres' ? 'postgres:15' : 'mysql:8';

    return `version: '3.8'
services:
  app:
    image: ${env === 'production' ? image : 'sukit-app:dev'}
    build:
      context: .
      dockerfile: Dockerfile
      target: ${env === 'production' ? 'runner' : 'builder'}
    ports: ["${this.config.port}:${this.config.port}"]
    environment:
      NODE_ENV: ${env}
      DATABASE_URL: "${dbEngine}://sukit:\${DB_PASSWORD}@db:${dbPort}/sukit"
      REDIS_URL: "redis://redis:6379"
      APP_URL: "http://localhost:${this.config.port}"
    depends_on:
      db: { condition: service_healthy }
      redis: { condition: service_healthy }
    volumes: ${env === 'development' ? '\n      - .:/app\n      - /app/node_modules' : ''}
    restart: unless-stopped
    networks: [sukit-network]
    deploy:
      resources:
        limits: { cpus: '1', memory: '1G' }
        reservations: { cpus: '0.25', memory: '256M' }

  db:
    image: ${dbImage}
    environment:
      ${
        dbEngine === 'postgres'
          ? `POSTGRES_USER: sukit\n      POSTGRES_PASSWORD: \${DB_PASSWORD}\n      POSTGRES_DB: sukit`
          : `MYSQL_ROOT_PASSWORD: \${DB_PASSWORD}\n      MYSQL_DATABASE: sukit\n      MYSQL_USER: sukit\n      MYSQL_PASSWORD: \${DB_PASSWORD}`
      }
    volumes: [db_data:/var/lib/${dbEngine === 'postgres' ? 'postgresql' : 'mysql'}/data]
    networks: [sukit-network]
    healthcheck:
      test: ${dbEngine === 'postgres' ? '["CMD-SHELL", "pg_isready -U sukit"]' : '["CMD", "mysqladmin", "ping", "-h", "localhost"]'}
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits: { cpus: '1', memory: '512M' }

  redis:
    image: redis:7-alpine
    networks: [sukit-network]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits: { cpus: '0.5', memory: '256M' }

volumes:
  db_data:

networks:
  sukit-network:
    driver: bridge`;
  }

  generateKubernetesHelm(): Record<string, string> {
    const app = this.config.appName;
    const port = this.config.port;
    const image = `${this.config.registry}/${app}:latest`;

    return {
      'Chart.yaml': `apiVersion: v2\nname: ${app}\ndescription: A Helm chart for SUKIT\nversion: 0.1.0\nappVersion: "1.0.0"`,
      'values.yaml': `replicaCount: 2\nimage:\n  repository: ${this.config.registry}/${app}\n  tag: latest\n  pullPolicy: Always\nservice:\n  type: ClusterIP\n  port: ${port}\ningress:\n  enabled: true\n  className: nginx\n  hosts: [{ host: ${this.config.domains.prod}, paths: [{ path: /, pathType: Prefix }] }]\n  tls: [{ hosts: [${this.config.domains.prod}], secretName: sukit-tls }]\nresources:\n  limits: { cpu: 1, memory: 1Gi }\n  requests: { cpu: 250m, memory: 256Mi }\nautoscaling:\n  enabled: true\n  minReplicas: 2\n  maxReplicas: 10\n  targetCPUUtilizationPercentage: 70\npostgresql:\n  enabled: true\n  auth:\n    database: sukit\n    username: sukit\nredis:\n  enabled: true\n  architecture: standalone`,
      'templates/_helpers.tpl': `{{- define "${app}.name" -}}{{ default .Chart.Name .Values.nameOverride | trunc 63 }}{{- end }}\n{{- define "${app}.fullname" -}}{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 }}{{- end }}`,
      'templates/deployment.yaml': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "${app}.fullname" . }}
  labels: { app: {{ include "${app}.name" . }} }
spec:
  replicas: {{ .Values.replicaCount }}
  selector: { matchLabels: { app: {{ include "${app}.name" . }} } }
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }
  template:
    metadata:
      labels: { app: {{ include "${app}.name" . }} }
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "${port}"
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: ${app}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports: [{ containerPort: ${port} }]
          env:
            - { name: NODE_ENV, value: "production" }
            - { name: DATABASE_URL, valueFrom: { secretKeyRef: { name: ${app}-secrets, key: database-url } } }
            - { name: REDIS_URL, valueFrom: { secretKeyRef: { name: ${app}-secrets, key: redis-url } } }
          livenessProbe: { httpGet: { path: /api/live, port: ${port} }, initialDelaySeconds: 10, periodSeconds: 10 }
          readinessProbe: { httpGet: { path: /api/ready, port: ${port} }, initialDelaySeconds: 5, periodSeconds: 5 }
          startupProbe: { httpGet: { path: /api/health, port: ${port} }, initialDelaySeconds: 3, periodSeconds: 3, failureThreshold: 10 }
          resources: {{ toYaml .Values.resources | nindent 12 }}`,
      'templates/service.yaml': `apiVersion: v1
kind: Service
metadata:
  name: {{ include "${app}.fullname" . }}
  labels: { app: {{ include "${app}.name" . }} }
spec:
  type: {{ .Values.service.type }}
  ports: [{ port: {{ .Values.service.port }}, targetPort: ${port} }]
  selector: { app: {{ include "${app}.name" . }} }`,
      'templates/ingress.yaml': `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "${app}.fullname" . }}
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: {{ .Values.ingress.className }}
  tls: {{ toYaml .Values.ingress.tls | nindent 4 }}
  rules: {{ toYaml .Values.ingress.hosts | nindent 4 }}`,
      'templates/hpa.yaml': `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "${app}.fullname" . }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "${app}.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }} }`,
      'templates/secrets.yaml': `apiVersion: v1
kind: Secret
metadata:
  name: ${app}-secrets
type: Opaque
stringData:
  database-url: "{{ .Values.postgresql.auth.database }}"
  redis-url: "redis://{{ .Release.Name }}-redis-master:6379"
  app-secret-key: "${require('crypto').randomBytes(32).toString('hex')}"`,
    };
  }

  generateTerraform(): Record<string, string> {
    return {
      'main.tf': `terraform {
  required_version = ">= 1.5"
  backend "s3" { bucket = "sukit-terraform-state", key = "prod/terraform.tfstate", region = "us-east-1" }
}

provider "aws" { region = var.aws_region }

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  name = "${this.config.appName}-vpc"
  cidr = "10.0.0.0/16"
  azs = ["\${var.aws_region}a", "\${var.aws_region}b"]
  public_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.11.0/24"]
  enable_nat_gateway = true
  enable_vpn_gateway = false
  tags = { Environment = "production" }
}

module "ecs" {
  source = "terraform-aws-modules/ecs/aws"
  cluster_name = "${this.config.appName}-cluster"
}

module "rds" {
  source = "terraform-aws-modules/rds/aws"
  identifier = "${this.config.appName}-db"
  engine = "${this.config.dbConfig.engine}"
  engine_version = "${this.config.dbConfig.version}"
  instance_class = "db.t3.medium"
  allocated_storage = 50
  db_name = "sukit"
  username = var.db_username
  password = var.db_password
  subnet_ids = module.vpc.private_subnets
  vpc_security_group_ids = [aws_security_group.rds.id]
  backup_retention_period = 30
  backup_window = "03:00-04:00"
  maintenance_window = "sun:04:00-sun:05:00"
  storage_encrypted = true
  deletion_protection = true
  skip_final_snapshot = false
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id = "${this.config.appName}-cache"
  engine = "redis"
  node_type = "cache.t3.micro"
  num_cache_nodes = 1
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
}

resource "aws_s3_bucket" "media" {
  bucket = "sukit-media-${random_string.suffix.result}"
  force_destroy = false
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled = true
  aliases = [var.domain_name]
  origin { domain_name = aws_s3_bucket.media.bucket_regional_domain_name, origin_id = "media" }
  default_cache_behavior {
    target_origin_id = "media"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    forwarded_values { query_string = false, cookies { forward = "none" } }
    min_ttl = 0
    default_ttl = 86400
    max_ttl = 31536000
  }
  viewer_certificate { acm_certificate_arn = var.certificate_arn, ssl_support_method = "sni-only" }
  restrictions { geo_restriction { restriction_type = "none" } }
}`,
      'variables.tf': `variable "aws_region" { default = "us-east-1" }\nvariable "db_username" { sensitive = true }\nvariable "db_password" { sensitive = true }\nvariable "domain_name" { default = "${this.config.domains.prod}" }\nvariable "certificate_arn" {}`,
      'outputs.tf': `output "rds_endpoint" { value = module.rds.db_instance_endpoint }\noutput "redis_endpoint" { value = aws_elasticache_cluster.redis.cache_nodes[0].address }\noutput "cdn_domain" { value = aws_cloudfront_distribution.cdn.domain_name }`,
      'random.tf': `resource "random_string" "suffix" { length = 8; special = false; upper = false }`,
    };
  }

  generateDeployScript(env: 'staging' | 'production' = 'staging'): string {
    return `#!/bin/bash
set -euo pipefail

ENV="${env}"
APP="${this.config.appName}"
TAG="\$(git rev-parse --short HEAD)"
IMAGE="${this.config.registry}/\${APP}:\${TAG}"

echo "=== Deploying \${APP} to \${ENV} ==="
echo "Tag: \${TAG}"

# Build and push Docker image
echo "Building Docker image..."
docker build -t \${IMAGE} -f Dockerfile .
docker push \${IMAGE}

# Update Kubernetes deployment
echo "Updating Kubernetes..."
kubectl set image deployment/\${APP} \${APP}=\${IMAGE} -n \${ENV}
kubectl rollout status deployment/\${APP} -n \${ENV}

# Run database migrations
echo "Running migrations..."
kubectl exec deploy/\${APP} -n \${ENV} -- npx prisma migrate deploy

# Health check
echo "Running health check..."
for i in {1..30}; do
  STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://\${ENV}.${this.config.domains.prod}/api/health)
  if [ "\$STATUS" = "200" ]; then
    echo "Health check passed!"
    exit 0
  fi
  sleep 2
done

echo "Health check failed!"
exit 1`;
  }

  generateDockerignore(): string {
    return `node_modules\n.next\ndist\n.git\n*.md\n.env*\n.gitignore\nDockerfile\ndocker-compose*\n*.log\ncoverage\nplaywright-report\nterraform\nkubernetes\n.pnpm-store`;
  }

  // ─── Blue-Green Deployment ────────────────────────────────────

  generateBlueGreenConfig(): Record<string, any> {
    return {
      strategy: 'blue-green',
      active: 'blue',
      services: {
        blue: {
          name: `${this.config.appName}-blue`,
          image: `${this.config.registry}/${this.config.appName}:blue`,
          replicas: 2,
          port: this.config.port,
        },
        green: {
          name: `${this.config.appName}-green`,
          image: `${this.config.registry}/${this.config.appName}:green`,
          replicas: 2,
          port: this.config.port,
        },
      },
      router: {
        type: 'service-mesh',
        provider: 'istio',
        virtualService: {
          hosts: [this.config.domains.prod],
          http: [
            {
              route: [
                { destination: { host: `${this.config.appName}-blue`, port: { number: this.config.port } }, weight: 100 },
                { destination: { host: `${this.config.appName}-green`, port: { number: this.config.port } }, weight: 0 },
              ],
            },
          ],
        },
      },
      cutover: {
        type: 'gradual',
        steps: [
          { weight: 10, duration: 60, verify: true },
          { weight: 25, duration: 120, verify: true },
          { weight: 50, duration: 180, verify: true },
          { weight: 75, duration: 120, verify: true },
          { weight: 100, duration: 60, verify: true },
        ],
        rollbackOnFailure: true,
        healthCheckPath: '/api/health',
        healthCheckTimeout: 30,
      },
      cleanup: {
        keepPreviousFor: 300,
        autoCleanup: true,
      },
    };
  }

  generateKubernetesBlueGreen(): Record<string, string> {
    const app = this.config.appName;
    const port = this.config.port;
    const image = `${this.config.registry}/${app}`;

    return {
      'blue-deployment.yaml': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${app}-blue
  labels: { app: ${app}, color: blue }
spec:
  replicas: 2
  selector: { matchLabels: { app: ${app}, color: blue } }
  template:
    metadata: { labels: { app: ${app}, color: blue } }
    spec:
      containers:
        - name: ${app}
          image: ${image}:blue
          ports: [{ containerPort: ${port} }]
          readinessProbe: { httpGet: { path: /api/ready, port: ${port} }, initialDelaySeconds: 5, periodSeconds: 5 }
          livenessProbe: { httpGet: { path: /api/live, port: ${port} }, initialDelaySeconds: 10, periodSeconds: 10 }`,
      'green-deployment.yaml': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${app}-green
  labels: { app: ${app}, color: green }
spec:
  replicas: 2
  selector: { matchLabels: { app: ${app}, color: green } }
  template:
    metadata: { labels: { app: ${app}, color: green } }
    spec:
      containers:
        - name: ${app}
          image: ${image}:green
          ports: [{ containerPort: ${port} }]
          readinessProbe: { httpGet: { path: /api/ready, port: ${port} }, initialSeconds: 5, periodSeconds: 5 }
          livenessProbe: { httpGet: { path: /api/live, port: ${port} }, initialDelaySeconds: 10, periodSeconds: 10 }`,
      'service.yaml': `apiVersion: v1
kind: Service
metadata:
  name: ${app}-service
  labels: { app: ${app} }
spec:
  type: ClusterIP
  ports: [{ port: ${port}, targetPort: ${port} }]
  selector: { app: ${app}, color: blue }`,
      'cutover.sh': `#!/bin/bash
set -euo pipefail
COLOR=$1
echo "Switching traffic to ${COLOR}..."
kubectl patch service ${app}-service -p "{\\"spec\\":{\\"selector\\":{\\"color\\":\\"${COLOR}\\"}}}"
echo "Waiting for health check..."
for i in {1..30}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${this.config.domains.prod}/api/health)
  if [ "$STATUS" = "200" ]; then
    echo "Health check passed! Traffic now on ${COLOR}."
    exit 0
  fi
  sleep 2
done
echo "Health check failed! Rolling back..."
kubectl patch service ${app}-service -p '{"spec":{"selector":{"color":"blue"}}}'
exit 1`,
    };
  }

  // ─── Canary Deployment ────────────────────────────────────────

  generateCanaryConfig(): Record<string, any> {
    return {
      strategy: 'canary',
      initialWeight: 5,
      maxWeight: 100,
      increment: 5,
      intervalSeconds: 120,
      metrics: {
        errorRateThreshold: 1,
        latencyP95Threshold: 2000,
        successRateThreshold: 99,
      },
      analysis: {
        duration: 300,
        interval: 60,
        successfulRuns: 3,
        failedRuns: 1,
      },
      notifications: {
        onPromotion: true,
        onFailure: true,
        channels: ['slack', 'email'],
      },
    };
  }

  generateFlaggerCanary(): string {
    return `apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: ${this.config.appName}
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${this.config.appName}
  service:
    port: ${this.config.port}
    targetPort: ${this.config.port}
    name: ${this.config.appName}-canary
    portDiscovery: true
  analysis:
    interval: 2m
    threshold: 1
    maxWeight: 50
    stepWeight: 5
    metrics:
      - name: error-rate
        templateRef:
          name: error-rate
          namespace: istio-system
        thresholdRange:
          max: 1
      - name: latency-p95
        templateRef:
          name: latency
          namespace: istio-system
        thresholdRange:
          max: 2000
    webhooks:
      - name: load-test
        url: http://flagger-loadtester.flagger:80/
        timeout: 5s
        metadata:
          cmd: "hey -z 1m -q 10 http://${this.config.appName}-canary:${this.config.port}/api/health"`;
  }

  // ─── Feature Flags ────────────────────────────────────────────

  generateFeatureFlagConfig(): Record<string, any> {
    return {
      provider: 'unleash',
      url: `${process.env.UNLEASH_URL || 'http://unleash:4242'}`,
      apiKey: process.env.UNLEASH_API_KEY || '',
      environment: process.env.NODE_ENV || 'development',
      refreshInterval: 30000,
      metricsInterval: 60000,
      flags: {
        'new-builder-ui': { enabled: false, description: 'New visual builder interface', owner: 'frontend-team' },
        'ai-content-generation': { enabled: false, description: 'AI-powered content generation', owner: 'ml-team' },
        'dark-mode': { enabled: false, description: 'Dark mode UI', owner: 'ux-team' },
        'multi-language': { enabled: false, description: 'Multi-language support', owner: 'platform-team' },
        'export-pdf': { enabled: false, description: 'PDF export feature', owner: 'export-team' },
        'analytics-dashboard': { enabled: false, description: 'New analytics dashboard', owner: 'analytics-team' },
        'collaboration': { enabled: false, description: 'Real-time collaboration', owner: 'platform-team' },
        'marketplace': { enabled: false, description: 'Module marketplace', owner: 'marketplace-team' },
      },
    };
  }

  generateLaunchDarklyConfig(): Record<string, any> {
    return {
      clientSideId: process.env.LAUNCH_DARKLY_CLIENT_ID || '',
      sdkKey: process.env.LAUNCH_DARKLY_SDK_KEY || '',
      streaming: true,
      pollingInterval: 30,
      flags: this.generateFeatureFlagConfig().flags,
    };
  }

  generateFeatureFlagMiddleware(): string {
    return `import { createHash } from 'crypto';

export class FeatureFlags {
  private flags: Map<string, { enabled: boolean; rules?: any[] }> = new Map();
  private userOverrides: Map<string, Map<string, boolean>> = new Map();

  constructor(initialFlags?: Record<string, any>) {
    if (initialFlags) {
      for (const [key, val] of Object.entries(initialFlags)) {
        this.flags.set(key, { enabled: val.enabled ?? false, rules: val.rules });
      }
    }
  }

  isEnabled(flag: string, user?: { id: string; email?: string; attributes?: Record<string, string> }): boolean {
    const config = this.flags.get(flag);
    if (!config) return false;
    if (user) {
      const override = this.userOverrides.get(user.id)?.get(flag);
      if (override !== undefined) return override;
      if (config.rules) {
        for (const rule of config.rules) {
          if (this.evaluateRule(rule, user)) return true;
        }
      }
      if (config.enabled && user.id) {
        const hash = createHash('md5').update(flag + ':' + user.id).digest('hex');
        const bucket = parseInt(hash.substring(0, 8), 16) % 100;
        return bucket < (config.rolloutPercentage || 100);
      }
    }
    return config.enabled;
  }

  private evaluateRule(rule: any, user: { id: string; attributes?: Record<string, string> }): boolean {
    if (rule.type === 'percentage') {
      const hash = createHash('md5').update(rule.flag + ':' + user.id).digest('hex');
      const bucket = parseInt(hash.substring(0, 8), 16) % 100;
      return bucket < rule.value;
    }
    if (rule.type === 'attribute' && user.attributes) {
      return user.attributes[rule.attribute] === rule.value;
    }
    return false;
  }

  setOverride(userId: string, flag: string, enabled: boolean): void {
    if (!this.userOverrides.has(userId)) this.userOverrides.set(userId, new Map());
    this.userOverrides.get(userId)!.set(flag, enabled);
  }

  getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    for (const [key, val] of this.flags) result[key] = val.enabled;
    return result;
  }
}`;
  }

  // ─── A/B Testing Infrastructure ───────────────────────────────

  generateABTestingConfig(): Record<string, any> {
    return {
      provider: 'growthbook',
      url: process.env.GROWTHBOOK_URL || 'http://growthbook:3000',
      apiKey: process.env.GROWTHBOOK_API_KEY || '',
      experiments: [
        { key: 'builder-layout', variants: ['classic', 'modern', 'compact'], weights: [0.33, 0.33, 0.34] },
        { key: 'signup-flow', variants: ['standard', 'simplified', 'social-first'], weights: [0.5, 0.3, 0.2] },
        { key: 'pricing-page', variants: ['control', 'new-design'], weights: [0.5, 0.5] },
        { key: 'onboarding', variants: ['tutorial', 'interactive', 'video'], weights: [0.4, 0.4, 0.2] },
      ],
      metrics: ['conversion', 'engagement', 'retention', 'revenue'],
      minimumSampleSize: 1000,
      confidenceLevel: 0.95,
    };
  }

  // ─── Preview Environments ─────────────────────────────────────

  generatePreviewEnvironmentConfig(): Record<string, any> {
    return {
      enabled: true,
      provider: 'github-pages',
      domainPattern: 'pr-{number}.preview.sukit.dev',
      ttl: 7200,
      autoCleanup: true,
      resources: { cpu: '0.5', memory: '512Mi' },
      environmentVariables: {
        NODE_ENV: 'preview',
        APP_URL: 'https://pr-{number}.preview.sukit.dev',
      },
    };
  }

  // ─── Rollback Mechanism ───────────────────────────────────────

  generateRollbackScript(): string {
    return `#!/bin/bash
set -euo pipefail

ENV="\${1:-production}"
APP="${this.config.appName}"
PREVIOUS_TAG="\${2:-}"

echo "=== Rolling back \${APP} on \${ENV} ==="

if [ -z "\${PREVIOUS_TAG}" ]; then
  echo "Fetching previous deployment..."
  PREVIOUS_TAG=$(kubectl rollout history deployment/\${APP} -n \${ENV} | tail -2 | head -1 | awk '{print $1}')
  if [ -z "\${PREVIOUS_TAG}" ]; then
    echo "No previous revision found!"
    exit 1
  fi
fi

echo "Rolling back to revision: \${PREVIOUS_TAG}"
kubectl rollout undo deployment/\${APP} -n \${ENV} --to-revision=\${PREVIOUS_TAG}

echo "Waiting for rollback to complete..."
kubectl rollout status deployment/\${APP} -n \${ENV} --timeout=300s

echo "Running health check..."
for i in {1..30}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://\${ENV}.${this.config.domains.prod}/api/health)
  if [ "\$STATUS" = "200" ]; then
    echo "Rollback successful! Health check passed."
    exit 0
  fi
  sleep 2
done

echo "Rollback health check failed!"
exit 1`;
  }

  getRollbackStrategy(): Record<string, any> {
    return {
      type: 'rolling',
      maxRollbackRevisions: 5,
      autoRollbackOnHealthCheckFailure: true,
      healthCheckRetries: 3,
      notificationOnRollback: true,
      preserveDatabaseMigrations: true,
    };
  }

  // ─── Docker Push Script ───────────────────────────────────────

  generateDockerPushScript(options: { tag?: string; registry?: string; buildArgs?: Record<string, string> } = {}): string {
    const registry = options.registry || this.config.registry;
    const tag = options.tag || '$(git rev-parse --short HEAD)';
    const buildArgs = options.buildArgs || {};
    const argsStr = Object.entries(buildArgs).map(([k, v]) => `--build-arg ${k}=${v}`).join(' ');
    return `#!/bin/bash
set -euo pipefail

APP="${this.config.appName}"
REGISTRY="${registry}"
TAG="${tag}"

echo "=== Building Docker image ==="
docker build \\
  -t \${REGISTRY}/\${APP}:\${TAG} \\
  -t \${REGISTRY}/\${APP}:latest \\
  ${argsStr} \\
  -f Dockerfile .

echo "=== Pushing to registry ==="
docker push \${REGISTRY}/\${APP}:\${TAG}
docker push \${REGISTRY}/\${APP}:latest

echo "=== Verifying manifest ==="
docker manifest inspect \${REGISTRY}/\${APP}:\${TAG} > /dev/null

echo "✅ Docker image pushed: \${REGISTRY}/\${APP}:\${TAG}"`;
  }

  // ─── Kubernetes Deploy Script ─────────────────────────────────

  generateK8sDeployScript(options: { manifestDir?: string; namespace?: string; rollbackOnFailure?: boolean } = {}): string {
    const manifestDir = options.manifestDir || './kubernetes';
    const namespace = options.namespace || 'production';
    return `#!/bin/bash
set -euo pipefail

NAMESPACE="${namespace}"
MANIFEST_DIR="${manifestDir}"
APP="${this.config.appName}"
TAG="$(git rev-parse --short HEAD)"
ROLLBACK_ON_FAILURE=${options.rollbackOnFailure !== false}

echo "=== Deploying \${APP} to Kubernetes ==="

# Backup current manifests for rollback
BACKUP_DIR="/tmp/k8s-backup-\$(date +%s)"
mkdir -p \${BACKUP_DIR}
kubectl get deployment \${APP} -n \${NAMESPACE} -o yaml > \${BACKUP_DIR}/deployment.yaml 2>/dev/null || true
kubectl get service \${APP} -n \${NAMESPACE} -o yaml > \${BACKUP_DIR}/service.yaml 2>/dev/null || true
kubectl get ingress \${APP} -n \${NAMESPACE} -o yaml > \${BACKUP_DIR}/ingress.yaml 2>/dev/null || true

# Apply manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f \${MANIFEST_DIR}/ -n \${NAMESPACE}

# Update image
kubectl set image deployment/\${APP} \${APP}=\${REGISTRY:-${this.config.registry}}/\${APP}:\${TAG} -n \${NAMESPACE}

# Wait for rollout
echo "Waiting for rollout to complete..."
if ! kubectl rollout status deployment/\${APP} -n \${NAMESPACE} --timeout=300s; then
  echo "❌ Rollout failed!"
  if [ "\${ROLLBACK_ON_FAILURE}" = true ]; then
    echo "Rolling back to previous version..."
    kubectl apply -f \${BACKUP_DIR}/ -n \${NAMESPACE} 2>/dev/null || true
    kubectl rollout status deployment/\${APP} -n \${NAMESPACE} --timeout=120s
  fi
  exit 1
fi

# Run migrations
echo "Running database migrations..."
kubectl exec deploy/\${APP} -n \${NAMESPACE} -- npx prisma migrate deploy 2>/dev/null || echo "No migrations to run"

# Health check
echo "Running health check..."
for i in {1..30}; do
  STATUS=$(kubectl exec deploy/\${APP} -n \${NAMESPACE} -- curl -s -o /dev/null -w "%{http_code}" http://localhost:${this.config.port}/api/health 2>/dev/null || echo "000")
  if [ "\$STATUS" = "200" ]; then
    echo "✅ Deployment successful!"
    exit 0
  fi
  sleep 2
done

echo "❌ Health check failed!"
exit 1`;
  }

  // ─── Terraform Apply Script ───────────────────────────────────

  generateTerraformApplyScript(options: { autoApprove?: boolean; varFile?: string; backend?: boolean } = {}): string {
    return `#!/bin/bash
set -euo pipefail

echo "=== Terraform Plan & Apply ==="

# Initialize backend
${options.backend !== false ? 'echo "Initializing Terraform backend..."
terraform init -upgrade -input=false' : ''}

# Select workspace
WORKSPACE="\${1:-production}"
terraform workspace select \${WORKSPACE} 2>/dev/null || terraform workspace new \${WORKSPACE}

# Validate configuration
echo "Validating Terraform configuration..."
terraform validate

# Generate plan
echo "Generating Terraform plan..."
PLAN_FILE="/tmp/tf-plan-\$(date +%s).tfplan"
terraform plan \\
  -input=false \\
  ${options.varFile ? `-var-file="${options.varFile}" \\` : ''}
  -out=\${PLAN_FILE}

# Show plan summary
terraform show -no-color \${PLAN_FILE} | head -50

# Apply
if [ "${options.autoApprove}" = true ]; then
  echo "Applying Terraform plan (auto-approved)..."
  terraform apply -input=false -auto-approve \${PLAN_FILE}
else
  echo "Apply Terraform plan? (y/n)"
  read -r CONFIRM
  if [ "\$CONFIRM" = "y" ] || [ "\$CONFIRM" = "Y" ]; then
    terraform apply -input=false \${PLAN_FILE}
  else
    echo "Apply cancelled"
    exit 0
  fi
fi

echo "✅ Terraform apply complete"
rm -f \${PLAN_FILE}`;
  }

  // ─── Deployment Notification ─────────────────────────────────

  generateDeploymentNotification(options: { channels?: ('slack' | 'email')[]; includeCommitInfo?: boolean; includeChanges?: boolean } = {}): Record<string, any> {
    const channels = options.channels || ['slack', 'email'];
    const notification: Record<string, any> = {};
    const appName = this.config.appName;

    if (channels.includes('slack')) {
      notification.slack = {
        webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
        channel: '#deployments',
        template: {
          blocks: [
            { type: 'header', text: { type: 'plain_text', text: ':rocket: New Deployment' } },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: '*App:* ' + appName },
                { type: 'mrkdwn', text: '*Environment:* ' + (options.includeCommitInfo ? 'production' : '') },
                { type: 'mrkdwn', text: '*Version:* `\\$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")`' },
                { type: 'mrkdwn', text: '*Deployed by:* `\\$(whoami)`' },
                { type: 'mrkdwn', text: '*Timestamp:* `\\$(date -u +"%Y-%m-%dT%H:%M:%SZ")`' },
              ],
            },
            ...(options.includeChanges ? [{
              type: 'section',
              text: { type: 'mrkdwn', text: '*Recent Changes:*\\n\\$(git log --oneline -5 2>/dev/null || echo "N/A")' },
            }] : []),
            { type: 'context', elements: [{ type: 'mrkdwn', text: '<https://app.sukit.dev|SUKIT Dashboard> | <https://github.com/sukit/sukit/actions|View Pipeline>' }] },
          ],
        },
      };
    }

    if (channels.includes('email')) {
      notification.email = {
        recipients: process.env.DEPLOY_NOTIFY_EMAILS ? process.env.DEPLOY_NOTIFY_EMAILS.split(',') : ['devops@sukit.dev'],
        subject: 'Deployment: ' + appName + ' - \\$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")',
        template: 'Deployment Notification\n' +
          'App: ' + appName + '\n' +
          'Version: \\$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")\n' +
          'Environment: production\n' +
          'Timestamp: \\$(date -u +"%Y-%m-%dT%H:%M:%SZ")\n' +
          'Deployed by: \\$(whoami)\n\n' +
          'Recent Changes:\n' +
          '\\$(git log --oneline -10 2>/dev/null || echo "N/A")\n\n' +
          'Dashboard: https://app.sukit.dev\n' +
          'Pipeline: https://github.com/sukit/sukit/actions',
      };
    }

    return notification;
  }

  healthCheck(): Promise<{ status: string; checks: Record<string, boolean> }> {
    const checks: Record<string, boolean> = {
      database: false,
      redis: false,
      api: false,
    };
    return Promise.resolve({ status: 'ok', checks });
  }
}
