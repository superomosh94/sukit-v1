import { type ModulesAPI } from './api/modules';
import { type EventsAPI } from './api/events';
import { setAuthAdapter, type AuthAPI, type AuthAdapter } from './api/auth';
import { type PermissionsAPI } from './api/permissions';
import { setFSAdapter, type FSAPI, type FSAdapter } from './api/fs';
import {
  setStorageAdapter,
  type StorageAPI,
  type StorageAdapter,
} from './api/storage';
import { setSitesAdapter, type SitesAPI, type SitesAdapter } from './api/sites';
import { setPagesAdapter, type PagesAPI, type PagesAdapter } from './api/pages';
import { type BlocksAPI } from './api/blocks';
import { setMediaAdapter, type MediaAPI, type MediaAdapter } from './api/media';
import {
  setExportAdapter,
  type ExportAPI,
  type ExportAdapter,
} from './api/export-engine';
import { type APIRoutesAPI } from './api/api-routes';
import { type UIAPI } from './api/ui';
import {
  setSettingsAdapter,
  type SettingsAPI,
  type SettingsAdapter,
} from './api/settings';
import { setTasksAdapter, type TasksAPI, type TasksAdapter } from './api/tasks';
import { setCacheAdapter, type CacheAPI, type CacheAdapter } from './api/cache';
import { type LogAPI } from './api/log';
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
export declare function createKernel(config?: KernelConfig): SukitKernel;
export {
  setAuthAdapter,
  setFSAdapter,
  setStorageAdapter,
  setSitesAdapter,
  setPagesAdapter,
  setMediaAdapter,
  setExportAdapter,
  setTasksAdapter,
  setCacheAdapter,
  setSettingsAdapter,
};
export type {
  AuthAdapter,
  FSAdapter,
  StorageAdapter,
  SitesAdapter,
  PagesAdapter,
  MediaAdapter,
  ExportAdapter,
  TasksAdapter,
  CacheAdapter,
  SettingsAdapter,
  ModulesAPI,
  EventsAPI,
  AuthAPI,
  PermissionsAPI,
  FSAPI,
  StorageAPI,
  SitesAPI,
  PagesAPI,
  BlocksAPI,
  MediaAPI,
  ExportAPI,
  APIRoutesAPI,
  UIAPI,
  SettingsAPI,
  TasksAPI,
  CacheAPI,
  LogAPI,
};
export * from './types';
