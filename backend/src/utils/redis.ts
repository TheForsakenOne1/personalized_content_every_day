import { getRedisClient } from '../config/redis';
import type { RedisClientType } from 'redis';

let redisClientInstance: RedisClientType | null = null;

// Initialize Redis client lazily
const getRedis = async (): Promise<RedisClientType> => {
  if (!redisClientInstance || !redisClientInstance.isOpen) {
    redisClientInstance = await getRedisClient();
  }
  return redisClientInstance;
};

// Export a proxy that initializes on first use
export const redis = new Proxy({} as RedisClientType, {
  get: function (target, prop) {
    return async function (...args: any[]) {
      const client = await getRedis();
      const method = (client as any)[prop];
      if (typeof method === 'function') {
        return method.apply(client, args);
      }
      return method;
    };
  },
});

export { getRedis, getRedisClient };
