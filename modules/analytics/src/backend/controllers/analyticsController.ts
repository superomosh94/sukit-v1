import { prisma } from './db';

interface AnalyticsEvent {
  event: string;
  userId: string | null;
  timestamp: Date;
  data: unknown;
}

export async function trackEvent(
  siteId: string,
  event: string,
  data?: Record<string, any>,
  userId?: string
) {
  return prisma.analyticsEvent.create({
    data: {
      siteId,
      event,
      data: data || {},
      userId,
      timestamp: new Date(),
    },
  });
}

export async function trackPageView(
  siteId: string,
  page: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  return trackEvent(siteId, 'page_view', { page, ...metadata }, userId);
}

export async function getAnalytics(
  siteId: string,
  startDate?: string,
  endDate?: string
) {
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const events = await prisma.analyticsEvent.findMany({
    where: {
      siteId,
      timestamp: { gte: start, lte: end },
    },
    orderBy: { timestamp: 'asc' },
  });

  const totalPageViews = events.filter(
    (e: AnalyticsEvent) => e.event === 'page_view'
  ).length;
  const uniqueVisitors = new Set(
    events
      .filter((e: AnalyticsEvent) => e.userId)
      .map((e: AnalyticsEvent) => e.userId)
  ).size;
  const totalEvents = events.length;

  // Page views by day
  const pageViewsByDay: Record<string, number> = {};
  events.forEach((e: AnalyticsEvent) => {
    if (e.event === 'page_view') {
      const day = e.timestamp.toISOString().split('T')[0];
      pageViewsByDay[day] = (pageViewsByDay[day] || 0) + 1;
    }
  });

  // Top pages
  const pageCounts: Record<string, number> = {};
  events.forEach((e: AnalyticsEvent) => {
    if (e.event === 'page_view' && e.data) {
      const page = (e.data as Record<string, string>).page || '/';
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    }
  });
  const topPages = Object.entries(pageCounts)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Events breakdown
  const eventCounts: Record<string, number> = {};
  events.forEach((e: AnalyticsEvent) => {
    eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
  });

  return {
    summary: {
      totalPageViews,
      uniqueVisitors,
      totalEvents,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    },
    pageViewsByDay,
    topPages,
    eventCounts,
  };
}

export async function getFunnelAnalysis(
  siteId: string,
  steps: string[],
  startDate?: string,
  endDate?: string
) {
  const start = startDate
    ? new Date(startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const funnels: Array<{
    step: string;
    count: number;
    conversionRate: number;
  }> = [];
  let previousCount = 0;

  for (let i = 0; i < steps.length; i++) {
    const count = await prisma.analyticsEvent.count({
      where: {
        siteId,
        event: steps[i],
        timestamp: { gte: start, lte: end },
      },
    });

    funnels.push({
      step: steps[i],
      count,
      conversionRate:
        i === 0 ? 100 : previousCount > 0 ? (count / previousCount) * 100 : 0,
    });

    previousCount = count;
  }

  return {
    steps: funnels,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

export async function getUserAnalytics(siteId: string, days = 30) {
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const dau = await prisma.analyticsEvent.groupBy({
    by: ['userId'],
    where: { siteId, timestamp: { gte: start }, userId: { not: null } },
    _count: { id: true },
  });

  const events = await prisma.analyticsEvent.findMany({
    where: { siteId, timestamp: { gte: start } },
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true, userId: true },
  });

  // DAU calculation
  const dailyActive: Record<string, Set<string>> = {};
  events.forEach((e: { userId: string | null; timestamp: Date }) => {
    if (e.userId) {
      const day = e.timestamp.toISOString().split('T')[0];
      if (!dailyActive[day]) dailyActive[day] = new Set();
      dailyActive[day].add(e.userId);
    }
  });

  return {
    totalActiveUsers: dau.length,
    dailyActiveUsers: Object.fromEntries(
      Object.entries(dailyActive).map(([day, users]) => [day, users.size])
    ),
  };
}
