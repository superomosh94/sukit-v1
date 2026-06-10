import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

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

  const favorites = await prisma.mediaFavorite.findMany({
    where: { userId: session.user!.id, siteId },
    include: {
      asset: {
        include: {
          variants: true,
          tags: { include: { tag: true } },
          favorites: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const items = favorites.map((f) => ({
    ...f.asset,
    tags: f.asset.tags.map((t) => t.tag),
    isFavorited: true,
    favoritedAt: f.createdAt,
    favorites: undefined,
  }));

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { pathname } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  const assetId = segments[segments.length - 1];

  if (!assetId) {
    const body = await request.json();
    const { siteId } = body;

    if (!siteId) {
      return NextResponse.json(
        {
          error: {
            message: 'siteId and assetId are required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: {
          message: 'Asset ID required in URL path',
          code: 'VALIDATION_ERROR',
        },
      },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const siteId = body.siteId;

  if (!siteId) {
    return NextResponse.json(
      { error: { message: 'siteId is required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const asset = await prisma.mediaAsset.findFirst({
    where: { id: assetId, siteId },
  });

  if (!asset) {
    return NextResponse.json(
      { error: { message: 'Asset not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  const existing = await prisma.mediaFavorite.findUnique({
    where: { assetId_userId: { assetId, userId: session.user!.id } },
  });

  if (existing) {
    return NextResponse.json({ success: true, favorited: true });
  }

  await prisma.mediaFavorite.create({
    data: {
      assetId,
      userId: session.user!.id,
      siteId,
    },
  });

  return NextResponse.json({ success: true, favorited: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { pathname } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  const assetId = segments[segments.length - 1];

  if (!assetId) {
    return NextResponse.json(
      {
        error: {
          message: 'Asset ID required in URL path',
          code: 'VALIDATION_ERROR',
        },
      },
      { status: 400 }
    );
  }

  await prisma.mediaFavorite.deleteMany({
    where: { assetId, userId: session.user!.id },
  });

  return NextResponse.json({ success: true, favorited: false });
}
