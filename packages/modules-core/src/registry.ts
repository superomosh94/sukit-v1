import { SukitModule } from './types';

class ModuleRegistry {
  private modules: Map<string, SukitModule> = new Map();

  registerModule(mod: SukitModule): void {
    this.modules.set(mod.id, mod);
  }

  unregisterModule(id: string): boolean {
    return this.modules.delete(id);
  }

  getModule(id: string): SukitModule | undefined {
    return this.modules.get(id);
  }

  getAllModules(): SukitModule[] {
    return Array.from(this.modules.values());
  }

  getEnabledModules(): SukitModule[] {
    return this.getAllModules().filter((m) => m.enabled);
  }

  setModuleEnabled(id: string, enabled: boolean): void {
    const mod = this.modules.get(id);
    if (mod) {
      mod.enabled = enabled;
    }
  }

  clear(): void {
    this.modules.clear();
  }
}

export const moduleRegistry = new ModuleRegistry();
