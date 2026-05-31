const IV_LENGTH = 12;
const KEY_BITS = 128;

export async function generateKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: KEY_BITS },
    true,
    ['encrypt', 'decrypt']
  );
  const jwk = await crypto.subtle.exportKey('jwk', key);
  return jwk.k as string;
}

export async function encrypt(
  key: string,
  data: unknown
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const cryptoKey = await importKey(key, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoded
  );
  return { encrypted, iv };
}

export async function decrypt(
  key: string,
  iv: Uint8Array,
  encrypted: ArrayBuffer
): Promise<unknown> {
  const cryptoKey = await importKey(key, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    cryptoKey,
    encrypted
  );
  const decoded = new TextDecoder().decode(decrypted);
  return JSON.parse(decoded);
}

async function importKey(key: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    { k: key, alg: 'A128GCM', ext: true, key_ops: usages, kty: 'oct' },
    { name: 'AES-GCM', length: KEY_BITS },
    false,
    usages
  );
}
