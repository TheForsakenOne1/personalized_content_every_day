import logger from '../../utils/logger';
import { cacheService } from './cache.service';

export class TrendingCache {
  private readonly PREFIX = 'trending';
  private readonly TTL = 900; // 15 minutes

  getCacheKey(days: number, limit: number): string {
    return `${this.PREFIX}:${days}:${limit}`;
  }

  async get(days: number, limit: number) {
    const key = this.getCacheKey(days, limit);
    return await cacheService.get(key);
  }

  async set(days: number, limit: number, data: any) {
    const key = this.getCacheKey(days, limit);
    return await cacheService.set(key, data, this.TTL);
  }

  async invalidate() {
    return await cacheService.invalidatePattern(`${this.PREFIX}:*`);
  }
}

export const trendingCache = new TrendingCache();
