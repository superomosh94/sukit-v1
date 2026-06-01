import type { APIRoute, RequestHandler } from '../types';

interface ApiMetric {
  count: number;
  totalDuration: number;
  errors: number;
  lastRequest: number;
}

interface WebhookRegistration {
  id: string;
  event: string;
  url: string;
  secret?: string;
}

export function createAPIRoutesAPI() {
  const routes = new Map<string, APIRoute>();
  const middleware: Array<
    (req: Request, method: string, path: string) => Promise<Response | null>
  > = [];
  const metrics = new Map<string, ApiMetric>();
  const webhooks = new Map<string, WebhookRegistration[]>();
  let globalPrefix = '';
  let currentVersion = 'v1';

  const key = (method: string, path: string) => `${method}:${path}`;

  return {
    setVersion(version: string): void {
      currentVersion = version;
    },

    getVersion(): string {
      return currentVersion;
    },

    setPrefix(prefix: string): void {
      globalPrefix = prefix;
    },

    get(path: string, handler: RequestHandler): void {
      routes.set(key('GET', path), {
        method: 'GET',
        path: globalPrefix + path,
        handler,
        moduleId: 'kernel',
      });
    },

    post(path: string, handler: RequestHandler): void {
      routes.set(key('POST', path), {
        method: 'POST',
        path: globalPrefix + path,
        handler,
        moduleId: 'kernel',
      });
    },

    put(path: string, handler: RequestHandler): void {
      routes.set(key('PUT', path), {
        method: 'PUT',
        path: globalPrefix + path,
        handler,
        moduleId: 'kernel',
      });
    },

    delete(path: string, handler: RequestHandler): void {
      routes.set(key('DELETE', path), {
        method: 'DELETE',
        path: globalPrefix + path,
        handler,
        moduleId: 'kernel',
      });
    },

    use(
      mw: (
        req: Request,
        method: string,
        path: string
      ) => Promise<Response | null>
    ): void {
      middleware.push(mw);
    },

    getRoute(path: string, method: string): APIRoute | undefined {
      return routes.get(key(method, path));
    },

    getAll(): APIRoute[] {
      return Array.from(routes.values());
    },

    async handleRequest(
      req: Request,
      params: Record<string, string>
    ): Promise<Response | null> {
      const path = new URL(req.url).pathname;
      const method = req.method;
      const start = performance.now();

      const metric = metrics.get(key(method, path)) ?? {
        count: 0,
        totalDuration: 0,
        errors: 0,
        lastRequest: 0,
      };
      metric.count++;
      metric.lastRequest = Date.now();

      try {
        for (const mw of middleware) {
          const mwResponse = await mw(req, method, path);
          if (mwResponse) {
            metric.totalDuration += performance.now() - start;
            return mwResponse;
          }
        }

        let route = routes.get(key(method, path));
        if (!route) {
          const versionedPath = path.replace(/^\/api\/v\d+\//, '/api/');
          route = routes.get(key(method, versionedPath));
        }

        if (!route) {
          metric.errors++;
          metrics.set(key(method, path), metric);
          return null;
        }

        const response = await route.handler(req, params);

        metric.totalDuration += performance.now() - start;
        metrics.set(key(method, path), metric);

        return response;
      } catch (error) {
        metric.errors++;
        metrics.set(key(method, path), metric);
        const message =
          error instanceof Error ? error.message : 'Internal error';
        return new Response(JSON.stringify({ error: message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    },

    /* --- Versioning --- */
    version(version: string): {
      get: (p: string, h: RequestHandler) => void;
      post: (p: string, h: RequestHandler) => void;
      put: (p: string, h: RequestHandler) => void;
      delete: (p: string, h: RequestHandler) => void;
    } {
      const prefix = `/api/${version}`;
      const api = this;
      return {
        get(path: string, handler: RequestHandler) {
          api.get(prefix + path, handler);
        },
        post(path: string, handler: RequestHandler) {
          api.post(prefix + path, handler);
        },
        put(path: string, handler: RequestHandler) {
          api.put(prefix + path, handler);
        },
        delete(path: string, handler: RequestHandler) {
          api.delete(prefix + path, handler);
        },
      };
    },

    /* --- Rate Limiting (simple in-memory) --- */
    rateLimitMap: new Map<string, { count: number; resetAt: number }>(),

    setRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
      const now = Date.now();
      const entry = this.rateLimitMap.get(key);
      if (!entry || entry.resetAt <= now) {
        this.rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (entry.count >= maxRequests) return false;
      entry.count++;
      return true;
    },

    /* --- Webhooks --- */
    registerWebhook(
      event: string,
      config: { url: string; secret?: string }
    ): string {
      const id = crypto.randomUUID();
      if (!webhooks.has(event)) webhooks.set(event, []);
      webhooks.get(event)!.push({ id, event, ...config });
      return id;
    },

    getWebhooks(event?: string): WebhookRegistration[] {
      if (event) return webhooks.get(event) ?? [];
      return Array.from(webhooks.values()).flat();
    },

    async triggerWebhook(event: string, payload: any): Promise<void> {
      const hooks = webhooks.get(event) ?? [];
      for (const hook of hooks) {
        try {
          await fetch(hook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(hook.secret ? { 'X-Webhook-Secret': hook.secret } : {}),
            },
            body: JSON.stringify({ event, payload }),
          });
        } catch (error) {
          console.error(`[Webhook] Failed to send to ${hook.url}:`, error);
        }
      }
    },

    /* --- Metrics --- */
    getMetrics(path?: string, method?: string) {
      if (path && method) return metrics.get(key(method, path));
      return metrics;
    },

    /* --- Documentation --- */
    getOpenAPISpec(): Record<string, any> {
      const paths: Record<string, any> = {};
      const allRoutes = Array.from(routes.values());
      for (const route of allRoutes) {
        const path = route.path;
        const method = route.method.toLowerCase();
        if (!paths[path]) paths[path] = {};
        paths[path][method] = {
          summary: `Route ${route.method} ${route.path}`,
          tags: [route.moduleId],
          responses: { '200': { description: 'Success' } },
        };
      }
      return {
        openapi: '3.0.0',
        info: { title: 'Sukit API', version: currentVersion },
        paths,
      };
    },
  };
}

export type APIRoutesAPI = ReturnType<typeof createAPIRoutesAPI>;
