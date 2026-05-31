import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { getStorageAdapter } from '@/lib/media/storage';
import { getImageDimensions } from '@/lib/media/image';

async function getAsset(mediaId: string, siteId: string) {
  return prisma.mediaAsset.findFirst({
    where: { id: mediaId, siteId },
    include: {
      variants: { orderBy: { createdAt: 'desc' } },
      tags: { include: { tag: true } },
      favorites: true,
    },
  });
}

function formatAsset(
  asset: NonNullable<Awaited<ReturnType<typeof getAsset>>>,
  userId: string
) {
  return {
    ...asset,
    tags: asset.tags.map((t) => t.tag),
    isFavorited: asset.favorites.some((f) => f.userId === userId),
    favorites: undefined,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json(
      { error: { message: 'siteId is required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const asset = await getAsset(id, siteId);
  if (!asset) {
    return NextResponse.json(
      { error: { message: 'Media not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  return NextResponse.json(formatAsset(asset, session.user!.id));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { siteId, ...metadata } = body;

  if (!siteId) {
    return NextResponse.json(
      { error: { message: 'siteId is required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const existing = await prisma.mediaAsset.findFirst({
    where: { id, siteId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: { message: 'Media not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  const allowedFields = [
    'alt',
    'caption',
    'description',
    'title',
    'copyright',
    'credit',
    'folderId',
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in metadata) {
      updateData[field] = metadata[field];
    }
  }

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: updateData,
    include: {
      variants: { orderBy: { createdAt: 'desc' } },
      tags: { include: { tag: true } },
      favorites: true,
    },
  });

  return NextResponse.json(formatAsset(asset, session.user!.id));
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json(
      { error: { message: 'siteId is required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const asset = await prisma.mediaAsset.findFirst({
    where: { id, siteId },
  });

  if (!asset) {
    return NextResponse.json(
      { error: { message: 'Media not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  await prisma.mediaAsset.update({
    where: { id },
    data: { trashedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { pathname } = new URL(request.url);

  if (pathname.endsWith('/restore')) {
    const body = await request.json();
    const siteId = body.siteId;

    if (!siteId) {
      return NextResponse.json(
        { error: { message: 'siteId is required', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const asset = await prisma.mediaAsset.findFirst({
      where: { id, siteId, trashedAt: { not: null } },
    });

    if (!asset) {
      return NextResponse.json(
        { error: { message: 'Media not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const restored = await prisma.mediaAsset.update({
      where: { id },
      data: { trashedAt: null },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
    });

    return NextResponse.json({
      ...restored,
      tags: restored.tags.map((t) => t.tag),
      isFavorited: restored.favorites.some(
        (f) => f.userId === session.user!.id
      ),
      favorites: undefined,
    });
  }

  const body = await request.json();
  const siteId = body.siteId;

  if (!siteId) {
    return NextResponse.json(
      { error: { message: 'siteId is required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const asset = await prisma.mediaAsset.findFirst({
    where: { id, siteId },
  });

  if (!asset) {
    return NextResponse.json(
      { error: { message: 'Media not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  const { default: sharp } = await import('sharp');
  if (
    !asset.mimeType.startsWith('image/') ||
    asset.mimeType === 'image/svg+xml'
  ) {
    return NextResponse.json(
      { error: { message: 'Not an image', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const storage = await getStorageAdapter();
  const buffer = await storage.download(asset.filename);

  if (pathname.endsWith('/crop')) {
    const { x, y, width: cropW, height: cropH } = body;
    if (x == null || y == null || !cropW || !cropH) {
      return NextResponse.json(
        {
          error: {
            message: 'x, y, width, height required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }
    const result = await sharp(buffer)
      .extract({ left: x, top: y, width: cropW, height: cropH })
      .toBuffer();
    const resultPath = `${asset.filename.replace(/\.[^.]+$/, '')}_cropped${asset.filename.match(/\.[^.]+$/)?.[0] ?? ''}`;
    const resultUrl = await storage.upload(resultPath, result, asset.mimeType);
    const dims = await getImageDimensions(result);
    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        filename: resultPath,
        width: dims.width,
        height: dims.height,
        size: result.length,
      },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
    });
    return NextResponse.json({
      ...updated,
      url: resultUrl,
      tags: updated.tags.map((t) => t.tag),
      isFavorited: updated.favorites.some((f) => f.userId === session.user!.id),
      favorites: undefined,
    });
  }

  if (pathname.endsWith('/resize')) {
    const { width: resizeW, height: resizeH } = body;
    if (!resizeW && !resizeH) {
      return NextResponse.json(
        {
          error: {
            message: 'width or height required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }
    const result = await sharp(buffer)
      .resize(resizeW, resizeH, { fit: 'contain', withoutEnlargement: true })
      .toBuffer();
    const resultPath = `${asset.filename.replace(/\.[^.]+$/, '')}_resized${asset.filename.match(/\.[^.]+$/)?.[0] ?? ''}`;
    const resultUrl = await storage.upload(resultPath, result, asset.mimeType);
    const dims = await getImageDimensions(result);
    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        filename: resultPath,
        width: dims.width,
        height: dims.height,
        size: result.length,
      },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
    });
    return NextResponse.json({
      ...updated,
      url: resultUrl,
      tags: updated.tags.map((t) => t.tag),
      isFavorited: updated.favorites.some((f) => f.userId === session.user!.id),
      favorites: undefined,
    });
  }

  if (pathname.endsWith('/rotate')) {
    const { degrees } = body;
    if (![90, 180, 270].includes(degrees)) {
      return NextResponse.json(
        {
          error: {
            message: 'degrees must be 90, 180, or 270',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }
    const result = await sharp(buffer).rotate(degrees).toBuffer();
    const resultPath = `${asset.filename.replace(/\.[^.]+$/, '')}_rotated${asset.filename.match(/\.[^.]+$/)?.[0] ?? ''}`;
    const resultUrl = await storage.upload(resultPath, result, asset.mimeType);
    const dims = await getImageDimensions(result);
    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        filename: resultPath,
        width: dims.width,
        height: dims.height,
        size: result.length,
      },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
    });
    return NextResponse.json({
      ...updated,
      url: resultUrl,
      tags: updated.tags.map((t) => t.tag),
      isFavorited: updated.favorites.some((f) => f.userId === session.user!.id),
      favorites: undefined,
    });
  }

  if (pathname.endsWith('/flip')) {
    const { direction } = body;
    const flop = direction === 'horizontal';
    const flip = direction === 'vertical';
    if (!flop && !flip) {
      return NextResponse.json(
        {
          error: {
            message: 'direction must be horizontal or vertical',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }
    let pipeline = sharp(buffer);
    if (flop) pipeline = pipeline.flop();
    if (flip) pipeline = pipeline.flip();
    const result = await pipeline.toBuffer();
    const resultPath = `${asset.filename.replace(/\.[^.]+$/, '')}_flipped${asset.filename.match(/\.[^.]+$/)?.[0] ?? ''}`;
    const resultUrl = await storage.upload(resultPath, result, asset.mimeType);
    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: { filename: resultPath, size: result.length },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
    });
    return NextResponse.json({
      ...updated,
      url: resultUrl,
      tags: updated.tags.map((t) => t.tag),
      isFavorited: updated.favorites.some((f) => f.userId === session.user!.id),
      favorites: undefined,
    });
  }

  if (pathname.endsWith('/filter')) {
    const { brightness, contrast, saturation, blur: blurAmount } = body;
    let pipeline = sharp(buffer);
    if (brightness != null || contrast != null || saturation != null) {
      pipeline = pipeline.modulate({
        ...(brightness != null ? { brightness: brightness / 100 } : {}),
        ...(saturation != null ? { saturation: saturation / 100 } : {}),
      });
      if (contrast != null) {
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        pipeline = pipeline.linear(factor, 128 * (1 - factor));
      }
    }
    if (blurAmount != null && blurAmount > 0) {
      pipeline = pipeline.blur(blurAmount);
    }
    const result = await pipeline.toBuffer();
    const resultPath = `${asset.filename.replace(/\.[^.]+$/, '')}_filtered${asset.filename.match(/\.[^.]+$/)?.[0] ?? ''}`;
    const resultUrl = await storage.upload(resultPath, result, asset.mimeType);
    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: { filename: resultPath, size: result.length },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
    });
    return NextResponse.json({
      ...updated,
      url: resultUrl,
      tags: updated.tags.map((t) => t.tag),
      isFavorited: updated.favorites.some((f) => f.userId === session.user!.id),
      favorites: undefined,
    });
  }

  if (pathname.endsWith('/optimize')) {
    const {
      format = 'webp',
      quality = 80,
      width,
      height,
      stripMetadata,
    } = body;
    let pipeline = sharp(buffer);
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'contain',
        withoutEnlargement: true,
      });
    }
    if (stripMetadata) {
      pipeline = pipeline.withMetadata({});
    }
    const ext = format === 'avif' ? '.avif' : '.webp';
    const result = await pipeline.toFormat(format, { quality }).toBuffer();
    const resultPath = `${asset.filename.replace(/\.[^.]+$/, '')}${ext}`;
    const mimeType = format === 'avif' ? 'image/avif' : 'image/webp';
    const resultUrl = await storage.upload(resultPath, result, mimeType);
    const dims = await getImageDimensions(result);
    const variant = await prisma.mediaVariant.create({
      data: {
        assetId: id,
        type: format,
        width: dims.width,
        height: dims.height,
        size: result.length,
        path: resultUrl,
      },
    });
    return NextResponse.json(variant);
  }

  if (pathname.endsWith('/variants')) {
    const sizes = [320, 640, 960, 1280, 1920];
    const variants = [];

    for (const w of sizes) {
      try {
        const resized = await sharp(buffer)
          .resize(w, undefined, { fit: 'contain', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();
        const variantPath = `${asset.filename.replace(/\.[^.]+$/, '')}_${w}w.webp`;
        const variantUrl = await storage.upload(
          variantPath,
          resized,
          'image/webp'
        );
        const dims = await getImageDimensions(resized);
        const v = await prisma.mediaVariant.create({
          data: {
            assetId: id,
            type:
              w <= 320
                ? 'small'
                : w <= 640
                  ? 'medium'
                  : w <= 1280
                    ? 'large'
                    : 'xl',
            width: dims.width,
            height: dims.height,
            size: resized.length,
            path: variantUrl,
          },
        });
        variants.push(v);
      } catch {}
    }

    return NextResponse.json(variants);
  }

  if (pathname.endsWith('/permanent')) {
    await prisma.mediaVariant.deleteMany({ where: { assetId: id } });
    await prisma.mediaAssetTag.deleteMany({ where: { assetId: id } });
    await prisma.mediaFavorite.deleteMany({ where: { assetId: id } });
    await prisma.mediaAsset.delete({ where: { id } });

    try {
      await storage.delete(asset.filename);
    } catch {}

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: { message: 'Not found', code: 'NOT_FOUND' } },
    { status: 404 }
  );
}
