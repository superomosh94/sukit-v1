import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PopupController {
  async list(query: { status?: string; type?: string; search?: string; siteId: string; limit?: number; offset?: number }) {
    const where: any = { siteId: query.siteId };
    if (query.status) where.status = query.status;
    if (query.type) where.popupType = query.type;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const [popups, total] = await Promise.all([
      prisma.popup.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      prisma.popup.count({ where }),
    ]);

    return { popups, total };
  }

  async get(id: string) {
    const popup = await prisma.popup.findUnique({
      where: { id },
      include: { events: { take: 100, orderBy: { createdAt: 'desc' } } },
    });
    if (!popup) throw new Error('Popup not found');
    return popup;
  }

  async create(data: any) {
    return prisma.popup.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.popup.update({ where: { id }, data });
  }

  async delete(id: string) {
    await prisma.popup.delete({ where: { id } });
    return { success: true };
  }

  async activate(id: string) {
    return prisma.popup.update({ where: { id }, data: { status: 'ACTIVE' as any } });
  }

  async pause(id: string) {
    return prisma.popup.update({ where: { id }, data: { status: 'PAUSED' as any } });
  }

  async duplicate(id: string) {
    const original = await prisma.popup.findUnique({ where: { id } });
    if (!original) throw new Error('Popup not found');
    const { id: _, createdAt, updatedAt, ...rest } = original;
    return prisma.popup.create({
      data: { ...rest, name: `${rest.name} (Copy)`, status: 'DRAFT' as any },
    });
  }

  async trackEvent(popupId: string, eventType: string, sessionId?: string) {
    const popup = await prisma.popup.findUnique({ where: { id: popupId } });
    if (!popup) throw new Error('Popup not found');

    await prisma.popupEvent.create({
      data: { popupId, eventType: eventType as any, sessionId },
    });

    const updateData: any = {};
    if (eventType === 'VIEW') {
      updateData.views = { increment: 1 };
    } else if (eventType === 'CONVERSION') {
      updateData.conversions = { increment: 1 };
    }

    if (updateData.views || updateData.conversions) {
      await prisma.popup.update({ where: { id: popupId }, data: updateData });
      const updated = await prisma.popup.findUnique({ where: { id: popupId } });
      if (updated && updated.views > 0) {
        updateData.conversionRate = updated.conversions / updated.views;
        await prisma.popup.update({ where: { id: popupId }, data: { conversionRate: updateData.conversionRate } });
      }
    }

    return { success: true };
  }

  async getAnalytics(siteId: string, period: '7d' | '30d' | '90d' = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await prisma.popupEvent.findMany({
      where: { createdAt: { gte: since }, popup: { siteId } },
    });

    const views = events.filter(e => e.eventType === 'VIEW').length;
    const conversions = events.filter(e => e.eventType === 'CONVERSION').length;
    const conversionRate = views > 0 ? conversions / views : 0;

    const dailyMap = new Map<string, { views: number; conversions: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dailyMap.set(d.toISOString().slice(0, 10), { views: 0, conversions: 0 });
    }
    for (const event of events) {
      const key = event.createdAt.toISOString().slice(0, 10);
      const entry = dailyMap.get(key);
      if (entry) {
        if (event.eventType === 'VIEW') entry.views++;
        else if (event.eventType === 'CONVERSION') entry.conversions++;
      }
    }

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { views, conversions, conversionRate, dailyData };
  }
}
