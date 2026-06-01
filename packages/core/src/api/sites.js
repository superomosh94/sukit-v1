let _adapter = null;
export function setSitesAdapter(adapter) {
    _adapter = adapter;
}
export function createSitesAPI(adapter) {
    const a = () => adapter ?? _adapter;
    return {
        async create(name, options) {
            return a().create(name, options);
        },
        async get(id) {
            return a().get(id);
        },
        async update(id, data) {
            return a().update(id, data);
        },
        async delete(id) {
            return a().delete(id);
        },
        async list() {
            return a().list();
        },
    };
}
