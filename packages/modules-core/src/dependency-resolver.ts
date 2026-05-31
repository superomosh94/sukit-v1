import { readJson, pathExists } from 'fs-extra';
import { join } from 'path';

export interface PluginManifest {
  name: string;
  version: string;
  displayName: string;
  description?: string;
  category?: string;
  requirements?: string[];
  conflicts?: string[];
  [key: string]: any;
}

export class DependencyResolver {
  private pluginsPath: string;
  private pluginCache: Map<string, PluginManifest>;

  constructor(pluginsPath: string) {
    this.pluginsPath = pluginsPath;
    this.pluginCache = new Map();
  }

  async loadPlugin(pluginName: string): Promise<PluginManifest> {
    if (this.pluginCache.has(pluginName)) {
      return this.pluginCache.get(pluginName)!;
    }

    const pluginPath = join(this.pluginsPath, pluginName, 'plugin.json');
    if (!await pathExists(pluginPath)) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    const config: PluginManifest = await readJson(pluginPath);
    this.pluginCache.set(pluginName, config);
    return config;
  }

  async resolveDependencies(pluginNames: string[]): Promise<string[]> {
    const resolved = new Set<string>();
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const dfs = async (pluginName: string): Promise<void> => {
      if (visited.has(pluginName)) return;
      if (visiting.has(pluginName)) {
        throw new Error(`Circular dependency detected: ${pluginName}`);
      }

      visiting.add(pluginName);

      const plugin = await this.loadPlugin(pluginName);
      const requirements = plugin.requirements || [];

      for (const req of requirements) {
        if (!resolved.has(req)) {
          await dfs(req);
        }
      }

      visiting.delete(pluginName);
      visited.add(pluginName);
      resolved.add(pluginName);
      order.push(pluginName);
    };

    for (const plugin of pluginNames) {
      if (!visited.has(plugin)) {
        await dfs(plugin);
      }
    }

    return order;
  }

  async getMissingRequirements(pluginName: string): Promise<string[]> {
    const plugin = await this.loadPlugin(pluginName);
    const requirements = plugin.requirements || [];
    const missing: string[] = [];

    for (const req of requirements) {
      try {
        await this.loadPlugin(req);
      } catch {
        missing.push(req);
      }
    }

    return missing;
  }

  async getAllPlugins(): Promise<string[]> {
    const { readdir, stat } = await import('fs-extra');
    const plugins: string[] = [];
    const items = await readdir(this.pluginsPath);

    for (const item of items) {
      const itemPath = join(this.pluginsPath, item);
      const itemStat = await stat(itemPath);
      if (itemStat.isDirectory()) {
        const pluginJsonPath = join(itemPath, 'plugin.json');
        if (await pathExists(pluginJsonPath)) {
          plugins.push(item);
        }
      }
    }

    return plugins;
  }

  clearCache(): void {
    this.pluginCache.clear();
  }
}
