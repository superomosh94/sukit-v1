let _adapter = null;
export function setStorageAdapter(adapter) {
    _adapter = adapter;
}
export function createStorageAPI(prefix, adapter) {
    const a = () => adapter ?? _adapter;
    const prefixed = (key) => `${prefix}:${key}`;
    return {
        async get(key) {
            return a().get(prefixed(key));
        },
        async set(key, value) {
            return a().set(prefixed(key), value);
        },
        async delete(key) {
            return a().delete(prefixed(key));
        },
        async has(key) {
            return a().has(prefixed(key));
        },
    };
}
//# sourceMappingURL=storage.js.map