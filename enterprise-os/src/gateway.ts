import type { SukitKernel } from '@sukit/core';

interface APIProduct {
  id: string;
  name: string;
  description: string;
  version: string;
  endpoints: { path: string; method: string; description: string }[];
  rateLimit: { perSecond: number; perHour: number };
  scopes: string[];
  documentation: string;
}

interface APIKey {
  id: string;
  orgId: string;
  name: string;
  key: string;
  keyPrefix: string;
  scopes: string[];
  rateLimitOverride: { perSecond?: number; perHour?: number } | null;
  ipWhitelist: string[];
  expiresAt: string | null;
  lastUsed: string | null;
  requests24h: number;
  totalRequests: number;
  createdAt: string;
}

interface APIUsageRecord {
  keyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  latency: number;
  ip: string;
  timestamp: string;
}

export class APIGateway {
  private kernel: SukitKernel;
  private apiKeys: Map<string, APIKey> = new Map();
  private usageLogs: APIUsageRecord[] = [];
  private products: APIProduct[] = [];

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.initProducts();
  }

  private initProducts(): void {
    this.products = [
      {
        id: 'sites-api',
        name: 'Sites API',
        description: 'Manage sites programmatically',
        version: 'v1',
        endpoints: [
          {
            path: '/api/v1/sites',
            method: 'GET',
            description: 'List all sites',
          },
          { path: '/api/v1/sites', method: 'POST', description: 'Create site' },
          {
            path: '/api/v1/sites/:id',
            method: 'GET',
            description: 'Get site details',
          },
          {
            path: '/api/v1/sites/:id',
            method: 'PUT',
            description: 'Update site',
          },
          {
            path: '/api/v1/sites/:id',
            method: 'DELETE',
            description: 'Delete site',
          },
        ],
        rateLimit: { perSecond: 10, perHour: 1000 },
        scopes: ['sites:read', 'sites:write'],
        documentation: '/docs/api/sites',
      },
      {
        id: 'pages-api',
        name: 'Pages API',
        description: 'Create and manage pages',
        version: 'v1',
        endpoints: [
          { path: '/api/v1/pages', method: 'GET', description: 'List pages' },
          { path: '/api/v1/pages', method: 'POST', description: 'Create page' },
          {
            path: '/api/v1/pages/:id',
            method: 'PUT',
            description: 'Update page',
          },
          {
            path: '/api/v1/pages/:id',
            method: 'DELETE',
            description: 'Delete page',
          },
        ],
        rateLimit: { perSecond: 20, perHour: 5000 },
        scopes: ['pages:read', 'pages:write'],
        documentation: '/docs/api/pages',
      },
      {
        id: 'media-api',
        name: 'Media API',
        description: 'Upload and manage media files',
        version: 'v1',
        endpoints: [
          { path: '/api/v1/media', method: 'GET', description: 'List media' },
          {
            path: '/api/v1/media/upload',
            method: 'POST',
            description: 'Upload file',
          },
          {
            path: '/api/v1/media/:id',
            method: 'DELETE',
            description: 'Delete media',
          },
        ],
        rateLimit: { perSecond: 5, perHour: 500 },
        scopes: ['media:read', 'media:write'],
        documentation: '/docs/api/media',
      },
      {
        id: 'marketplace-api',
        name: 'Marketplace API',
        description: 'Browse and install modules',
        version: 'v1',
        endpoints: [
          {
            path: '/api/v1/marketplace/modules',
            method: 'GET',
            description: 'List modules',
          },
          {
            path: '/api/v1/marketplace/search',
            method: 'GET',
            description: 'Search modules',
          },
          {
            path: '/api/v1/marketplace/install',
            method: 'POST',
            description: 'Install module',
          },
        ],
        rateLimit: { perSecond: 30, perHour: 10000 },
        scopes: ['marketplace:read', 'marketplace:write'],
        documentation: '/docs/api/marketplace',
      },
      {
        id: 'export-api',
        name: 'Export API',
        description: 'Export and deploy sites',
        version: 'v1',
        endpoints: [
          {
            path: '/api/v1/export/:siteId',
            method: 'GET',
            description: 'Export site',
          },
        ],
        rateLimit: { perSecond: 3, perHour: 60 },
        scopes: ['export:read'],
        documentation: '/docs/api/export',
      },
    ];
  }

  getProducts(): APIProduct[] {
    return this.products;
  }

  getProduct(productId: string): APIProduct | undefined {
    return this.products.find((p) => p.id === productId);
  }

  createAPIKey(
    orgId: string,
    name: string,
    scopes: string[],
    options?: {
      rateLimitOverride?: { perSecond?: number; perHour?: number };
      ipWhitelist?: string[];
      expiresAt?: string;
    }
  ): APIKey {
    const rawKey = `suk_${crypto.randomUUID().replace(/-/g, '').substring(0, 32)}`;
    const key: APIKey = {
      id: `key_${crypto.randomUUID().substring(0, 12)}`,
      orgId,
      name,
      key: rawKey,
      keyPrefix: rawKey.substring(0, 8),
      scopes,
      rateLimitOverride: options?.rateLimitOverride || null,
      ipWhitelist: options?.ipWhitelist || [],
      expiresAt: options?.expiresAt || null,
      lastUsed: null,
      requests24h: 0,
      totalRequests: 0,
      createdAt: new Date().toISOString(),
    };
    this.apiKeys.set(key.id, key);
    return key;
  }

  revokeAPIKey(keyId: string): boolean {
    return this.apiKeys.delete(keyId);
  }

  getAPIKeys(orgId: string): APIKey[] {
    return Array.from(this.apiKeys.values()).filter((k) => k.orgId === orgId);
  }

  validateAPIKey(key: string): {
    valid: boolean;
    keyData?: APIKey;
    error?: string;
  } {
    for (const [, k] of this.apiKeys) {
      if (k.key === key) {
        if (k.expiresAt && new Date(k.expiresAt) < new Date())
          return { valid: false, error: 'API key expired' };
        k.lastUsed = new Date().toISOString();
        k.requests24h++;
        k.totalRequests++;
        return { valid: true, keyData: k };
      }
    }
    return { valid: false, error: 'Invalid API key' };
  }

  checkRateLimit(key: APIKey): {
    allowed: boolean;
    remaining: number;
    retryAfter?: number;
  } {
    const perHour = key.rateLimitOverride?.perHour || 1000;
    const perSecond = key.rateLimitOverride?.perSecond || 10;
    if (key.requests24h >= perHour)
      return { allowed: false, remaining: 0, retryAfter: 3600 };
    return { allowed: true, remaining: perHour - key.requests24h };
  }

  logUsage(
    keyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    latency: number,
    ip: string
  ): void {
    this.usageLogs.push({
      keyId,
      endpoint,
      method,
      statusCode,
      latency,
      ip,
      timestamp: new Date().toISOString(),
    });
    if (this.usageLogs.length > 10000)
      this.usageLogs = this.usageLogs.slice(-5000);
  }

  getUsageAnalytics(orgId: string): {
    totalRequests: number;
    byEndpoint: Record<string, number>;
    byMethod: Record<string, number>;
    byStatusCode: Record<string, number>;
    averageLatency: number;
    p95Latency: number;
    topKeys: { id: string; name: string; requests: number }[];
  } {
    const orgKeys = this.getAPIKeys(orgId).map((k) => k.id);
    const relevantLogs = this.usageLogs.filter((l) =>
      orgKeys.includes(l.keyId)
    );
    const byEndpoint: Record<string, number> = {};
    const byMethod: Record<string, number> = {};
    const byStatusCode: Record<string, number> = {};
    let totalLatency = 0;
    const latencies: number[] = [];

    for (const log of relevantLogs) {
      byEndpoint[log.endpoint] = (byEndpoint[log.endpoint] || 0) + 1;
      byMethod[log.method] = (byMethod[log.method] || 0) + 1;
      byStatusCode[String(log.statusCode)] =
        (byStatusCode[String(log.statusCode)] || 0) + 1;
      totalLatency += log.latency;
      latencies.push(log.latency);
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const p95 =
      sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;

    const keyRequests: Record<string, { name: string; requests: number }> = {};
    for (const log of relevantLogs) {
      const key = this.apiKeys.get(log.keyId);
      if (key) {
        keyRequests[log.keyId] = {
          name: key.name,
          requests: (keyRequests[log.keyId]?.requests || 0) + 1,
        };
      }
    }

    return {
      totalRequests: relevantLogs.length,
      byEndpoint,
      byMethod,
      byStatusCode,
      averageLatency:
        relevantLogs.length > 0 ? totalLatency / relevantLogs.length : 0,
      p95Latency: p95,
      topKeys: Object.entries(keyRequests)
        .sort(([, a], [, b]) => b.requests - a.requests)
        .slice(0, 10)
        .map(([id, data]) => ({ id, ...data })),
    };
  }
}
