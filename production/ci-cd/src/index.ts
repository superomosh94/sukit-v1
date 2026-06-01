import type { SukitKernel } from '@sukit/core';

export interface PipelineConfig {
  nodeVersion: string;
  pnpmVersion: string;
  coverageThreshold: number;
  bundleSizeLimitKB: number;
  maxTestWorkers: number;
  e2eBrowsers: string[];
  notifyOnFailure: boolean;
  deployEnvironments: { name: string; branch: string; auto: boolean }[];
}

const DEFAULT_CONFIG: PipelineConfig = {
  nodeVersion: '20',
  pnpmVersion: '8',
  coverageThreshold: 80,
  bundleSizeLimitKB: 204800,
  maxTestWorkers: 4,
  e2eBrowsers: ['chromium', 'firefox', 'webkit'],
  notifyOnFailure: true,
  deployEnvironments: [
    { name: 'staging', branch: 'develop', auto: true },
    { name: 'production', branch: 'main', auto: true },
  ],
};

export class CICDPipeline {
  private kernel: SukitKernel;
  private config: PipelineConfig;

  constructor(kernel: SukitKernel, config?: Partial<PipelineConfig>) {
    this.kernel = kernel;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateGitHubActions(): Record<string, string> {
    return {
      'ci.yml': `name: CI
on:
  push: { branches: [${this.config.deployEnvironments.map((e) => e.branch).join(', ')}] }
  pull_request: { branches: [${this.config.deployEnvironments
    .filter((e) => e.name === 'production')
    .map((e) => e.branch)
    .join(', ')}] }
  schedule: [{ cron: '0 2 * * *' }]
  workflow_dispatch: {}
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true
env:
  NODE_VERSION: '${this.config.nodeVersion}'
  PNPM_VERSION: '${this.config.pnpmVersion}'

jobs:
  quality:
    name: Quality Gates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: \${{ env.PNPM_VERSION }} }
      - uses: actions/setup-node@v4
        with: { node-version: \${{ env.NODE_VERSION }}, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm audit --audit-level=high
      - name: Bundle Size Check
        run: |
          SIZE=\$(du -sk apps/web/.next 2>/dev/null | cut -f1 || echo "0")
          echo "Bundle size: \${SIZE}KB"
          if [ "\$SIZE" -gt ${this.config.bundleSizeLimitKB} ]; then echo "❌ Exceeds limit"; exit 1; fi

  test:
    name: Tests
    needs: quality
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env: { POSTGRES_USER: sukit, POSTGRES_PASSWORD: test, POSTGRES_DB: sukit_test }
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
      redis:
        image: redis:7
        options: --health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 5
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: \${{ env.PNPM_VERSION }} }
      - uses: actions/setup-node@v4
        with: { node-version: \${{ env.NODE_VERSION }}, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:generate && pnpm db:push
      - run: pnpm test -- --shard=\${{ matrix.shard }}/\${{ strategy.job-total }} --coverage
        env:
          DATABASE_URL: postgresql://sukit:test@localhost:5432/sukit_test
          REDIS_URL: redis://localhost:6379
      - name: Coverage Gate
        run: |
          LINES=\$(grep -oP '"lines":\\s*\\K[0-9.]+' coverage/coverage-summary.json 2>/dev/null || echo "0")
          if (( \$(echo "\$LINES < ${this.config.coverageThreshold}" | bc -l) )); then
            echo "❌ Coverage \$LINES% < ${this.config.coverageThreshold}%"; exit 1
          fi

  e2e:
    name: E2E Tests
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps ${this.config.e2eBrowsers.join(' ')}
      - run: pnpm test:e2e

  security:
    name: Security Scan
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - name: Dependency Scan
        run: npx snyk test --severity-threshold=high || true
      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with: { languages: javascript-typescript }
      - name: Secret Scanning
        uses: trufflesecurity/trufflehog@v3
        with: { extra_args: --only-verified }

  docker:
    name: Docker Build
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: \${{ github.actor }}, password: \${{ secrets.GITHUB_TOKEN }} }
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/\${{ github.repository_owner }}/sukit
          tags: |-
            type=ref,event=branch
            type=sha,format=short
            type=semver,pattern={{version}}
            type=raw,value=latest,enable=\${{ github.ref == 'refs/heads/main' }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy
    needs: [docker, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Kubernetes
        run: |
          TAG=\$(git rev-parse --short HEAD)
          kubectl set image deployment/sukit sukit=ghcr.io/\${{ github.repository_owner }}/sukit:\${TAG} -n production
          kubectl rollout status deployment/sukit -n production --timeout=300s
      - name: Run Migrations
        run: npx prisma migrate deploy
      - name: Health Check
        run: |
          for i in \$(seq 1 30); do
            STATUS=\$(curl -s -o /dev/null -w "%{http_code}" https://app.sukit.dev/api/health)
            if [ "\$STATUS" = "200" ]; then echo "✅ Deploy OK"; exit 0; fi
            sleep 5
          done; echo "❌ Failed"; exit 1
      - name: Notify Slack
        if: \${{ failure() }}
        uses: slackapi/slack-github-action@v2
        with:
          webhook: \${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |-
            {"text": "❌ Deploy to production failed! <\${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}|View logs>"}`,

      'deploy-staging.yml': `name: Deploy Staging
on: { push: { branches: [develop] } }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - run: |
          TAG=\$(git rev-parse --short HEAD)
          kubectl set image deployment/sukit sukit=ghcr.io/\${{ github.repository_owner }}/sukit:\${TAG} -n staging
          kubectl rollout status deployment/sukit -n staging
          npx prisma migrate deploy`,

      'preview.yml': `name: Preview Deploy
on: { pull_request: { types: [opened, synchronize, reopened] } }
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Preview
        run: |
          PR_NUM=\${{ github.event.number }}
          kubectl set image deployment/sukit-preview-\${PR_NUM} sukit=ghcr.io/\${{ github.repository_owner }}/sukit:pr-\${PR_NUM} -n previews || true
      - name: Comment Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner, repo: context.repo.repo,
              issue_number: context.issue.number,
              body: 'Preview deployed at: https://preview-\${PR_NUM}.app.sukit.dev'
            })`,

      'renovate.json': `{
  "\$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base", ":dependencyDashboard"],
  "packageRules": [
    { "matchUpdateTypes": ["patch"], "automerge": true, "groupName": "patch" },
    { "matchDepTypes": ["devDependencies"], "automerge": true, "groupName": "devDeps" },
    { "matchPackageNames": ["react", "next"], "groupName": "framework" },
    { "matchPackageNames": ["@sukit/*"], "groupName": "sukit-packages" }
  ],
  "vulnerabilityAlerts": { "enabled": true },
  "labels": ["dependencies"],
  "schedule": ["before 9am on Monday"]
}`,
    };
  }

  generateGitLabCI(): string {
    return `image: node:${this.config.nodeVersion}

cache:
  key: \${CI_COMMIT_REF_SLUG}
  paths: [node_modules/, .pnpm-store/]

variables:
  PNPM_VERSION: '${this.config.pnpmVersion}'
  DATABASE_URL: 'postgresql://sukit:test@postgres:5432/sukit_test'
  REDIS_URL: 'redis://redis:6379'

stages: [lint, test, security, build, deploy]

lint:
  stage: lint
  script:
    - npm install -g pnpm@\${PNPM_VERSION}
    - pnpm install --frozen-lockfile
    - pnpm lint
    - pnpm typecheck

test:
  stage: test
  services:
    - postgres:15
    - redis:7
  script:
    - npm install -g pnpm@\${PNPM_VERSION}
    - pnpm install --frozen-lockfile
    - pnpm db:generate && pnpm db:push
    - pnpm test -- --coverage
    - |
      LINES=\$(grep -oP '"lines":\\s*\\K[0-9.]+' coverage/coverage-summary.json)
      if (( \$(echo "\$LINES < ${this.config.coverageThreshold}" | bc -l) )); then
        echo "Coverage below threshold"; exit 1
      fi
  coverage: /\"lines\":\s*([0-9.]+)/

security:
  stage: security
  script:
    - npm install -g pnpm@\${PNPM_VERSION}
    - pnpm install --frozen-lockfile
    - pnpm audit --audit-level=high

build:
  stage: build
  script:
    - npm install -g pnpm@\${PNPM_VERSION}
    - pnpm install --frozen-lockfile
    - pnpm build
  artifacts:
    paths: [apps/web/.next]

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/sukit sukit=\${CI_REGISTRY_IMAGE}:\${CI_COMMIT_SHORT_SHA} -n production
    - kubectl rollout status deployment/sukit -n production
  only: [main]
  environment: production`;
  }

  generateJenkinsfile(): string {
    return `pipeline {
  agent { docker { image 'node:${this.config.nodeVersion}-alpine' } }
  stages {
    stage('Install') { steps { sh 'npm install -g pnpm && pnpm install --frozen-lockfile' } }
    stage('Lint') { steps { sh 'pnpm lint && pnpm typecheck' } }
    stage('Test') {
      steps { sh 'pnpm test -- --coverage' }
      post { always { junit 'coverage/junit.xml'; publishHTML([reportDir: 'coverage', reportFiles: 'index.html']) } }
    }
    stage('Security') { steps { sh 'pnpm audit --audit-level=high' } }
    stage('Build') { steps { sh 'pnpm build' } }
    stage('Deploy') {
      when { branch 'main' }
      steps { sh 'kubectl set image deployment/sukit sukit=\${IMAGE_TAG}' }
    }
  }
  post {
    failure { slackSend(color: 'danger', message: "Pipeline failed: \${env.BUILD_URL}") }
    success { slackSend(color: 'good', message: "Pipeline succeeded: \${env.BUILD_URL}") }
  }
}`;
  }

  generateCircleCI(): string {
    return `version: 2.1
orbs: { node: circleci/node@5, docker: circleci/docker@2 }
jobs:
  test:
    docker:
      - image: cimg/node:${this.config.nodeVersion}
      - image: postgres:15
        environment: { POSTGRES_USER: sukit, POSTGRES_PASSWORD: test, POSTGRES_DB: sukit_test }
      - image: redis:7
    steps:
      - checkout
      - node/install-packages: { pnpm: { version: '${this.config.pnpmVersion}' } }
      - run: pnpm test -- --coverage
  deploy:
    docker: [image: cimg/base:stable]
    steps:
      - checkout
      - run: kubectl set image deployment/sukit sukit=\${CIRCLE_SHA1} -n production
workflows:
  version: 2
  ci-cd:
    jobs:
      - test
      - deploy:
          requires: [test]
          filters: { branches: { only: main } }`;
  }

  generateStatusBadges(): string {
    return `[![CI](https://github.com/sukit/sukit/actions/workflows/ci.yml/badge.svg)](https://github.com/sukit/sukit/actions)
[![Coverage](https://codecov.io/gh/sukit/sukit/branch/main/graph/badge.svg)](https://codecov.io/gh/sukit/sukit)
[![Security](https://github.com/sukit/sukit/actions/workflows/security.yml/badge.svg)](https://github.com/sukit/sukit/actions)
[![Docker](https://ghcr.io/sukit/sukit/badge.svg)](https://ghcr.io/sukit/sukit)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Snyk](https://snyk.io/test/github/sukit/sukit/badge.svg)](https://snyk.io/test/github/sukit/sukit)`;
  }

  generateReleasePleaseConfig(): string {
    return `{
  "release-type": "node",
  "packages": {
    ".": { "release-type": "simple" },
    "packages/core": {},
    "packages/shell-ui": {},
    "packages/marketplace": {}
  },
  "plugins": ["sentence-case"],
  "bump-minor-pre-major": true,
  "bump-patch-for-minor-pre-major": true,
  "include-v-in-tag": true,
  "changelog-sections": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "perf", "section": "Performance" },
    { "type": "security", "section": "Security" },
    { "type": "deps", "section": "Dependencies" }
  ]
}`;
  }
}
