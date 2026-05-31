export interface StorageAdapter {
  upload(path: string, buffer: Buffer, mimeType: string): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  url(path: string): string;
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(
    private basePath: string = process.env.UPLOAD_DIR ?? "./uploads",
    private baseUrl: string = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/uploads`,
  ) {}

  async upload(path: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const fs = await import("fs/promises");
    const fullPath = `${this.basePath}/${path}`;
    await fs.mkdir(fullPath.split("/").slice(0, -1).join("/"), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return this.url(path);
  }

  async download(path: string): Promise<Buffer> {
    const fs = await import("fs/promises");
    return fs.readFile(`${this.basePath}/${path}`);
  }

  async delete(path: string): Promise<void> {
    const fs = await import("fs/promises");
    await fs.unlink(`${this.basePath}/${path}`);
  }

  url(path: string): string {
    return `${this.baseUrl}/${path}`;
  }
}

export class S3StorageAdapter implements StorageAdapter {
  private s3: import("@aws-sdk/client-s3").S3Client;

  constructor(
    private bucket: string = process.env.S3_BUCKET ?? "",
    private region: string = process.env.S3_REGION ?? "us-east-1",
    private endpoint: string = process.env.S3_ENDPOINT ?? "",
  ) {
    const { S3Client } = require("@aws-sdk/client-s3") as typeof import("@aws-sdk/client-s3");
    this.s3 = new S3Client({
      region: this.region,
      endpoint: this.endpoint || undefined,
      forcePathStyle: !!this.endpoint,
    });
  }

  async upload(path: string, buffer: Buffer, mimeType: string): Promise<string> {
    const { PutObjectCommand } = require("@aws-sdk/client-s3") as typeof import("@aws-sdk/client-s3");
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return this.url(path);
  }

  async download(path: string): Promise<Buffer> {
    const { GetObjectCommand } = require("@aws-sdk/client-s3") as typeof import("@aws-sdk/client-s3");
    const response = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: path }),
    );
    return Buffer.from(await response.Body!.transformToByteArray());
  }

  async delete(path: string): Promise<void> {
    const { DeleteObjectCommand } = require("@aws-sdk/client-s3") as typeof import("@aws-sdk/client-s3");
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: path }),
    );
  }

  url(path: string): string {
    if (this.endpoint) return `${this.endpoint}/${this.bucket}/${path}`;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
  }
}

let _storageAdapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (_storageAdapter) return _storageAdapter;

  const provider = process.env.STORAGE_PROVIDER ?? "local";
  if (provider === "s3" || provider === "r2") {
    _storageAdapter = new S3StorageAdapter();
  } else {
    _storageAdapter = new LocalStorageAdapter();
  }

  return _storageAdapter;
}
