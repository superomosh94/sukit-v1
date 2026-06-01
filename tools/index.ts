import type { SukitKernel } from '@sukit/core';
import type { MarketplaceLayer } from '@sukit/marketplace';
import { CLI } from './cli/src/index';
import { GitHubIntegration } from './github/src/index';
import { DockerSupport } from './docker/src/index';
import { BackupSystem } from './backup/src/index';
import { MigrationTool } from './migrate/src/index';
import { WebhookSystem } from './webhooks/src/index';
import { APIServer } from './api/src/index';
import { WebSocketServer } from './websocket/src/index';
import { SearchEngine } from './search/src/index';
import { HealthCheck } from './health/src/index';
import { AuditLogger } from './audit/src/index';
import { MonitoringSystem } from './monitoring/src/index';

export class ToolsLayer {
  public cli: CLI;
  public github: GitHubIntegration;
  public docker: DockerSupport;
  public backup: BackupSystem;
  public migrate: MigrationTool;
  public webhooks: WebhookSystem;
  public api: APIServer;
  public websocket: WebSocketServer;
  public search: SearchEngine;
  public health: HealthCheck;
  public audit: AuditLogger;
  public monitoring: MonitoringSystem;

  private kernel: SukitKernel;
  private initialized = false;

  constructor(kernel: SukitKernel, marketplace?: MarketplaceLayer) {
    this.kernel = kernel;
    this.cli = new CLI(kernel, marketplace);
    this.github = new GitHubIntegration(kernel);
    this.docker = new DockerSupport(kernel);
    this.backup = new BackupSystem(kernel);
    this.migrate = new MigrationTool(kernel);
    this.webhooks = new WebhookSystem(kernel);
    this.api = new APIServer(kernel);
    this.websocket = new WebSocketServer(kernel);
    this.search = new SearchEngine(kernel);
    this.health = new HealthCheck(kernel);
    this.audit = new AuditLogger(kernel);
    this.monitoring = new MonitoringSystem(kernel);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.kernel.events.emit('tools:initializing', {});
    this.initialized = true;
    await this.kernel.events.emit('tools:initialized', {
      tools: this.listTools(),
    });
  }

  async destroy(): Promise<void> {
    this.initialized = false;
    await this.kernel.events.emit('tools:destroyed', {});
  }

  listTools(): { name: string; version: string; description: string }[] {
    return [
      {
        name: 'CLI',
        version: '1.0.0',
        description: 'Command-line interface for SUKIT automation',
      },
      {
        name: 'GitHub',
        version: '1.0.0',
        description: 'GitHub repository management and CI/CD',
      },
      {
        name: 'Docker',
        version: '1.0.0',
        description: 'Dockerfile and container orchestration generation',
      },
      {
        name: 'Backup',
        version: '1.0.0',
        description: 'Full and incremental backup with cloud storage',
      },
      {
        name: 'Migration',
        version: '1.0.0',
        description: 'Import from WordPress, Webflow, Wix, Squarespace',
      },
      {
        name: 'Webhooks',
        version: '1.0.0',
        description: 'Outgoing/incoming webhooks with retry and HMAC',
      },
      {
        name: 'API',
        version: '1.0.0',
        description: 'REST API with CRUD, rate limiting, OpenAPI docs',
      },
      {
        name: 'WebSocket',
        version: '1.0.0',
        description: 'Real-time collaboration, presence, and locks',
      },
      {
        name: 'Search',
        version: '1.0.0',
        description: 'Full-text search engine with indexing',
      },
      {
        name: 'Health',
        version: '1.0.0',
        description: 'Health check endpoints and component monitoring',
      },
      {
        name: 'Audit',
        version: '1.0.0',
        description: 'Action logging, search, and export',
      },
      {
        name: 'Monitoring',
        version: '1.0.0',
        description: 'Metrics, alerts, Slack/Email/PagerDuty',
      },
    ];
  }
}

export { CLI } from './cli/src/index';
export { GitHubIntegration } from './github/src/index';
export { DockerSupport } from './docker/src/index';
export { BackupSystem } from './backup/src/index';
export { MigrationTool } from './migrate/src/index';
export { WebhookSystem } from './webhooks/src/index';
export { APIServer } from './api/src/index';
export { WebSocketServer } from './websocket/src/index';
export { SearchEngine } from './search/src/index';
export { HealthCheck } from './health/src/index';
export { AuditLogger } from './audit/src/index';
export { MonitoringSystem } from './monitoring/src/index';

export type * from './types';
