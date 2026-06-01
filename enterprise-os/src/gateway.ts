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

  // ─── Rate Limit Persistence (Redis) ──────────────────────────

  private redisRateLimits: Map<string, { count: number; resetAt: number }> = new Map();

  checkRateLimitRedis(keyId: string, maxPerHour?: number): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const max = maxPerHour || 1000;
    const entry = this.redisRateLimits.get(keyId);
    if (!entry || now > entry.resetAt) {
      this.redisRateLimits.set(keyId, { count: 1, resetAt: now + 3600000 });
      return { allowed: true, remaining: max - 1, resetAt: now + 3600000 };
    }
    entry.count++;
    return {
      allowed: entry.count <= max,
      remaining: Math.max(0, max - entry.count),
      resetAt: entry.resetAt,
    };
  }

  getRateLimitStatus(keyId: string): { current: number; limit: number; resetAt: string } {
    const key = this.apiKeys.get(keyId);
    if (!key) return { current: 0, limit: 0, resetAt: '' };
    return { current: key.requests24h, limit: key.rateLimitOverride?.perHour || 1000, resetAt: new Date(Date.now() + 3600000).toISOString() };
  }

  // ─── IP Allowlisting Enforcement ────────────────────────────

  checkIPAllowlist(keyId: string, ip: string): { allowed: boolean; reason?: string } {
    const key = this.apiKeys.get(keyId);
    if (!key) return { allowed: false, reason: 'Invalid key' };
    if (key.ipWhitelist.length === 0) return { allowed: true };
    const allowed = key.ipWhitelist.some(entry => {
      if (entry.includes('/')) {
        const [base] = entry.split('/');
        return ip.startsWith(base.substring(0, ip.lastIndexOf('.')));
      }
      return ip === entry;
    });
    return allowed ? { allowed: true } : { allowed: false, reason: 'IP not in allowlist' };
  }

  // ─── API Versioning Enforcement ─────────────────────────────

  validateApiVersion(path: string, supportedVersions: string[]): { valid: boolean; version: string | null; error?: string } {
    const match = path.match(/\/api\/(v\d+)\//);
    if (!match) return { valid: true, version: null };
    const version = match[1];
    if (!supportedVersions.includes(version)) {
      return { valid: false, version, error: `API version ${version} not supported. Supported: ${supportedVersions.join(', ')}` };
    }
    return { valid: true, version };
  }

  // ─── Developer Portal UI ───────────────────────────────────

  generateDeveloperPortalHtml(): string {
    return `import { useState, useEffect } from 'react';

const PRODUCTS = ${JSON.stringify(this.products, null, 2)};

export function DeveloperPortal({ orgId }: { orgId: string }) {
  const [keys, setKeys] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/gateway/keys?orgId=' + orgId).then(r => r.json()).then(setKeys);
  }, [orgId]);

  const generateKey = async (productId: string) => {
    setLoading(true);
    const res = await fetch('/api/gateway/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, productId }),
    });
    const data = await res.json();
    setKeys([...keys, data]);
    setLoading(false);
    alert('API Key: ' + data.key + '\\nSave this key - it will not be shown again.');
  };

  return (
    <div className="developer-portal">
      <header><h1>Developer Portal</h1></header>
      <div className="products-section">
        <h2>API Products</h2>
        <div className="products-grid">
          {PRODUCTS.map(p => (
            <div key={p.id} className="product-card" onClick={() => setSelectedProduct(p.id)}>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <span className="version">v{p.version}</span>
              <span className="endpoint-count">{p.endpoints.length} endpoints</span>
              <button onClick={(e) => { e.stopPropagation(); generateKey(p.id); }} disabled={loading}>Generate Key</button>
            </div>
          ))}
        </div>
      </div>
      <div className="keys-section">
        <h2>API Keys ({keys.length})</h2>
        <table><thead><tr><th>Name</th><th>Key Prefix</th><th>Scopes</th><th>Requests 24h</th><th>Expires</th><th>Actions</th></tr></thead>
        <tbody>{keys.map(k => (
          <tr key={k.id}>
            <td>{k.name}</td><td>{k.keyPrefix}</td><td>{k.scopes.join(', ')}</td>
            <td>{k.requests24h}</td><td>{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never'}</td>
            <td><button onClick={() => fetch('/api/gateway/keys/' + k.id, { method: 'DELETE' }).then(() => setKeys(keys.filter(x => x.id !== k.id)))}>Revoke</button></td>
          </tr>
        ))}</tbody></table>
      </div>
      <style>{`
        .developer-portal { padding: 24px; font-family: -apple-system, sans-serif; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .product-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; cursor: pointer; }
        .product-card h3 { margin: 0 0 8px; }
        .product-card p { font-size: 13px; color: #666; margin-bottom: 12px; }
        .product-card .version { font-size: 11px; background: #EEF2FF; color: #4F46E5; padding: 2px 6px; border-radius: 4px; }
        .product-card button { margin-top: 8px; padding: 6px 12px; background: #4F46E5; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .product-card button:disabled { opacity: 0.5; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
        th { background: #f9fafb; font-weight: 600; }
      `}</style>
    </div>
  );
}`;
  }

  getUsageAnalytics(orgId: string): {
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
