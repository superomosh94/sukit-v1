import { prisma } from '@/lib/db/prisma';
import {
  compareSemver,
  isGreaterVersion,
} from '@/lib/marketplace/utils/semver';
import { emit } from '@/lib/marketplace/utils/events';
import { audit } from '@/lib/marketplace/utils/audit';
import { getStorage } from '@/lib/marketplace/storage';
import { mkdir, writeFile, readdir, rm, rename, cp, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

export type InstallOptions = {
  userId: string;
  siteId?: string;
  version?: string;
  channel?: 'stable' | 'beta' | 'nightly' | 'lts';
  permissions?: string[];
  autoUpdate?: boolean;
  skipBackup?: boolean;
  pinVersion?: string;
};

async function getModule(idOrSlug: string) {
  return prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: idOrSlug }, { moduleId: idOrSlug }] },
    include: {
      versions: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function installModule(idOrSlug: string, options: InstallOptions) {
  const mod = await getModule(idOrSlug);
  if (!mod) throw new Error('Module not found');
  if (mod.status !== 'approved') {
    throw new Error(`Module is not available (status: ${mod.status})`);
  }
  const version =
    options.version ||
    (options.channel === 'beta'
      ? mod.versions.find((v) => v.isBeta)?.version
      : options.channel === 'nightly'
        ? mod.versions[0]?.version
        : mod.versions.find((v) => v.isLatest)?.version) ||
    mod.version;
  if (!version) throw new Error('No version available to install');

  const existing = await prisma.moduleInstall.findFirst({
    where: { moduleId: mod.id, userId: options.userId, status: 'installed' },
  });
  if (existing) {
    throw new Error('Module is already installed');
  }

  // Resolve dependencies
  const depRes = await resolveInstall(mod.id);
  if (depRes.missing.length > 0) {
    throw new Error(
      `Missing dependencies: ${depRes.missing.map((m) => m.moduleId).join(', ')}`
    );
  }
  if (depRes.conflicts.length > 0) {
    throw new Error(
      `Dependency conflicts: ${depRes.conflicts
        .map((c) => `${c.moduleId} (have ${c.installed}, need ${c.required})`)
        .join(', ')}`
    );
  }

  // Backup existing install record (if upgrading from removed)
  if (!options.skipBackup) {
    const removed = await prisma.moduleInstall.findFirst({
      where: { moduleId: mod.id, userId: options.userId },
    });
    if (removed) {
      await prisma.moduleBackup.create({
        data: {
          moduleId: mod.id,
          userId: options.userId,
          version: removed.version,
          filePath: removed.installPath || '',
          reason: 'pre-install',
        },
      });
    }
  }

  const installPath = `/modules/${mod.moduleId}/${version}`;
  const install = await prisma.moduleInstall.create({
    data: {
      moduleId: mod.id,
      userId: options.userId,
      siteId: options.siteId,
      version,
      status: 'installed',
      autoUpdate: options.autoUpdate ?? false,
      pinnedVersion: options.pinVersion,
      channel: options.channel || 'stable',
      installPath,
    },
  });
  await prisma.marketplaceModule.update({
    where: { id: mod.id },
    data: { downloads: { increment: 1 } },
  });
  await prisma.analyticsEvent.create({
    data: {
      moduleId: mod.id,
      event: 'install',
      userId: options.userId,
      siteId: options.siteId,
      version,
      metadata: { channel: options.channel || 'stable' },
    },
  });
  await emit('module.installed', {
    moduleId: mod.moduleId,
    userId: options.userId,
    version,
  });
  await audit('install', {
    userId: options.userId,
    resourceType: 'module',
    resourceId: mod.id,
    changes: { version, channel: options.channel },
  });
  return {
    success: true,
    installId: install.id,
    moduleId: mod.moduleId,
    version,
    dependencies: depRes.installed,
  };
}

export async function installFromUrl(url: string, options: InstallOptions) {
  if (!/^https?:\/\//.test(url)) throw new Error('Invalid URL');
  const res = await fetch(url, { method: 'HEAD' });
  if (!res.ok) throw new Error(`Module not reachable: ${res.status}`);
  const buf = await fetch(url)
    .then((r) => r.arrayBuffer())
    .then(Buffer.from);
  return installFromFile(buf, options);
}

export async function installFromFile(file: Buffer, options: InstallOptions) {
  if (file.length > 50 * 1024 * 1024) {
    throw new Error('Module file too large (max 50MB)');
  }
  const { readFile, writeFile, mkdir, unlink } = await import('fs/promises');
  const { tmpdir } = await import('os');
  const path = await import('path');
  const tmp = path.join(tmpdir(), `sukit-module-${Date.now()}.zip`);
  await writeFile(tmp, file);
  let manifest: any = null;
  try {
    const { default: extract } = await import('extract-zip').catch(
      () => ({ default: null }) as any
    );
    if (extract) {
      await extract(tmp, { dir: tmp + '.d' });
      const manifestPath = path.join(tmp + '.d', 'manifest.json');
      const { readFile: rf } = await import('fs/promises');
      manifest = JSON.parse(await rf(manifestPath, 'utf8'));
    } else {
      // fallback: read manifest from first json in zip using yauzl-style
      const yauzl = await import('yauzl').catch(() => null);
      if (yauzl) {
        await new Promise((resolve, reject) => {
          (yauzl as any).open(
            tmp,
            { lazyEntries: true },
            (err: any, zipfile: any) => {
              if (err) return reject(err);
              zipfile.readEntry();
              zipfile.on('entry', (entry: any) => {
                if (entry.fileName === 'manifest.json') {
                  zipfile.openReadStream(entry, (e: any, stream: any) => {
                    if (e) return reject(e);
                    let data = '';
                    stream.on('data', (c: Buffer) => (data += c));
                    stream.on('end', () => {
                      manifest = JSON.parse(data);
                      resolve(null);
                    });
                  });
                } else {
                  zipfile.readEntry();
                }
              });
              zipfile.on('end', () => resolve(null));
            }
          );
        });
      }
    }
  } finally {
    await unlink(tmp).catch(() => {});
  }
  if (!manifest) throw new Error('manifest.json not found in module package');
  const slug = `${manifest.author?.toLowerCase().replace(/\W+/g, '-') || 'user'}/${manifest.name?.toLowerCase().replace(/\W+/g, '-') || 'module'}`;
  const existing = await prisma.marketplaceModule.findUnique({
    where: { moduleId: slug },
  });
  const version = manifest.version || '1.0.0';
  let mod = existing;
  if (existing) {
    await prisma.moduleVersion.create({
      data: {
        moduleId: existing.id,
        version,
        changelog: manifest.changelog || '',
        downloadUrl: '',
        fileSize: file.length,
        sukVersion: manifest.sukitVersion || '1.0.0',
        isLatest: true,
      },
    });
    await prisma.marketplaceModule.update({
      where: { id: existing.id },
      data: {
        version,
        updatedAt: new Date(),
      },
    });
    await prisma.moduleVersion.updateMany({
      where: { moduleId: existing.id, NOT: { version } },
      data: { isLatest: false },
    });
  } else {
    mod = await prisma.marketplaceModule.create({
      data: {
        moduleId: slug,
        name: manifest.name || 'Untitled',
        description: manifest.description || '',
        version,
        authorId: options.userId,
        authorName: manifest.author || 'Unknown',
        category: manifest.category || 'other',
        tags: manifest.tags || [],
        permissions: manifest.permissions || [],
        dependencies: manifest.dependencies || [],
        minSukitVersion: manifest.sukitVersion || '1.0.0',
        status: 'draft',
        versions: {
          create: {
            version,
            downloadUrl: '',
            fileSize: file.length,
            sukVersion: manifest.sukitVersion || '1.0.0',
            isLatest: true,
          },
        },
      },
    });
  }
  return installModule(slug, { ...options, version });
}

export async function uninstallModule(
  idOrSlug: string,
  userId: string,
  options: { backup?: boolean; reason?: string } = {}
) {
  const mod = await getModule(idOrSlug);
  if (!mod) throw new Error('Module not found');
  const install = await prisma.moduleInstall.findFirst({
    where: { moduleId: mod.id, userId, status: 'installed' },
  });
  if (!install) throw new Error('Module is not installed');
  if (options.backup) {
    await prisma.moduleBackup.create({
      data: {
        moduleId: mod.id,
        userId,
        version: install.version,
        filePath: install.installPath || '',
        reason: 'pre-uninstall',
        metadata: { reason: options.reason },
      },
    });
  }
  await prisma.moduleInstall.update({
    where: { id: install.id },
    data: { status: 'uninstalled', uninstalledAt: new Date() },
  });
  await prisma.analyticsEvent.create({
    data: {
      moduleId: mod.id,
      event: 'uninstall',
      userId,
      siteId: install.siteId,
      version: install.version,
    },
  });
  await emit('module.uninstalled', {
    moduleId: mod.moduleId,
    userId,
  });
  await audit('uninstall', {
    userId,
    resourceType: 'module',
    resourceId: mod.id,
    changes: { reason: options.reason },
  });
  return {
    success: true,
    moduleId: mod.moduleId,
    backupCreated: !!options.backup,
  };
}

export async function listInstalled(userId: string, siteId?: string) {
  return prisma.moduleInstall.findMany({
    where: {
      userId,
      status: 'installed',
      ...(siteId ? { siteId } : {}),
    },
    include: {
      module: {
        include: {
          versions: { where: { isLatest: true }, take: 1 },
        },
      },
    },
    orderBy: { installedAt: 'desc' },
  });
}

export async function resolveInstall(moduleInternalId: string) {
  const mod = await prisma.marketplaceModule.findUnique({
    where: { id: moduleInternalId },
    select: { dependencies: true },
  });
  if (!mod) return { installed: [], missing: [], conflicts: [] };
  const deps =
    (mod.dependencies as Array<{ moduleId: string; version?: string }>) || [];
  const installed: any[] = [];
  const missing: any[] = [];
  const conflicts: any[] = [];
  for (const dep of deps) {
    const dmod = await prisma.marketplaceModule.findFirst({
      where: { OR: [{ id: dep.moduleId }, { moduleId: dep.moduleId }] },
    });
    if (!dmod) {
      missing.push({ moduleId: dep.moduleId, required: dep.version });
      continue;
    }
    const ins = await prisma.moduleInstall.findFirst({
      where: { moduleId: dmod.id, status: 'installed' },
    });
    if (!ins) {
      missing.push({
        moduleId: dep.moduleId,
        name: dmod.name,
        required: dep.version,
      });
    } else if (dep.version && compareSemver(ins.version, dep.version) < 0) {
      conflicts.push({
        moduleId: dep.moduleId,
        installed: ins.version,
        required: dep.version,
      });
    } else {
      installed.push({ moduleId: dep.moduleId, version: ins.version });
    }
  }
  return { installed, missing, conflicts };
}

export async function createBackup(idOrSlug: string, userId: string) {
  const mod = await getModule(idOrSlug);
  if (!mod) throw new Error('Module not found');
  const install = await prisma.moduleInstall.findFirst({
    where: { moduleId: mod.id, userId, status: 'installed' },
  });
  if (!install) throw new Error('Module is not installed');
  const backup = await prisma.moduleBackup.create({
    data: {
      moduleId: mod.id,
      userId,
      version: install.version,
      filePath: install.installPath || '',
      reason: 'manual',
    },
  });
  return { success: true, backupId: backup.id };
}

export async function restoreBackup(
  idOrSlug: string,
  userId: string,
  backupId: string
) {
  const mod = await getModule(idOrSlug);
  if (!mod) throw new Error('Module not found');
  const backup = await prisma.moduleBackup.findFirst({
    where: { id: backupId, moduleId: mod.id, userId },
  });
  if (!backup) throw new Error('Backup not found');
  const existing = await prisma.moduleInstall.findFirst({
    where: { moduleId: mod.id, userId },
  });
  if (existing) {
    await prisma.moduleInstall.update({
      where: { id: existing.id },
      data: {
        version: backup.version,
        installPath: backup.filePath,
        status: 'installed',
        uninstalledAt: null,
        updatedAt: new Date(),
      },
    });
  } else {
    await prisma.moduleInstall.create({
      data: {
        moduleId: mod.id,
        userId,
        version: backup.version,
        installPath: backup.filePath,
        status: 'installed',
      },
    });
  }
  return { success: true, version: backup.version };
}

export async function rollbackInstall(idOrSlug: string, userId: string) {
  const mod = await getModule(idOrSlug);
  if (!mod) throw new Error('Module not found');
  const install = await prisma.moduleInstall.findFirst({
    where: { moduleId: mod.id, userId, status: 'installed' },
  });
  if (!install) throw new Error('Module is not installed');
  const backups = await prisma.moduleBackup.findMany({
    where: { moduleId: mod.id, userId },
    orderBy: { createdAt: 'desc' },
  });
  if (backups.length === 0) {
    throw new Error('No backup available to rollback to');
  }
  const previous = backups[0];
  await prisma.moduleInstall.update({
    where: { id: install.id },
    data: {
      previousVersion: install.version,
      version: previous.version,
      installPath: previous.filePath,
    },
  });
  await emit('module.updated', {
    moduleId: mod.moduleId,
    userId,
    action: 'rollback',
    from: install.version,
    to: previous.version,
  });
  await audit('rollback', {
    userId,
    resourceType: 'module',
    resourceId: mod.id,
    changes: { from: install.version, to: previous.version },
  });
  return {
    success: true,
    moduleId: mod.moduleId,
    version: previous.version,
    previousVersion: install.version,
  };
}
