import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string; backupId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { siteId, backupId } = await params;

  const backup = await prisma.backup.findFirst({
    where: { id: backupId, siteId, site: { userId: session.user.id } },
  });
  if (!backup) {
    return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
  }

  return NextResponse.json(backup);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string; backupId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { siteId, backupId } = await params;

  const backup = await prisma.backup.findFirst({
    where: { id: backupId, siteId, site: { userId: session.user.id } },
  });
  if (!backup) {
    return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
  }

  await prisma.backup.delete({ where: { id: backupId } });
  return NextResponse.json({ success: true });
}
