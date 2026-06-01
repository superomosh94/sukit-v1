let _adapter = null;
export function setCacheAdapter(adapter) {
    _adapter = adapter;
}
export function createCacheAPI(adapter) {
    const a = () => adapter ?? _adapter;
    return {
        async get(key) {
            return a().get(key);
        },
        async set(key, value, ttl) {
            return a().set(key, value, ttl);
        },
        async delete(key) {
            return a().delete(key);
        },
        async clear() {
            return a().clear();
        },
    };
}
//# sourceMappingURL=cache.js.map