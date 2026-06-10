import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const userName = searchParams.get('userName');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const search = searchParams.get('search');

  const where: any = {};

  if (action) where.action = action;
  if (userName) where.userName = userName;
  if (dateFrom)
    where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
  if (dateTo)
    where.createdAt = {
      ...where.createdAt,
      lte: new Date(dateTo + 'T23:59:59.999Z'),
    };
  if (search) {
    where.OR = [
      { action: { contains: search } },
      { resourceType: { contains: search } },
      { resourceId: { contains: search } },
    ];
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const mapped = logs.map((l) => ({
    id: l.id,
    timestamp: l.createdAt.toISOString(),
    userId: l.userId,
    userName: l.userName,
    action: l.action,
    resourceType: l.resourceType,
    resourceId: l.resourceId,
    changes: l.changes,
    ipAddress: l.ipAddress,
  }));

  return NextResponse.json(mapped);
}
