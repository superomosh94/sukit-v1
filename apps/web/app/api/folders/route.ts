import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

function buildTree(folders: any[], parentId: string | null = null): any[] {
  return folders
    .filter((f) => f.parentId === parentId)
    .map((f) => ({
      ...f,
      children: buildTree(folders, f.id),
    }));
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json(
      { error: { message: 'siteId is required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const folders = await prisma.mediaFolder.findMany({
    where: { siteId },
    include: { _count: { select: { assets: true } } },
    orderBy: { name: 'asc' },
  });

  const mapped = folders.map((f) => ({
    id: f.id,
    siteId: f.siteId,
    name: f.name,
    parentId: f.parentId,
    assetCount: f._count.assets,
    createdBy: f.createdBy,
    createdAt: f.createdAt,
  }));

  const tree = buildTree(mapped);
  return NextResponse.json({ items: mapped, tree });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { siteId, name, parentId } = await request.json();

  if (!siteId || !name) {
    return NextResponse.json(
      {
        error: {
          message: 'siteId and name are required',
          code: 'VALIDATION_ERROR',
        },
      },
      { status: 400 }
    );
  }

  const folder = await prisma.mediaFolder.create({
    data: {
      siteId,
      name,
      parentId: parentId ?? null,
      createdBy: session.user!.id,
    },
  });

  return NextResponse.json(folder, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { pathname } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  const folderId = segments[segments.length - 1];

  if (!folderId) {
    return NextResponse.json(
      { error: { message: 'Folder ID required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json(
      { error: { message: 'name is required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const folder = await prisma.mediaFolder.findUnique({
    where: { id: folderId },
  });
  if (!folder) {
    return NextResponse.json(
      { error: { message: 'Folder not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  const updated = await prisma.mediaFolder.update({
    where: { id: folderId },
    data: { name },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { pathname, searchParams } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  const folderId = segments[segments.length - 1];
  const force = searchParams.get('force') === 'true';

  if (!folderId) {
    return NextResponse.json(
      { error: { message: 'Folder ID required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const folder = await prisma.mediaFolder.findUnique({
    where: { id: folderId },
    include: { _count: { select: { assets: true } } },
  });

  if (!folder) {
    return NextResponse.json(
      { error: { message: 'Folder not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  if (folder._count.assets > 0 && !force) {
    return NextResponse.json(
      {
        error: {
          message: `Folder contains ${folder._count.assets} assets. Use force=true to delete.`,
          code: 'FOLDER_NOT_EMPTY',
        },
      },
      { status: 409 }
    );
  }

  if (force) {
    await prisma.mediaAsset.updateMany({
      where: { folderId },
      data: { folderId: null },
    });
  }

  await prisma.mediaFolder.delete({ where: { id: folderId } });
  return NextResponse.json({ success: true });
}
