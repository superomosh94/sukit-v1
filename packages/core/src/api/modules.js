export function createModulesAPI(loader) {
    return {
        async load(id, manifest, factory) {
            await loader.load(id, manifest, factory);
        },
        async unload(id) {
            await loader.unload(id);
        },
        list() {
            return loader.list();
        },
        isLoaded(id) {
            return loader.isLoaded(id);
        },
        getManifest(id) {
            return loader.getManifest(id);
        },
        getAll() {
            return loader.getAll();
        },
    };
}
//# sourceMappingURL=modules.js.map