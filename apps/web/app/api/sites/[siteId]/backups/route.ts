import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { siteId } = await params;

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });
  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }

  const backups = await prisma.backup.findMany({
    where: { siteId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(backups);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { siteId } = await params;
  const body = await request.json().catch(() => ({}));

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });
  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }

  const pages = await prisma.page.findMany({
    where: { siteId },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' },
        include: {
          columns: {
            orderBy: { sortOrder: 'asc' },
            include: {
              blocks: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
    },
  });

  const media = await prisma.media.findMany({ where: { siteId } });
  const forms = await prisma.form.findMany({ where: { siteId } });
  const menus = await prisma.menu.findMany({ where: { siteId } });

  const snapshot = JSON.stringify({
    exportedAt: new Date().toISOString(),
    siteId,
    pages,
    media,
    forms,
    menus,
  });

  const contentLength = new TextEncoder().encode(snapshot).length;

  const backup = await prisma.backup.create({
    data: {
      siteId,
      file: snapshot,
      size: contentLength,
      type: body.label || 'manual',
      status: 'completed',
      createdBy: session.user.id,
    },
  });

  await prisma.siteSnapshot.create({
    data: {
      siteId,
      file: snapshot,
    },
  });

  return NextResponse.json(backup, { status: 201 });
}
