import type { CropArea, ImageFilter } from './types';

export interface OptimizeOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  stripMetadata?: boolean;
}

export type FlipDirection = 'horizontal' | 'vertical';

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  space?: string;
  channels?: number;
  depth?: string;
  density?: number;
  hasAlpha?: boolean;
  exif?: Record<string, unknown>;
}

export async function optimizeImage(
  buffer: Buffer,
  options: OptimizeOptions = {}
): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  const {
    quality = 80,
    format = 'webp',
    width,
    height,
    stripMetadata,
  } = options;

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

  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9 });
      break;
  }

  return pipeline.toBuffer();
}

export async function generateResponsiveVariants(
  buffer: Buffer,
  sizes: { width: number; suffix: string }[]
): Promise<
  { suffix: string; buffer: Buffer; width: number; height: number }[]
> {
  const { default: sharp } = await import('sharp');
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width ?? 0;
  const results: {
    suffix: string;
    buffer: Buffer;
    width: number;
    height: number;
  }[] = [];

  for (const { width, suffix } of sizes) {
    if (width >= originalWidth) continue;
    const resized = await sharp(buffer)
      .resize(width, undefined, { fit: 'contain', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
    const dims = await sharp(resized).metadata();
    results.push({
      suffix,
      buffer: resized,
      width: dims.width ?? 0,
      height: dims.height ?? 0,
    });
  }

  return results;
}

export async function cropImage(
  buffer: Buffer,
  cropArea: CropArea
): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  return sharp(buffer)
    .extract({
      left: Math.round(cropArea.x),
      top: Math.round(cropArea.y),
      width: Math.round(cropArea.width),
      height: Math.round(cropArea.height),
    })
    .toBuffer();
}

export async function resizeImage(
  buffer: Buffer,
  width: number,
  height?: number
): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  return sharp(buffer)
    .resize(width, height, {
      fit: 'contain',
      withoutEnlargement: true,
    })
    .toBuffer();
}

export async function rotateImage(
  buffer: Buffer,
  degrees: 90 | 180 | 270
): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  return sharp(buffer).rotate(degrees).toBuffer();
}

export async function flipImage(
  buffer: Buffer,
  direction: FlipDirection
): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  let pipeline = sharp(buffer);
  if (direction === 'horizontal') {
    pipeline = pipeline.flop();
  } else {
    pipeline = pipeline.flip();
  }
  return pipeline.toBuffer();
}

export async function applyFilters(
  buffer: Buffer,
  filters: ImageFilter
): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  let pipeline = sharp(buffer);

  if (
    filters.brightness != null ||
    filters.contrast != null ||
    filters.saturation != null
  ) {
    const modulate: Record<string, number> = {};
    if (filters.brightness != null) {
      modulate.brightness = filters.brightness / 100;
    }
    if (filters.saturation != null) {
      modulate.saturation = filters.saturation / 100;
    }
    pipeline = pipeline.modulate(modulate);

    if (filters.contrast != null && filters.contrast !== 0) {
      const factor =
        (259 * (filters.contrast + 255)) / (255 * (259 - filters.contrast));
      pipeline = pipeline.linear(factor, 128 * (1 - factor));
    }
  }

  if (filters.blur != null && filters.blur > 0) {
    pipeline = pipeline.blur(filters.blur);
  }

  return pipeline.toBuffer();
}

export async function stripMetadata(buffer: Buffer): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  return sharp(buffer).withMetadata({}).toBuffer();
}

export async function generateThumbnail(
  buffer: Buffer,
  size: number = 150
): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  return sharp(buffer)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .webp({ quality: 60 })
    .toBuffer();
}

export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const { default: sharp } = await import('sharp');
  const metadata = await sharp(buffer).metadata();

  let exif: Record<string, unknown> | undefined;
  if (metadata.exif) {
    try {
      const metadata: Record<string, unknown> = {};
    } catch {}
  }

  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    format: metadata.format ?? 'unknown',
    space: metadata.space,
    channels: metadata.channels,
    depth: metadata.depth,
    density: metadata.density,
    hasAlpha: metadata.hasAlpha,
    exif,
  };
}
