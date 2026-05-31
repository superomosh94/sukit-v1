export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png" | "avif";
}

export async function getImageDimensions(
  buffer: Buffer,
): Promise<ImageDimensions> {
  const { default: sharp } = await import("sharp");
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

export async function resizeImage(
  buffer: Buffer,
  options: ResizeOptions,
): Promise<Buffer> {
  const { default: sharp } = await import("sharp");

  let pipeline = sharp(buffer);

  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: "contain",
      withoutEnlargement: true,
    });
  }

  if (options.format) {
    switch (options.format) {
      case "webp":
        pipeline = pipeline.webp({ quality: options.quality ?? 80 });
        break;
      case "jpeg":
        pipeline = pipeline.jpeg({ quality: options.quality ?? 85 });
        break;
      case "png":
        pipeline = pipeline.png({ compressionLevel: 8 });
        break;
      case "avif":
        pipeline = pipeline.avif({ quality: options.quality ?? 65 });
        break;
    }
  }

  return pipeline.toBuffer();
}

export async function generateBlurPlaceholder(
  buffer: Buffer,
): Promise<string> {
  const { default: sharp } = await import("sharp");
  const smallBlur = await sharp(buffer)
    .resize(10, 10, { fit: "cover" })
    .blur(5)
    .webp({ quality: 20 })
    .toBuffer();

  return `data:image/webp;base64,${smallBlur.toString("base64")}`;
}

export async function convertToWebP(
  buffer: Buffer,
  quality: number = 80,
): Promise<Buffer> {
  const { default: sharp } = await import("sharp");
  return sharp(buffer).webp({ quality }).toBuffer();
}

export function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    avif: "image/avif",
  };
  return mimeTypes[format.toLowerCase()] ?? "application/octet-stream";
}
