import { prisma } from '@/lib/db/prisma';
import { emit } from '@/lib/marketplace/utils/events';
import { audit } from '@/lib/marketplace/utils/audit';
import {
  generateApiKey,
  hashApiKey,
  slugify,
} from '@/lib/marketplace/utils/crypto';
import { getStorage } from '@/lib/marketplace/storage';

export async function getDeveloperByUserId(userId: string) {
  return prisma.developer.findUnique({
    where: { userId },
    include: { modules: true, apiKeys: true },
  });
}

export async function getDeveloperProfile(userId: string) {
  const dev = await getDeveloperByUserId(userId);
  if (!dev) return null;
  return {
    id: dev.id,
    name: dev.name,
    email: dev.email,
    companyName: dev.companyName,
    website: dev.website,
    bio: dev.bio,
    avatar: dev.avatar,
    payoutMethod: dev.payoutMethod,
    payoutEmail: dev.payoutEmail,
    payoutCountry: dev.payoutCountry,
    taxId: dev.taxId,
    totalEarnings: dev.totalEarnings,
    unpaidEarnings: dev.unpaidEarnings,
    status: dev.status,
    agreementAccepted: dev.agreementAccepted,
  };
}

export async function registerDeveloper(opts: {
  userId: string;
  email: string;
  name: string;
  companyName?: string;
  website?: string;
  bio?: string;
  taxId?: string;
  payoutMethod?: string;
  payoutEmail?: string;
  payoutCountry?: string;
  agreementAccepted?: boolean;
  agreementVersion?: string;
}) {
  const existing = await prisma.developer.findUnique({
    where: { userId: opts.userId },
  });
  if (existing) throw new Error('Already registered as developer');
  if (!opts.agreementAccepted)
    throw new Error('Must accept developer agreement');
  const dev = await prisma.developer.create({
    data: {
      userId: opts.userId,
      email: opts.email,
      name: opts.name,
      companyName: opts.companyName,
      website: opts.website,
      bio: opts.bio,
      taxId: opts.taxId,
      payoutMethod: opts.payoutMethod,
      payoutEmail: opts.payoutEmail,
      payoutCountry: opts.payoutCountry,
      agreementAccepted: true,
      agreementVersion: opts.agreementVersion || 'v1.0',
      status: 'pending',
    },
  });
  await emit('developer.approved' as any, { developerId: dev.id });
  return { success: true, developerId: dev.id };
}

export async function getDeveloperStatus(userId: string) {
  const dev = await prisma.developer.findUnique({
    where: { userId },
    select: { status: true, id: true },
  });
  if (!dev) return { status: 'not_applied' };
  return { status: dev.status, developerId: dev.id };
}

export async function approveDeveloper(
  developerId: string,
  reviewerId: string
) {
  const dev = await prisma.developer.update({
    where: { id: developerId },
    data: { status: 'approved', approvedAt: new Date() },
  });
  await audit('developer.approve' as any, {
    userId: reviewerId,
    resourceType: 'developer',
    resourceId: developerId,
  });
  await emit('developer.approved', { developerId });
  return dev;
}

export async function getDeveloperDashboard(userId: string) {
  const dev = await prisma.developer.findUnique({ where: { userId } });
  if (!dev) throw new Error('Developer not found');
  const modules = await prisma.marketplaceModule.findMany({
    where: { authorId: userId },
    include: {
      _count: { select: { installs: true, reviews: true } },
    },
  });
  const totalDownloads = modules.reduce((s, m) => s + m.downloads, 0);
  const pendingCount = modules.filter(
    (m) => m.status === 'pending_review'
  ).length;
  const publishedCount = modules.filter((m) => m.status === 'approved').length;
  const totalRating = modules.reduce((s, m) => s + m.rating * m.ratingCount, 0);
  const totalReviews = modules.reduce((s, m) => s + m.ratingCount, 0);
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [
    txns,
    installsToday,
    installsWeek,
    installsMonth,
    monthRevenue,
    openTickets,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        module: { authorId: userId },
        status: 'completed',
        refundedAt: null,
      },
    }),
    prisma.moduleInstall.count({
      where: {
        module: { authorId: userId },
        installedAt: { gte: dayAgo },
        status: 'installed',
      },
    }),
    prisma.moduleInstall.count({
      where: {
        module: { authorId: userId },
        installedAt: { gte: weekAgo },
        status: 'installed',
      },
    }),
    prisma.moduleInstall.count({
      where: {
        module: { authorId: userId },
        installedAt: { gte: monthAgo },
        status: 'installed',
      },
    }),
    prisma.transaction.aggregate({
      where: {
        module: { authorId: userId },
        status: 'completed',
        refundedAt: null,
        createdAt: { gte: monthAgo },
      },
      _sum: { developerAmount: true },
    }),
    prisma.supportTicket.count({
      where: {
        module: { authorId: userId },
        status: { in: ['open', 'in_progress'] },
      },
    }),
  ]);
  const totalRevenue = txns.reduce((s, t) => s + (t.developerAmount || 0), 0);
  const mrr = await prisma.subscription.aggregate({
    where: { module: { authorId: userId }, status: 'active' },
    _sum: { amount: true },
  });
  return {
    totalModules: modules.length,
    publishedModules: publishedCount,
    pendingSubmissions: pendingCount,
    totalDownloads,
    totalRevenue,
    unpaidEarnings: dev.unpaidEarnings,
    mrr: mrr._sum.amount || 0,
    averageRating,
    reviewCount: totalReviews,
    openTickets,
    installsToday,
    installsThisWeek: installsWeek,
    installsThisMonth: installsMonth,
    revenueThisMonth: monthRevenue._sum.developerAmount || 0,
    revenueGrowth: 0,
    churnRate: 0,
  };
}

export async function listDeveloperModules(userId: string) {
  return prisma.marketplaceModule.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      versions: { where: { isLatest: true }, take: 1 },
      _count: { select: { installs: true, reviews: true } },
    },
  });
}

export async function createDeveloperModule(opts: {
  userId: string;
  userName: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  priceModel?: string;
  price?: number;
}) {
  const slug = `${slugify(opts.userName)}/${slugify(opts.name)}`;
  const existing = await prisma.marketplaceModule.findUnique({
    where: { moduleId: slug },
  });
  if (existing) throw new Error('Module with this name already exists');
  const mod = await prisma.marketplaceModule.create({
    data: {
      moduleId: slug,
      name: opts.name,
      description: opts.description,
      version: '0.1.0',
      authorId: opts.userId,
      authorName: opts.userName,
      category: opts.category,
      tags: opts.tags || [],
      priceModel: opts.priceModel || 'free',
      price: opts.price || 0,
      status: 'draft',
    },
  });
  return mod;
}

export async function updateDeveloperModule(
  userId: string,
  moduleId: string,
  data: any
) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }], authorId: userId },
  });
  if (!mod) throw new Error('Module not found or not owned by you');
  return prisma.marketplaceModule.update({
    where: { id: mod.id },
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      tags: data.tags,
      priceModel: data.priceModel,
      price: data.price,
      subscriptionPriceMonthly: data.subscriptionPriceMonthly,
      subscriptionPriceYearly: data.subscriptionPriceYearly,
      icon: data.icon,
      banner: data.banner,
      demoUrl: data.demoUrl,
      supportUrl: data.supportUrl,
      sourceUrl: data.sourceUrl,
      documentation: data.documentation,
      changelog: data.changelog,
    },
  });
}

export async function deleteDeveloperModule(userId: string, moduleId: string) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }], authorId: userId },
  });
  if (!mod) throw new Error('Module not found or not owned by you');
  await prisma.marketplaceModule.delete({ where: { id: mod.id } });
  return { success: true };
}

export async function getDeveloperSales(userId: string, period = 'month') {
  const since = new Date();
  if (period === 'week') since.setDate(since.getDate() - 7);
  else if (period === 'month') since.setMonth(since.getMonth() - 1);
  else if (period === 'year') since.setFullYear(since.getFullYear() - 1);
  else since.setFullYear(2000);
  const txns = await prisma.transaction.findMany({
    where: {
      module: { authorId: userId },
      status: 'completed',
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'asc' },
  });
  const totalRevenue = txns.reduce((s, t) => s + (t.developerAmount || 0), 0);
  const aov = txns.length > 0 ? totalRevenue / txns.length : 0;
  const refundCount = await prisma.transaction.count({
    where: {
      module: { authorId: userId },
      refundedAt: { not: null },
      createdAt: { gte: since },
    },
  });
  // Group by day
  const byDay = new Map<string, { sales: number; revenue: number }>();
  for (const t of txns) {
    const d = t.createdAt.toISOString().split('T')[0];
    const cur = byDay.get(d) || { sales: 0, revenue: 0 };
    cur.sales += 1;
    cur.revenue += t.developerAmount || 0;
    byDay.set(d, cur);
  }
  const salesByDay = Array.from(byDay.entries()).map(([date, v]) => ({
    date,
    ...v,
  }));
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
  const topCustomers = Array.from(byCustomer.values())
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 10);
  return {
    totalRevenue,
    mrr: 0,
    averageOrderValue: aov,
    conversionRate: 0,
    refundRate: txns.length > 0 ? (refundCount / txns.length) * 100 : 0,
    salesByDay,
    topCustomers,
  };
}

export async function listDeveloperReviews(userId: string) {
  const reviews = await prisma.moduleReview.findMany({
    where: { module: { authorId: userId } },
    orderBy: { createdAt: 'desc' },
    include: {
      module: { select: { moduleId: true, name: true } },
      responses: true,
    },
  });
  const pending = reviews.filter(
    (r) => r.responses.length === 0 && r.status === 'approved'
  ).length;
  const total = reviews.length;
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return {
    reviews,
    averageRating: total > 0 ? sum / total : 0,
    totalReviews: total,
    pendingResponse: pending,
  };
}

export async function getDeveloperNotifications(_userId: string) {
  // Read from audit log as a simple notification source
  const items = await prisma.auditLog.findMany({
    where: { resourceType: 'module' },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return {
    notifications: items.map((i) => ({
      id: i.id,
      title: i.action,
      body: i.resourceId,
      read: false,
      createdAt: i.createdAt,
    })),
    unreadCount: items.length,
  };
}

export async function markNotificationRead(_id: string) {
  return { success: true };
}

export async function getDeveloperSupportTickets(userId: string) {
  const tickets = await prisma.supportTicket.findMany({
    where: { module: { authorId: userId } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { responses: true },
  });
  const openCount = tickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress'
  ).length;
  return { tickets, openCount };
}

export async function listApiKeys(developerId: string) {
  return prisma.developerApiKey.findMany({
    where: { developerId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createApiKey(
  developerId: string,
  data: {
    name: string;
    permissions?: string[];
    rateLimit?: number;
    expiresAt?: Date;
  }
) {
  const { key, hash } = generateApiKey();
  const apiKey = await prisma.developerApiKey.create({
    data: {
      developerId,
      name: data.name,
      key,
      keyHash: hash,
      permissions: data.permissions || ['read'],
      rateLimit: data.rateLimit || 100,
      expiresAt: data.expiresAt,
    },
  });
  await audit('apikey.create' as any, {
    resourceType: 'apikey',
    resourceId: apiKey.id,
    changes: { name: data.name },
  });
  // Return once with raw key
  return { ...apiKey, rawKey: key };
}

export async function revokeApiKey(developerId: string, keyId: string) {
  const apiKey = await prisma.developerApiKey.findFirst({
    where: { id: keyId, developerId },
  });
  if (!apiKey) throw new Error('API key not found');
  await prisma.developerApiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });
  await audit('apikey.revoke' as any, {
    resourceType: 'apikey',
    resourceId: keyId,
  });
  return { success: true };
}

export async function updateApiKey(
  developerId: string,
  keyId: string,
  data: any
) {
  const apiKey = await prisma.developerApiKey.findFirst({
    where: { id: keyId, developerId },
  });
  if (!apiKey) throw new Error('API key not found');
  return prisma.developerApiKey.update({
    where: { id: keyId },
    data: {
      name: data.name,
      permissions: data.permissions,
      rateLimit: data.rateLimit,
      expiresAt: data.expiresAt,
    },
  });
}

export async function uploadAsset(
  userId: string,
  type: 'icon' | 'banner' | 'screenshot' | 'module' | 'image',
  filename: string,
  data: Buffer
) {
  const prefix = `marketplace/${type}s/${userId}/${Date.now()}`;
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return getStorage().save(`${prefix}/${safe}`, data);
}
