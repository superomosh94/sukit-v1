import type { Module, ModuleManifest, ActiveModule } from '../types';
import type { SukitKernel } from '../index';
export declare class ModuleLoader {
  private modules;
  private kernel;
  constructor(kernel: SukitKernel);
  load(
    moduleId: string,
    manifest: ModuleManifest,
    factory: () => Promise<{
      default: Module;
    }>
  ): Promise<void>;
  unload(moduleId: string): Promise<void>;
  isLoaded(moduleId: string): boolean;
  getManifest(moduleId: string): ModuleManifest | undefined;
  list(): Module[];
  getAll(): ActiveModule[];
  reload(
    moduleId: string,
    manifest: ModuleManifest,
    factory: () => Promise<{
      default: Module;
    }>
  ): Promise<void>;
}
