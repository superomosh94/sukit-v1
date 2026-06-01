let _adapter = null;
export function setExportAdapter(adapter) {
    _adapter = adapter;
}
export function createExportAPI(adapter) {
    const a = () => adapter ?? _adapter;
    return {
        async toStatic(siteId) {
            return a().toStatic(siteId);
        },
        async toNextJS(siteId) {
            return a().toNextJS(siteId);
        },
        async toGitHub(siteId, repo) {
            return a().toGitHub(siteId, repo);
        },
        async deploy(siteId, provider) {
            return a().deploy(siteId, provider);
        },
    };
}
