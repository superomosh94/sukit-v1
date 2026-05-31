import type { ModuleRegistration, ModuleManifest } from "@sukit/core";
import { moduleRegistry } from "./module-registry";

const moduleCache = new Map<string, ModuleRegistration>();

export async function loadModule(manifest: ModuleManifest): Promise<ModuleRegistration | null> {
  if (moduleCache.has(manifest.id)) {
    return moduleCache.get(manifest.id)!;
  }

  try {
    const mod = await import(/* webpackIgnore: true */ manifest.sukit.entrypoints.main);
    const registration: ModuleRegistration = {
      manifest,
      components: mod.components ?? {},
      hooks: mod.hooks ?? {},
      enabled: true,
    };
    moduleCache.set(manifest.id, registration);
    moduleRegistry.register(registration);
    return registration;
  } catch (error) {
    console.error(`Failed to load module "${manifest.id}":`, error);
    return null;
  }
}

export async function unloadModule(moduleId: string): Promise<void> {
  moduleCache.delete(moduleId);
  moduleRegistry.unregister(moduleId);
}

export function getLoadedModules(): ModuleRegistration[] {
  return Array.from(moduleCache.values());
}

export async function preloadModules(manifests: ModuleManifest[]): Promise<(ModuleRegistration | null)[]> {
  return Promise.all(manifests.map((m) => loadModule(m)));
}
