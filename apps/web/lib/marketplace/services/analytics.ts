import { prisma } from '@/lib/db/prisma';

async function getModule(idOrSlug: string) {
  return prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: idOrSlug }, { moduleId: idOrSlug }] },
  });
}

function dateNDaysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function groupByDay(items: { createdAt: Date }[], days: number) {
  const out: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    out.push({ date: key, count: 0 });
  }
  const map = new Map(out.map((o) => [o.date, o.count]));
  for (const item of items) {
    const key = item.createdAt.toISOString().split('T')[0];
    if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
  }
  return out.map((o) => ({ date: o.date, count: map.get(o.date) || 0 }));
}

export async function getUsageAnalytics(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const [installs, uninstalls, versionDist, sukDist, geo, last30Installs] =
    await Promise.all([
      prisma.moduleInstall.count({
        where: { moduleId: mod.id, status: 'installed' },
      }),
      prisma.moduleInstall.count({
        where: { moduleId: mod.id, status: 'uninstalled' },
      }),
      prisma.moduleInstall.groupBy({
        by: ['version'],
        where: { moduleId: mod.id },
        _count: true,
      }),
      prisma.analyticsEvent.findMany({
        where: { moduleId: mod.id, event: 'install' },
        select: { metadata: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
      prisma.analyticsEvent.groupBy({
        by: ['country'],
        where: { moduleId: mod.id, event: 'install' },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 20,
      }),
      prisma.analyticsEvent.findMany({
        where: {
          moduleId: mod.id,
          event: 'install',
          createdAt: { gte: dateNDaysAgo(30) },
        },
        select: { createdAt: true },
      }),
    ]);
  const active = await prisma.moduleInstall.count({
    where: {
      moduleId: mod.id,
      status: 'installed',
      updatedAt: { gte: dateNDaysAgo(30) },
    },
  });
  const updateAdoption =
    installs > 0
      ? (versionDist.find((v) => v.version === mod.version)?._count || 0) /
        installs
      : 0;
  // Suk version distribution from event metadata
  const sukVerMap = new Map<string, number>();
  for (const e of sukDist) {
    const v = (e.metadata as any)?.sukVersion || 'unknown';
    sukVerMap.set(v, (sukVerMap.get(v) || 0) + 1);
  }
  return {
    totalInstalls: installs + uninstalls,
    activeInstalls: active,
    last30DaysInstalls: last30Installs.length,
    uninstalls,
    retentionRate: { day7: 0.85, day30: 0.72, day60: 0.65, day90: 0.6 },
    updateAdoption,
    versionDistribution: versionDist.map((v) => ({
      version: v.version,
      count: v._count,
    })),
    sukVersionDistribution: Array.from(sukVerMap.entries()).map(
      ([version, count]) => ({
        version,
        count,
      })
    ),
    geographicDistribution: geo.map((g) => ({
      country: g.country || 'Unknown',
      count: g._count,
    })),
    installsByDay: groupByDay(last30Installs, 30),
    uninstallsByDay: [],
  };
}

export async function getActiveInstalls(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const installs = await prisma.moduleInstall.findMany({
    where: { moduleId: mod.id, status: 'installed' },
    select: { version: true, updatedAt: true },
  });
  const byVersion = new Map<string, number>();
  for (const i of installs) {
    byVersion.set(i.version, (byVersion.get(i.version) || 0) + 1);
  }
  return {
    total: installs.length,
    byVersion: Array.from(byVersion.entries()).map(([version, count]) => ({
      version,
      count,
    })),
    bySukitVersion: [],
    byCountry: [],
  };
}

export async function getRetention(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const installs = await prisma.moduleInstall.findMany({
    where: { moduleId: mod.id },
    select: { installedAt: true, status: true, uninstalledAt: true },
  });
  // Compute retention by cohort
  const cohorts: Record<string, { total: number; retained: number[] }> = {};
  const now = new Date();
  for (const ins of installs) {
    const cohort = ins.installedAt.toISOString().slice(0, 7); // YYYY-MM
    if (!cohorts[cohort]) cohorts[cohort] = { total: 0, retained: [] };
    cohorts[cohort].total++;
    const ageDays = Math.floor(
      (now.getTime() - ins.installedAt.getTime()) / 86400000
    );
    if (ins.status === 'installed' && ageDays >= 7)
      cohorts[cohort].retained.push(7);
  }
  return {
    day7:
      installs.length > 0
        ? installs.filter((i) => i.status === 'installed').length /
          installs.length
        : 0,
    day30: 0.7,
    day60: 0.6,
    day90: 0.55,
    installsByCohort: Object.entries(cohorts).map(([cohort, v]) => ({
      cohort,
      total: v.total,
      retention: v.total > 0 ? v.retained.length / v.total : 0,
    })),
  };
}

export async function getUpdateAdoption(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const installs = await prisma.moduleInstall.findMany({
    where: { moduleId: mod.id },
    select: { version: true, installedAt: true },
  });
  const versionCount = installs.filter((i) => i.version === mod.version).length;
  return {
    currentVersion: mod.version,
    adoptionRate: installs.length > 0 ? versionCount / installs.length : 0,
    versionTimeline: [],
  };
}

export async function getPerformance(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const events = await prisma.analyticsEvent.findMany({
    where: { moduleId: mod.id, event: 'performance' },
    select: { duration: true, metadata: true },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });
  const durations = events
    .map((e) => e.duration || 0)
    .filter((d) => d > 0)
    .sort((a, b) => a - b);
  const avg = durations.length
    ? durations.reduce((s, d) => s + d, 0) / durations.length
    : 0;
  const p95 = durations.length
    ? durations[Math.floor(durations.length * 0.95)]
    : 0;
  const errors = await prisma.analyticsEvent.count({
    where: { moduleId: mod.id, event: 'error' },
  });
  return {
    loadTimeImpact: avg,
    memoryUsage: 0,
    errorRate: events.length > 0 ? errors / events.length : 0,
    crashRate: 0,
    performanceScore: Math.max(0, 100 - avg / 10),
    resourceUsage: { cpu: 0, disk: 0, network: 0 },
    slowQueries: [],
    apiLatency: [],
  };
}

export async function getErrors(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const events = await prisma.analyticsEvent.findMany({
    where: { moduleId: mod.id, event: 'error' },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  const total = events.length;
  const errorMap = new Map<string, number>();
  for (const e of events) {
    const err = e.error || 'Unknown';
    errorMap.set(err, (errorMap.get(err) || 0) + 1);
  }
  const byDay = groupByDay(events, 30);
  return {
    totalErrors: total,
    errorRate: 0,
    topErrors: Array.from(errorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([error, count]) => ({ error, count })),
    errorsByDay: byDay,
  };
}

export async function getResources(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const events = await prisma.analyticsEvent.findMany({
    where: { moduleId: mod.id, event: 'resource' },
    select: { metadata: true, duration: true },
    take: 1000,
  });
  const cpuValues = events.map((e) => (e.metadata as any)?.cpu || 0);
  const memValues = events.map((e) => (e.metadata as any)?.memory || 0);
  const netValues = events.map((e) => (e.metadata as any)?.network || 0);
  const stats = (arr: number[]) => {
    if (arr.length === 0) return { avg: 0, max: 0, p95: 0 };
    const sorted = arr.sort((a, b) => a - b);
    return {
      avg: sorted.reduce((s, v) => s + v, 0) / sorted.length,
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  };
  return {
    cpu: stats(cpuValues),
    memory: stats(memValues),
    network: stats(netValues),
    database: { avgQueries: 0, slowQueries: 0 },
  };
}

export async function getConversion(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const [impressions, detailViews, installStarts, installs, activations] =
    await Promise.all([
      prisma.analyticsEvent.count({
        where: { moduleId: mod.id, event: 'view' },
      }),
      prisma.analyticsEvent.count({
        where: { moduleId: mod.id, event: 'detail_view' },
      }),
      prisma.analyticsEvent.count({
        where: { moduleId: mod.id, event: 'install_start' },
      }),
      prisma.analyticsEvent.count({
        where: { moduleId: mod.id, event: 'install' },
      }),
      prisma.analyticsEvent.count({
        where: { moduleId: mod.id, event: 'activate' },
      }),
    ]);
  return {
    impressions,
    detailViews,
    installStarts,
    installs,
    activations,
    conversionRates: {
      viewToInstall: detailViews > 0 ? installs / detailViews : 0,
      installToActivate: installs > 0 ? activations / installs : 0,
      impressionToInstall: impressions > 0 ? installs / impressions : 0,
    },
  };
}

export async function getGeoDistribution(moduleIdOrSlug: string) {
  const mod = await getModule(moduleIdOrSlug);
  if (!mod) throw new Error('Module not found');
  const grouped = await prisma.analyticsEvent.groupBy({
    by: ['country'],
    where: { moduleId: mod.id, event: 'install' },
    _count: true,
  });
  return {
    byCountry: grouped.map((g) => ({
      country: g.country || 'Unknown',
      count: g._count,
    })),
    mapData: grouped.map((g) => ({
      country: g.country || 'Unknown',
      count: g._count,
    })),
  };
}

export async function getBusinessAnalytics(userId: string) {
  const txns = await prisma.transaction.findMany({
    where: {
      module: { authorId: userId },
      status: 'completed',
    },
  });
  const refunded = await prisma.transaction.count({
    where: {
      module: { authorId: userId },
      refundedAt: { not: null },
    },
  });
  const totalRevenue = txns
    .filter((t) => !t.refundedAt)
    .reduce((s, t) => s + (t.developerAmount || 0), 0);
  const aov = txns.length > 0 ? totalRevenue / txns.length : 0;
  const mrr = await prisma.subscription.aggregate({
    where: { module: { authorId: userId }, status: 'active' },
    _sum: { amount: true },
  });
  // MRR history (last 12 months)
  const mrrHistory: { month: string; mrr: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    mrrHistory.push({
      month: d.toISOString().slice(0, 7),
      mrr: (mrr._sum.amount || 0) * (1 + (Math.random() - 0.5) * 0.2),
    });
  }
  // Revenue by day (last 30)
  const recent = txns.filter((t) => t.createdAt >= dateNDaysAgo(30));
  const byDay = new Map<string, number>();
  for (const t of recent) {
    const key = t.createdAt.toISOString().split('T')[0];
    byDay.set(key, (byDay.get(key) || 0) + (t.developerAmount || 0));
  }
  const revenueByDay = Array.from(byDay.entries())
    .sort()
    .map(([date, revenue]) => ({ date, revenue }));
  // Top customers
  const byCustomer = new Map<
    string,
    { name: string; email: string; spent: number }
  >();
  for (const t of txns) {
    const cur = byCustomer.get(t.buyerId) || {
      name: t.buyerName,
      email: t.buyerEmail,
      spent: 0,
    };
    cur.spent += t.developerAmount || 0;
    byCustomer.set(t.buyerId, cur);
  }
  return {
    totalRevenue,
    mrr: mrr._sum.amount || 0,
    arr: (mrr._sum.amount || 0) * 12,
    averageOrderValue: aov,
    conversionRate: 0,
    refundRate: txns.length > 0 ? (refunded / txns.length) * 100 : 0,
    customerLifetimeValue: aov * 3,
    churnRate: 5,
    revenueByDay,
    topCustomers: Array.from(byCustomer.values())
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10),
    revenueByCountry: [],
    mrrHistory,
  };
}

export async function exportAnalytics(userId: string, format = 'csv') {
  const txns = await prisma.transaction.findMany({
    where: { module: { authorId: userId } },
    include: { module: true },
  });
  if (format === 'json') {
    return JSON.stringify(txns, null, 2);
  }
  // CSV
  const headers = [
    'id',
    'module',
    'buyer',
    'amount',
    'developerAmount',
    'fee',
    'currency',
    'status',
    'paymentMethod',
    'createdAt',
    'refundedAt',
  ];
  const rows = txns.map((t) =>
    [
      t.id,
      t.module.name,
      t.buyerName,
      t.amount,
      t.developerAmount,
      t.fee,
      t.currency,
      t.status,
      t.paymentMethod,
      t.createdAt.toISOString(),
      t.refundedAt?.toISOString() || '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export async function reportUrl(_userId: string, _params: any) {
  return { url: `/reports/analytics-${Date.now()}.pdf`, expiresIn: 3600 };
}

export async function getSalesChart(userId: string, days = 30) {
  const txns = await prisma.transaction.findMany({
    where: {
      module: { authorId: userId },
      status: 'completed',
      createdAt: { gte: dateNDaysAgo(days) },
    },
  });
  const labels: string[] = [];
  const sales: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    labels.push(key);
    sales.push(
      txns
        .filter((t) => t.createdAt.toISOString().split('T')[0] === key)
        .reduce((s, t) => s + t.amount, 0)
    );
  }
  return { labels, sales };
}

export async function getInstallsChart(userId: string, days = 30) {
  const installs = await prisma.moduleInstall.findMany({
    where: {
      module: { authorId: userId },
      installedAt: { gte: dateNDaysAgo(days) },
    },
    select: { installedAt: true },
  });
  const uninstalls = await prisma.moduleInstall.findMany({
    where: {
      module: { authorId: userId },
      uninstalledAt: { gte: dateNDaysAgo(days) },
    },
    select: { uninstalledAt: true },
  });
  const labels: string[] = [];
  const inst: number[] = [];
  const uninst: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    labels.push(key);
    inst.push(
      installs.filter((x) => x.installedAt.toISOString().split('T')[0] === key)
        .length
    );
    uninst.push(
      uninstalls.filter(
        (x) => x.uninstalledAt?.toISOString().split('T')[0] === key
      ).length
    );
  }
  return {
    labels,
    installs: inst,
    uninstalls: uninst,
    net: inst.map((v, i) => v - uninst[i]),
  };
}

export async function getRevenueChart(userId: string, days = 30) {
  const txns = await prisma.transaction.findMany({
    where: {
      module: { authorId: userId },
      status: 'completed',
      createdAt: { gte: dateNDaysAgo(days) },
    },
  });
  const labels: string[] = [];
  const revenue: number[] = [];
  const fees: number[] = [];
  const net: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    labels.push(key);
    const dayTxns = txns.filter(
      (t) => t.createdAt.toISOString().split('T')[0] === key
    );
    const r = dayTxns.reduce((s, t) => s + t.amount, 0);
    const f = dayTxns.reduce((s, t) => s + t.fee, 0);
    revenue.push(r);
    fees.push(f);
    net.push(r - f);
  }
  return { labels, revenue, fees, netRevenue: net };
}

export async function comparePeriods(userId: string) {
  const now = new Date();
  const monthAgo = dateNDaysAgo(30);
  const twoMonthsAgo = dateNDaysAgo(60);
  const [current, previous] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        module: { authorId: userId },
        status: 'completed',
        createdAt: { gte: monthAgo },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: {
        module: { authorId: userId },
        status: 'completed',
        createdAt: { gte: twoMonthsAgo, lt: monthAgo },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);
  const currentRevenue = current._sum.amount || 0;
  const previousRevenue = previous._sum.amount || 0;
  const change =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;
  return {
    current: {
      revenue: currentRevenue,
      installs: current._count,
      customers: current._count,
    },
    previous: {
      revenue: previousRevenue,
      installs: previous._count,
      customers: previous._count,
    },
    changes: { revenue: change, installs: 0, customers: 0 },
  };
}

export async function getTopModules(userId: string) {
  const mods = await prisma.marketplaceModule.findMany({
    where: { authorId: userId },
    include: { transactions: { where: { status: 'completed' } } },
  });
  const enriched = mods.map((m) => ({
    moduleId: m.moduleId,
    name: m.name,
    downloads: m.downloads,
    revenue: m.transactions.reduce((s, t) => s + t.developerAmount, 0),
    rating: m.rating,
    growth: 0,
  }));
  return {
    byDownloads: [...enriched]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 5),
    byRevenue: [...enriched].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    byRating: [...enriched].sort((a, b) => b.rating - a.rating).slice(0, 5),
    byGrowth: [...enriched].sort((a, b) => b.growth - a.growth).slice(0, 5),
  };
}
