import type { Module, ModuleManifest, ActiveModule } from '../types';
import { EventBus } from './event-bus';
import { PermissionManager } from './permission-manager';
import type { SukitKernel } from '../index';

export class ModuleLoader {
  private modules = new Map<string, ActiveModule>();
  private kernel: SukitKernel;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  async load(
    moduleId: string,
    manifest: ModuleManifest,
    factory: () => Promise<{ default: Module }>
  ): Promise<void> {
    const existing = this.modules.get(moduleId);
    if (existing?.status === 'active') return;

    try {
      const modExports = await factory();
      const mod = modExports.default;

      const perms = manifest.sukit.permissions ?? [];
      for (const perm of perms) {
        const granted = await this.kernel
          .forModule(moduleId)
          .permissions.request(
            perm,
            `Module ${manifest.name} requires ${perm}`
          );
        if (!granted) {
          throw new Error(
            `Permission "${perm}" denied for module "${moduleId}"`
          );
        }
      }

      await mod.activate(this.kernel.forModule(moduleId));

      this.modules.set(moduleId, {
        definition: mod,
        manifest,
        status: 'active',
      });

      await this.kernel.events.emit('module:activated', { moduleId });
    } catch (error) {
      this.modules.set(moduleId, {
        definition: null as any,
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

  async unload(moduleId: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) return;

    try {
      await mod.definition.deactivate(this.kernel.forModule(moduleId));
      await this.kernel.events.emit('module:deactivated', { moduleId });
    } catch (error) {
      console.error(`[ModuleLoader] Error deactivating "${moduleId}":`, error);
    }

    this.modules.delete(moduleId);
  }

  isLoaded(moduleId: string): boolean {
    return this.modules.get(moduleId)?.status === 'active';
  }

  getManifest(moduleId: string): ModuleManifest | undefined {
    return this.modules.get(moduleId)?.manifest;
  }

  list(): Module[] {
    return Array.from(this.modules.values())
      .filter((m) => m.status === 'active')
      .map((m) => m.definition);
  }

  getAll(): ActiveModule[] {
    return Array.from(this.modules.values());
  }

  async reload(
    moduleId: string,
    manifest: ModuleManifest,
    factory: () => Promise<{ default: Module }>
  ): Promise<void> {
    await this.unload(moduleId);
    await this.load(moduleId, manifest, factory);
  }
}
