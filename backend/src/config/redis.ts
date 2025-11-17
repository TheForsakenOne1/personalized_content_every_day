import { createClient, RedisClientType } from 'redis';
import { config } from './index';
import logger from '../utils/logger';
import { REDIS_CONSTANTS } from '../constants';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: config.redisUrl || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > REDIS_CONSTANTS.MAX_RECONNECT_ATTEMPTS) {
          logger.error('Redis: Too many reconnection attempts, giving up', { retries });
          return new Error('Too many reconnection attempts');
        }
        // Exponential backoff: 50ms, 100ms, 200ms, etc.
        const delay = Math.min(
          retries * REDIS_CONSTANTS.RECONNECT_BASE_DELAY_MS,
          REDIS_CONSTANTS.RECONNECT_MAX_DELAY_MS
        );
        return delay;
      },
    },
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error', { error: err.message });
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redisClient.on('disconnect', () => {
    logger.warn('Redis disconnected');
  });

  await redisClient.connect();

  return redisClient;
};

export const closeRedisConnection = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};
