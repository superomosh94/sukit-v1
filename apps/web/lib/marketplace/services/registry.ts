import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

export type ModuleListFilters = {
  q?: string;
  category?: string;
  tag?: string;
  authorId?: string;
  featured?: boolean;
  staffPick?: boolean;
  priceModel?: 'free' | 'paid' | 'subscription';
  minRating?: number;
  sort?:
    | 'relevance'
    | 'downloads'
    | 'rating'
    | 'newest'
    | 'price_asc'
    | 'price_desc'
    | 'trending';
  page?: number;
  pageSize?: number;
  status?: string;
};

export async function listModules(filters: ModuleListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.MarketplaceModuleWhereInput = {
    status: filters.status || 'approved',
  };
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
      { moduleId: { contains: filters.q, mode: 'insensitive' } },
      { authorName: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  if (filters.category) where.category = filters.category;
  if (filters.tag) where.tags = { has: filters.tag };
  if (filters.authorId) where.authorId = filters.authorId;
  if (filters.featured) where.featured = true;
  if (filters.staffPick) where.staffPick = true;
  if (filters.priceModel === 'free') {
    where.OR = [
      ...((where.OR as any[]) || []),
      { priceModel: 'free' },
      { price: null },
      { price: 0 },
    ];
  } else if (filters.priceModel === 'paid') {
    where.priceModel = { in: ['one_time', 'paid'] };
    where.price = { gt: 0 };
  } else if (filters.priceModel === 'subscription') {
    where.priceModel = 'subscription';
  }
  if (filters.minRating && filters.minRating > 0) {
    where.rating = { gte: filters.minRating };
  }

  let orderBy: Prisma.MarketplaceModuleOrderByWithRelationInput = {
    publishedAt: 'desc',
  };
  switch (filters.sort) {
    case 'downloads':
      orderBy = { downloads: 'desc' };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
    case 'newest':
      orderBy = { publishedAt: 'desc' };
      break;
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'trending':
      orderBy = { trendingScore: 'desc' };
      break;
    case 'relevance':
    default:
      orderBy = filters.q ? { downloads: 'desc' } : { trendingScore: 'desc' };
      break;
  }

  const [modules, total] = await Promise.all([
    prisma.marketplaceModule.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        versions: {
          where: { isLatest: true },
          take: 1,
        },
      },
    }),
    prisma.marketplaceModule.count({ where }),
  ]);
  return {
    modules,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getModuleById(idOrSlug: string) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { moduleId: idOrSlug }],
    },
    include: {
      versions: { orderBy: { createdAt: 'desc' } },
      reviews: {
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          installs: true,
          reviews: true,
          transactions: true,
        },
      },
    },
  });
  return mod;
}

export async function getModuleVersions(moduleId: string) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }] },
    select: { id: true },
  });
  if (!mod) return [];
  return prisma.moduleVersion.findMany({
    where: { moduleId: mod.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDependencies(moduleId: string) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }] },
    select: { id: true, dependencies: true },
  });
  if (!mod) return { module: null, dependencies: [], dependents: [] };
  const deps =
    (mod.dependencies as Array<{ moduleId: string; version?: string }>) || [];
  const depIds = deps.map((d) => d.moduleId);
  const [depModules, dependents] = await Promise.all([
    depIds.length
      ? prisma.marketplaceModule.findMany({
          where: {
            OR: [{ id: { in: depIds } }, { moduleId: { in: depIds } }],
          },
          select: {
            id: true,
            moduleId: true,
            name: true,
            version: true,
            status: true,
          },
        })
      : Promise.resolve([]),
    prisma.marketplaceModule.findMany({
      where: {
        dependencies: { path: ['moduleId'], array_contains: mod.id },
      },
      select: { id: true, moduleId: true, name: true, version: true },
    }),
  ]);
  return { module: mod, dependencies: depModules, dependents };
}

export async function checkDependencies(moduleId: string) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }] },
  });
  if (!mod) {
    return { resolved: [], missing: [], conflicts: [], circular: [] };
  }
  const deps =
    (mod.dependencies as Array<{ moduleId: string; version?: string }>) || [];
  const depIds = deps.map((d) => d.moduleId);
  const installed = await prisma.moduleInstall.findMany({
    where: { moduleId: { in: depIds }, status: 'installed' },
  });
  const installedMap = new Map(installed.map((i) => [i.moduleId, i]));
  const depModules = await prisma.marketplaceModule.findMany({
    where: { OR: [{ id: { in: depIds } }, { moduleId: { in: depIds } }] },
  });
  const depMap = new Map<
    string,
    { id: string; moduleId: string; version: string }
  >();
  for (const d of depModules) (depMap.set(d.id, d), depMap.set(d.moduleId, d));
  const { compareSemver } = await import('@/lib/marketplace/utils/semver');

  const resolved: any[] = [];
  const missing: any[] = [];
  const conflicts: any[] = [];
  for (const dep of deps) {
    const dmod = depMap.get(dep.moduleId);
    const ins = installedMap.get(dmod?.id || dep.moduleId);
    if (!dmod) {
      missing.push({ moduleId: dep.moduleId, required: dep.version });
      continue;
    }
    if (!ins) {
      missing.push({
        moduleId: dep.moduleId,
        name: dmod.name,
        required: dep.version,
      });
    } else if (dep.version && compareSemver(ins.version, dep.version) < 0) {
      conflicts.push({
        moduleId: dep.moduleId,
        name: dmod.name,
        installed: ins.version,
        required: dep.version,
      });
    } else {
      resolved.push({
        moduleId: dep.moduleId,
        name: dmod.name,
        installedVersion: ins.version,
        requiredVersion: dep.version,
      });
    }
  }
  const circular = await detectCircular(mod.moduleId);
  return { resolved, missing, conflicts, circular };
}

async function detectCircular(
  rootId: string,
  visited: Set<string> = new Set()
): Promise<string[][]> {
  if (visited.has(rootId)) return [[rootId]];
  visited.add(rootId);
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: rootId }, { moduleId: rootId }] },
    select: { dependencies: true, moduleId: true },
  });
  if (!mod) return [];
  const deps = (mod.dependencies as any[]) || [];
  const cycles: string[][] = [];
  for (const dep of deps) {
    const inner = await detectCircular(dep.moduleId, new Set(visited));
    for (const cycle of inner) {
      cycles.push([mod.moduleId, ...cycle]);
    }
  }
  return cycles;
}

export async function resolveDependencies(
  moduleId: string
): Promise<{ modules: any[]; unresolved: any[] }> {
  const result = await checkDependencies(moduleId);
  const unresolved: any[] = [];
  const modules: any[] = [];
  for (const m of [...result.missing, ...result.conflicts]) {
    const target = await prisma.marketplaceModule.findFirst({
      where: { OR: [{ id: m.moduleId }, { moduleId: m.moduleId }] },
    });
    if (target) modules.push(target);
    else unresolved.push(m);
  }
  return { modules, unresolved };
}

export async function getUpdateHistory(moduleId: string) {
  return prisma.moduleVersion.findMany({
    where: { moduleId: (await getModuleInternalId(moduleId)) || '__none__' },
    orderBy: { createdAt: 'desc' },
  });
}

async function getModuleInternalId(idOrSlug: string): Promise<string | null> {
  const m = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: idOrSlug }, { moduleId: idOrSlug }] },
    select: { id: true },
  });
  return m?.id || null;
}

export async function listFeatured(limit = 12) {
  return prisma.marketplaceModule.findMany({
    where: {
      status: 'approved',
      OR: [
        { featured: true, featuredUntil: { gt: new Date() } },
        { featured: true, featuredUntil: null },
        { staffPick: true },
      ],
    },
    orderBy: [{ featured: 'desc' }, { downloads: 'desc' }],
    take: limit,
  });
}

export async function listPopular(limit = 20, period?: 'week' | 'month') {
  const since =
    period === 'week'
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : period === 'month'
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : null;
  if (since) {
    const events = await prisma.analyticsEvent.groupBy({
      by: ['moduleId'],
      where: { event: 'install', createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { moduleId: 'desc' } },
      take: limit,
    });
    const ids = events.map((e) => e.moduleId);
    const mods = await prisma.marketplaceModule.findMany({
      where: { id: { in: ids }, status: 'approved' },
    });
    return mods
      .map((m) => ({
        ...m,
        recentInstalls: events.find((e) => e.moduleId === m.id)?._count || 0,
      }))
      .sort((a, b) => b.recentInstalls - a.recentInstalls);
  }
  return prisma.marketplaceModule.findMany({
    where: { status: 'approved' },
    orderBy: { downloads: 'desc' },
    take: limit,
  });
}

export async function listNew(limit = 20) {
  return prisma.marketplaceModule.findMany({
    where: { status: 'approved', publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

export async function listCategories() {
  const grouped = await prisma.marketplaceModule.groupBy({
    by: ['category'],
    where: { status: 'approved' },
    _count: true,
    orderBy: { _count: { category: 'desc' } },
  });
  return grouped.map((g) => ({
    id: g.category,
    name: g.category,
    slug: g.category.toLowerCase().replace(/\s+/g, '-'),
    count: g._count,
  }));
}

export async function listTags() {
  const mods = await prisma.marketplaceModule.findMany({
    where: { status: 'approved' },
    select: { tags: true },
  });
  const counts = new Map<string, number>();
  for (const m of mods) {
    for (const t of m.tags) counts.set(t, (counts.get(t) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export async function searchSuggestions(q: string, limit = 8) {
  if (!q || q.length < 2) return [];
  const mods = await prisma.marketplaceModule.findMany({
    where: {
      status: 'approved',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { moduleId: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ],
    },
    select: { id: true, moduleId: true, name: true, icon: true },
    take: limit,
  });
  return mods;
}

export async function setFeatured(
  moduleId: string,
  featured: boolean,
  until?: Date
) {
  return prisma.marketplaceModule.update({
    where: { id: (await getModuleInternalId(moduleId))! },
    data: { featured, featuredUntil: until, staffPick: featured },
  });
}

export async function deleteModule(moduleId: string) {
  const id = await getModuleInternalId(moduleId);
  if (!id) throw new Error('Module not found');
  return prisma.marketplaceModule.delete({ where: { id } });
}

export async function adminStats() {
  const [total, pending, approved, installs, transactions, developers] =
    await Promise.all([
      prisma.marketplaceModule.count(),
      prisma.marketplaceModule.count({ where: { status: 'pending_review' } }),
      prisma.marketplaceModule.count({ where: { status: 'approved' } }),
      prisma.moduleInstall.count({ where: { status: 'installed' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true, developerAmount: true, fee: true },
        where: { status: 'completed' },
      }),
      prisma.developer.count({ where: { status: 'approved' } }),
    ]);
  return {
    modules: { total, pending, approved },
    installs,
    revenue: {
      total: transactions._sum.amount || 0,
      developer: transactions._sum.developerAmount || 0,
      platform: transactions._sum.fee || 0,
    },
    developers,
  };
}
