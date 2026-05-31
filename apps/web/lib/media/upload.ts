import { prisma } from "@/lib/db/prisma";

export interface UploadResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

export async function handleFileUpload(
  file: File,
  siteId: string,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploadthing", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  const result: UploadResult = {
    url: data.url,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    width: data.width ?? 0,
    height: data.height ?? 0,
  };

  await prisma.media.create({
    data: {
      siteId,
      url: result.url,
      filename: result.filename,
      mimeType: result.mimeType,
      size: result.size,
      width: result.width,
      height: result.height,
    },
  });

  return result;
}

export function validateFile(file: File, maxSizeMB: number = 10): string | null {
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `File size exceeds ${maxSizeMB}MB limit`;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    return "File type not supported";
  }

  return null;
}
