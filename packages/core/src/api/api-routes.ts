import type { APIRoute, RequestHandler } from "../types";

export function createAPIRoutesAPI() {
  const routes = new Map<string, APIRoute>();

  const key = (method: string, path: string) => `${method}:${path}`;

  return {
    get(path: string, handler: RequestHandler): void {
      routes.set(key("GET", path), { method: "GET", path, handler, moduleId: "kernel" });
    },

    post(path: string, handler: RequestHandler): void {
      routes.set(key("POST", path), { method: "POST", path, handler, moduleId: "kernel" });
    },

    put(path: string, handler: RequestHandler): void {
      routes.set(key("PUT", path), { method: "PUT", path, handler, moduleId: "kernel" });
    },

    delete(path: string, handler: RequestHandler): void {
      routes.set(key("DELETE", path), { method: "DELETE", path, handler, moduleId: "kernel" });
    },

    getRoute(path: string, method: string): APIRoute | undefined {
      return routes.get(key(method, path));
    },

    getAll(): APIRoute[] {
      return Array.from(routes.values());
    },

    async handleRequest(req: Request, params: Record<string, string>): Promise<Response | null> {
      const route = routes.get(key(req.method, req.url?.split("?")[0] ?? ""));
      if (!route) return null;
      return route.handler(req, params);
    },
  };
}

export type APIRoutesAPI = ReturnType<typeof createAPIRoutesAPI>;
