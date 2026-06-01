import { prisma } from '@/lib/db/prisma';
import {
  isGreaterVersion,
  compareSemver,
} from '@/lib/marketplace/utils/semver';
import { emit } from '@/lib/marketplace/utils/events';
import { audit } from '@/lib/marketplace/utils/audit';

export async function checkUpdates(userId: string, siteId?: string) {
  const installs = await prisma.moduleInstall.findMany({
    where: {
      userId,
      status: 'installed',
      ...(siteId ? { siteId } : {}),
    },
    include: {
      module: {
        include: {
          versions: { orderBy: { createdAt: 'desc' } },
        },
      },
    },
  });
  const updates: any[] = [];
  const security: any[] = [];
  for (const ins of installs) {
    if (ins.pinnedVersion) continue;
    const channel = ins.channel || 'stable';
    const candidates = ins.module.versions.filter((v) => {
      if (channel === 'stable') return !v.isBeta;
      if (channel === 'beta') return true;
      if (channel === 'lts') return !v.isBeta;
      return true;
    });
    const newer = candidates.find(
      (v) =>
        v.version !== ins.version && compareSemver(v.version, ins.version) > 0
    );
    if (newer) {
      const update = {
        moduleId: ins.module.moduleId,
        moduleInternalId: ins.module.id,
        moduleName: ins.module.name,
        icon: ins.module.icon,
        currentVersion: ins.version,
        latestVersion: newer.version,
        isSecurity: newer.isSecurityFix,
        isBeta: newer.isBeta,
        changelog: newer.changelog,
        autoUpdate: ins.autoUpdate,
        channel,
      };
      if (newer.isSecurityFix) security.push(update);
      else updates.push(update);
    }
  }
  return {
    updatesAvailable: [...security, ...updates],
    totalCount: updates.length + security.length,
    securityCount: security.length,
    lastChecked: new Date().toISOString(),
  };
}

export async function applyUpdate(
  moduleIdOrSlug: string,
  userId: string,
  options: { version?: string; channel?: string } = {}
) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleIdOrSlug }, { moduleId: moduleIdOrSlug }] },
    include: { versions: { orderBy: { createdAt: 'desc' } } },
  });
  if (!mod) throw new Error('Module not found');
  const install = await prisma.moduleInstall.findFirst({
    where: { moduleId: mod.id, userId, status: 'installed' },
  });
  if (!install) throw new Error('Module is not installed');

  let target: any;
  if (options.version) {
    target = mod.versions.find((v) => v.version === options.version);
    if (!target) throw new Error(`Version ${options.version} not found`);
  } else {
    const channel = options.channel || install.channel || 'stable';
    target = mod.versions.find(
      (v) =>
        compareSemver(v.version, install.version) > 0 &&
        (channel === 'beta' ? true : !v.isBeta)
    );
  }
  if (!target) throw new Error('No update available');

  // Backup
  await prisma.moduleBackup.create({
    data: {
      moduleId: mod.id,
      userId,
      version: install.version,
      filePath: install.installPath || '',
      reason: 'pre-update',
    },
  });
  const previousVersion = install.version;
  await prisma.moduleInstall.update({
    where: { id: install.id },
    data: {
      previousVersion: install.version,
      version: target.version,
      installPath: `/modules/${mod.moduleId}/${target.version}`,
    },
  });
  await prisma.analyticsEvent.create({
    data: {
      moduleId: mod.id,
      event: 'update',
      userId,
      siteId: install.siteId,
      version: target.version,
      metadata: { from: previousVersion },
    },
  });
  await emit('module.updated', {
    moduleId: mod.moduleId,
    userId,
    from: previousVersion,
    to: target.version,
  });
  await audit('update', {
    userId,
    resourceType: 'module',
    resourceId: mod.id,
    changes: { from: previousVersion, to: target.version },
  });
  return {
    success: true,
    moduleId: mod.moduleId,
    version: target.version,
    previousVersion,
  };
}

export async function updateAll(
  userId: string,
  options: { channel?: string; includeBeta?: boolean } = {}
) {
  const result = await checkUpdates(userId);
  const updated: any[] = [];
  const failed: any[] = [];
  for (const u of result.updatesAvailable) {
    try {
      const r = await applyUpdate(u.moduleId, userId, {
        channel: options.channel || u.channel,
      });
      updated.push(r);
    } catch (e: any) {
      failed.push({ moduleId: u.moduleId, error: e.message });
    }
  }
  return { updated, failed };
}

export async function setAutoUpdate(
  moduleIdOrSlug: string,
  userId: string,
  enabled: boolean
) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleIdOrSlug }, { moduleId: moduleIdOrSlug }] },
  });
  if (!mod) throw new Error('Module not found');
  const install = await prisma.moduleInstall.findFirst({
    where: { moduleId: mod.id, userId },
  });
  if (!install) throw new Error('Module is not installed');
  return prisma.moduleInstall.update({
    where: { id: install.id },
    data: { autoUpdate: enabled },
  });
}

export async function pinVersion(
  moduleIdOrSlug: string,
  userId: string,
  version: string | null
) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleIdOrSlug }, { moduleId: moduleIdOrSlug }] },
  });
  if (!mod) throw new Error('Module not found');
  const install = await prisma.moduleInstall.findFirst({
    where: { moduleId: mod.id, userId },
  });
  if (!install) throw new Error('Module is not installed');
  if (version) {
    const exists = await prisma.moduleVersion.findFirst({
      where: { moduleId: mod.id, version },
    });
    if (!exists) throw new Error('Version not found');
  }
  return prisma.moduleInstall.update({
    where: { id: install.id },
    data: { pinnedVersion: version },
  });
}

export async function setChannel(
  moduleIdOrSlug: string,
  userId: string,
  channel: 'stable' | 'beta' | 'nightly' | 'lts'
) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleIdOrSlug }, { moduleId: moduleIdOrSlug }] },
  });
  if (!mod) throw new Error('Module not found');
  const install = await prisma.moduleInstall.findFirst({
    where: { moduleId: mod.id, userId },
  });
  if (!install) throw new Error('Module is not installed');
  return prisma.moduleInstall.update({
    where: { id: install.id },
    data: { channel },
  });
}
