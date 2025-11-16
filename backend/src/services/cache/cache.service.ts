import { getRedisClient } from '../../config/redis';
import { RedisClientType } from 'redis';

export class CacheService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  async getClient(): Promise<RedisClientType | null> {
    if (this.client && this.isConnected) {
      return this.client;
    }

    try {
      this.client = await getRedisClient();
      this.isConnected = true;
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      return null;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      if (!client) return null;

      const value = await client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) return false;

      const serialized = JSON.stringify(value);

      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, serialized);
      } else {
        await client.set(key, serialized);
      }

      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string | string[]): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) return false;

      if (Array.isArray(key)) {
        await client.del(key);
      } else {
        await client.del(key);
      }

      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) return false;

      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const client = await this.getClient();
      if (!client) return 0;

      const keys = await client.keys(pattern);
      if (keys.length === 0) return 0;

      await client.del(keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache invalidate pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const client = await this.getClient();
      if (!client) return -2;

      return await client.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -2;
    }
  }

  async flush(): Promise<boolean> {
    try {
      const client = await this.getClient();
      if (!client) return false;

      await client.flushDb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Get or compute value - if cache miss, compute and store
   */
  async getOrCompute<T = any>(
    key: string,
    computeFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T | null> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - compute value
    try {
      const value = await computeFn();

      // Store in cache
      await this.set(key, value, ttlSeconds);

      return value;
    } catch (error) {
      console.error(`Compute function error for key ${key}:`, error);
      return null;
    }
  }
}

// Singleton instance
export const cacheService = new CacheService();
