let _adapter = null;
export function setFSAdapter(adapter) {
    _adapter = adapter;
}
export function createFSAPI(adapter) {
    const a = () => adapter ?? _adapter;
    return {
        async read(path) {
            return a().readFile(path);
        },
        async write(path, content) {
            return a().writeFile(path, content);
        },
        async exists(path) {
            return a().exists(path);
        },
        async list(dir) {
            return a().readDirectory(dir);
        },
        async delete(path) {
            return a().deleteFile(path);
        },
    };
}
//# sourceMappingURL=fs.js.map