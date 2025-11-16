import { prisma } from '../../utils/prisma';
import { redis } from '../../utils/redis';

export interface SearchSuggestion {
  query: string;
  score: number; // Relevance score
  type: 'popular' | 'personal' | 'content' | 'tag';
}

/**
 * Search Suggestions Service
 * Provides autocomplete suggestions based on:
 * - User's search history
 * - Popular/trending searches
 * - Content titles/tags
 */
export class SearchSuggestionsService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'search:suggestions';

  /**
   * Get search suggestions for a query
   */
  async getSuggestions(query: string, userId?: string, limit: number = 10): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();

    // Try cache first
    const cacheKey = `${this.CACHE_PREFIX}:${normalizedQuery}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      console.log(`📦 Suggestions cache HIT (q="${normalizedQuery}")`);
      return cached;
    }

    console.log(`🔍 Suggestions cache MISS - generating suggestions`);

    // Combine suggestions from multiple sources
    const suggestions: SearchSuggestion[] = [];

    // 1. User's personal history (if logged in)
    if (userId) {
      const personalSuggestions = await this.getPersonalSuggestions(userId, normalizedQuery);
      suggestions.push(...personalSuggestions);
    }

    // 2. Popular/trending searches
    const popularSuggestions = await this.getPopularSuggestions(normalizedQuery);
    suggestions.push(...popularSuggestions);

    // 3. Content titles
    const contentSuggestions = await this.getContentSuggestions(normalizedQuery);
    suggestions.push(...contentSuggestions);

    // 4. Tags
    const tagSuggestions = await this.getTagSuggestions(normalizedQuery);
    suggestions.push(...tagSuggestions);

    // Sort by score and deduplicate
    const uniqueSuggestions = this.deduplicateAndSort(suggestions);
    const topSuggestions = uniqueSuggestions.slice(0, limit);

    // Cache for 1 hour
    await this.saveToCache(cacheKey, topSuggestions);

    return topSuggestions;
  }

  /**
   * Get suggestions from user's search history
   */
  private async getPersonalSuggestions(userId: string, query: string): Promise<SearchSuggestion[]> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      const history = await prisma.searchHistory.findMany({
        where: {
          userId,
          query: {
            contains: query,
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { query: true },
      });

      return history.map(h => ({
        query: h.query,
        score: 100, // Highest priority for personal history
        type: 'personal' as const,
      }));
      */

      return [];
    } catch (error) {
      console.error('Error fetching personal suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular/trending search suggestions
   */
  private async getPopularSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      // Get searches from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const searches = await prisma.searchHistory.findMany({
        where: {
          query: {
            contains: query,
            mode: 'insensitive',
          },
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: { query: true },
      });

      // Count frequency
      const frequency = new Map<string, number>();
      searches.forEach(s => {
        frequency.set(s.query, (frequency.get(s.query) || 0) + 1);
      });

      // Convert to suggestions with score based on frequency
      return Array.from(frequency.entries())
        .map(([q, count]) => ({
          query: q,
          score: Math.min(count * 5, 90), // Cap at 90, below personal history
          type: 'popular' as const,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      */

      return [];
    } catch (error) {
      console.error('Error fetching popular suggestions:', error);
      return [];
    }
  }

  /**
   * Get suggestions from content titles
   */
  private async getContentSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      const content = await prisma.content.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: { title: true },
        take: 10,
        orderBy: { publishedAt: 'desc' },
      });

      // Extract unique phrases from titles
      const suggestions: SearchSuggestion[] = [];
      const seen = new Set<string>();

      content.forEach(c => {
        // Extract words that contain the query
        const words = c.title.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.includes(query) && word.length >= query.length && !seen.has(word)) {
            seen.add(word);
            suggestions.push({
              query: word,
              score: 70, // Medium priority
              type: 'content',
            });
          }
        });

        // Also suggest the full title if it's not too long
        if (c.title.length <= 60 && !seen.has(c.title.toLowerCase())) {
          seen.add(c.title.toLowerCase());
          suggestions.push({
            query: c.title,
            score: 75,
            type: 'content',
          });
        }
      });

      return suggestions.slice(0, 5);
      */

      return [];
    } catch (error) {
      console.error('Error fetching content suggestions:', error);
      return [];
    }
  }

  /**
   * Get suggestions from tags
   */
  private async getTagSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: { name: true },
        take: 5,
      });

      return tags.map(t => ({
        query: t.name,
        score: 60, // Lower priority than personal/popular
        type: 'tag' as const,
      }));
      */

      return [];
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
      return [];
    }
  }

  /**
   * Deduplicate and sort suggestions
   */
  private deduplicateAndSort(suggestions: SearchSuggestion[]): SearchSuggestion[] {
    // Deduplicate by query (keep highest score)
    const map = new Map<string, SearchSuggestion>();

    suggestions.forEach(s => {
      const existing = map.get(s.query);
      if (!existing || s.score > existing.score) {
        map.set(s.query, s);
      }
    });

    // Sort by score descending
    return Array.from(map.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Get trending search queries (most searched in last 24 hours)
   */
  async getTrendingSearches(limit: number = 10): Promise<Array<{ query: string; count: number }>> {
    try {
      // Try cache first
      const cacheKey = `${this.CACHE_PREFIX}:trending:${limit}`;
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        console.log('📦 Trending searches cache HIT');
        return cached;
      }

      console.log('🔍 Trending searches cache MISS - calculating');

      // TODO: Uncomment when Prisma is generated
      /*
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const searches = await prisma.searchHistory.findMany({
        where: {
          createdAt: {
            gte: oneDayAgo,
          },
        },
        select: { query: true },
      });

      // Count frequency
      const frequency = new Map<string, number>();
      searches.forEach(s => {
        frequency.set(s.query, (frequency.get(s.query) || 0) + 1);
      });

      // Sort by count
      const trending = Array.from(frequency.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      // Cache for 1 hour
      await this.saveToCache(cacheKey, trending);

      return trending;
      */

      return [];
    } catch (error) {
      console.error('Error fetching trending searches:', error);
      return [];
    }
  }

  /**
   * Get from Redis cache
   */
  private async getFromCache(key: string): Promise<any> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Save to Redis cache
   */
  private async saveToCache(key: string, value: any): Promise<void> {
    try {
      await redis.setEx(key, this.CACHE_TTL, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Clear all suggestion caches
   */
  async clearCache(): Promise<void> {
    try {
      const pattern = `${this.CACHE_PREFIX}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(keys);
        console.log(`🗑️ Cleared ${keys.length} suggestion cache entries`);
      }
    } catch (error) {
      console.error('Error clearing suggestion cache:', error);
    }
  }
}

export const searchSuggestionsService = new SearchSuggestionsService();
