let _adapter = null;
export function setSettingsAdapter(adapter) {
    _adapter = adapter;
}
export function createSettingsAPI(prefix, adapter) {
    const a = () => adapter ?? _adapter;
    const panels = new Map();
    const prefixed = (key) => `${prefix}:${key}`;
    const ensure = () => {
        const inst = a();
        if (!inst)
            throw new Error('Settings adapter not configured');
        return inst;
    };
    return {
        async get(key, defaultValue) {
            const val = await ensure().get(prefixed(key));
            return val ?? defaultValue;
        },
        async set(key, value) {
            return ensure().set(prefixed(key), value);
        },
        registerPanel(panel) {
            panels.set(panel.id, panel);
        },
        getPanel(id) {
            return panels.get(id);
        },
        getAllPanels() {
            return Array.from(panels.values());
        },
    };
}
//# sourceMappingURL=settings.js.map