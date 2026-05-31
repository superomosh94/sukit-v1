import type { ComponentType } from "react";
import type { ModuleManifest } from "@sukit/core";

export interface ModuleRegistration {
  manifest: ModuleManifest;
  components: Record<string, ComponentType<Record<string, unknown>>>;
  hooks: Record<string, (...args: unknown[]) => unknown>;
  enabled: boolean;
}

class ModuleRegistry {
  private modules = new Map<string, ModuleRegistration>();

  register(registration: ModuleRegistration): void {
    this.modules.set(registration.manifest.id, registration);
  }

  unregister(moduleId: string): void {
    this.modules.delete(moduleId);
  }

  get(moduleId: string): ModuleRegistration | undefined {
    return this.modules.get(moduleId);
  }

  getAll(): ModuleRegistration[] {
    return Array.from(this.modules.values());
  }

  getEnabled(): ModuleRegistration[] {
    return this.getAll().filter((m) => m.enabled);
  }

  enable(moduleId: string): void {
    const mod = this.modules.get(moduleId);
    if (mod) mod.enabled = true;
  }

  disable(moduleId: string): void {
    const mod = this.modules.get(moduleId);
    if (mod) mod.enabled = false;
  }

  isInstalled(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  getComponent(moduleId: string, componentName: string): ComponentType<Record<string, unknown>> | undefined {
    return this.modules.get(moduleId)?.components[componentName];
  }

  runHook(hookName: string, ...args: unknown[]): unknown[] {
    const results: unknown[] = [];
    for (const mod of this.getEnabled()) {
      const hookFn = mod.hooks[hookName];
      if (hookFn) {
        results.push(hookFn(...args));
      }
    }
    return results;
  }
}

export const moduleRegistry = new ModuleRegistry();
