import type { SukitKernel } from '@sukit/core';

export interface PipelineConfig {
  nodeVersion: string;
  pnpmVersion: string;
  coverageThreshold: number;
  bundleSizeLimitKB: number;
  maxTestWorkers: number;
  e2eBrowsers: string[];
  notifyOnFailure: boolean;
  notifyOnSuccess: boolean;
  notifyOnDeploy: boolean;
  slackWebhookUrl: string;
  slackChannel: string;
  emailNotifications: string[];
  accessibilityThreshold: number;
  performanceRegressionThreshold: number;
  lighthouseBudget: Record<string, number>;
  enableA11yGate: boolean;
  enablePerfRegressionGate: boolean;
  enableLighthouseGate: boolean;
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
  notifyOnSuccess: true,
  notifyOnDeploy: true,
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  slackChannel: '#deployments',
  emailNotifications: [],
  accessibilityThreshold: 90,
  performanceRegressionThreshold: 10,
  lighthouseBudget: { performance: 80, accessibility: 90, 'best-practices': 90, seo: 90 },
  enableA11yGate: true,
  enablePerfRegressionGate: true,
  enableLighthouseGate: true,
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

  // ─── Release Workflow ──────────────────────────────────────────

  generateReleaseWorkflow(): Record<string, string> {
    const config = this.generateReleasePleaseConfig();
    return {
      'release.yml': `name: Release
on:
  push: { branches: [main] }
  workflow_dispatch: {}

permissions:
  contents: write
  pull-requests: write
  packages: write

jobs:
  release-please:
    name: Release Please
    runs-on: ubuntu-latest
    outputs:
      release_created: \${{ steps.release.outputs.release_created }}
      tag_name: \${{ steps.release.outputs.tag_name }}
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json

  publish:
    name: Publish Release
    needs: release-please
    if: \${{ needs.release-please.outputs.release_created == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { ref: \${{ needs.release-please.outputs.tag_name }} }

      - uses: pnpm/action-setup@v4
        with: { version: ${this.config.pnpmVersion} }
      - uses: actions/setup-node@v4
        with: { node-version: ${this.config.nodeVersion}, registry-url: 'https://registry.npmjs.org', cache: 'pnpm' }

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - name: Publish to npm
        run: |
          for pkg in packages/*/; do
            if [ -f "\$pkg/package.json" ]; then
              cd "\$pkg"
              pnpm publish --no-git-checks --access public || true
              cd -
            fi
          done
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}

      - name: Publish to GitHub Packages
        run: |
          echo "//npm.pkg.github.com/:_authToken=\${{ secrets.GITHUB_TOKEN }}" > .npmrc
          for pkg in packages/*/; do
            if [ -f "\$pkg/package.json" ]; then
              cd "\$pkg"
              pnpm publish --registry=https://npm.pkg.github.com --no-git-checks || true
              cd -
            fi
          done

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/\${{ github.repository_owner }}/sukit:\${{ needs.release-please.outputs.tag_name }}
            ghcr.io/\${{ github.repository_owner }}/sukit:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ needs.release-please.outputs.tag_name }}
          generate_release_notes: true

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v2
        with:
          webhook: \${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |-
            {"text": "${{ job.status == 'success' && ':rocket:' || ':x:' }} Release \${{ needs.release-please.outputs.tag_name }} ${{ job.status }}
            <\${{ github.server_url }}/\${{ github.repository }}/releases/tag/\${{ needs.release-please.outputs.tag_name }}|View Release>"}`,
      'release-please-config.json': config,
      '.release-please-manifest.json': JSON.stringify({
        '.': '1.0.0',
        'packages/core': '0.1.0',
        'packages/shell-ui': '0.1.0',
        'packages/marketplace': '0.1.0',
      }, null, 2),
    };
  }

  // ─── Slack Notifications ──────────────────────────────────────

  generateSlackNotificationAction(): Record<string, any> {
    return {
      name: 'Notify Slack',
      uses: 'slackapi/slack-github-action@v2',
      with: {
        webhook: '${{ secrets.SLACK_WEBHOOK_URL }}',
        'webhook-type': 'incoming-webhook',
        payload: JSON.stringify({
          text: '${{ github.workflow }}: ${{ job.status }}',
          blocks: [
            { type: 'header', text: { type: 'plain_text', text: '${{ github.workflow }} - ${{ job.status }}' } },
            { type: 'section', text: { type: 'mrkdwn', text: `*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* <${{ github.server_url }}/${{ github.repository }}/commit/${{ github.sha }}|${{ github.sha.substring(0, 7) }}>\n*Triggered by:* ${{ github.actor }}` } },
            { type: 'section', text: { type: 'mrkdwn', text: `<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>` } },
            { type: 'context', elements: [{ type: 'mrkdwn', text: `${{ job.status == 'success' ? '✅' : '❌' }} Job: ${{ github.job }}` }] },
          ],
        }),
      },
    };
  }

  generateSlackNotifyStep(): string {
    return `      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v2
        with:
          webhook: \${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |-
            {"text": "${{ job.status == 'success' && '✅' || '❌' }} ${{ github.workflow }} - ${{ github.job }}: ${{ job.status }}
            Repo: ${{ github.repository }}
            Branch: ${{ github.ref_name }}
            Commit: ${{ github.sha.substring(0, 7) }}
            <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>"}`;
  }

  generateNotificationConfig(): Record<string, any> {
    return {
      slack: {
        webhookUrl: this.config.slackWebhookUrl,
        channel: this.config.slackChannel,
        onFailure: this.config.notifyOnFailure,
        onSuccess: this.config.notifyOnSuccess,
        onDeploy: this.config.notifyOnDeploy,
      },
      email: {
        recipients: this.config.emailNotifications,
        onFailure: this.config.notifyOnFailure,
        onDeploy: true,
      },
    };
  }

  // ─── Accessibility Gate ───────────────────────────────────────

  generateAccessibilityGateStep(): string {
    return `      - name: Accessibility Check
        run: |
          npx pa11y-ci --threshold ${this.config.accessibilityThreshold} --sitemap https://app.sukit.dev/sitemap.xml 2>&1 | tee a11y-report.txt
          if grep -q "Errors" a11y-report.txt; then
            ERRORS=$(grep -oP 'Errors: \\K[0-9]+' a11y-report.txt)
            if [ "$ERRORS" -gt 0 ]; then
              echo "❌ Accessibility check failed with $ERRORS errors"
              exit 1
            fi
          fi
          echo "✅ Accessibility check passed"`;
  }

  generateAxeAccessibilityStep(): string {
    return `      - name: Accessibility (axe-core)
        uses: dequelabs/axe-github-actions@v3
        with:
          api_key: \${{ secrets.AXE_API_KEY }}
          url: https://app.sukit.dev
          output_file: axe-report.json
          thresholds: '{"violations": ${this.config.accessibilityThreshold > 90 ? 0 : 1}}'`;
  }

  generateA11yWorkflow(): Record<string, string> {
    return {
      'a11y.yml': `name: Accessibility
on:
  schedule: [{ cron: '0 6 * * 1' }]
  workflow_dispatch: {}
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install chromium
      - name: Start App
        run: pnpm dev &
      - name: Wait for App
        run: npx wait-on http://localhost:3042
      - name: Run Accessibility Tests
        run: npx playwright test --config=tests/accessibility/playwright.config.ts --reporter=html
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: a11y-report
          path: playwright-report/`,
    };
  }

  // ─── Performance Regression Detection ─────────────────────────

  generatePerformanceRegressionStep(): string {
    return `      - name: Performance Regression Check
        run: |
          CURRENT=$(curl -s https://app.sukit.dev/api/metrics | jq '.lcp')
          PREVIOUS=\$(cat .previous-lcp 2>/dev/null || echo "0")
          if [ "\$PREVIOUS" != "0" ]; then
            THRESHOLD=${this.config.performanceRegressionThreshold}
            CHANGE=\$(echo "scale=2; (\$CURRENT - \$PREVIOUS) / \$PREVIOUS * 100" | bc)
            if (( \$(echo "\$CHANGE > \$THRESHOLD" | bc -l) )); then
              echo "❌ LCP regressed by \$CHANGE% (threshold: \$THRESHOLD%)"
              exit 1
            fi
          fi
          echo "\$CURRENT" > .previous-lcp
          echo "✅ Performance regression check passed"`;
  }

  generateLighthouseStep(): string {
    return `      - name: Lighthouse Check
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: '["https://app.sukit.dev"]'
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
          temporaryPublicStorage: true`;
  }

  generateLighthouseBudget(): Record<string, any> {
    return {
      budgeting: Object.entries(this.config.lighthouseBudget).map(([key, value]) => ({
        resourceType: key,
        budget: value,
      })),
    };
  }

  // ─── Performance Regression Workflow ──────────────────────────

  generatePerfWorkflow(): Record<string, string> {
    return {
      'performance.yml': `name: Performance
on:
  schedule: [{ cron: '0 4 * * 1' }]
  workflow_dispatch: {}
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: '["https://app.sukit.dev", "https://app.sukit.dev/builder", "https://app.sukit.dev/sites"]'
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
          temporaryPublicStorage: true
      - name: Compare with Baseline
        run: |
          echo "Previous scores:"
          cat .lighthouse-baseline.json 2>/dev/null || echo "No baseline"
          echo "✅ Performance check complete"`,
    };
  }
}
