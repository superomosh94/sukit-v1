import type { MediaAsset } from '../types';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 20;
const MAX_IMAGE_DIMENSIONS = { width: 10000, height: 10000 };

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
}

export function validateFile(
  file: File,
  options?: FileValidationOptions
): FileValidationResult {
  const errors: string[] = [];
  const typeList = options?.allowedTypes ?? [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_DOCUMENT_TYPES,
  ];
  const maxSize = options?.maxSizeMB
    ? options.maxSizeMB * 1024 * 1024
    : undefined;

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.type);

  if (options?.allowedTypes) {
    if (!typeList.includes(file.type)) {
      errors.push(
        `"${file.name}" has unsupported file type: ${file.type || 'unknown'}`
      );
    }
  } else if (!isImage && !isVideo && !isDocument) {
    errors.push(
      `"${file.name}" has unsupported file type: ${file.type || 'unknown'}`
    );
  }

  const effectiveMax = maxSize ?? (isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE);
  if (file.size > effectiveMax) {
    const maxMB = effectiveMax / 1024 / 1024;
    errors.push(
      `"${file.name}" exceeds ${maxMB}MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`
    );
  }

  const maxW = options?.maxWidth ?? MAX_IMAGE_DIMENSIONS.width;
  const maxH = options?.maxHeight ?? MAX_IMAGE_DIMENSIONS.height;
  if (
    isImage &&
    (maxW < MAX_IMAGE_DIMENSIONS.width || maxH < MAX_IMAGE_DIMENSIONS.height)
  ) {
    errors.push(`"${file.name}" exceeds max dimensions (${maxW}x${maxH})`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateFiles(
  files: File[],
  options?: FileValidationOptions
): FileValidationResult {
  const allErrors: string[] = [];

  if (files.length > MAX_FILES_PER_UPLOAD) {
    allErrors.push(`Maximum ${MAX_FILES_PER_UPLOAD} files per upload`);
    return { valid: false, errors: allErrors };
  }

  for (const file of files) {
    const result = validateFile(file, options);
    allErrors.push(...result.errors);
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}

export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
  if (mimeType.includes('audio/')) return 'audio';
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar')
  )
    return 'archive';
  return 'file';
}

export function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Video';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word')) return 'Word';
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'Excel';
  return 'Document';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function getDimensionsLabel(width?: number, height?: number): string {
  if (width && height) return `${width}x${height}`;
  if (width) return `${width}px`;
  if (height) return `${height}px`;
  return 'Unknown';
}

export function formatDimensions(width?: number, height?: number): string {
  if (width && height) return `${width} × ${height}`;
  if (width) return `${width}px wide`;
  if (height) return `${height}px tall`;
  return 'Unknown';
}

export function getUploadSpeed(bytes: number, seconds: number): string {
  if (seconds <= 0) return '0 MB/s';
  const mbPerSecond = bytes / seconds / (1024 * 1024);
  return `${mbPerSecond.toFixed(1)} MB/s`;
}

export function getTimeRemaining(bytes: number, speedMBps: number): string {
  if (speedMBps <= 0) return '∞';
  const seconds = bytes / (speedMBps * 1024 * 1024);
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  if (seconds < 3600)
    return `${Math.ceil(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.ceil((seconds % 3600) / 60)}m`;
}

export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isVideoType(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

export function isDocumentType(mimeType: string): boolean {
  return ALLOWED_DOCUMENT_TYPES.includes(mimeType);
}

export async function generateThumbnailHash(buffer: Buffer): Promise<string> {
  const sharp = Function('return import("sharp")')();
  return 'placeholder';
}

export function generateFilename(
  original: string,
  conflictIndex?: number
): string {
  const dotIndex = original.lastIndexOf('.');
  const name = dotIndex > 0 ? original.substring(0, dotIndex) : original;
  const ext = dotIndex > 0 ? original.substring(dotIndex) : '';

  if (conflictIndex != null && conflictIndex > 0) {
    const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
    return `${sanitized}_${conflictIndex}${ext}`;
  }

  const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
  return `${sanitized}${ext}`;
}

export function getOptimizedUrl(asset: MediaAsset, variant?: string): string {
  if (variant && asset.variants) {
    const v = asset.variants.find((mv) => mv.type === variant);
    if (v) return v.path;
  }
  return asset.url ?? asset.thumbnailUrl ?? '';
}

export function generateSrcSet(asset: MediaAsset): string {
  if (!asset.variants) return '';
  return asset.variants
    .filter((v) => ['small', 'medium', 'large', 'xl'].includes(v.type))
    .map((v) => `${v.path} ${v.width}w`)
    .join(', ');
}

export function generateSizes(asset: MediaAsset): string {
  if (!asset.width) return '100vw';
  return `(max-width: ${asset.width}px) 100vw, ${asset.width}px`;
}
