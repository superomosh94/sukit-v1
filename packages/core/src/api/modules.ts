import type { Module, ModuleManifest, ActiveModule } from '../types';
import { ModuleLoader } from '../internal/module-loader';

export function createModulesAPI(loader: ModuleLoader) {
  return {
    async load(
      id: string,
      manifest: ModuleManifest,
      factory: () => Promise<{ default: Module }>,
      priority?: number
    ): Promise<void> {
      await loader.load(id, manifest, factory, priority);
    },

    async unload(id: string): Promise<void> {
      await loader.unload(id);
    },

    list(): Module[] {
      return loader.list();
    },

    isLoaded(id: string): boolean {
      return loader.isLoaded(id);
    },

    getManifest(id: string): ModuleManifest | undefined {
      return loader.getManifest(id);
    },

    getAll(): ActiveModule[] {
      return loader.getAll();
    },

    async scan(
      discover: () => Promise<
        Array<{
          moduleId: string;
          manifest: ModuleManifest;
          factory: () => Promise<{ default: Module }>;
        }>
      >
    ): Promise<string[]> {
      return loader.scan(discover);
    },

    validateManifest(manifest: ModuleManifest): {
      valid: boolean;
      errors: string[];
    } {
      return loader.validateManifest(manifest);
    },

    async healthCheck(moduleId: string) {
      return loader.healthCheck(moduleId);
    },

    async runAllHealthChecks() {
      return loader.runAllHealthChecks();
    },

    getMetrics(moduleId?: string) {
      return loader.getMetrics(moduleId);
    },

    getDependencyGraph() {
      return loader.getDependencyGraph();
    },

    getDependents(moduleId: string): string[] {
      return loader.getDependents(moduleId);
    },

    getVersionHistory(moduleId: string) {
      return loader.getVersionHistory(moduleId);
    },

    async checkForUpdates(
      moduleId: string,
      latestVersion: string
    ): Promise<boolean> {
      return loader.checkForUpdates(moduleId, latestVersion);
    },

    async rollback(moduleId: string, version: string): Promise<boolean> {
      return loader.rollback(moduleId, version);
    },

    detectConflicts(moduleId: string, manifest: ModuleManifest): string[] {
      return loader.detectConflicts(moduleId, manifest);
    },

    protectModule(moduleId: string): void {
      loader.protectModule(moduleId);
    },

    unprotectModule(moduleId: string): void {
      loader.unprotectModule(moduleId);
    },

    setResourceLimits(
      moduleId: string,
      limits: { maxMemory?: number; maxCalls?: number; maxLoadTime?: number }
    ): void {
      loader.setResourceLimits(moduleId, limits);
    },

    async reload(
      id: string,
      manifest: ModuleManifest,
      factory: () => Promise<{ default: Module }>
    ): Promise<void> {
      await loader.reload(id, manifest, factory);
    },
  };
}

export type ModulesAPI = ReturnType<typeof createModulesAPI>;
