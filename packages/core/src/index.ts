import { EventBus } from "./internal/event-bus";
import { PermissionManager } from "./internal/permission-manager";
import { ModuleLoader } from "./internal/module-loader";

import { createModulesAPI, type ModulesAPI } from "./api/modules";
import { createEventsAPI, type EventsAPI } from "./api/events";
import { createAuthAPI, setAuthAdapter, type AuthAPI, type AuthAdapter } from "./api/auth";
import { createPermissionsAPI, type PermissionsAPI } from "./api/permissions";
import { createFSAPI, setFSAdapter, type FSAPI, type FSAdapter } from "./api/fs";
import { createStorageAPI, setStorageAdapter, type StorageAPI, type StorageAdapter } from "./api/storage";
import { createSitesAPI, setSitesAdapter, type SitesAPI, type SitesAdapter } from "./api/sites";
import { createPagesAPI, setPagesAdapter, type PagesAPI, type PagesAdapter } from "./api/pages";
import { createBlocksAPI, type BlocksAPI } from "./api/blocks";
import { createMediaAPI, setMediaAdapter, type MediaAPI, type MediaAdapter } from "./api/media";
import { createExportAPI, setExportAdapter, type ExportAPI, type ExportAdapter } from "./api/export-engine";
import { createAPIRoutesAPI, type APIRoutesAPI } from "./api/api-routes";
import { createUIAPI, type UIAPI } from "./api/ui";
import { createSettingsAPI, setSettingsAdapter, type SettingsAPI, type SettingsAdapter } from "./api/settings";
import { createTasksAPI, setTasksAdapter, type TasksAPI, type TasksAdapter } from "./api/tasks";
import { createCacheAPI, setCacheAdapter, type CacheAPI, type CacheAdapter } from "./api/cache";
import { createLogAPI, type LogAPI } from "./api/log";

export interface KernelConfig {
  auth?: AuthAdapter;
  fs?: FSAdapter;
  storage?: StorageAdapter;
  sites?: SitesAdapter;
  pages?: PagesAdapter;
  media?: MediaAdapter;
  export?: ExportAdapter;
  tasks?: TasksAdapter;
  cache?: CacheAdapter;
  settings?: SettingsAdapter;
}

export interface SukitKernel {
  modules: ModulesAPI;
  events: EventsAPI;
  auth: AuthAPI;
  permissions: PermissionsAPI;
  fs: FSAPI;
  storage: StorageAPI;
  sites: SitesAPI;
  pages: PagesAPI;
  blocks: BlocksAPI;
  media: MediaAPI;
  export: ExportAPI;
  api: APIRoutesAPI;
  ui: UIAPI;
  settings: SettingsAPI;
  tasks: TasksAPI;
  cache: CacheAPI;
  log: LogAPI;
  forModule(moduleId: string): SukitKernel;
}

export function createKernel(config?: KernelConfig): SukitKernel {
  const eventBus = new EventBus();
  const permissionManager = new PermissionManager();
  const blocksAPI = createBlocksAPI();
  const apiRoutesAPI = createAPIRoutesAPI();
  const uiAPI = createUIAPI();
  const logAPI = createLogAPI();

  if (config?.auth) setAuthAdapter(config.auth);
  if (config?.fs) setFSAdapter(config.fs);
  if (config?.storage) setStorageAdapter(config.storage);
  if (config?.sites) setSitesAdapter(config.sites);
  if (config?.pages) setPagesAdapter(config.pages);
  if (config?.media) setMediaAdapter(config.media);
  if (config?.export) setExportAdapter(config.export);
  if (config?.tasks) setTasksAdapter(config.tasks);
  if (config?.cache) setCacheAdapter(config.cache);
  if (config?.settings) setSettingsAdapter(config.settings);

  const kernel: SukitKernel = {
    modules: createModulesAPI(new ModuleLoader(null as any)),
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

    forModule(moduleId: string): SukitKernel {
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
  (kernel.modules as ModulesAPI) = createModulesAPI(loader);

  return kernel;
}

export { setAuthAdapter, setFSAdapter, setStorageAdapter, setSitesAdapter, setPagesAdapter, setMediaAdapter, setExportAdapter, setTasksAdapter, setCacheAdapter, setSettingsAdapter };

export type { AuthAdapter, FSAdapter, StorageAdapter, SitesAdapter, PagesAdapter, MediaAdapter, ExportAdapter, TasksAdapter, CacheAdapter, SettingsAdapter, ModulesAPI, EventsAPI, AuthAPI, PermissionsAPI, FSAPI, StorageAPI, SitesAPI, PagesAPI, BlocksAPI, MediaAPI, ExportAPI, APIRoutesAPI, UIAPI, SettingsAPI, TasksAPI, CacheAPI, LogAPI };

export * from "./types";
