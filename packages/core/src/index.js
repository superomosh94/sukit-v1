import { EventBus } from "./internal/event-bus";
import { PermissionManager } from "./internal/permission-manager";
import { ModuleLoader } from "./internal/module-loader";
import { createModulesAPI } from "./api/modules";
import { createEventsAPI } from "./api/events";
import { createAuthAPI, setAuthAdapter } from "./api/auth";
import { createPermissionsAPI } from "./api/permissions";
import { createFSAPI, setFSAdapter } from "./api/fs";
import { createStorageAPI, setStorageAdapter } from "./api/storage";
import { createSitesAPI, setSitesAdapter } from "./api/sites";
import { createPagesAPI, setPagesAdapter } from "./api/pages";
import { createBlocksAPI } from "./api/blocks";
import { createMediaAPI, setMediaAdapter } from "./api/media";
import { createExportAPI, setExportAdapter } from "./api/export-engine";
import { createAPIRoutesAPI } from "./api/api-routes";
import { createUIAPI } from "./api/ui";
import { createSettingsAPI, setSettingsAdapter } from "./api/settings";
import { createTasksAPI, setTasksAdapter } from "./api/tasks";
import { createCacheAPI, setCacheAdapter } from "./api/cache";
import { createLogAPI } from "./api/log";
export function createKernel(config) {
    const eventBus = new EventBus();
    const permissionManager = new PermissionManager();
    const blocksAPI = createBlocksAPI();
    const apiRoutesAPI = createAPIRoutesAPI();
    const uiAPI = createUIAPI();
    const logAPI = createLogAPI();
    if (config?.auth)
        setAuthAdapter(config.auth);
    if (config?.fs)
        setFSAdapter(config.fs);
    if (config?.storage)
        setStorageAdapter(config.storage);
    if (config?.sites)
        setSitesAdapter(config.sites);
    if (config?.pages)
        setPagesAdapter(config.pages);
    if (config?.media)
        setMediaAdapter(config.media);
    if (config?.export)
        setExportAdapter(config.export);
    if (config?.tasks)
        setTasksAdapter(config.tasks);
    if (config?.cache)
        setCacheAdapter(config.cache);
    if (config?.settings)
        setSettingsAdapter(config.settings);
    const kernel = {
        modules: createModulesAPI(new ModuleLoader(null)),
        events: createEventsAPI(eventBus),
        auth: createAuthAPI(config?.auth),
        permissions: createPermissionsAPI(permissionManager),
        fs: createFSAPI(config?.fs),
        storage: createStorageAPI("kernel", config?.storage),
        sites: createSitesAPI(config?.sites),
        pages: createPagesAPI(config?.pages),
        blocks: blocksAPI,
        media: createMediaAPI(config?.media),
        export: createExportAPI(config?.export),
        api: apiRoutesAPI,
        ui: uiAPI,
        settings: createSettingsAPI("kernel", config?.settings),
        tasks: createTasksAPI(config?.tasks),
        cache: createCacheAPI(config?.cache),
        log: logAPI,
        forModule(moduleId) {
            return {
                modules: kernel.modules,
                events: kernel.events,
                auth: kernel.auth,
                permissions: createPermissionsAPI(permissionManager, moduleId),
                fs: kernel.fs,
                storage: createStorageAPI(moduleId, config?.storage),
                sites: kernel.sites,
                pages: kernel.pages,
                blocks: kernel.blocks,
                media: kernel.media,
                export: kernel.export,
                api: kernel.api,
                ui: kernel.ui,
                settings: createSettingsAPI(moduleId, config?.settings),
                tasks: kernel.tasks,
                cache: kernel.cache,
                log: createLogAPI(moduleId),
                forModule: kernel.forModule,
            };
        },
    };
    const loader = new ModuleLoader(kernel);
    kernel.modules = createModulesAPI(loader);
    return kernel;
}
export { setAuthAdapter, setFSAdapter, setStorageAdapter, setSitesAdapter, setPagesAdapter, setMediaAdapter, setExportAdapter, setTasksAdapter, setCacheAdapter, setSettingsAdapter };
export * from "./types";
//# sourceMappingURL=index.js.map