import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { getStorageAdapter } from '@/lib/media/storage';
import { getImageDimensions, convertToWebP } from '@/lib/media/image';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { searchParams, pathname } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json(
      { error: { message: 'siteId is required', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  if (pathname.endsWith('/list')) {
    const folderId = searchParams.get('folderId') ?? undefined;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') ?? 'uploadedAt';
    const sortOrder = searchParams.get('sortOrder') ?? 'desc';
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {
      siteId,
      trashedAt: null,
      ...(folderId ? { folderId } : {}),
      ...(type && type !== 'all' ? { mimeType: { startsWith: type } } : {}),
      ...(search
        ? {
            OR: [
              { originalName: { contains: search, mode: 'insensitive' } },
              { alt: { contains: search, mode: 'insensitive' } },
              { caption: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where: where as any,
        include: {
          variants: true,
          tags: { include: { tag: true } },
          favorites: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mediaAsset.count({ where: where as any }),
    ]);

    const items = assets.map((a) => ({
      ...a,
      tags: a.tags.map((at) => at.tag),
      isFavorited: a.favorites.some((f) => f.userId === session.user!.id),
      favorites: undefined,
    }));

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  if (pathname.endsWith('/search')) {
    const q = searchParams.get('q') ?? '';
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);

    const items = await prisma.mediaAsset.findMany({
      where: {
        siteId,
        trashedAt: null,
        OR: [
          { originalName: { contains: q, mode: 'insensitive' } },
          { alt: { contains: q, mode: 'insensitive' } },
          { caption: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
      take: limit,
      orderBy: { uploadedAt: 'desc' },
    });

    const results = items.map((a) => ({
      ...a,
      tags: a.tags.map((at) => at.tag),
      isFavorited: a.favorites.some((f) => f.userId === session.user!.id),
      favorites: undefined,
    }));

    return NextResponse.json(results);
  }

  if (pathname.endsWith('/trash')) {
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    const [items, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where: { siteId, trashedAt: { not: null } },
        include: {
          variants: true,
          tags: { include: { tag: true } },
          favorites: true,
        },
        orderBy: { trashedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mediaAsset.count({ where: { siteId, trashedAt: { not: null } } }),
    ]);

    const assets = items.map((a) => ({
      ...a,
      tags: a.tags.map((at) => at.tag),
      isFavorited: a.favorites.some((f) => f.userId === session.user!.id),
      favorites: undefined,
    }));

    return NextResponse.json({
      items: assets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }

  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where: { siteId, trashedAt: null },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
      orderBy: { uploadedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mediaAsset.count({ where: { siteId, trashedAt: null } }),
  ]);

  const assets = items.map((a) => ({
    ...a,
    tags: a.tags.map((at) => at.tag),
    isFavorited: a.favorites.some((f) => f.userId === session.user!.id),
    favorites: undefined,
  }));

  return NextResponse.json({
    items: assets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { pathname } = new URL(request.url);

  if (pathname.endsWith('/upload')) {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const siteId = formData.get('siteId') as string | null;
    const folderId = formData.get('folderId') as string | null;

    if (!file || !siteId) {
      return NextResponse.json(
        {
          error: {
            message: 'file and siteId are required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = await getStorageAdapter();
    const path = `${siteId}/${Date.now()}-${file.name}`;
    const url = await storage.upload(path, buffer, file.type);

    let width: number | null = null;
    let height: number | null = null;

    const isImage =
      file.type.startsWith('image/') && file.type !== 'image/svg+xml';

    if (isImage) {
      try {
        const dims = await getImageDimensions(buffer);
        width = dims.width;
        height = dims.height;
      } catch {}
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        siteId,
        filename: path,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        folderId,
        uploadedBy: session.user!.id,
      },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
    });

    return NextResponse.json(
      {
        ...asset,
        tags: asset.tags.map((t) => t.tag),
        isFavorited: false,
        favorites: undefined,
      },
      { status: 201 }
    );
  }

  if (pathname.endsWith('/upload-url')) {
    const { siteId, url: fileUrl, folderId } = await request.json();

    if (!siteId || !fileUrl) {
      return NextResponse.json(
        {
          error: {
            message: 'siteId and url are required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(fileUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: { message: 'Failed to fetch URL', code: 'FETCH_ERROR' } },
        { status: 400 }
      );
    }

    const contentType =
      response.headers.get('content-type') ?? 'application/octet-stream';
    const buffer = Buffer.from(await response.arrayBuffer());
    const originalName = fileUrl.split('/').pop() ?? 'download';
    const storage = await getStorageAdapter();
    const path = `${siteId}/${Date.now()}-${originalName}`;
    const uploadedUrl = await storage.upload(path, buffer, contentType);

    let width: number | null = null;
    let height: number | null = null;

    const isImage =
      contentType.startsWith('image/') && contentType !== 'image/svg+xml';
    if (isImage) {
      try {
        const dims = await getImageDimensions(buffer);
        width = dims.width;
        height = dims.height;
      } catch {}
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        siteId,
        filename: path,
        originalName,
        mimeType: contentType,
        size: buffer.length,
        width,
        height,
        folderId,
        uploadedBy: session.user!.id,
      },
      include: {
        variants: true,
        tags: { include: { tag: true } },
        favorites: true,
      },
    });

    return NextResponse.json(
      {
        ...asset,
        tags: asset.tags.map((t) => t.tag),
        isFavorited: false,
        favorites: undefined,
      },
      { status: 201 }
    );
  }

  if (pathname.endsWith('/trash/empty')) {
    const { siteId } = await request.json();

    if (!siteId) {
      return NextResponse.json(
        { error: { message: 'siteId is required', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const trashed = await prisma.mediaAsset.findMany({
      where: { siteId, trashedAt: { not: null } },
      select: { id: true, filename: true },
    });

    const storage = await getStorageAdapter();
    for (const asset of trashed) {
      try {
        await storage.delete(asset.filename);
      } catch {}
    }

    await prisma.mediaAsset.deleteMany({
      where: { siteId, trashedAt: { not: null } },
    });

    return NextResponse.json({ deleted: trashed.length });
  }

  if (pathname.includes('/bulk/')) {
    const body = await request.json();
    const { ids, siteId } = body;

    if (!ids?.length || !siteId) {
      return NextResponse.json(
        {
          error: {
            message: 'ids and siteId are required',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    if (pathname.endsWith('/bulk/delete')) {
      await prisma.mediaAsset.updateMany({
        where: { id: { in: ids }, siteId },
        data: { trashedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/restore')) {
      await prisma.mediaAsset.updateMany({
        where: { id: { in: ids }, siteId },
        data: { trashedAt: null },
      });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/permanent')) {
      const assets = await prisma.mediaAsset.findMany({
        where: { id: { in: ids }, siteId },
        select: { id: true, filename: true },
      });

      const storage = await getStorageAdapter();
      for (const asset of assets) {
        try {
          await storage.delete(asset.filename);
        } catch {}
      }

      await prisma.mediaAsset.deleteMany({
        where: { id: { in: ids }, siteId },
      });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/move')) {
      const { folderId } = body;
      await prisma.mediaAsset.updateMany({
        where: { id: { in: ids }, siteId },
        data: { folderId: folderId ?? null },
      });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/tags')) {
      const { tagIds } = body;
      const data = ids.flatMap((assetId: string) =>
        tagIds.map((tagId: string) => ({ assetId, tagId }))
      );
      await prisma.mediaAssetTag.createMany({ data, skipDuplicates: true });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/remove-tags')) {
      const { tagIds } = body;
      await prisma.mediaAssetTag.deleteMany({
        where: { assetId: { in: ids }, tagId: { in: tagIds } },
      });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/alt-text')) {
      const { altText } = body;
      await prisma.mediaAsset.updateMany({
        where: { id: { in: ids }, siteId },
        data: { alt: altText },
      });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/caption')) {
      const { caption } = body;
      await prisma.mediaAsset.updateMany({
        where: { id: { in: ids }, siteId },
        data: { caption },
      });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/favorite')) {
      const data = ids.map((assetId: string) => ({
        assetId,
        userId: session.user!.id,
        siteId,
      }));
      await prisma.mediaFavorite.createMany({ data, skipDuplicates: true });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/unfavorite')) {
      await prisma.mediaFavorite.deleteMany({
        where: { assetId: { in: ids }, userId: session.user!.id },
      });
      return NextResponse.json({ success: true });
    }

    if (pathname.endsWith('/bulk/download')) {
      const assets = await prisma.mediaAsset.findMany({
        where: { id: { in: ids }, siteId },
      });

      const storage = await getStorageAdapter();
      const { default: archiver } = await import('archiver');

      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: 5 } });
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));

      const promise = new Promise<void>((resolve, reject) => {
        archive.on('end', resolve);
        archive.on('error', reject);
      });

      for (const asset of assets) {
        try {
          const buf = await storage.download(asset.filename);
          archive.append(buf, { name: asset.originalName });
        } catch {}
      }

      await archive.finalize();
      await promise;
      const zipBuffer = Buffer.concat(chunks);

      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="media.zip"',
        },
      });
    }

    if (pathname.endsWith('/bulk/optimize')) {
      const { default: sharp } = await import('sharp');
      const storage = await getStorageAdapter();
      const results: { id: string; status: string }[] = [];

      for (const id of ids) {
        try {
          const asset = await prisma.mediaAsset.findUnique({ where: { id } });
          if (!asset || !asset.mimeType.startsWith('image/')) {
            results.push({ id, status: 'skipped' });
            continue;
          }

          const buffer = await storage.download(asset.filename);
          const optimized = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

          const variantPath = `${asset.filename}.webp`;
          const variantUrl = await storage.upload(
            variantPath,
            optimized,
            'image/webp'
          );

          await prisma.mediaVariant.create({
            data: {
              assetId: id,
              type: 'webp',
              width: asset.width ?? 0,
              height: asset.height ?? 0,
              size: optimized.length,
              path: variantUrl,
            },
          });

          results.push({ id, status: 'optimized' });
        } catch {
          results.push({ id, status: 'failed' });
        }
      }

      return NextResponse.json({ results });
    }
  }

  return NextResponse.json(
    { error: { message: 'Not found', code: 'NOT_FOUND' } },
    { status: 404 }
  );
}
