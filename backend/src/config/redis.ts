import { createClient, RedisClientType } from 'redis';
import { config } from './index';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: config.redisUrl || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis: Too many reconnection attempts, giving up');
          return new Error('Too many reconnection attempts');
        }
        // Exponential backoff: 50ms, 100ms, 200ms, etc.
        return Math.min(retries * 50, 3000);
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redisClient.on('disconnect', () => {
    console.log('⚠️  Redis disconnected');
  });

  await redisClient.connect();

  return redisClient;
};

export const closeRedisConnection = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('Redis connection closed');
  }
};
