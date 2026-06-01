import { prisma } from '../db';
import sharp from 'sharp';

export interface OptimizeOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export async function optimizeImage(
  buffer: Buffer,
  filename: string,
  options: OptimizeOptions = {}
) {
  const { quality = 80, width, height, format } = options;
  const targetFormat =
    format || (filename.match(/\.(webp|avif)$/i) ? undefined : 'webp');

  let pipeline = sharp(buffer);

  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (targetFormat === 'webp') {
    pipeline = pipeline.webp({ quality });
  } else if (targetFormat === 'avif') {
    pipeline = pipeline.avif({ quality });
  } else if (targetFormat === 'jpeg') {
    pipeline = pipeline.jpeg({ quality });
  }

  const optimized = await pipeline.toBuffer();
  const metadata = await sharp(buffer).metadata();

  return {
    buffer: optimized,
    width: metadata.width,
    height: metadata.height,
    format: targetFormat || metadata.format,
    size: optimized.length,
  };
}
