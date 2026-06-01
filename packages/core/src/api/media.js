let _adapter = null;
export function setMediaAdapter(adapter) {
    _adapter = adapter;
}
export function createMediaAPI(adapter) {
    const a = () => adapter ?? _adapter;
    return {
        async upload(file, siteId) {
            return a().upload(file, siteId);
        },
        async get(id) {
            return a().get(id);
        },
        async list(siteId) {
            return a().list(siteId);
        },
        url(id, options) {
            return a().getUrl(id, options);
        },
        async delete(id) {
            return a().delete(id);
        },
    };
}
