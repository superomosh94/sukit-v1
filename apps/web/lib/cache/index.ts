import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });
    redis.on('error', () => {});
  }
  return redis;
}

const TTL = {
  PAGE: 60 * 5,
  API: 60 * 2,
  QUERY: 60 * 10,
};

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const r = getRedis();
    return await r.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttl: number = TTL.PAGE): Promise<void> {
  try {
    const r = getRedis();
    await r.setex(key, ttl, value);
  } catch {
    // cache miss ok
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const r = getRedis();
    const keys = await r.keys(pattern);
    if (keys.length > 0) await r.del(...keys);
  } catch {
    // ok
  }
}

export function pageCacheKey(siteId: string, path: string): string {
  return `page:${siteId}:${path}`;
}

export function apiCacheKey(endpoint: string, params: string): string {
  return `api:${endpoint}:${params}`;
}

export async function invalidateSiteCache(siteId: string): Promise<void> {
  await cacheDel(`page:${siteId}:*`);
  await cacheDel(`api:${siteId}:*`);
}

export { TTL };
