import type { Module, ModuleManifest, ActiveModule } from "../types";
import { ModuleLoader } from "../internal/module-loader";

export function createModulesAPI(loader: ModuleLoader) {
  return {
    async load(id: string, manifest: ModuleManifest, factory: () => Promise<{ default: Module }>): Promise<void> {
      await loader.load(id, manifest, factory);
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
  };
}

export type ModulesAPI = ReturnType<typeof createModulesAPI>;
