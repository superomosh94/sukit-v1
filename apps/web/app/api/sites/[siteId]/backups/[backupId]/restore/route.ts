import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

export async function POST(
  _request: Request,
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

  let snapshot: any;
  try {
    snapshot = JSON.parse(backup.file);
  } catch {
    return NextResponse.json({ error: 'Invalid backup data' }, { status: 500 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.page.deleteMany({ where: { siteId } });
    await tx.media.deleteMany({ where: { siteId } });
    await tx.form.deleteMany({ where: { siteId } });
    await tx.menu.deleteMany({ where: { siteId } });

    if (snapshot.pages) {
      for (const page of snapshot.pages) {
        await tx.page.create({
          data: {
            id: page.id,
            siteId: page.siteId,
            title: page.title,
            slug: page.slug,
            isHome: page.isHome,
            metadata: page.metadata,
            pageSettings: page.pageSettings,
            sortOrder: page.sortOrder,
            status: page.status,
            sections: page.sections
              ? {
                  create: page.sections.map((sec: any) => ({
                    id: sec.id,
                    sectionType: sec.sectionType || sec.type,
                    sortOrder: sec.sortOrder,
                    settings: sec.settings || {},
                    columns: sec.columns
                      ? {
                          create: sec.columns.map((col: any) => ({
                            id: col.id,
                            gridRow: col.gridRow || 1,
                            gridCol: col.gridCol || 1,
                            span: col.span || 12,
                            sortOrder: col.sortOrder,
                            settings: col.settings || {},
                            blocks: col.blocks
                              ? {
                                  create: col.blocks.map((blk: any) => ({
                                    id: blk.id,
                                    blockType: blk.blockType || blk.type,
                                    sortOrder: blk.sortOrder,
                                    props: blk.props || blk.content || {},
                                    styles: blk.styles || {},
                                  })),
                                }
                              : undefined,
                          })),
                        }
                      : undefined,
                  })),
                }
              : undefined,
          },
        });
      }
    }

    if (snapshot.media) {
      for (const item of snapshot.media) {
        await tx.media.create({ data: item });
      }
    }

    if (snapshot.forms) {
      for (const form of snapshot.forms) {
        await tx.form.create({ data: form });
      }
    }

    if (snapshot.menus) {
      for (const menu of snapshot.menus) {
        await tx.menu.create({ data: menu });
      }
    }
  });

  return NextResponse.json({
    success: true,
    restoredAt: new Date().toISOString(),
  });
}
