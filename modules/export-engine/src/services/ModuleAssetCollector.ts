import { prisma } from '../db.js';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'path';

export interface ImageAsset {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  moduleId: string;
}

export interface IconAsset {
  name: string;
  content: string;
  moduleId: string;
}

export interface AssetMap {
  images: ImageAsset[];
  icons: IconAsset[];
  totalSize: number;
}

export class ModuleAssetCollector {
  async collectAssets(siteId: string, _modules: string[]): Promise<AssetMap> {
    const [mediaAssets, moduleIcons] = await Promise.all([
      this.collectSiteMedia(siteId),
      this.collectModuleIcons(_modules),
    ]);

    const totalSize =
      mediaAssets.reduce((sum, a) => sum + a.size, 0) +
      moduleIcons.reduce(
        (sum, a) => sum + Buffer.byteLength(a.content, 'utf-8'),
        0
      );

    return { images: mediaAssets, icons: moduleIcons, totalSize };
  }

  async collectSiteMedia(siteId: string): Promise<ImageAsset[]> {
    const media = await prisma.media.findMany({ where: { siteId } });
    return media.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
      mimeType: m.mimeType,
      size: m.size,
      width: m.width || undefined,
      height: m.height || undefined,
      moduleId: 'site',
    }));
  }

  async collectModuleImages(moduleId: string): Promise<ImageAsset[]> {
    const assetsDir = path.resolve(
      process.cwd(),
      '..',
      'modules',
      moduleId,
      'assets',
      'images'
    );
    if (!existsSync(assetsDir)) return [];
    try {
      const files = readdirSync(assetsDir);
      return files.map((f) => {
        const stat = existsSync(path.join(assetsDir, f))
          ? { size: 0 }
          : { size: 0 };
        return {
          id: `${moduleId}-${f}`,
          filename: f,
          url: `/assets/modules/${moduleId}/images/${f}`,
          mimeType: this.mimeType(f),
          size: stat.size,
          moduleId,
        };
      });
    } catch {
      return [];
    }
  }

  async collectModuleIcons(moduleIds: string[]): Promise<IconAsset[]> {
    const icons: IconAsset[] = [];
    for (const moduleId of moduleIds) {
      const iconPath = path.resolve(
        process.cwd(),
        '..',
        'modules',
        moduleId,
        'assets',
        'icon.svg'
      );
      if (existsSync(iconPath)) {
        icons.push({
          name: `${moduleId}-icon`,
          content: readFileSync(iconPath, 'utf-8'),
          moduleId,
        });
      }
    }
    return icons;
  }

  private mimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const map: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.ico': 'image/x-icon',
    };
    return map[ext] || 'application/octet-stream';
  }
}

export const moduleAssetCollector = new ModuleAssetCollector();
