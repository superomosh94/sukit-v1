import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { getStorageAdapter } from '@/lib/media/storage';
import { resizeImage } from '@/lib/media/image';

const SRCSET_WIDTHS = [320, 640, 960, 1280, 1920];

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string; mediaId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { siteId, mediaId } = await params;

  const media = await prisma.media.findFirst({
    where: { id: mediaId, siteId, site: { userId: session.user.id } },
  });

  if (!media) {
    return NextResponse.json(
      { error: { message: 'Media not found', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  const storage = await getStorageAdapter();
  const urlObj = new URL(media.url);
  const basePath = urlObj.pathname.replace('/uploads/', '');

  const originalBuffer = await storage.download(basePath);

  const webpBuffer = await resizeImage(originalBuffer, {
    format: 'webp',
    quality: 80,
  });
  const webpPath = `${basePath}.webp`;
  const webpUrl = await storage.upload(webpPath, webpBuffer, 'image/webp');

  const srcset: { width: number; url: string }[] = [];

  for (const w of SRCSET_WIDTHS) {
    try {
      const resized = await resizeImage(originalBuffer, {
        width: w,
        format: 'webp',
        quality: 75,
      });
      const variantPath = `${basePath.replace(/\.[^.]+$/, '')}_${w}w.webp`;
      const variantUrl = await storage.upload(
        variantPath,
        resized,
        'image/webp'
      );
      srcset.push({ width: w, url: variantUrl });
    } catch {
      // Skip failed variant
    }
  }

  return NextResponse.json({
    webpUrl,
    srcset,
  });
}
