import { readFile, writeFile, pathExists, ensureDir } from 'fs-extra';
import { join } from 'path';
import { homedir } from 'os';

export interface RegistryPlugin {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  category: string;
  author: string;
  downloads: number;
  rating?: number;
  reviews?: any[];
  [key: string]: any;
}

export class RegistryClient {
  private registryUrl: string;
  private configPath: string;

  constructor(registryUrl = 'http://localhost:3001/api/plugins') {
    this.registryUrl = registryUrl;
    this.configPath = join(homedir(), '.sukit', 'config.json');
  }

  private async getConfig(): Promise<Record<string, any>> {
    if (await pathExists(this.configPath)) {
      return readFile(this.configPath, 'utf-8').then(JSON.parse);
    }
    return {};
  }

  private async saveConfig(config: Record<string, any>): Promise<void> {
    await ensureDir(join(homedir(), '.sukit'));
    await writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  async getToken(): Promise<string | undefined> {
    const config = await this.getConfig();
    return config.token;
  }

  async searchPlugins(query = '', category = '', sort = 'downloads'): Promise<RegistryPlugin[]> {
    const params = new URLSearchParams({ sort });
    if (query) params.set('search', query);
    if (category) params.set('category', category);

    const response = await fetch(`${this.registryUrl}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch plugins from registry');
    const data = await response.json();
    return data as RegistryPlugin[];
  }

  async getPlugin(name: string): Promise<RegistryPlugin> {
    const response = await fetch(`${this.registryUrl}/${name}`);
    if (!response.ok) throw new Error(`Plugin ${name} not found in registry`);
    const data = await response.json();
    return data as RegistryPlugin;
  }

  async login(username: string, password: string): Promise<any> {
    const registryBase = this.registryUrl.replace('/plugins', '');
    const response = await fetch(`${registryBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as any;
      throw new Error(data.error || 'Login failed');
    }

    const data = await response.json() as any;
    const config = await this.getConfig();
    config.token = data.token;
    config.user = data.user;
    await this.saveConfig(config);
    return data.user;
  }

  async logout(): Promise<void> {
    const config = await this.getConfig();
    delete config.token;
    delete config.user;
    await this.saveConfig(config);
  }

  async publishPlugin(pluginData: Record<string, any>): Promise<any> {
    const token = await this.getToken();
    if (!token) throw new Error('You must be logged in to publish a plugin');

    const response = await fetch(this.registryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pluginData),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as any;
      throw new Error(data.error || 'Failed to publish plugin');
    }

    const data = await response.json() as any;
    return data;
  }

  async submitReview(pluginName: string, rating: number, comment: string): Promise<any> {
    const token = await this.getToken();
    if (!token) throw new Error('You must be logged in to submit a review');

    const response = await fetch(`${this.registryUrl}/${pluginName}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as any;
      throw new Error(data.error || 'Failed to submit review');
    }

    const data = await response.json() as any;
    return data;
  }

  async recordDownload(pluginName: string): Promise<void> {
    await fetch(`${this.registryUrl}/${pluginName}/download`).catch(() => {});
  }
}
