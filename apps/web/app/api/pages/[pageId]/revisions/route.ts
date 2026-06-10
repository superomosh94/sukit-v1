import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { pageId } = await params;

  const revisions = await prisma.pageRevision.findMany({
    where: { pageId },
    orderBy: { version: 'desc' },
    take: 50,
  });
  return NextResponse.json({ revisions });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { pageId } = await params;
  const body = await req.json();
  const { version } = body;

  if (!version)
    return NextResponse.json({ error: 'version required' }, { status: 400 });

  const revision = await prisma.pageRevision.findUnique({
    where: { pageId_version: { pageId, version } },
  });
  if (!revision)
    return NextResponse.json({ error: 'Revision not found' }, { status: 404 });

  const content = revision.content as any;
  const sections = content.sections || [];

  for (const section of sections) {
    await prisma.section.upsert({
      where: { id: section.id },
      update: {
        settings: section.settings || {},
        sortOrder: section.sortOrder || 0,
      },
      create: {
        id: section.id,
        pageId,
        sectionType: section.sectionType || 'custom',
        settings: section.settings || {},
        sortOrder: section.sortOrder || 0,
      },
    });
  }

  return NextResponse.json({ success: true, restoredVersion: version });
}
