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
}
