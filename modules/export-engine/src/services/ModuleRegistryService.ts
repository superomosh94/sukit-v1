import { prisma } from '../db.js';
import { readdirSync, existsSync } from 'node:fs';
import path from 'path';

export interface EnabledModule {
  id: string;
  moduleId: string;
  name: string;
  version: string;
  enabled: boolean;
  settings: Record<string, unknown>;
  capabilities: ModuleCapability[];
}

export type ModuleCapability =
  | 'routes'
  | 'models'
  | 'components'
  | 'blocks'
  | 'api'
  | 'hooks'
  | 'assets'
  | 'email'
  | 'payments'
  | 'storage'
  | 'auth'
  | 'ai';

export interface ModuleCapabilityList {
  moduleId: string;
  capabilities: ModuleCapability[];
}

export interface ModuleSchema {
  routes?: string[];
  models?: string[];
  blocks?: string[];
  settings?: Record<string, unknown>;
}

const MODULE_REGISTRY: Record<
  string,
  { name: string; capabilities: ModuleCapability[] }
> = {
  'visual-builder': {
    name: 'Visual Builder',
    capabilities: ['blocks', 'components'],
  },
  'site-manager': { name: 'Site Manager', capabilities: ['routes', 'models'] },
  'media-library': {
    name: 'Media Library',
    capabilities: ['routes', 'models', 'components'],
  },
  'form-builder': {
    name: 'Form Builder',
    capabilities: ['routes', 'models', 'blocks', 'components', 'email'],
  },
  'seo-module': {
    name: 'SEO Module',
    capabilities: ['routes', 'models', 'components'],
  },
  analytics: {
    name: 'Analytics',
    capabilities: ['routes', 'models', 'components'],
  },
  'code-editor': { name: 'Code Editor', capabilities: ['components', 'hooks'] },
  chat: {
    name: 'AI Chat',
    capabilities: ['routes', 'models', 'components', 'ai'],
  },
  'popup-builder': {
    name: 'Popup Builder',
    capabilities: ['routes', 'models', 'blocks', 'components'],
  },
  commerce: {
    name: 'Commerce',
    capabilities: ['routes', 'models', 'blocks', 'components', 'payments'],
  },
  blog: {
    name: 'Blog',
    capabilities: ['routes', 'models', 'blocks', 'components'],
  },
  auth: { name: 'Authentication', capabilities: ['routes', 'models', 'auth'] },
  backup: { name: 'Backup', capabilities: ['routes', 'models', 'storage'] },
  translation: {
    name: 'Translation',
    capabilities: ['routes', 'models', 'components'],
  },
  membership: { name: 'Membership', capabilities: ['routes', 'models', 'api'] },
  booking: {
    name: 'Booking',
    capabilities: ['routes', 'models', 'components'],
  },
  newsletter: {
    name: 'Newsletter',
    capabilities: ['routes', 'models', 'email'],
  },
  webhook: { name: 'Webhook', capabilities: ['routes', 'hooks'] },
};

export class ModuleRegistryService {
  async getEnabledModules(siteId: string): Promise<EnabledModule[]> {
    const dbModules = await prisma.module.findMany({
      where: { siteId, enabled: true },
    });

    const filesystemModules = this.getFilesystemModules();

    return dbModules
      .map((m) => {
        const reg = MODULE_REGISTRY[m.moduleId];
        return {
          id: m.id,
          moduleId: m.moduleId,
          name: reg?.name || m.moduleId,
          version: '1.0.0',
          enabled: m.enabled,
          settings: m.settings as Record<string, unknown>,
          capabilities: reg?.capabilities || [],
        };
      })
      .concat(
        filesystemModules
          .filter((fs) => !dbModules.some((db) => db.moduleId === fs))
          .map((fs) => {
            const reg = MODULE_REGISTRY[fs];
            return {
              id: `fs-${fs}`,
              moduleId: fs,
              name: reg?.name || fs,
              version: '1.0.0',
              enabled: true,
              settings: {},
              capabilities: reg?.capabilities || [],
            };
          })
      );
  }

  async getModuleCapabilities(moduleId: string): Promise<ModuleCapability[]> {
    const reg = MODULE_REGISTRY[moduleId];
    return reg?.capabilities || [];
  }

  async getModuleSchema(moduleId: string): Promise<ModuleSchema | null> {
    const modulesDir = path.resolve(
      process.cwd(),
      '..',
      '..',
      'modules',
      moduleId
    );
    const schemaPath = path.join(modulesDir, 'schema.json');
    if (existsSync(schemaPath)) {
      const { readFileSync } = await import('fs');
      return JSON.parse(readFileSync(schemaPath, 'utf-8'));
    }
    return null;
  }

  async isModuleAvailable(moduleId: string, siteId: string): Promise<boolean> {
    const db = await prisma.module.findUnique({
      where: { siteId_moduleId: { siteId, moduleId } },
    });
    if (db) return db.enabled;
    return (
      moduleId in MODULE_REGISTRY ||
      this.getFilesystemModules().includes(moduleId)
    );
  }

  getAllKnownModules(): string[] {
    return Object.keys(MODULE_REGISTRY);
  }

  getModuleName(moduleId: string): string {
    return MODULE_REGISTRY[moduleId]?.name || moduleId;
  }

  private getFilesystemModules(): string[] {
    try {
      const modulesDir = path.resolve(process.cwd(), '..', '..', 'modules');
      if (!existsSync(modulesDir)) return [];
      return readdirSync(modulesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
    } catch {
      return [];
    }
  }
}

export const moduleRegistry = new ModuleRegistryService();
