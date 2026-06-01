import type { SukitKernel } from '@sukit/core';
import type { MarketplaceLayer } from '@sukit/marketplace';

export interface ToolContext {
  kernel: SukitKernel;
  marketplace?: MarketplaceLayer;
  config: Record<string, any>;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface FileDescriptor {
  path: string;
  content: string | Buffer;
  mode?: number;
}

export interface ExportResult {
  files: FileDescriptor[];
  directory: string;
  size: number;
  summary: {
    pages: number;
    assets: number;
    totalFiles: number;
  };
}

export interface BackupMetadata {
  id: string;
  type: 'full' | 'incremental';
  size: number;
  checksum: string;
  encrypted: boolean;
  compression: 'gzip' | 'zstd' | 'none';
  includes: {
    database: boolean;
    media: boolean;
    config: boolean;
    modules: boolean;
  };
  createdAt: string;
  expiresAt: string;
}

export interface CloudStorageConfig {
  provider: 's3' | 'r2' | 'b2' | 'local';
  bucket?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  basePath?: string;
}

export interface MigrationResult {
  platform: string;
  pages: number;
  posts: number;
  media: number;
  categories: number;
  tags: number;
  users: number;
  errors: MigrationError[];
  duration: number;
}

export interface MigrationError {
  type: string;
  originalId: string;
  title: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface WebhookEvent {
  id: string;
  type: string;
  resourceType: string;
  resourceId: string;
  payload: any;
  timestamp: string;
  signature?: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retryCount: number;
  timeout: number;
  format: 'json' | 'form';
  headers: Record<string, string>;
  template?: Record<string, unknown> | string;
  allowedIPs?: string[];
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: { url: string; description: string }[];
  paths: Record<string, any>;
  components?: Record<string, any>;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  userId?: string;
  room?: string;
  timestamp: string;
}

export interface PresenceInfo {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  joinedAt: string;
  currentPage?: string;
  currentBlock?: string;
}

export interface SearchDocument {
  id: string;
  siteId: string;
  siteName: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  author: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  hits: {
    id: string;
    title: string;
    excerpt: string;
    siteId: string;
    siteName: string;
    slug: string;
    score: number;
    highlights: Record<string, string>;
  }[];
  total: number;
  query: string;
  facetDistribution?: Record<string, Record<string, number>>;
}

export interface SearchFilters {
  siteId?: string;
  status?: string;
  author?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  error?: string;
  details?: Record<string, any>;
  lastChecked: string;
}

export interface AuditEvent {
  id?: string;
  userId: string | null;
  userName?: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  changes: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
  timestamp: Date | string;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  details?: Record<string, any>;
  source: string;
  timestamp: Date | string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface AlertChannel {
  type: 'slack' | 'email' | 'pagerduty' | 'webhook';
  name: string;
  config: Record<string, any>;
  send(alert: Alert): Promise<boolean>;
}

export interface MetricPoint {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: string;
}

export interface PrometheusMetric {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labelNames: string[];
}
