import type { StorageAdapter } from './types';

let _S3Client: typeof import('@aws-sdk/client-s3').S3Client;
let _PutObjectCommand: typeof import('@aws-sdk/client-s3').PutObjectCommand;
let _GetObjectCommand: typeof import('@aws-sdk/client-s3').GetObjectCommand;
let _DeleteObjectCommand: typeof import('@aws-sdk/client-s3').DeleteObjectCommand;

async function loadS3() {
  if (!_S3Client) {
    const mod = await import('@aws-sdk/client-s3');
    _S3Client = mod.S3Client;
    _PutObjectCommand = mod.PutObjectCommand;
    _GetObjectCommand = mod.GetObjectCommand;
    _DeleteObjectCommand = mod.DeleteObjectCommand;
  }
}

export class S3StorageAdapter implements StorageAdapter {
  private s3!: InstanceType<typeof _S3Client>;
  private initialized = false;

  constructor(
    private bucket: string = process.env.S3_BUCKET ?? '',
    private region: string = process.env.S3_REGION ?? 'us-east-1',
    private endpoint: string = process.env.S3_ENDPOINT ?? ''
  ) {}

  private async ensure() {
    if (this.initialized) return;
    await loadS3();
    this.s3 = new _S3Client({
      region: this.region,
      endpoint: this.endpoint || undefined,
      forcePathStyle: !!this.endpoint,
    });
    this.initialized = true;
  }

  async upload(
    path: string,
    buffer: Buffer,
    _mimeType: string
  ): Promise<string> {
    await this.ensure();
    await this.s3.send(
      new _PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: buffer,
        ContentType: _mimeType,
      })
    );
    return this.url(path);
  }

  async download(path: string): Promise<Buffer> {
    await this.ensure();
    const response = await this.s3.send(
      new _GetObjectCommand({ Bucket: this.bucket, Key: path })
    );
    return Buffer.from(await response.Body!.transformToByteArray());
  }

  async delete(path: string): Promise<void> {
    await this.ensure();
    await this.s3.send(
      new _DeleteObjectCommand({ Bucket: this.bucket, Key: path })
    );
  }

  url(path: string): string {
    if (this.endpoint) return `${this.endpoint}/${this.bucket}/${path}`;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${path}`;
  }
}
