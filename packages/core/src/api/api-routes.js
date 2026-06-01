export function createAPIRoutesAPI() {
    const routes = new Map();
    const key = (method, path) => `${method}:${path}`;
    return {
        get(path, handler) {
            routes.set(key("GET", path), { method: "GET", path, handler, moduleId: "kernel" });
        },
        post(path, handler) {
            routes.set(key("POST", path), { method: "POST", path, handler, moduleId: "kernel" });
        },
        put(path, handler) {
            routes.set(key("PUT", path), { method: "PUT", path, handler, moduleId: "kernel" });
        },
        delete(path, handler) {
            routes.set(key("DELETE", path), { method: "DELETE", path, handler, moduleId: "kernel" });
        },
        getRoute(path, method) {
            return routes.get(key(method, path));
        },
        getAll() {
            return Array.from(routes.values());
        },
        async handleRequest(req, params) {
            const route = routes.get(key(req.method, req.url?.split("?")[0] ?? ""));
            if (!route)
                return null;
            return route.handler(req, params);
        },
    };
}
