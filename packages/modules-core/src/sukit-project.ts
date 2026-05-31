import fs from 'fs-extra';
import path from 'path';

export interface SukitMetadata {
  projectName: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  lastBuiltAt: string | null;
  framework: 'nextjs';
  nodeVersion: string;
  schemaVersion: number;
}

export interface SukitManifest {
  plugins: Record<string, { version: string; enabled: boolean; installedAt: string }>;
  modules: Record<string, { version: string; enabled: boolean; installedAt: string }>;
}

export interface SukitBuildInfo {
  builtAt: string;
  siteCount: number;
  pageCount: number;
  assetCount: number;
  outputSize: number;
  duration: number;
}

export interface SukitConfig {
  deploy: {
    provider: string | null;
    autoDeploy: boolean;
    branch: string;
  };
  export: {
    outputDir: string;
    minify: boolean;
    cleanBeforeBuild: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
  };
}

export const DEFAULT_CONFIG: SukitConfig = {
  deploy: { provider: null, autoDeploy: false, branch: 'main' },
  export: { outputDir: 'dist', minify: true, cleanBeforeBuild: true },
  seo: { defaultTitle: 'My SUKIT Site', defaultDescription: '' },
};

const SCHEMA_VERSION = 1;

export class SukitProject {
  private rootDir: string;
  private sukitDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.sukitDir = path.join(rootDir, '.sukit');
  }

  get root(): string {
    return this.rootDir;
  }

  get dir(): string {
    return this.sukitDir;
  }

  async init(projectName: string): Promise<void> {
    await fs.ensureDir(this.sukitDir);
    await fs.ensureDir(path.join(this.sukitDir, 'build'));
    await fs.ensureDir(path.join(this.sukitDir, 'export'));

    const metadata: SukitMetadata = {
      projectName,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastBuiltAt: null,
      framework: 'nextjs',
      nodeVersion: process.version,
      schemaVersion: SCHEMA_VERSION,
    };

    const manifest: SukitManifest = {
      plugins: {},
      modules: {},
    };

    await Promise.all([
      fs.writeJSON(path.join(this.sukitDir, 'metadata.json'), metadata, { spaces: 2 }),
      fs.writeJSON(path.join(this.sukitDir, 'manifest.json'), manifest, { spaces: 2 }),
      fs.writeJSON(path.join(this.sukitDir, 'config.json'), DEFAULT_CONFIG, { spaces: 2 }),
      fs.writeJSON(path.join(this.sukitDir, 'state.json'), { initialized: true }, { spaces: 2 }),
    ]);
  }

  async exists(): Promise<boolean> {
    return fs.pathExists(path.join(this.sukitDir, 'metadata.json'));
  }

  async getMetadata(): Promise<SukitMetadata> {
    return fs.readJSON(path.join(this.sukitDir, 'metadata.json'));
  }

  async updateMetadata(partial: Partial<SukitMetadata>): Promise<SukitMetadata> {
    const meta = await this.getMetadata();
    const updated = { ...meta, ...partial, updatedAt: new Date().toISOString() };
    await fs.writeJSON(path.join(this.sukitDir, 'metadata.json'), updated, { spaces: 2 });
    return updated;
  }

  async getManifest(): Promise<SukitManifest> {
    return fs.readJSON(path.join(this.sukitDir, 'manifest.json'));
  }

  async updateManifest(partial: Partial<SukitManifest>): Promise<SukitManifest> {
    const manifest = await this.getManifest();
    const updated = { ...manifest, ...partial };
    await fs.writeJSON(path.join(this.sukitDir, 'manifest.json'), updated, { spaces: 2 });
    return updated;
  }

  async getConfig(): Promise<SukitConfig> {
    try {
      return await fs.readJSON(path.join(this.sukitDir, 'config.json'));
    } catch {
      await fs.writeJSON(path.join(this.sukitDir, 'config.json'), DEFAULT_CONFIG, { spaces: 2 });
      return DEFAULT_CONFIG;
    }
  }

  async updateConfig(partial: Partial<SukitConfig>): Promise<SukitConfig> {
    const config = await this.getConfig();
    const updated = { ...config, ...partial };
    await fs.writeJSON(path.join(this.sukitDir, 'config.json'), updated, { spaces: 2 });
    return updated;
  }

  async recordBuild(info: SukitBuildInfo): Promise<void> {
    await fs.writeJSON(path.join(this.sukitDir, 'build', 'latest.json'), info, { spaces: 2 });
    await this.updateMetadata({ lastBuiltAt: info.builtAt });
  }

  async getLatestBuild(): Promise<SukitBuildInfo | null> {
    try {
      return await fs.readJSON(path.join(this.sukitDir, 'build', 'latest.json'));
    } catch {
      return null;
    }
  }

  async addPlugin(name: string, version: string): Promise<void> {
    const manifest = await this.getManifest();
    manifest.plugins[name] = { version, enabled: true, installedAt: new Date().toISOString() };
    await this.updateManifest(manifest);
  }

  async removePlugin(name: string): Promise<void> {
    const manifest = await this.getManifest();
    delete manifest.plugins[name];
    await this.updateManifest(manifest);
  }

  async addModule(name: string, version: string): Promise<void> {
    const manifest = await this.getManifest();
    manifest.modules[name] = { version, enabled: true, installedAt: new Date().toISOString() };
    await this.updateManifest(manifest);
  }

  async removeModule(name: string): Promise<void> {
    const manifest = await this.getManifest();
    delete manifest.modules[name];
    await this.updateManifest(manifest);
  }
}
