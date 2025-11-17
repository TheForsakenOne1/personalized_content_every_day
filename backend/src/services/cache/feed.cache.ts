import logger from '../../utils/logger';
import { cacheService } from './cache.service';

export class FeedCache {
  private readonly PREFIX = 'feed';
  private readonly TTL = 300; // 5 minutes

  getCacheKey(userId: string, filter?: string): string {
    return `${this.PREFIX}:${userId}:${filter || 'all'}`;
  }

  async get(userId: string, filter?: string) {
    const key = this.getCacheKey(userId, filter);
    return await cacheService.get(key);
  }

  async set(userId: string, data: any, filter?: string) {
    const key = this.getCacheKey(userId, filter);
    return await cacheService.set(key, data, this.TTL);
  }

  async invalidateUser(userId: string) {
    return await cacheService.invalidatePattern(`${this.PREFIX}:${userId}:*`);
  }

  async invalidateAll() {
    return await cacheService.invalidatePattern(`${this.PREFIX}:*`);
  }
}

export const feedCache = new FeedCache();
