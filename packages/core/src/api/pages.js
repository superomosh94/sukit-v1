let _adapter = null;
export function setPagesAdapter(adapter) {
    _adapter = adapter;
}
export function createPagesAPI(adapter) {
    const a = () => adapter ?? _adapter;
    return {
        async create(siteId, slug, title) {
            return a().create(siteId, slug, title);
        },
        async get(siteId, pageId) {
            return a().get(siteId, pageId);
        },
        async save(page) {
            return a().save(page);
        },
        async delete(siteId, pageId) {
            return a().delete(siteId, pageId);
        },
        async list(siteId) {
            return a().list(siteId);
        },
    };
}
