import { readJson, pathExists } from 'fs-extra';
import { join } from 'path';
import { StateManager } from './state-manager';
import { PluginManifest } from './dependency-resolver';

export interface Conflict {
  type: 'conflict' | 'missing_requirement';
  plugin: string;
  with?: string;
  requirements?: string[];
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export interface Resolution {
  resolved: boolean;
  action: string;
  requirements?: string[];
  message: string;
}

export interface ConflictResult {
  resolved: boolean;
  resolutions: { conflict: Conflict; resolution: Resolution }[];
}

export class ConflictResolver {
  private pluginsPath: string;
  private stateManager: StateManager;

  constructor(pluginsPath: string, stateManager: StateManager) {
    this.pluginsPath = pluginsPath;
    this.stateManager = stateManager;
  }

  async detectConflicts(pluginName: string): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    const installedPlugins = await this.stateManager.getInstalledPlugins();
    const pluginConfig = await this.getPluginConfig(pluginName);

    if (!pluginConfig) return conflicts;

    for (const installed of installedPlugins) {
      if (pluginConfig.conflicts?.includes(installed.name)) {
        conflicts.push({
          type: 'conflict',
          plugin: pluginName,
          with: installed.name,
          severity: 'high',
          message: `${pluginName} conflicts with installed plugin ${installed.name}`,
        });
      }

      const installedConfig = await this.getPluginConfig(installed.name);
      if (installedConfig?.conflicts?.includes(pluginName)) {
        conflicts.push({
          type: 'conflict',
          plugin: installed.name,
          with: pluginName,
          severity: 'high',
          message: `Installed plugin ${installed.name} conflicts with ${pluginName}`,
        });
      }
    }

    if (pluginConfig.requirements?.length) {
      const missingRequirements: string[] = [];
      for (const req of pluginConfig.requirements) {
        const isInstalled = installedPlugins.some(p => p.name === req);
        if (!isInstalled) missingRequirements.push(req);
      }
      if (missingRequirements.length > 0) {
        conflicts.push({
          type: 'missing_requirement',
          plugin: pluginName,
          requirements: missingRequirements,
          severity: 'medium',
          message: `${pluginName} requires: ${missingRequirements.join(', ')}`,
        });
      }
    }

    return conflicts;
  }

  async resolveConflicts(conflicts: Conflict[], autoResolve = false): Promise<ConflictResult> {
    const resolutions: { conflict: Conflict; resolution: Resolution }[] = [];

    for (const conflict of conflicts) {
      let resolution: Resolution;
      switch (conflict.type) {
        case 'conflict':
          resolution = this.resolvePluginConflict(conflict, autoResolve);
          break;
        case 'missing_requirement':
          resolution = this.resolveRequirement(conflict, autoResolve);
          break;
        default:
          resolution = { resolved: false, action: 'skip', message: 'Unknown conflict type' };
      }
      resolutions.push({ conflict, resolution });
    }

    return { resolved: resolutions.every(r => r.resolution.resolved), resolutions };
  }

  private resolvePluginConflict(conflict: Conflict, autoResolve: boolean): Resolution {
    if (autoResolve) {
      return { resolved: true, action: 'skip', message: `Skipping ${conflict.plugin} due to conflict with ${conflict.with}` };
    }
    return { resolved: false, action: 'prompt', message: `Conflict: ${conflict.plugin} vs ${conflict.with}. Run with --auto to skip.` };
  }

  private resolveRequirement(conflict: Conflict, autoResolve: boolean): Resolution {
    if (autoResolve) {
      return { resolved: true, action: 'install', requirements: conflict.requirements, message: `Auto-installing requirements: ${conflict.requirements!.join(', ')}` };
    }
    return { resolved: false, action: 'prompt', message: `Missing requirements: ${conflict.requirements!.join(', ')}. Run with --auto to auto-install.` };
  }

  private async getPluginConfig(pluginName: string): Promise<PluginManifest | null> {
    const pluginPath = join(this.pluginsPath, pluginName, 'plugin.json');
    if (!await pathExists(pluginPath)) return null;
    return readJson(pluginPath);
  }
}
