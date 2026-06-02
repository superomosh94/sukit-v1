import { EventEmitter } from 'events';
import Redis from 'ioredis';

let client: Redis | null = null;
let useRealRedis = false;

export function hasRedis(): boolean {
  return useRealRedis;
}

export function getRedis(): Redis {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) {
      const emitter = new EventEmitter();
      const mock = emitter as unknown as Redis;
      mock.connect = () => Promise.resolve() as any;
      mock.quit = () => Promise.resolve() as any;
      mock.disconnect = () => {};
      mock.status = 'close';
      mock.options = {};
      client = mock;
      return client;
    }

    useRealRedis = true;
    client = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: () => null,
    });
    client.on('error', () => {});
  }
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    try {
      await client.quit();
    } catch {
      // ignore disconnect errors
    }
    client = null;
  }
}
