import type { SukitKernel } from '@sukit/core';
import type { OpenAPISpec, CommandResult } from '../../types';
import { createHash, randomBytes } from 'crypto';

interface APIRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  params: Record<string, string>;
  body?: any;
  apiKey?: string;
}

interface APIResponse {
  status: number;
  body: any;
  headers?: Record<string, string>;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

interface CORSConfig {
  origins: string[];
  methods: string[];
  headers: string[];
}

type RateLimitStore = 'memory' | 'redis';

type SerializerFn = (data: any) => string;

type ZodSchema = any;

interface UsageRecord {
  route: string;
  method: string;
  status: number;
  latency: number;
  timestamp: number;
}

interface UsageStats {
  totalRequests: number;
  routes: Record<string, number>;
  errors: number;
  avgLatency: number;
}

interface PaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export class APIServer {
  private kernel: SukitKernel;
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private apiKeys: Map<string, { userId: string; permissions: string[] }> =
    new Map();
  private redisClient: RedisClient | null = null;
  private rateLimitStore: RateLimitStore = 'memory';
  private corsConfig: CORSConfig | null = null;
  private schemas: Map<string, ZodSchema> = new Map();
  private serializer: SerializerFn = JSON.stringify;
  private builtInSerializers: Record<string, SerializerFn> = {
    json: JSON.stringify,
    xml: (data: any) => this.xmlSerialize(data),
  };
  private versionHeader: string = 'Accept-Version';
  private versionedRoutes: Record<
    string,
    Record<string, Record<string, (req: APIRequest) => Promise<APIResponse>>>
  > = {};
  private usageLogs: Map<string, UsageRecord[]> = new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ==========================================
  // Feature 1: API Key Hashing
  // ==========================================

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  generateApiKey(userId: string): string {
    const raw = 'sk-' + randomBytes(24).toString('hex');
    const hashed = this.hashKey(raw);
    this.apiKeys.set(hashed, { userId, permissions: ['*'] });
    return raw;
  }

  registerApiKey(key: string, userId: string, permissions: string[]): void {
    const hashed = this.hashKey(key);
    this.apiKeys.set(hashed, { userId, permissions });
  }

  revokeApiKey(key: string): void {
    const hashed = this.hashKey(key);
    this.apiKeys.delete(hashed);
  }

  // ==========================================
  // Feature 2: Rate Limit Persistence (Redis)
  // ==========================================

  enableRedisPersistence(redisClient: RedisClient): void {
    this.redisClient = redisClient;
    this.rateLimitStore = 'redis';
  }

  setRateLimitStore(store: RateLimitStore): void {
    this.rateLimitStore = store;
  }

  // ==========================================
  // Feature 3: CORS Dynamic Configuration
  // ==========================================

  setCORS(
    origins: string[],
    methods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: string[] = ['Content-Type', 'Authorization', 'X-API-Key']
  ): APIResponse {
    this.corsConfig = { origins, methods, headers };
    return {
      status: 200,
      body: { cors: 'configured' },
      headers: this.getCORSHeaders('*'),
    };
  }

  private getCORSHeaders(origin: string): Record<string, string> {
    if (!this.corsConfig) return {};
    const allowed =
      this.corsConfig.origins.includes('*') ||
      this.corsConfig.origins.includes(origin);
    return {
      'Access-Control-Allow-Origin': allowed ? origin : '',
      'Access-Control-Allow-Methods': this.corsConfig.methods.join(', '),
      'Access-Control-Allow-Headers': this.corsConfig.headers.join(', '),
      'Access-Control-Max-Age': '86400',
    };
  }

  private addCORSHeaders(response: APIResponse, origin: string): APIResponse {
    if (!this.corsConfig) return response;
    const corsHeaders = this.getCORSHeaders(origin);
    return {
      ...response,
      headers: { ...(response.headers || {}), ...corsHeaders },
    };
  }

  // ==========================================
  // Feature 4: Request Body Validation (Zod)
  // ==========================================

  registerSchema(route: string, schema: ZodSchema): void {
    this.schemas.set(route, schema);
  }

  validate(body: any, schema: ZodSchema): { valid: boolean; errors?: any } {
    if (!schema || typeof schema.safeParse !== 'function')
      return { valid: true };
    const result = schema.safeParse(body);
    if (result.success) return { valid: true };
    return {
      valid: false,
      errors: result.error?.format?.() || result.error?.issues || result.error,
    };
  }

  // ==========================================
  // Feature 5: Response Serialization
  // ==========================================

  setSerializer(serializer: SerializerFn | 'json' | 'xml'): void {
    if (typeof serializer === 'string') {
      this.serializer = this.builtInSerializers[serializer] || JSON.stringify;
    } else {
      this.serializer = serializer;
    }
  }

  serialize(data: any, format?: 'json' | 'xml' | string): string {
    if (format && this.builtInSerializers[format]) {
      return this.builtInSerializers[format](data);
    }
    return this.serializer(data);
  }

  private xmlSerialize(data: any, root: string = 'response'): string {
    if (data === null || data === undefined) {
      return `<?xml version="1.0" encoding="UTF-8"?><${root}/>`;
    }
    const inner =
      typeof data === 'object'
        ? Object.entries(data)
            .map(([k, v]) => {
              const val = v === null || v === undefined ? '' : String(v);
              return `<${k}>${val}</${k}>`;
            })
            .join('')
        : String(data);
    return `<?xml version="1.0" encoding="UTF-8"?><${root}>${inner}</${root}>`;
  }

  // ==========================================
  // Feature 6: Cursor-based Pagination
  // ==========================================

  paginateCursor<T extends Record<string, any>>(
    items: T[],
    cursorField: keyof T,
    limit: number = 20
  ): PaginationResult<T> {
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const lastItem = data[data.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? Buffer.from(String(lastItem[cursorField])).toString('base64')
        : null;
    return { data, nextCursor, hasMore };
  }

  // ==========================================
  // Feature 7: Error Response Standardization
  // ==========================================

  standardError(status: number, message: string, details?: any): APIResponse {
    return {
      status,
      body: {
        error: {
          code: status,
          message,
          details: details ?? null,
          timestamp: new Date().toISOString(),
        },
      },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // ==========================================
  // Feature 8: API Versioning (Header-based)
  // ==========================================

  setVersionHeader(header: string): void {
    this.versionHeader = header;
  }

  registerVersionedRoutes(
    version: string,
    routes: Record<
      string,
      Record<string, (req: APIRequest) => Promise<APIResponse>>
    >
  ): void {
    this.versionedRoutes[version] = routes;
  }

  private getVersion(req: APIRequest): string | null {
    const header =
      req.headers[this.versionHeader] ||
      req.headers[this.versionHeader.toLowerCase()];
    return header || null;
  }

  // ==========================================
  // Feature 9: API Usage Analytics
  // ==========================================

  trackUsage(
    apiKey: string,
    route: string,
    method: string,
    status: number,
    latency: number
  ): void {
    const hashed = this.hashKey(apiKey);
    if (!this.usageLogs.has(hashed)) {
      this.usageLogs.set(hashed, []);
    }
    this.usageLogs.get(hashed)!.push({
      route,
      method,
      status,
      latency,
      timestamp: Date.now(),
    });
  }

  getUsageStats(apiKey: string): UsageStats | null {
    const hashed = this.hashKey(apiKey);
    const logs = this.usageLogs.get(hashed);
    if (!logs || logs.length === 0) return null;

    const routes: Record<string, number> = {};
    let errors = 0;
    let totalLatency = 0;

    for (const r of logs) {
      const key = `${r.method} ${r.route}`;
      routes[key] = (routes[key] || 0) + 1;
      if (r.status >= 400) errors++;
      totalLatency += r.latency;
    }

    return {
      totalRequests: logs.length,
      routes,
      errors,
      avgLatency: totalLatency / logs.length,
    };
  }

  // ==========================================
  // Feature 10: Swagger UI Serving
  // ==========================================

  getSwaggerUIHTML(specUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Reference - SUKIT</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: ${JSON.stringify(specUrl)},
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis],
      layout: "BaseLayout",
      deepLinking: true,
      showExtensions: true,
      showCommonExtensions: true
    });
  </script>
</body>
</html>`;
  }

  serveSwaggerUI(path: string): (req: APIRequest) => Promise<APIResponse> {
    return async () => ({
      status: 200,
      body: this.getSwaggerUIHTML(path),
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // ==========================================
  // Feature 11: API Playground (Enhanced Swagger UI)
  // ==========================================

  getSwaggerUIPlayground(specUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Playground - SUKIT</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    var ui = SwaggerUIBundle({
      url: ${JSON.stringify(specUrl)},
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis],
      layout: "BaseLayout",
      deepLinking: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      supportedSubmitMethods: ["get", "put", "post", "delete", "patch", "options"],
      requestInterceptor: function (req) {
        var key = localStorage.getItem('sukit_api_key');
        if (key) req.headers['X-API-Key'] = key;
        return req;
      }
    });
    window.ui = ui;
    window.onload = function () {
      var saved = localStorage.getItem('sukit_api_key');
      if (!saved) {
        var key = prompt("Enter your SUKIT API key (optional, saved in browser):");
        if (key) localStorage.setItem('sukit_api_key', key);
      }
    };
  </script>
</body>
</html>`;
  }

  // ==========================================
  // Core: handleRequest (Updated with all features)
  // ==========================================

  async handleRequest(req: APIRequest): Promise<APIResponse> {
    const start = Date.now();
    const origin = req.headers['origin'] || '';

    if (req.method === 'OPTIONS' && this.corsConfig) {
      return this.addCORSHeaders({ status: 204, body: '' }, origin);
    }

    if (req.apiKey) {
      const hashedKey = this.hashKey(req.apiKey);
      const auth = this.apiKeys.get(hashedKey);
      if (!auth)
        return this.addCORSHeaders(
          this.standardError(401, 'Invalid API key'),
          origin
        );
      const limit = await this.checkRateLimit(hashedKey);
      if (!limit.allowed) {
        const err = this.standardError(429, 'Rate limit exceeded');
        err.body.error.retryAfter = limit.retryAfter;
        return this.addCORSHeaders(err, origin);
      }
    }

    const version = this.getVersion(req);
    let handler: ((req: APIRequest) => Promise<APIResponse>) | null = null;
    if (version) {
      handler = this.getHandler(req.method, `/v${version}${req.path}`, req);
    }
    if (!handler) {
      handler = this.getHandler(req.method, req.path, req);
    }
    if (!handler)
      return this.addCORSHeaders(this.standardError(404, 'Not found'), origin);

    const schema = this.schemas.get(req.path);
    if (schema && req.body !== undefined) {
      const validation = this.validate(req.body, schema);
      if (!validation.valid) {
        return this.addCORSHeaders(
          this.standardError(422, 'Validation failed', validation.errors),
          origin
        );
      }
    }

    const response = await handler(req);
    const latency = Date.now() - start;

    if (req.apiKey) {
      this.trackUsage(
        req.apiKey,
        req.path,
        req.method,
        response.status,
        latency
      );
    }

    return this.addCORSHeaders(response, origin);
  }

  // ==========================================
  // Core: getHandler (with versioned route support)
  // ==========================================

  private getHandler(
    method: string,
    path: string,
    req?: APIRequest
  ): ((req: APIRequest) => Promise<APIResponse>) | null {
    if (req) {
      const version = this.getVersion(req);
      if (version && this.versionedRoutes[version]) {
        const routes = this.versionedRoutes[version];
        for (const [pattern, handlers] of Object.entries(routes)) {
          const params = this.matchRoute(pattern, path);
          if (params && handlers[method])
            return (r: APIRequest) => handlers[method]({ ...r, params });
        }
      }
    }

    const routes = this.getRoutes();
    for (const [pattern, handlers] of Object.entries(routes)) {
      const params = this.matchRoute(pattern, path);
      if (params && handlers[method])
        return (req: APIRequest) => handlers[method]({ ...req, params });
    }
    return null;
  }

  private matchRoute(
    pattern: string,
    path: string
  ): Record<string, string> | null {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) return null;
    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':'))
        params[patternParts[i].slice(1)] = pathParts[i];
      else if (patternParts[i] !== pathParts[i]) return null;
    }
    return params;
  }

  private async checkRateLimit(key: string): Promise<{
    allowed: boolean;
    retryAfter?: number;
  }> {
    if (this.rateLimitStore === 'redis' && this.redisClient) {
      const redisKey = `ratelimit:${key}`;
      const count = await this.redisClient.incr(redisKey);
      if (count === 1) {
        await this.redisClient.expire(redisKey, 3600);
      }
      if (count > 1000) return { allowed: false, retryAfter: 3600 };
      return { allowed: true };
    }

    const now = Date.now();
    const entry = this.rateLimits.get(key);
    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(key, { count: 1, resetAt: now + 3600000 });
      return { allowed: true };
    }
    if (entry.count >= 1000)
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      };
    entry.count++;
    return { allowed: true };
  }

  getRoutes(): Record<
    string,
    Record<string, (req: APIRequest) => Promise<APIResponse>>
  > {
    const json = (data: any, status = 200): APIResponse => ({
      status,
      body: data,
      headers: { 'Content-Type': 'application/json' },
    });
    const rerr = (msg: string, status = 400): APIResponse =>
      this.standardError(status, msg);

    return {
      '/api/sites': {
        GET: async () => json({ sites: [], total: 0 }),
        POST: async (req) => {
          const site = await this.kernel.sites.create(
            req.body?.name || 'New Site'
          );
          return json(site, 201);
        },
      },
      '/api/sites/:id': {
        GET: async (req) => {
          const site = await this.kernel.sites.get(req.params.id);
          return site ? json(site) : rerr('Not found', 404);
        },
        PUT: async (req) => json({ id: req.params.id, ...req.body }),
        DELETE: async (req) => {
          await this.kernel.sites.delete(req.params.id);
          return json({ deleted: true });
        },
      },
      '/api/sites/:id/pages': {
        GET: async (req) => {
          const pages = await this.kernel.pages.list(req.params.id);
          return json({ pages, total: pages.length });
        },
        POST: async (req) => {
          const page = await this.kernel.pages.create(
            req.params.id,
            req.body?.slug || 'page',
            req.body?.title || 'New Page'
          );
          return json(page, 201);
        },
      },
      '/api/sites/:id/pages/:pageId': {
        GET: async (req) =>
          json({ id: req.params.pageId, siteId: req.params.id }),
        PUT: async (req) =>
          json({
            id: req.params.pageId,
            siteId: req.params.id,
            ...req.body,
          }),
        DELETE: async (req) => json({ deleted: true }),
      },
      '/api/media': { GET: async () => json({ media: [], total: 0 }) },
      '/api/media/upload': {
        POST: async () => json({ url: '/uploads/file.jpg', size: 0 }),
      },
      '/api/modules': { GET: async () => json({ modules: [] }) },
      '/api/modules/install': {
        POST: async () =>
          json({ success: true, moduleId: '', version: '1.0.0' }),
      },
      '/api/export/:siteId': {
        GET: async (req) =>
          json({
            siteId: req.params.siteId,
            format: 'zip',
            url: `/api/export/${req.params.siteId}/download`,
          }),
      },
      '/api/health': {
        GET: async () =>
          json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
          }),
      },
    };
  }

  generateOpenAPISpec(): OpenAPISpec {
    const paths: Record<string, any> = {};
    for (const [pattern, handlers] of Object.entries(this.getRoutes())) {
      paths[pattern] = {};
      for (const [method] of Object.entries(handlers)) {
        paths[pattern][method.toLowerCase()] = {
          summary: `${method} ${pattern}`,
          security: method !== 'GET' ? [{ ApiKeyAuth: [] }] : [],
          responses: {
            '200': { description: 'OK' },
            '401': { description: 'Unauthorized' },
            '429': { description: 'Rate limited' },
          },
        };
      }
    }

    for (const [version, routes] of Object.entries(this.versionedRoutes)) {
      for (const [pattern, handlers] of Object.entries(routes)) {
        const versionedPath = `/v${version}${pattern}`;
        paths[versionedPath] = {};
        for (const [method] of Object.entries(handlers)) {
          paths[versionedPath][method.toLowerCase()] = {
            summary: `${method} ${versionedPath}`,
            security: method !== 'GET' ? [{ ApiKeyAuth: [] }] : [],
            responses: {
              '200': { description: 'OK' },
              '401': { description: 'Unauthorized' },
              '429': { description: 'Rate limited' },
            },
          };
        }
      }
    }

    return {
      openapi: '3.0.0',
      info: {
        title: 'SUKIT API',
        version: '1.0.0',
        description: 'REST API for programmatic SUKIT access',
      },
      servers: [
        { url: 'https://app.sukit.dev/api', description: 'Production' },
        {
          url: 'http://localhost:3042/api',
          description: 'Development',
        },
      ],
      paths,
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
    };
  }
}
