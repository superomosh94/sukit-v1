import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

export async function GET(request: Request) {
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

  const tags = await prisma.mediaTag.findMany({
    where: { siteId },
    include: { _count: { select: { assets: true } } },
    orderBy: { name: 'asc' },
  });

  const items = tags.map((t) => ({
    id: t.id,
    siteId: t.siteId,
    name: t.name,
    assetCount: t._count.assets,
    createdAt: t.createdAt,
  }));

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { siteId, name } = body;

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

  const existing = await prisma.mediaTag.findUnique({
    where: { siteId_name: { siteId, name } },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const tag = await prisma.mediaTag.create({
    data: { siteId, name },
  });

  return NextResponse.json(tag, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { pathname } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  const tagId = segments[segments.length - 1];

  if (!tagId) {
    return NextResponse.json(
      { error: { message: 'Tag ID required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const { name } = await request.json();
  if (!name) {
    return NextResponse.json(
      { error: { message: 'name is required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const tag = await prisma.mediaTag.findUnique({ where: { id: tagId } });
  if (!tag) {
    return NextResponse.json(
      { error: { message: 'Tag not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  const updated = await prisma.mediaTag.update({
    where: { id: tagId },
    data: { name },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { pathname } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  const tagId = segments[segments.length - 1];

  if (!tagId) {
    return NextResponse.json(
      { error: { message: 'Tag ID required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const tag = await prisma.mediaTag.findUnique({ where: { id: tagId } });
  if (!tag) {
    return NextResponse.json(
      { error: { message: 'Tag not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  await prisma.mediaAssetTag.deleteMany({ where: { tagId } });
  await prisma.mediaTag.delete({ where: { id: tagId } });

  return NextResponse.json({ success: true });
}
