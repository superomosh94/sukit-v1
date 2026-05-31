import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const siteId = url.searchParams.get('siteId');

  const deployments = await prisma.deployment.findMany({
    where: siteId ? { siteId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { site: { select: { name: true } } },
  });

  return NextResponse.json(deployments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { siteId, type = 'static', pages = 0, assets = 0 } = body;

  const deployment = await prisma.deployment.create({
    data: {
      siteId,
      type,
      status: 'PENDING',
      pages,
      assets,
    },
  });

  return NextResponse.json(deployment, { status: 201 });
}
