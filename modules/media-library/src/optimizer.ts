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
  options: OptimizeOptions
): Promise<Buffer> {
  const sharp = Function('return import("sharp")')();
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
      exif = {} as Record<string, unknown>;
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

export async function convertToWebP(
  buffer: Buffer,
  quality: number = 80
): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  return sharp(buffer).webp({ quality }).toBuffer();
}

export async function convertToAVIF(
  buffer: Buffer,
  quality: number = 80
): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  return sharp(buffer).avif({ quality }).toBuffer();
}

export function getOriginalSize(buffer: Buffer): number {
  return buffer.length;
}

export async function getOptimizedSize(
  buffer: Buffer,
  format: 'webp' | 'avif' | 'jpeg' | 'png',
  quality: number = 80
): Promise<number> {
  const { default: sharp } = await import('sharp');
  let pipeline = sharp(buffer);
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
  const out = await pipeline.toBuffer();
  return out.length;
}

export interface CompressionComparison {
  format: string;
  size: number;
  savingsPercent: number;
}

export async function compareCompression(
  buffer: Buffer,
  formats: { format: 'webp' | 'avif' | 'jpeg' | 'png'; quality: number }[]
): Promise<CompressionComparison[]> {
  const originalSize = buffer.length;
  const results: CompressionComparison[] = [];
  for (const { format, quality } of formats) {
    const size = await getOptimizedSize(buffer, format, quality);
    results.push({
      format,
      size,
      savingsPercent: Math.round((1 - size / originalSize) * 100 * 10) / 10,
    });
  }
  return results;
}

export interface SrcSetVariant {
  width: number;
  height: number;
  url: string;
  size: number;
}

export async function generateSrcSetVariants(
  buffer: Buffer,
  sizes: { width: number; label: string }[]
): Promise<{ variants: SrcSetVariant[]; srcSet: string }> {
  const { default: sharp } = await import('sharp');
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width ?? 0;
  const variants: SrcSetVariant[] = [];

  for (const { width, label } of sizes) {
    if (width >= originalWidth) continue;
    const resized = await sharp(buffer)
      .resize(width, undefined, { fit: 'contain', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
    const dims = await sharp(resized).metadata();
    variants.push({
      width: dims.width ?? width,
      height: dims.height ?? 0,
      url: `/api/media/variant/${label}`,
      size: resized.length,
    });
  }

  const srcSet = variants.map((v) => `${v.url} ${v.width}w`).join(', ');
  return { variants, srcSet };
}

export async function generatePictureSources(
  buffer: Buffer
): Promise<{ webp: Buffer; avif: Buffer; originalFormat: string }> {
  const { default: sharp } = await import('sharp');
  const metadata = await sharp(buffer).metadata();
  const webp = await sharp(buffer).webp({ quality: 80 }).toBuffer();
  const avif = await sharp(buffer).avif({ quality: 80 }).toBuffer();
  return {
    webp,
    avif,
    originalFormat: metadata.format ?? 'jpeg',
  };
}

export async function autoStraighten(buffer: Buffer): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  return sharp(buffer).rotate().withMetadata().toBuffer();
}

export interface FocusPoint {
  x: number;
  y: number;
}

export async function getFocusPoint(buffer: Buffer): Promise<FocusPoint> {
  const { default: sharp } = await import('sharp');
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 1;
  const height = metadata.height ?? 1;

  const { data, info } = await sharp(buffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let totalLuma = 0;
  const lumaMap: number[] = [];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      lumaMap.push(luma);
      totalLuma += luma;
    }
  }

  const avgLuma = totalLuma / lumaMap.length;
  let weightedX = 0;
  let weightedY = 0;
  let totalWeight = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const luma = lumaMap[y * info.width + x];
      const contrast = Math.abs(luma - avgLuma);
      const centerWeight =
        1 -
        Math.sqrt(
          Math.pow((x / info.width - 0.5) * 2, 2) +
            Math.pow((y / info.height - 0.5) * 2, 2)
        ) /
          1.5;
      const weight = Math.max(0, contrast * (0.5 + centerWeight));
      weightedX += x * weight;
      weightedY += y * weight;
      totalWeight += weight;
    }
  }

  return {
    x:
      totalWeight > 0
        ? Math.round((weightedX / totalWeight / width) * 100)
        : 50,
    y:
      totalWeight > 0
        ? Math.round((weightedY / totalWeight / height) * 100)
        : 50,
  };
}
