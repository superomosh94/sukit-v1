import type { SukitKernel } from '@sukit/core';
import type { OpenAPISpec, CommandResult } from '../../types';

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

export class APIServer {
  private kernel: SukitKernel;
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private apiKeys: Map<string, { userId: string; permissions: string[] }> =
    new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  registerApiKey(key: string, userId: string, permissions: string[]): void {
    this.apiKeys.set(key, { userId, permissions });
  }

  revokeApiKey(key: string): void {
    this.apiKeys.delete(key);
  }

  async handleRequest(req: APIRequest): Promise<APIResponse> {
    if (req.apiKey) {
      const auth = this.apiKeys.get(req.apiKey);
      if (!auth) return { status: 401, body: { error: 'Invalid API key' } };
      const limit = this.checkRateLimit(req.apiKey);
      if (!limit.allowed)
        return {
          status: 429,
          body: { error: 'Rate limit exceeded', retryAfter: limit.retryAfter },
        };
    }

    const handler = this.getHandler(req.method, req.path);
    if (!handler) return { status: 404, body: { error: 'Not found' } };
    return handler(req);
  }

  private getHandler(
    method: string,
    path: string
  ): ((req: APIRequest) => Promise<APIResponse>) | null {
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

  private checkRateLimit(key: string): {
    allowed: boolean;
    retryAfter?: number;
  } {
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
    const error = (msg: string, status = 400): APIResponse => ({
      status,
      body: { error: msg },
    });

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
          return site ? json(site) : error('Not found', 404);
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
          json({ id: req.params.pageId, siteId: req.params.id, ...req.body }),
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

    return {
      openapi: '3.0.0',
      info: {
        title: 'SUKIT API',
        version: '1.0.0',
        description: 'REST API for programmatic SUKIT access',
      },
      servers: [
        { url: 'https://app.sukit.dev/api', description: 'Production' },
        { url: 'http://localhost:3042/api', description: 'Development' },
      ],
      paths,
      components: {
        securitySchemes: {
          ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
        },
      },
    };
  }
}
