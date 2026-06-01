import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';

const BASE_PATH = process.env.SUKIT_STORAGE_PATH || './data/sites';

export const filesystemService = {
  projectPath(siteId: string, ...segments: string[]): string {
    return path.join(BASE_PATH, siteId, ...segments);
  },

  async readFile(siteId: string, filePath: string): Promise<string> {
    const fullPath = this.projectPath(siteId, filePath);
    return fs.readFile(fullPath, 'utf-8');
  },

  async writeFile(
    siteId: string,
    filePath: string,
    content: string
  ): Promise<void> {
    const fullPath = this.projectPath(siteId, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  },

  async exists(siteId: string, filePath: string): Promise<boolean> {
    try {
      await fs.access(this.projectPath(siteId, filePath));
      return true;
    } catch {
      return false;
    }
  },

  async list(
    siteId: string,
    dirPath: string = ''
  ): Promise<
    Array<{
      name: string;
      path: string;
      size: number;
      isDirectory: boolean;
      modifiedAt: string;
    }>
  > {
    const fullPath = this.projectPath(siteId, dirPath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
      const entryPath = path.join(fullPath, entry.name);
      const stat = await fs.stat(entryPath);
      results.push({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        size: stat.size,
        isDirectory: entry.isDirectory(),
        modifiedAt: stat.mtime.toISOString(),
      });
    }
    return results;
  },

  async delete(siteId: string, filePath: string): Promise<void> {
    const fullPath = this.projectPath(siteId, filePath);
    await fs.rm(fullPath, { recursive: true, force: true });
  },

  async copy(siteId: string, source: string, dest: string): Promise<void> {
    const srcPath = this.projectPath(siteId, source);
    const destPath = this.projectPath(siteId, dest);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.cp(srcPath, destPath, { recursive: true });
  },

  async move(siteId: string, source: string, dest: string): Promise<void> {
    const srcPath = this.projectPath(siteId, source);
    const destPath = this.projectPath(siteId, dest);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.rename(srcPath, destPath);
  },

  async metadata(
    siteId: string,
    filePath: string
  ): Promise<{
    size: number;
    created: string;
    modified: string;
    isDirectory: boolean;
    permissions: string;
  }> {
    const fullPath = this.projectPath(siteId, filePath);
    const stat = await fs.stat(fullPath);
    return {
      size: stat.size,
      created: stat.birthtime.toISOString(),
      modified: stat.mtime.toISOString(),
      isDirectory: stat.isDirectory(),
      permissions: (stat.mode & 0o777).toString(8),
    };
  },

  async hash(
    siteId: string,
    filePath: string,
    algorithm: 'md5' | 'sha1' | 'sha256' = 'sha256'
  ): Promise<string> {
    const fullPath = this.projectPath(siteId, filePath);
    const content = await fs.readFile(fullPath);
    return createHash(algorithm).update(content).digest('hex');
  },

  async compress(
    siteId: string,
    source: string,
    dest?: string
  ): Promise<string> {
    const srcPath = this.projectPath(siteId, source);
    const destPath = dest ? this.projectPath(siteId, dest) : srcPath + '.gz';
    await pipeline(
      createReadStream(srcPath),
      createGzip(),
      createWriteStream(destPath)
    );
    return destPath;
  },

  async extract(
    siteId: string,
    source: string,
    dest?: string
  ): Promise<string> {
    const srcPath = this.projectPath(siteId, source);
    const destPath = dest
      ? this.projectPath(siteId, dest)
      : srcPath.replace(/\.gz$/, '');
    await pipeline(
      createReadStream(srcPath),
      createGunzip(),
      createWriteStream(destPath)
    );
    return destPath;
  },

  pathUtils: {
    join(...segments: string[]): string {
      return path.join(...segments);
    },
    resolve(...segments: string[]): string {
      return path.resolve(...segments);
    },
    relative(from: string, to: string): string {
      return path.relative(from, to);
    },
    basename(p: string): string {
      return path.basename(p);
    },
    dirname(p: string): string {
      return path.dirname(p);
    },
    extname(p: string): string {
      return path.extname(p);
    },
  },

  async watch(
    siteId: string,
    dirPath: string,
    callback: (event: string, filePath: string) => void
  ): Promise<() => void> {
    const fullPath = this.projectPath(siteId, dirPath);
    const { watch } = await import('fs');
    const watcher = watch(
      fullPath,
      { recursive: true },
      (eventType, filename) => {
        if (filename) callback(eventType, filename.toString());
      }
    );
    return () => watcher.close();
  },
};
