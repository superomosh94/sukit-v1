import { createHash, randomBytes, createHmac, timingSafeEqual } from 'crypto';

export function generateId(prefix?: string): string {
  const id = randomBytes(12).toString('hex');
  return prefix ? `${prefix}_${id}` : id;
}

export function generateLicenseKey(): string {
  const segment = () => randomBytes(4).toString('hex').toUpperCase();
  return `SUK-${segment()}-${segment()}-${segment()}-${segment()}`;
}

export function generateApiKey(): { key: string; hash: string } {
  const raw = `suk_dev_${randomBytes(32).toString('base64url')}`;
  const hash = hashApiKey(raw);
  return { key: raw, hash };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

export function fileHash(buffer: Buffer | string): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export function shortId(): string {
  return randomBytes(6).toString('base64url');
}

export function extractDomain(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
