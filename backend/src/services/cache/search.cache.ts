import { cacheService } from './cache.service';

export class SearchCache {
  private readonly PREFIX = 'search';
  private readonly TTL = 3600; // 1 hour

  getCacheKey(query: string, limit: number): string {
    // Normalize query (lowercase, trim) for better cache hits
    const normalizedQuery = query.toLowerCase().trim();
    return `${this.PREFIX}:${normalizedQuery}:${limit}`;
  }

  async get(query: string, limit: number) {
    const key = this.getCacheKey(query, limit);
    return await cacheService.get(key);
  }

  async set(query: string, limit: number, data: any) {
    const key = this.getCacheKey(query, limit);
    return await cacheService.set(key, data, this.TTL);
  }

  async invalidate() {
    return await cacheService.invalidatePattern(`${this.PREFIX}:*`);
  }
}

export const searchCache = new SearchCache();
