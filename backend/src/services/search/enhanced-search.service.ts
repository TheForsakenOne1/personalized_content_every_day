import { prisma } from '../../utils/prisma';
import { searchCache } from '../cache/search.cache';
import { searchHistoryService } from './search-history.service';

export interface AdvancedSearchFilters {
  query: string;
  categoryId?: string;
  contentType?: string; // 'paper', 'article', 'video', 'blog'
  source?: string; // 'arXiv', 'PubMed', 'IEEE', etc.
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  minQualityScore?: number;
  author?: string;
  sortBy?: 'relevance' | 'date' | 'quality' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  url: string;
  author: string | null;
  publishedAt: Date | null;
  contentType: string;
  source: string;
  qualityScore: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    id: string;
    name: string;
  }>;
  relevanceScore?: number; // Calculated based on search query
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  filters: AdvancedSearchFilters;
}

/**
 * Enhanced Search Service
 * Provides advanced search functionality with:
 * - Multi-field text search
 * - Advanced filtering (type, source, date range, quality)
 * - Multiple sort options
 * - Relevance scoring
 * - Search history tracking
 */
export class EnhancedSearchService {
  /**
   * Perform advanced search with filters
   */
  async search(
    filters: AdvancedSearchFilters,
    userId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    const skip = (page - 1) * limit;

    // Try cache first (for common searches without user-specific data)
    if (!userId) {
      const cached = await searchCache.get(filters.query, limit);
      if (cached && this.filtersMatchCache(filters)) {
        console.log(`📦 Enhanced search cache HIT (q="${filters.query}")`);
        return {
          results: cached,
          total: cached.length,
          page,
          limit,
          filters,
        };
      }
    }

    console.log(`🔍 Enhanced search cache MISS - searching DB`);

    // Build where clause
    const where = this.buildWhereClause(filters);

    // Get total count
    const total = await this.getCount(where);

    // Get results
    const results = await this.getResults(where, filters, skip, limit);

    // Calculate relevance scores
    const scoredResults = this.calculateRelevance(results, filters.query);

    // Record search in history (async, don't wait)
    if (userId) {
      searchHistoryService.recordSearch(userId, filters.query, total).catch(err => {
        console.error('Failed to record search:', err);
      });
    }

    // Cache results for non-user-specific searches
    if (!userId && total > 0) {
      searchCache.set(filters.query, scoredResults, limit).catch(err => {
        console.error('Failed to cache search results:', err);
      });
    }

    return {
      results: scoredResults,
      total,
      page,
      limit,
      filters,
    };
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filters: AdvancedSearchFilters): any {
    const where: any = {};

    // Text search (search in title, description, author)
    if (filters.query && filters.query.trim()) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { author: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Content type filter
    if (filters.contentType) {
      where.contentType = filters.contentType;
    }

    // Source filter
    if (filters.source) {
      where.source = filters.source;
    }

    // Author filter
    if (filters.author) {
      where.author = { contains: filters.author, mode: 'insensitive' };
    }

    // Quality score filter
    if (filters.minQualityScore !== undefined) {
      where.qualityScore = { gte: filters.minQualityScore };
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.publishedAt = {};
      if (filters.dateFrom) {
        where.publishedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.publishedAt.lte = filters.dateTo;
      }
    }

    // Tags filter (content must have at least one of the specified tags)
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: filters.tags,
            },
          },
        },
      };
    }

    return where;
  }

  /**
   * Get total count of results
   */
  private async getCount(where: any): Promise<number> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      return await prisma.content.count({ where });
      */

      return 0;
    } catch (error) {
      console.error('Error counting search results:', error);
      return 0;
    }
  }

  /**
   * Get search results
   */
  private async getResults(
    where: any,
    filters: AdvancedSearchFilters,
    skip: number,
    limit: number
  ): Promise<SearchResult[]> {
    try {
      // Determine sort order
      const orderBy = this.buildOrderBy(filters.sortBy || 'relevance', filters.sortOrder || 'desc');

      // TODO: Uncomment when Prisma is generated
      /*
      const content = await prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Transform to SearchResult format
      return content.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        url: c.url,
        author: c.author,
        publishedAt: c.publishedAt,
        contentType: c.contentType,
        source: c.source,
        qualityScore: Number(c.qualityScore),
        categoryId: c.categoryId,
        category: c.category,
        tags: c.tags.map(ct => ct.tag),
      }));
      */

      return [];
    } catch (error) {
      console.error('Error fetching search results:', error);
      return [];
    }
  }

  /**
   * Build orderBy clause
   */
  private buildOrderBy(sortBy: string, sortOrder: 'asc' | 'desc'): any {
    switch (sortBy) {
      case 'date':
        return { publishedAt: sortOrder };
      case 'quality':
        return { qualityScore: sortOrder };
      case 'popularity':
        // For now, use publishedAt as proxy (newer = more popular)
        // TODO: Add view count/save count sorting in future
        return { publishedAt: 'desc' };
      case 'relevance':
      default:
        // For text search, relevance is best
        // We'll calculate relevance scores separately
        return { publishedAt: 'desc' }; // Default to recent
    }
  }

  /**
   * Calculate relevance scores for search results
   * Based on how well the query matches the content
   */
  private calculateRelevance(results: SearchResult[], query: string): SearchResult[] {
    if (!query || !query.trim()) {
      return results;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery.split(/\s+/);

    return results.map(result => {
      let score = 0;

      // Title match (highest weight)
      const titleLower = result.title.toLowerCase();
      if (titleLower === normalizedQuery) {
        score += 100; // Exact match
      } else if (titleLower.includes(normalizedQuery)) {
        score += 50; // Phrase match
      } else {
        // Word matches
        queryTerms.forEach(term => {
          if (titleLower.includes(term)) {
            score += 10;
          }
        });
      }

      // Description match (medium weight)
      if (result.description) {
        const descLower = result.description.toLowerCase();
        if (descLower.includes(normalizedQuery)) {
          score += 20;
        } else {
          queryTerms.forEach(term => {
            if (descLower.includes(term)) {
              score += 3;
            }
          });
        }
      }

      // Author match (low weight)
      if (result.author) {
        const authorLower = result.author.toLowerCase();
        if (authorLower.includes(normalizedQuery)) {
          score += 10;
        }
      }

      // Tag match (medium weight)
      if (result.tags) {
        result.tags.forEach(tag => {
          if (tag.name.toLowerCase().includes(normalizedQuery)) {
            score += 15;
          }
        });
      }

      // Boost by quality score
      score += Number(result.qualityScore) * 5;

      // Boost by recency
      if (result.publishedAt) {
        const ageInDays = (Date.now() - result.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays <= 30) score += 5;
        else if (ageInDays <= 90) score += 3;
        else if (ageInDays <= 365) score += 1;
      }

      return {
        ...result,
        relevanceScore: score,
      };
    }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }

  /**
   * Check if filters match cached data (simple cache key matching)
   */
  private filtersMatchCache(filters: AdvancedSearchFilters): boolean {
    // Only use cache if no advanced filters are applied
    return (
      !filters.categoryId &&
      !filters.contentType &&
      !filters.source &&
      !filters.tags &&
      !filters.dateFrom &&
      !filters.dateTo &&
      !filters.minQualityScore &&
      !filters.author
    );
  }

  /**
   * Get search facets (aggregated filter options)
   * Useful for showing available filters in UI
   */
  async getSearchFacets(query: string): Promise<{
    contentTypes: Array<{ type: string; count: number }>;
    sources: Array<{ source: string; count: number }>;
    categories: Array<{ id: string; name: string; count: number }>;
    topTags: Array<{ name: string; count: number }>;
  }> {
    try {
      // Build base where clause
      const where: any = {};
      if (query && query.trim()) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }

      // TODO: Uncomment when Prisma is generated
      /*
      // Get all matching content
      const content = await prisma.content.findMany({
        where,
        select: {
          contentType: true,
          source: true,
          categoryId: true,
          category: {
            select: { id: true, name: true },
          },
          tags: {
            include: {
              tag: { select: { name: true } },
            },
          },
        },
      });

      // Aggregate content types
      const contentTypeMap = new Map<string, number>();
      const sourceMap = new Map<string, number>();
      const categoryMap = new Map<string, { name: string; count: number }>();
      const tagMap = new Map<string, number>();

      content.forEach(c => {
        // Content types
        contentTypeMap.set(c.contentType, (contentTypeMap.get(c.contentType) || 0) + 1);

        // Sources
        sourceMap.set(c.source, (sourceMap.get(c.source) || 0) + 1);

        // Categories
        const existingCat = categoryMap.get(c.categoryId);
        categoryMap.set(c.categoryId, {
          name: c.category.name,
          count: (existingCat?.count || 0) + 1,
        });

        // Tags
        c.tags.forEach(ct => {
          tagMap.set(ct.tag.name, (tagMap.get(ct.tag.name) || 0) + 1);
        });
      });

      return {
        contentTypes: Array.from(contentTypeMap.entries())
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count),
        sources: Array.from(sourceMap.entries())
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count),
        categories: Array.from(categoryMap.entries())
          .map(([id, { name, count }]) => ({ id, name, count }))
          .sort((a, b) => b.count - a.count),
        topTags: Array.from(tagMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20), // Top 20 tags
      };
      */

      return {
        contentTypes: [],
        sources: [],
        categories: [],
        topTags: [],
      };
    } catch (error) {
      console.error('Error fetching search facets:', error);
      return {
        contentTypes: [],
        sources: [],
        categories: [],
        topTags: [],
      };
    }
  }
}

export const enhancedSearchService = new EnhancedSearchService();
