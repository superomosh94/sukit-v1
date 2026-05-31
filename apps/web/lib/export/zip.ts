import type { FileEntry } from "./static-export";

interface ZipFileEntry {
  path: string;
  content: string | Uint8Array;
}

export async function createZipBuffer(files: ZipFileEntry[]): Promise<Uint8Array> {
  const { default: archiver } = await import("archiver");
  const { Readable } = await import("stream");

  return new Promise<Uint8Array>((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    for (const file of files) {
      if (typeof file.content === "string") {
        archive.append(file.content, { name: file.path });
      } else {
        archive.append(Buffer.from(file.content), { name: file.path });
      }
    }

    archive.finalize();
  });
}

export async function createZipFromFiles(
  files: Array<{ path: string; content: string }>,
): Promise<Blob> {
  const buffer = await createZipBuffer(files);
  return new Blob([buffer], { type: "application/zip" });
}
