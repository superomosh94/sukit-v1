import type { SukitKernel } from '@sukit/core';

export interface TestConfig {
  coverageThreshold: number;
  testTimeout: number;
  maxWorkers: number;
  retryFlakyTests: number;
  testMatch: string[];
  setupFiles: string[];
  globalSetup: string;
  globalTeardown: string;
  reporters: string[];
  testEnvironment: 'jsdom' | 'node';
}

const DEFAULT_CONFIG: TestConfig = {
  coverageThreshold: 80,
  testTimeout: 10000,
  maxWorkers: 4,
  retryFlakyTests: 2,
  testMatch: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'],
  setupFiles: [],
  globalSetup: '',
  globalTeardown: '',
  reporters: ['default'],
  testEnvironment: 'node',
};

export class TestSuite {
  private kernel: SukitKernel;
  private config: TestConfig;

  constructor(kernel: SukitKernel, config?: Partial<TestConfig>) {
    this.kernel = kernel;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateJestConfig(): Record<string, any> {
    return {
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/src'],
      testMatch: this.config.testMatch,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@sukit/(.*)$': '<rootDir>/../../packages/$1/src',
      },
      transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
      setupFilesAfterSetup: this.config.setupFiles,
      globalSetup: this.config.globalSetup || undefined,
      globalTeardown: this.config.globalTeardown || undefined,
      testTimeout: this.config.testTimeout,
      maxWorkers: this.config.maxWorkers,
      reporters: this.config.reporters,
      collectCoverage: true,
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.test.{ts,tsx}',
      ],
      coverageThreshold: {
        global: {
          branches: this.config.coverageThreshold,
          functions: this.config.coverageThreshold,
          lines: this.config.coverageThreshold,
          statements: this.config.coverageThreshold,
        },
      },
      coverageReporters: ['html', 'json', 'lcov', 'text-summary'],
      testPathPattern: this.config.testMatch,
      watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
      ],
    };
  }

  generatePlaywrightConfig(): Record<string, any> {
    return {
      testDir: './e2e',
      fullyParallel: true,
      forbidOnly: !!process.env.CI,
      retries: process.env.CI ? this.config.retryFlakyTests : 0,
      workers: process.env.CI ? 2 : undefined,
      reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
      use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3042',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
      },
      projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
        { name: 'firefox', use: { browserName: 'firefox' } },
        { name: 'webkit', use: { browserName: 'webkit' } },
        {
          name: 'Mobile Chrome',
          use: {
            browserName: 'chromium',
            viewport: { width: 375, height: 812 },
          },
        },
        {
          name: 'Mobile Safari',
          use: { browserName: 'webkit', viewport: { width: 375, height: 812 } },
        },
      ],
    };
  }

  generateK6Script(): string {
    return `import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('errors')
const responseTime = new Trend('response_time')

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
    response_time: ['p(99)<3000'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3042'

export default function () {
  const responses = http.batch([
    ['GET', \`\${BASE_URL}/api/health\`, null, { tags: { name: 'health' } }],
    ['GET', \`\${BASE_URL}/api/marketplace/featured\`, null, { tags: { name: 'featured' } }],
    ['GET', \`\${BASE_URL}/api/marketplace/search?q=seo\`, null, { tags: { name: 'search' } }],
  ])

  responses.forEach(res => {
    errorRate.add(res.status >= 400)
    responseTime.add(res.timings.duration)
    check(res, { 'status is 200': r => r.status === 200 })
  })
  sleep(1)
}`;
  }

  generateAccessibilityTest(): string {
    return `import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = ['/', '/login', '/dashboard', '/modules/marketplace', '/builder/demo']

PAGES.forEach(pagePath => {
  test(\`\${pagePath} has no accessibility violations\`, async ({ page }) => {
    await page.goto(pagePath)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})`;
  }

  generateTestFactory(): string {
    return `import { createKernel, type SukitKernel } from '@sukit/core'

let kernelInstance: SukitKernel | null = null

export function createTestKernel(): SukitKernel {
  if (kernelInstance) return kernelInstance
  kernelInstance = createKernel()
  return kernelInstance
}

export function createMockSite(overrides?: Partial<any>): any {
  return { id: \`site_\${Math.random().toString(36).substr(2, 9)}\`, name: 'Test Site', domain: 'test.example.com', settings: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...overrides }
}

export function createMockPage(overrides?: Partial<any>): any {
  return { id: \`page_\${Math.random().toString(36).substr(2, 9)}\`, siteId: 'site_test', title: 'Test Page', slug: 'test-page', isHome: false, settings: {}, sections: [], blocks: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...overrides }
}

export function createMockModule(overrides?: Partial<any>): any {
  return { id: \`@test/module-\${Math.random().toString(36).substr(2, 5)}\`, name: 'Test Module', version: '1.0.0', description: 'A test module', author: 'Test Author', downloads: 0, rating: 0, price: 0, category: 'tool', status: 'approved', ...overrides }
}

export function createMockUser(overrides?: Partial<any>): any {
  return { id: \`user_\${Math.random().toString(36).substr(2, 9)}\`, email: \`test\${Date.now()}@example.com\`, name: 'Test User', createdAt: new Date().toISOString(), ...overrides }
}`;
  }

  generateJestMatchers(): string {
    return `import { expect } from '@jest/globals'

expect.extend({
  toBeWithinRange(received: number, floor: number, ceil: number) {
    const pass = received >= floor && received <= ceil
    return { pass, message: () => \`expected \${received} to be within range \${floor} - \${ceil}\` }
  },

  toBeValidUrl(received: string) {
    try { new URL(received); return { pass: true, message: () => '' } }
    catch { return { pass: false, message: () => \`expected \${received} to be a valid URL\` } }
  },

  toBeISODate(received: string) {
    const pass = !isNaN(Date.parse(received))
    return { pass, message: () => \`expected \${received} to be a valid ISO date\` }
  },
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceil: number): R
      toBeValidUrl(): R
      toBeISODate(): R
    }
  }
}`;
  }

  generateGitHubActionsWorkflow(): string {
    return `name: CI/CD
on:
  push: { branches: [main, develop] }
  pull_request: { branches: [main] }
  schedule: [{ cron: '0 2 * * *' }]
  workflow_dispatch: {}

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: \${{ env.PNPM_VERSION }} }
      - uses: actions/setup-node@v4
        with: { node-version: \${{ env.NODE_VERSION }}, cache: 'pnpm' }
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    needs: lint
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env: { POSTGRES_USER: sukit, POSTGRES_PASSWORD: test, POSTGRES_DB: sukit }
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: \${{ env.PNPM_VERSION }} }
      - uses: actions/setup-node@v4
        with: { node-version: \${{ env.NODE_VERSION }}, cache: 'pnpm' }
      - run: pnpm install
      - run: pnpm db:generate
      - run: pnpm test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  security:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: \${{ env.PNPM_VERSION }} }
      - uses: actions/setup-node@v4
        with: { node-version: \${{ env.NODE_VERSION }}, cache: 'pnpm' }
      - run: pnpm install
      - run: pnpm audit --audit-level=high
      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with: { languages: javascript-typescript }

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: \${{ env.PNPM_VERSION }} }
      - uses: actions/setup-node@v4
        with: { node-version: \${{ env.NODE_VERSION }}, cache: 'pnpm' }
      - run: pnpm install
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    needs: [test, e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: \${{ env.PNPM_VERSION }} }
      - uses: actions/setup-node@v4
        with: { node-version: \${{ env.NODE_VERSION }}, cache: 'pnpm' }
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: apps/web/.next/

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploying to production..."
      # - run: pnpm deploy`;
  }
}
