import type { ComponentType } from 'react';
export type KernelForModule = import('../index').SukitKernel;
export interface ModuleAuthor {
  name: string;
  email?: string;
  url?: string;
}
export interface ModuleSlotConfig {
  component: string;
  position: number;
  when?: string;
}
export interface ModuleEntrypoints {
  main: string;
  styles?: string;
  settings?: string;
}
export interface SukitManifest {
  minVersion: string;
  maxVersion?: string;
  capabilities: string[];
  permissions: string[];
  entrypoints: ModuleEntrypoints;
  slots?: Record<string, ModuleSlotConfig>;
  hooks?: Record<string, string>;
  api?: {
    basePath: string;
    routes: string;
  };
  database?: {
    migrations: string;
    models: string[];
  };
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}
export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: ModuleAuthor | string;
  license?: string;
  icon?: string;
  screenshots?: string[];
  repository?: string;
  sukit: SukitManifest;
  settings?: ModuleSettings;
}
export interface ModuleSettings {
  [key: string]: {
    type:
      | 'text'
      | 'number'
      | 'boolean'
      | 'select'
      | 'file'
      | 'image'
      | 'color'
      | 'code'
      | 'encrypted'
      | 'json';
    label?: string;
    default?: any;
    options?: {
      label: string;
      value: any;
    }[];
    required?: boolean;
    description?: string;
  };
}
export interface Module {
  manifest: ModuleManifest;
  activate(kernel: KernelForModule): Promise<void> | void;
  deactivate(kernel: KernelForModule): Promise<void> | void;
  onInstall?(): Promise<void> | void;
  onUninstall?(): Promise<void> | void;
}
export interface ActiveModule {
  definition: Module;
  manifest: ModuleManifest;
  status: 'active' | 'inactive' | 'error';
  error?: string;
}
export type BlockCategory =
  | 'content'
  | 'media'
  | 'layout'
  | 'forms'
  | 'widgets'
  | 'advanced';
export interface BlockDefinition {
  type: string;
  name: string;
  description: string;
  category: BlockCategory;
  icon: string;
  component: ComponentType<any>;
  schema: Record<string, any>;
  defaultProps?: Record<string, any>;
  defaultStyles?: Record<string, any>;
  supportsChildren?: boolean;
}
export interface Block {
  id: string;
  blockType: string;
  props: Record<string, any>;
  styles?: Record<string, any>;
  children?: Block[];
}
export interface Site {
  id: string;
  name: string;
  domain?: string;
  settings: Record<string, any>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
export interface SiteOptions {
  domain?: string;
  template?: string;
}
export interface Page {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  isHome: boolean;
  settings: Record<string, any>;
  sections?: any[];
  createdAt: string;
  updatedAt: string;
}
export interface MediaAsset {
  id: string;
  siteId: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  createdAt: string;
}
export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}
export interface Deployment {
  id: string;
  siteId: string;
  provider: 'netlify' | 'vercel' | 'github';
  status: 'pending' | 'building' | 'success' | 'failed';
  url?: string;
  createdAt: string;
}
export interface Task<T = any> {
  name: string;
  data: T;
  options?: {
    priority?: number;
    delay?: number;
    retries?: number;
  };
}
export interface ScheduledTask<T = any> extends Task<T> {
  cron: string;
}
export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';
export interface Session {
  userId: string;
  token: string;
  expiresAt: string;
}
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}
export interface Invitation {
  id: string;
  siteId: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
}
export interface SlotOptions {
  position?: number;
  when?: string;
}
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  modifiedAt: string;
}
export interface SettingsPanel {
  id: string;
  label: string;
  icon?: string;
  component: ComponentType<any>;
}
export type RequestHandler = (
  req: Request,
  params: Record<string, string>
) => Response | Promise<Response>;
export interface APIRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: RequestHandler;
  moduleId: string;
}
export interface ModuleLogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error): void;
  forModule(moduleId: string): ModuleLogger;
}
