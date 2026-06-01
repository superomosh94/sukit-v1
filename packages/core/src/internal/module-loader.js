export class ModuleLoader {
    modules = new Map();
    kernel;
    constructor(kernel) {
        this.kernel = kernel;
    }
    async load(moduleId, manifest, factory) {
        const existing = this.modules.get(moduleId);
        if (existing?.status === 'active')
            return;
        try {
            const modExports = await factory();
            const mod = modExports.default;
            const perms = manifest.sukit.permissions ?? [];
            for (const perm of perms) {
                const granted = await this.kernel
                    .forModule(moduleId)
                    .permissions.request(perm, `Module ${manifest.name} requires ${perm}`);
                if (!granted) {
                    throw new Error(`Permission "${perm}" denied for module "${moduleId}"`);
                }
            }
            await mod.activate(this.kernel.forModule(moduleId));
            this.modules.set(moduleId, {
                definition: mod,
                manifest,
                status: 'active',
            });
            await this.kernel.events.emit('module:activated', { moduleId });
        }
        catch (error) {
            this.modules.set(moduleId, {
                definition: null,
                manifest,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            await this.kernel.events.emit('module:error', {
                moduleId,
                error: error instanceof Error ? error.message : 'Unknown',
            });
        }
    }
    async unload(moduleId) {
        const mod = this.modules.get(moduleId);
        if (!mod)
            return;
        try {
            await mod.definition.deactivate(this.kernel.forModule(moduleId));
            await this.kernel.events.emit('module:deactivated', { moduleId });
        }
        catch (error) {
            console.error(`[ModuleLoader] Error deactivating "${moduleId}":`, error);
        }
        this.modules.delete(moduleId);
    }
    isLoaded(moduleId) {
        return this.modules.get(moduleId)?.status === 'active';
    }
    getManifest(moduleId) {
        return this.modules.get(moduleId)?.manifest;
    }
    list() {
        return Array.from(this.modules.values())
            .filter((m) => m.status === 'active')
            .map((m) => m.definition);
    }
    getAll() {
        return Array.from(this.modules.values());
    }
    async reload(moduleId, manifest, factory) {
        await this.unload(moduleId);
        await this.load(moduleId, manifest, factory);
    }
}
