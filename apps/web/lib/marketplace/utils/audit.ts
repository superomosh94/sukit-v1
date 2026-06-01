import { prisma } from '@/lib/db/prisma';

export type AuditAction =
  | 'module.publish'
  | 'module.feature'
  | 'module.unfeature'
  | 'module.delete'
  | 'module.approve'
  | 'module.reject'
  | 'module.suspend'
  | 'version.publish'
  | 'install'
  | 'uninstall'
  | 'update'
  | 'rollback'
  | 'review.approve'
  | 'review.reject'
  | 'review.flag'
  | 'review.delete'
  | 'developer.approve'
  | 'developer.reject'
  | 'developer.suspend'
  | 'payout.request'
  | 'payout.approve'
  | 'refund.request'
  | 'refund.approve'
  | 'refund.reject'
  | 'license.activate'
  | 'license.deactivate'
  | 'license.revoke'
  | 'subscription.cancel'
  | 'apikey.create'
  | 'apikey.revoke'
  | 'kb.publish'
  | 'kb.unpublish'
  | 'kb.delete'
  | 'ticket.assign'
  | 'ticket.escalate'
  | 'ticket.resolve'
  | 'ticket.close'
  | 'webhook.create'
  | 'webhook.delete';

export async function audit(
  action: AuditAction,
  ctx: {
    userId?: string | null;
    userName?: string | null;
    resourceType: string;
    resourceId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: ctx.userId,
        userName: ctx.userName,
        action,
        resourceType: ctx.resourceType,
        resourceId: ctx.resourceId,
        changes: ctx.changes ?? undefined,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      },
    });
  } catch (e) {
    console.error('[audit] failed to write log', e);
  }
}

export async function listAudit(filters: {
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(100, filters.pageSize ?? 50);
  const where: any = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.resourceType) where.resourceType = filters.resourceType;
  if (filters.resourceId) where.resourceId = filters.resourceId;
  if (filters.action) where.action = filters.action;
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
