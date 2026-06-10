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

  const filename = `backup-${backup.type}-${backup.createdAt.toISOString().split('T')[0]}.json`;

  return new NextResponse(backup.file, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(backup.size),
    },
  });
}
