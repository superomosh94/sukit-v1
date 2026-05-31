import { readFile, writeFile, pathExists, ensureDir, copy } from 'fs-extra';
import { join, basename } from 'path';

export interface ModuleState {
  name: string;
  version: string;
  plugins: PluginRecord[];
  settings: Record<string, any>;
  audit: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PluginRecord {
  name: string;
  version: string;
  installedAt: string;
  updatedAt?: string;
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  migrations?: { name: string; appliedAt: string }[];
}

export interface AuditEntry {
  id: string;
  action: string;
  data: Record<string, any>;
  timestamp: string;
}

export class StateManager {
  private projectPath: string;
  private stateFilePath: string;
  private backupDir: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.stateFilePath = join(projectPath, 'sukit.json');
    this.backupDir = join(projectPath, '.sukit', 'backups');
  }

  async loadState(): Promise<ModuleState> {
    if (!await pathExists(this.stateFilePath)) {
      return this.createEmptyState();
    }
    return readFile(this.stateFilePath, 'utf-8').then(JSON.parse);
  }

  async saveState(state: ModuleState): Promise<void> {
    await writeFile(this.stateFilePath, JSON.stringify(state, null, 2));
  }

  createEmptyState(): ModuleState {
    return {
      name: basename(this.projectPath),
      version: '1.0.0',
      plugins: [],
      settings: {},
      audit: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async addPlugin(pluginName: string, version: string, config: Record<string, any> = {}): Promise<ModuleState> {
    const state = await this.loadState();
    if (state.plugins.some(p => p.name === pluginName)) {
      throw new Error(`Plugin ${pluginName} is already installed`);
    }
    state.plugins.push({
      name: pluginName,
      version,
      installedAt: new Date().toISOString(),
      config,
      status: 'active',
    });
    state.updatedAt = new Date().toISOString();
    await this.saveState(state);
    await this.addAuditEntry('plugin_installed', { pluginName, version });
    return state;
  }

  async removePlugin(pluginName: string): Promise<PluginRecord> {
    const state = await this.loadState();
    const index = state.plugins.findIndex(p => p.name === pluginName);
    if (index === -1) throw new Error(`Plugin ${pluginName} is not installed`);
    const removed = state.plugins.splice(index, 1)[0];
    state.updatedAt = new Date().toISOString();
    await this.saveState(state);
    await this.addAuditEntry('plugin_removed', { pluginName, version: removed.version });
    return removed;
  }

  async updatePlugin(pluginName: string, newVersion: string): Promise<{ oldVersion: string; newVersion: string }> {
    const state = await this.loadState();
    const plugin = state.plugins.find(p => p.name === pluginName);
    if (!plugin) throw new Error(`Plugin ${pluginName} is not installed`);
    const oldVersion = plugin.version;
    plugin.version = newVersion;
    plugin.updatedAt = new Date().toISOString();
    state.updatedAt = new Date().toISOString();
    await this.saveState(state);
    await this.addAuditEntry('plugin_updated', { pluginName, oldVersion, newVersion });
    return { oldVersion, newVersion };
  }

  async isInstalled(pluginName: string): Promise<boolean> {
    const state = await this.loadState();
    return state.plugins.some(p => p.name === pluginName);
  }

  async getPlugin(pluginName: string): Promise<PluginRecord | undefined> {
    const state = await this.loadState();
    return state.plugins.find(p => p.name === pluginName);
  }

  async getInstalledPlugins(): Promise<PluginRecord[]> {
    const state = await this.loadState();
    return state.plugins;
  }

  async addAuditEntry(action: string, data: Record<string, any>): Promise<void> {
    const state = await this.loadState();
    if (!state.audit) state.audit = [];
    state.audit.unshift({
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
    });
    if (state.audit.length > 1000) {
      state.audit = state.audit.slice(0, 1000);
    }
    await this.saveState(state);
  }

  async createBackup(name: string): Promise<string> {
    await ensureDir(this.backupDir);
    const backupPath = join(this.backupDir, `${name}.json`);
    await copy(this.stateFilePath, backupPath);
    return backupPath;
  }

  async restoreBackup(name: string): Promise<ModuleState> {
    const backupPath = join(this.backupDir, `${name}.json`);
    if (!await pathExists(backupPath)) throw new Error(`Backup ${name} not found`);
    await copy(backupPath, this.stateFilePath);
    return this.loadState();
  }
}
