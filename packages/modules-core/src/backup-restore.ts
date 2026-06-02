import {
  readJson,
  writeJson,
  pathExists,
  ensureDir,
  readdir,
  stat,
  copy,
  remove,
  readFile,
} from 'fs-extra';
import { join, basename } from 'path';
import { createWriteStream, createReadStream } from 'fs';
import { execSync } from 'child_process';
import { StateManager } from './state-manager';

export class BackupRestore {
  private projectPath: string;
  private backupDir: string;
  private stateManager: StateManager;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.backupDir = join(projectPath, '.sukit', 'backups');
    this.stateManager = new StateManager(projectPath);
  }

  async createBackup(
    name: string | null = null
  ): Promise<{ path: string; name: string; size: number }> {
    await ensureDir(this.backupDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = name || `backup-${timestamp}`;
    const backupPath = join(this.backupDir, `${backupName}.tar.gz`);

    const state = await this.stateManager.loadState();
    const installedPlugins = await this.stateManager.getInstalledPlugins();

    const manifest = {
      name: backupName,
      createdAt: new Date().toISOString(),
      projectName: basename(this.projectPath),
      plugins: installedPlugins,
      files: [] as string[],
    };

    const archiver = await import('archiver');
    const output = createWriteStream(backupPath);
    const archive = archiver.default('tar', { gzip: true });

    archive.pipe(output);

    const stateFilePath = join(this.projectPath, 'sukit.json');
    if (await pathExists(stateFilePath)) {
      archive.file(stateFilePath, { name: 'sukit.json' });
      manifest.files.push('sukit.json');
    }

    const envPath = join(this.projectPath, '.env');
    if (await pathExists(envPath)) {
      archive.file(envPath, { name: '.env' });
      manifest.files.push('.env');
    }

    archive.append(JSON.stringify(manifest, null, 2), {
      name: 'manifest.json',
    });

    await archive.finalize();
    await new Promise<void>((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
    });

    return { path: backupPath, name: backupName, size: archive.pointer() };
  }

  async restoreBackup(backupName: string): Promise<Record<string, any>> {
    const backupPath = join(this.backupDir, backupName);

    if (backupName.endsWith('.tar.gz')) {
      return this.restoreFromArchive(backupPath);
    }
    return this.restoreFromDirectory(backupName);
  }

  private async restoreFromArchive(
    backupPath: string
  ): Promise<Record<string, any>> {
    if (!(await pathExists(backupPath))) {
      throw new Error(`Backup ${backupPath} not found`);
    }

    const tempDir = join(
      this.projectPath,
      '.sukit',
      'temp',
      Date.now().toString()
    );
    await ensureDir(tempDir);

    console.log(`Restoring from ${backupPath}`);
    execSync(`tar -xzf "${backupPath}" -C "${tempDir}"`, { stdio: 'pipe' });

    const manifestPath = join(tempDir, 'manifest.json');
    let manifest: Record<string, any> = {};
    if (await pathExists(manifestPath)) {
      manifest = await readJson(manifestPath);
    }

    const entries = await readdir(tempDir);
    for (const entry of entries) {
      const sourcePath = join(tempDir, entry);
      const destPath = join(this.projectPath, entry);
      if (entry === 'manifest.json') continue;
      if (await pathExists(sourcePath)) {
        await copy(sourcePath, destPath, { overwrite: true });
      }
    }

    await remove(tempDir);

    return { ...manifest, success: true, restoredFrom: backupPath };
  }

  private async restoreFromDirectory(
    backupDir: string
  ): Promise<Record<string, any>> {
    const backupPath = join(this.backupDir, backupDir);
    if (!(await pathExists(backupPath)))
      throw new Error(`Backup directory ${backupDir} not found`);

    const manifestPath = join(backupPath, 'manifest.json');
    if (!(await pathExists(manifestPath)))
      throw new Error('Invalid backup: manifest.json not found');

    const manifest = await readJson(manifestPath);

    for (const file of manifest.files) {
      const sourcePath = join(backupPath, file);
      const destPath = join(this.projectPath, file);
      if (await pathExists(sourcePath)) {
        await copy(sourcePath, destPath);
      }
    }

    return manifest;
  }

  async listBackups(): Promise<
    { name: string; type: string; createdAt: Date; size: number }[]
  > {
    if (!(await pathExists(this.backupDir))) return [];

    const items = await readdir(this.backupDir);
    const backups: {
      name: string;
      type: string;
      createdAt: Date;
      size: number;
    }[] = [];

    for (const item of items) {
      const itemPath = join(this.backupDir, item);
      const itemStat = await stat(itemPath);

      backups.push({
        name: item,
        type: item.endsWith('.tar.gz') ? 'archive' : 'directory',
        createdAt: itemStat.birthtime,
        size: itemStat.size,
      });
    }

    return backups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async deleteBackup(backupName: string): Promise<boolean> {
    const backupPath = join(this.backupDir, backupName);
    if (!(await pathExists(backupPath)))
      throw new Error(`Backup ${backupName} not found`);
    await remove(backupPath);
    return true;
  }
}
