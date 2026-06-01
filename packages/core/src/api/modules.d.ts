import type { Module, ModuleManifest, ActiveModule } from '../types';
import { ModuleLoader } from '../internal/module-loader';
export declare function createModulesAPI(loader: ModuleLoader): {
  load(
    id: string,
    manifest: ModuleManifest,
    factory: () => Promise<{
      default: Module;
    }>
  ): Promise<void>;
  unload(id: string): Promise<void>;
  list(): Module[];
  isLoaded(id: string): boolean;
  getManifest(id: string): ModuleManifest | undefined;
  getAll(): ActiveModule[];
};
export type ModulesAPI = ReturnType<typeof createModulesAPI>;
//# sourceMappingURL=modules.d.ts.map
