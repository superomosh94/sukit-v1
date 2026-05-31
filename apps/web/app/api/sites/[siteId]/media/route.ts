import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { getStorageAdapter } from '@/lib/media/storage';
import { convertToWebP, getImageDimensions } from '@/lib/media/image';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { siteId } = await params;
  const media = await prisma.media.findMany({
    where: { siteId, site: { userId: session.user.id } },
    orderBy: { createdAt: 'desc' },
  });

  const items = media.map((m) => {
    const isImage =
      m.mimeType.startsWith('image/') && m.mimeType !== 'image/svg+xml';
    return {
      ...m,
      webpUrl: isImage ? `${m.url}.webp` : null,
    };
  });

  return NextResponse.json(items);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { siteId } = await params;
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json(
      { error: { message: 'No file provided', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = await getStorageAdapter();
  const path = `${siteId}/${Date.now()}-${file.name}`;
  const url = await storage.upload(path, buffer, file.type);

  let width = 0;
  let height = 0;
  let webpUrl: string | null = null;

  const isImage =
    file.type.startsWith('image/') && file.type !== 'image/svg+xml';

  if (isImage) {
    try {
      const dims = await getImageDimensions(buffer);
      width = dims.width;
      height = dims.height;

      const webpBuffer = await convertToWebP(buffer);
      const webpPath = `${path}.webp`;
      webpUrl = await storage.upload(webpPath, webpBuffer, 'image/webp');
    } catch {
      // WebP conversion failed, proceed without it
    }
  }

  const media = await prisma.media.create({
    data: {
      siteId,
      url,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      width,
      height,
    },
  });

  return NextResponse.json({ ...media, webpUrl }, { status: 201 });
}
