import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
} from 'crypto';

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

let _adapter: StorageAdapter | null = null;

export function setStorageAdapter(adapter: StorageAdapter): void {
  _adapter = adapter;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function deriveKey(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, 100000, 32, 'sha512');
}

function encrypt(plaintext: string, key: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const derivedKey = deriveKey(key, salt);
  const cipher = createCipheriv(ALGORITHM, derivedKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf-8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([salt, iv, tag, encrypted]);
  return payload.toString('base64');
}

function decrypt(ciphertext: string, key: string): string {
  const payload = Buffer.from(ciphertext, 'base64');
  const salt = payload.subarray(0, SALT_LENGTH);
  const iv = payload.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = payload.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH
  );
  const data = payload.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const derivedKey = deriveKey(key, salt);
  const decipher = createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final('utf-8');
}

export function createStorageAPI(prefix: string, adapter?: StorageAdapter) {
  const a = () => adapter ?? _adapter;
  const ttlTimers = new Map<string, NodeJS.Timeout>();

  const prefixed = (key: string) => `${prefix}:${key}`;

  const ensure = () => {
    const inst = a();
    if (!inst) throw new Error('Storage adapter not configured');
    return inst;
  };

  const setTtl = (key: string, ttl: number) => {
    const existing = ttlTimers.get(key);
    if (existing) clearTimeout(existing);
    ttlTimers.set(
      key,
      setTimeout(async () => {
        await ensure().delete(prefixed(key));
        ttlTimers.delete(key);
      }, ttl * 1000)
    );
  };

  return {
    async get<T>(key: string): Promise<T | null> {
      return ensure().get<T>(prefixed(key));
    },

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
      await ensure().set(prefixed(key), value);
      if (ttl && ttl > 0) setTtl(key, ttl);
    },

    async delete(key: string): Promise<void> {
      const existing = ttlTimers.get(key);
      if (existing) clearTimeout(existing);
      ttlTimers.delete(key);
      return ensure().delete(prefixed(key));
    },

    async has(key: string): Promise<boolean> {
      return ensure().has(prefixed(key));
    },

    async clear(): Promise<void> {
      for (const [, timer] of ttlTimers) clearTimeout(timer);
      ttlTimers.clear();
    },

    /* --- Encryption (AES-256-GCM) --- */
    encryptionKey: null as string | null,

    setEncryption(key: string): void {
      this.encryptionKey = key;
    },

    async setEncrypted(key: string, value: string): Promise<void> {
      if (!this.encryptionKey) throw new Error('Encryption key not set');
      const encrypted = encrypt(value, this.encryptionKey);
      await ensure().set(prefixed(key), encrypted);
    },

    async getEncrypted(key: string): Promise<string | null> {
      const val = await ensure().get<string>(prefixed(key));
      if (!val) return null;
      return decrypt(val, this.encryptionKey!);
    },
  };
}

export type StorageAPI = ReturnType<typeof createStorageAPI>;
