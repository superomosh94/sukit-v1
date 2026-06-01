import { prisma } from '@/lib/db/prisma';
import { emit } from '@/lib/marketplace/utils/events';
import { audit } from '@/lib/marketplace/utils/audit';
import { ticketEmail } from '@/lib/marketplace/utils/email';

const TEMPLATES: { id: string; name: string; subject: string; body: string }[] =
  [
    {
      id: 'welcome',
      name: 'Welcome',
      subject: 'Welcome to SUKIT support',
      body: "Hi! Thanks for reaching out. We'll get back to you soon.",
    },
    {
      id: 'investigating',
      name: 'Investigating',
      subject: "We're looking into this",
      body: 'Thanks for the report. Our team is investigating.',
    },
    {
      id: 'fixed',
      name: 'Fixed',
      subject: 'Your issue has been resolved',
      body: 'Glad to report that the issue has been fixed in the latest version.',
    },
    {
      id: 'need-info',
      name: 'Need more info',
      subject: 'Could you provide more details?',
      body: 'To help you better, could you share more details about your setup?',
    },
  ];

export async function listTickets(opts: {
  userId: string;
  status?: string;
  page?: number;
  pageSize?: number;
  isAdmin?: boolean;
}) {
  const page = opts.page ?? 1;
  const pageSize = Math.min(100, opts.pageSize ?? 20);
  const where: any = {};
  if (!opts.isAdmin) where.userId = opts.userId;
  if (opts.status) where.status = opts.status;
  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        module: { select: { moduleId: true, name: true } },
        responses: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);
  return {
    tickets,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createTicket(opts: {
  moduleId: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  priority?: string;
  category?: string;
  attachments?: string[];
}) {
  const ticket = await prisma.supportTicket.create({
    data: {
      moduleId: opts.moduleId,
      userId: opts.userId,
      userName: opts.userName,
      userEmail: opts.userEmail,
      subject: opts.subject,
      message: opts.message,
      priority: opts.priority || 'normal',
      category: opts.category || 'question',
      attachments: opts.attachments || [],
    },
  });
  await emit('ticket.created', {
    ticketId: ticket.id,
    moduleId: opts.moduleId,
  });
  return ticket;
}

export async function getTicket(
  ticketId: string,
  userId: string,
  isAdmin = false
) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      module: true,
      responses: {
        where: isAdmin
          ? {}
          : { OR: [{ authorType: { not: 'internal' } }, { authorId: userId }] },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!ticket) return null;
  if (!isAdmin && ticket.userId !== userId) {
    throw new Error('Not your ticket');
  }
  return ticket;
}

export async function respondToTicket(opts: {
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: 'customer' | 'developer' | 'admin' | 'internal';
  message: string;
  attachments?: string[];
  privateNote?: string;
}) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: opts.ticketId },
  });
  if (!ticket) throw new Error('Ticket not found');
  const response = await prisma.ticketResponse.create({
    data: {
      ticketId: opts.ticketId,
      authorId: opts.authorId,
      authorType: opts.authorType,
      authorName: opts.authorName,
      message: opts.message,
      attachments: opts.attachments || [],
      privateNote: opts.privateNote,
    },
  });
  if (ticket.status === 'open') {
    await prisma.supportTicket.update({
      where: { id: opts.ticketId },
      data: { status: 'in_progress' },
    });
  } else {
    await prisma.supportTicket.update({
      where: { id: opts.ticketId },
      data: { updatedAt: new Date() },
    });
  }
  await emit('ticket.updated', {
    ticketId: opts.ticketId,
    status: 'in_progress',
  });
  // Email notify other side
  if (opts.authorType === 'customer' || opts.authorType === 'internal') {
    const mod = await prisma.marketplaceModule.findUnique({
      where: { id: ticket.moduleId },
    });
    if (mod) {
      const dev = await prisma.developer.findFirst({
        where: { userId: mod.authorId },
      });
      if (dev?.payoutEmail) {
        await ticketEmail({
          toName: dev.payoutEmail,
          ticketId: ticket.id,
          subject: ticket.subject,
          status: 'in_progress',
          responseAuthor: opts.authorName,
          message: opts.message,
          url: `https://sukit.dev/admin/support/tickets/${ticket.id}`,
        });
      }
    }
  } else {
    await ticketEmail({
      toName: ticket.userEmail,
      ticketId: ticket.id,
      subject: ticket.subject,
      status: 'in_progress',
      responseAuthor: opts.authorName,
      message: opts.message,
      url: `https://sukit.dev/support/tickets/${ticket.id}`,
    });
  }
  return response;
}

export async function resolveTicket(ticketId: string, userId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });
  if (!ticket) throw new Error('Ticket not found');
  if (ticket.userId !== userId) {
    const mod = await prisma.marketplaceModule.findUnique({
      where: { id: ticket.moduleId },
    });
    if (mod?.authorId !== userId) {
      throw new Error('Not authorized');
    }
  }
  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: 'resolved', resolvedAt: new Date() },
  });
  await emit('ticket.resolved', { ticketId });
  return updated;
}

export async function reopenTicket(
  ticketId: string,
  userId: string,
  reason: string
) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });
  if (!ticket) throw new Error('Ticket not found');
  if (ticket.userId !== userId) throw new Error('Not your ticket');
  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: 'open', resolvedAt: null },
  });
  await prisma.ticketResponse.create({
    data: {
      ticketId,
      authorId: userId,
      authorType: 'internal',
      message: `Reopened: ${reason}`,
    },
  });
  return updated;
}

export async function closeTicket(ticketId: string, _userId: string) {
  return prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: 'closed', closedAt: new Date() },
  });
}

export async function getPrivateNotes(ticketId: string) {
  return prisma.ticketResponse.findMany({
    where: { ticketId, authorType: 'internal' },
    orderBy: { createdAt: 'asc' },
  });
}

export async function addPrivateNote(
  ticketId: string,
  authorId: string,
  message: string
) {
  return prisma.ticketResponse.create({
    data: {
      ticketId,
      authorId,
      authorType: 'internal',
      message,
    },
  });
}

export async function escalateTicket(
  ticketId: string,
  userId: string,
  reason: string
) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });
  if (!ticket) throw new Error('Ticket not found');
  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { priority: 'urgent' },
  });
  await prisma.ticketResponse.create({
    data: {
      ticketId,
      authorId: userId,
      authorType: 'internal',
      message: `Escalated: ${reason}`,
    },
  });
  await audit('ticket.escalate' as any, {
    userId,
    resourceType: 'ticket',
    resourceId: ticketId,
    changes: { reason },
  });
  return updated;
}

export async function requestInfo(
  ticketId: string,
  userId: string,
  question: string
) {
  return addPrivateNote(ticketId, userId, `Info requested: ${question}`);
}

export async function recordSatisfaction(
  ticketId: string,
  userId: string,
  rating: number
) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });
  if (!ticket) throw new Error('Ticket not found');
  if (ticket.userId !== userId) throw new Error('Not your ticket');
  return prisma.supportTicket.update({
    where: { id: ticketId },
    data: { satisfaction: rating },
  });
}

export async function getTicketHistory(userId: string) {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const rated = tickets.filter((t) => t.satisfaction);
  const avgSatisfaction =
    rated.length > 0
      ? rated.reduce((s, t) => s + (t.satisfaction || 0), 0) / rated.length
      : 0;
  const resolved = tickets.filter(
    (t) => t.status === 'resolved' || t.status === 'closed'
  );
  return {
    tickets,
    averageResponseTime: 4.5,
    satisfactionScore: avgSatisfaction,
    resolutionRate:
      tickets.length > 0 ? (resolved.length / tickets.length) * 100 : 0,
  };
}

export async function listTemplates() {
  return { templates: TEMPLATES };
}

export async function getAdminTicketQueue(filters: any = {}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(100, filters.pageSize ?? 20);
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedTo) where.assignedTo = filters.assignedTo;
  const [tickets, total, open, inProgress, urgent] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { module: { select: { moduleId: true, name: true } } },
    }),
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.count({ where: { status: 'open' } }),
    prisma.supportTicket.count({ where: { status: 'in_progress' } }),
    prisma.supportTicket.count({ where: { priority: 'urgent' } }),
  ]);
  return {
    tickets,
    total,
    page,
    pageSize,
    queue: { open, inProgress, urgent },
  };
}

export async function assignTicket(ticketId: string, assignedTo: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });
  if (!ticket) throw new Error('Ticket not found');
  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { assignedTo, status: 'in_progress' },
  });
  await audit('ticket.assign' as any, {
    userId: assignedTo,
    resourceType: 'ticket',
    resourceId: ticketId,
  });
  return updated;
}

export async function getAdminSupportStats() {
  const [total, open, inProgress, resolved, urgent, ratings] =
    await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'open' } }),
      prisma.supportTicket.count({ where: { status: 'in_progress' } }),
      prisma.supportTicket.count({ where: { status: 'resolved' } }),
      prisma.supportTicket.count({ where: { priority: 'urgent' } }),
      prisma.supportTicket.findMany({
        where: { satisfaction: { not: null } },
        select: { satisfaction: true, createdAt: true },
      }),
    ]);
  const avgSatisfaction =
    ratings.length > 0
      ? ratings.reduce((s, t) => s + (t.satisfaction || 0), 0) / ratings.length
      : 0;
  const byDay = new Map<string, number>();
  for (const t of ratings) {
    const key = t.createdAt.toISOString().split('T')[0];
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }
  return {
    total,
    open,
    inProgress,
    resolved,
    urgent,
    averageResponseTime: 4.5,
    averageResolutionTime: 24,
    satisfactionScore: avgSatisfaction,
    ticketsByDay: Array.from(byDay.entries())
      .sort()
      .map(([date, count]) => ({ date, count })),
  };
}

// ─── Knowledge Base ─────────────────────────────────────

export async function listKb(
  filters: { category?: string; published?: boolean } = {}
) {
  const where: any = {};
  if (filters.category) where.category = filters.category;
  if (filters.published !== undefined) where.published = filters.published;
  const [articles, groups] = await Promise.all([
    prisma.knowledgeBaseArticle.findMany({
      where,
      orderBy: [{ category: 'asc' }, { publishedAt: 'desc' }],
    }),
    prisma.knowledgeBaseArticle.groupBy({
      by: ['category'],
      where:
        filters.published !== undefined ? { published: filters.published } : {},
      _count: true,
    }),
  ]);
  return {
    articles,
    categories: groups.map((g) => ({ name: g.category, count: g._count })),
  };
}

export async function searchKb(query: string) {
  if (!query) return { articles: [], total: 0, query, suggestedArticles: [] };
  const articles = await prisma.knowledgeBaseArticle.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ],
    },
    take: 30,
  });
  // Suggest related by category of top result
  const top = articles[0];
  const suggested = top
    ? await prisma.knowledgeBaseArticle.findMany({
        where: { category: top.category, id: { not: top.id }, published: true },
        take: 3,
      })
    : [];
  return {
    articles,
    total: articles.length,
    query,
    suggestedArticles: suggested,
  };
}

export async function getKbArticle(slug: string) {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { slug },
  });
  if (!article) return null;
  // Increment views
  await prisma.knowledgeBaseArticle.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });
  return { ...article, views: article.views + 1 };
}

export async function getRelatedArticles(articleId: string) {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: { id: articleId },
  });
  if (!article) return [];
  return prisma.knowledgeBaseArticle.findMany({
    where: {
      category: article.category,
      id: { not: article.id },
      published: true,
    },
    take: 5,
  });
}

export async function voteKb(articleId: string, helpful: boolean) {
  return prisma.knowledgeBaseArticle.update({
    where: { id: articleId },
    data: helpful
      ? { helpful: { increment: 1 } }
      : { notHelpful: { increment: 1 } },
  });
}

export async function createKbArticle(opts: {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  published?: boolean;
  authorId: string;
  authorName: string;
}) {
  const slug = opts.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  const existing = await prisma.knowledgeBaseArticle.findUnique({
    where: { slug },
  });
  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;
  const article = await prisma.knowledgeBaseArticle.create({
    data: {
      title: opts.title,
      slug: finalSlug,
      content: opts.content,
      excerpt: opts.excerpt,
      category: opts.category,
      tags: opts.tags || [],
      published: opts.published ?? true,
      publishedAt: opts.published ? new Date() : null,
      authorId: opts.authorId,
      authorName: opts.authorName,
    },
  });
  if (opts.published) {
    await emit('kb.published', { articleId: article.id, slug: article.slug });
  }
  return article;
}

export async function updateKbArticle(id: string, data: any) {
  const update: any = {};
  for (const k of ['title', 'content', 'excerpt', 'category', 'tags']) {
    if (data[k] !== undefined) update[k] = data[k];
  }
  if (data.published !== undefined) {
    update.published = data.published;
    if (data.published && !update.publishedAt) update.publishedAt = new Date();
  }
  return prisma.knowledgeBaseArticle.update({ where: { id }, data: update });
}

export async function deleteKbArticle(id: string) {
  return prisma.knowledgeBaseArticle.delete({ where: { id } });
}

export async function getKbStats() {
  const [total, totalViews, all, byCategory] = await Promise.all([
    prisma.knowledgeBaseArticle.count({ where: { published: true } }),
    prisma.knowledgeBaseArticle.aggregate({
      _sum: { views: true },
      where: { published: true },
    }),
    prisma.knowledgeBaseArticle.findMany({
      where: { published: true },
      select: { helpful: true, notHelpful: true, views: true, title: true },
    }),
    prisma.knowledgeBaseArticle.groupBy({
      by: ['category'],
      where: { published: true },
      _count: true,
    }),
  ]);
  const totalHelpful = all.reduce((s, a) => s + a.helpful, 0);
  const totalVotes = all.reduce((s, a) => s + a.helpful + a.notHelpful, 0);
  return {
    totalArticles: total,
    totalViews: totalViews._sum.views || 0,
    helpfulPercentage: totalVotes > 0 ? (totalHelpful / totalVotes) * 100 : 0,
    topArticles: all
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((a) => ({ title: a.title, views: a.views })),
    articlesByCategory: byCategory.map((b) => ({
      category: b.category,
      count: b._count,
    })),
  };
}
