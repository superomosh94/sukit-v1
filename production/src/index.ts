import type { SukitKernel } from '@sukit/core';
import type { MarketplaceLayer } from '@sukit/marketplace';
import { SecuritySystem, type SecurityConfig } from './security/src/index';
import {
  PerformanceOptimizer,
  type PerformanceConfig,
} from './performance/src/index';
import { TestSuite, type TestConfig } from './testing/src/index';
import {
  DeploymentSystem,
  type DeploymentConfig,
} from './deployment/src/index';
import { CICDPipeline, type PipelineConfig } from './ci-cd/src/index';
import {
  ErrorTracker,
  type ErrorTrackingConfig,
} from './error-tracking/src/index';
import {
  MonitoringSystem,
  type MonitoringConfig,
} from './monitoring/src/index';
import { DocumentationSystem, type DocConfig } from './documentation/src/index';
import { MultiTenancy, type TenantConfig } from './multi-tenancy/src/index';
import {
  EnterpriseFeatures,
  type EnterpriseConfig,
} from './enterprise/src/index';

export class ProductionLayer {
  public security: SecuritySystem;
  public performance: PerformanceOptimizer;
  public testing: TestSuite;
  public deployment: DeploymentSystem;
  public cicd: CICDPipeline;
  public errors: ErrorTracker;
  public monitoring: MonitoringSystem;
  public docs: DocumentationSystem;
  public tenants: MultiTenancy;
  public enterprise: EnterpriseFeatures;

  private kernel: SukitKernel;
  private initialized = false;

  constructor(
    kernel: SukitKernel,
    marketplace?: MarketplaceLayer,
    config?: {
      security?: Partial<SecurityConfig>;
      performance?: Partial<PerformanceConfig>;
      testing?: Partial<TestConfig>;
      deployment?: Partial<DeploymentConfig>;
      cicd?: Partial<PipelineConfig>;
      errorTracking?: Partial<ErrorTrackingConfig>;
      monitoring?: Partial<MonitoringConfig>;
      documentation?: Partial<DocConfig>;
      tenant?: Partial<TenantConfig>;
      enterprise?: Partial<EnterpriseConfig>;
    }
  ) {
    this.kernel = kernel;
    this.security = new SecuritySystem(kernel, config?.security);
    this.performance = new PerformanceOptimizer(kernel, config?.performance);
    this.testing = new TestSuite(kernel, config?.testing);
    this.deployment = new DeploymentSystem(kernel, config?.deployment);
    this.cicd = new CICDPipeline(kernel, config?.cicd);
    this.errors = new ErrorTracker(kernel, config?.errorTracking);
    this.monitoring = new MonitoringSystem(kernel, config?.monitoring);
    this.docs = new DocumentationSystem(kernel, config?.documentation);
    this.tenants = new MultiTenancy(kernel, config?.tenant);
    this.enterprise = new EnterpriseFeatures(kernel, config?.enterprise);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.kernel.events.emit('production:initializing', {});
    this.initialized = true;
    await this.kernel.events.emit('production:initialized', {
      systems: [
        'security',
        'performance',
        'testing',
        'deployment',
        'cicd',
        'errors',
        'monitoring',
        'docs',
        'tenants',
        'enterprise',
      ],
    });
  }

  getMetrics(): Record<string, any> {
    return {
      security: { rateLimitEntries: 0, loginAttempts: 0 },
      performance: this.performance.getMetrics(),
      monitoring: { cacheHitRatio: this.performance.getCacheHitRatio() },
      deployment: { appName: 'sukit' },
    };
  }

  generateAllDockerfiles(env: 'production' | 'development' = 'production'): {
    Dockerfile: string;
    'docker-compose.yml': string;
    '.dockerignore': string;
  } {
    return {
      Dockerfile: this.deployment.generateDockerfile(env),
      'docker-compose.yml': this.deployment.generateDockerCompose(env),
      '.dockerignore': this.deployment.generateDockerignore(),
    };
  }

  generateAllCI(): Record<string, string> {
    return this.cicd.generateGitHubActions();
  }
  generateAllKubernetes(): Record<string, string> {
    return this.deployment.generateKubernetesHelm();
  }
  generateAllTerraform(): Record<string, string> {
    return this.deployment.generateTerraform();
  }
  generateAllDocs(): { user: any[]; dev: any[]; api: Record<string, any> } {
    return {
      user: this.docs.generateUserDocs(),
      dev: this.docs.generateDevDocs(),
      api: this.docs.generateOpenAPISpec(),
    };
  }
  generatePrometheusMetrics(): string {
    return this.monitoring.generatePrometheusMetrics();
  }
  generateGrafanaDashboard(): Record<string, any> {
    return this.monitoring.generateGrafanaDashboard();
  }
}

export { SecuritySystem } from './security/src/index';
export { PerformanceOptimizer } from './performance/src/index';
export { TestSuite } from './testing/src/index';
export { DeploymentSystem } from './deployment/src/index';
export { CICDPipeline } from './ci-cd/src/index';
export { ErrorTracker } from './error-tracking/src/index';
export { MonitoringSystem } from './monitoring/src/index';
export { DocumentationSystem } from './documentation/src/index';
export { MultiTenancy } from './multi-tenancy/src/index';
export { EnterpriseFeatures } from './enterprise/src/index';
