import logger from '../utils/logger';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { trendingCache } from './cache/trending.cache';
import { searchCache } from './cache/search.cache';

interface ContentFilters {
  categoryId?: string;
  contentType?: string;
  source?: string;
  search?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ContentService {
  async getContent(filters: ContentFilters, options: PaginationOptions) {
    const { page = 1, limit = 20, sortBy = 'publishedAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.contentType) {
      where.contentType = filters.contentType;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { author: { contains: filters.search } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.publishedAt = {};
      if (filters.dateFrom) {
        where.publishedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.publishedAt.lte = filters.dateTo;
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: { in: filters.tags },
          },
        },
      };
    }

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.content.count({ where }),
    ]);

    return {
      content: content.map((item) => ({
        ...item,
        tags: item.tags.map((ct) => ct.tag),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async getContentById(id: string, userId?: string) {
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    let userInteraction: any = null;
    if (userId) {
      userInteraction = await prisma.userContentInteraction.findUnique({
        where: {
          userId_contentId: {
            userId,
            contentId: id,
          },
        },
      });
    }

    return {
      ...content,
      tags: content.tags.map((ct) => ct.tag),
      userInteraction,
    };
  }

  async createContent(data: {
    externalId?: string;
    contentType: string;
    source: string;
    categoryId: string;
    title: string;
    description?: string;
    url: string;
    thumbnailUrl?: string;
    author?: string;
    publishedAt?: Date;
    duration?: number;
    wordCount?: number;
    language?: string;
    metadata?: any;
    qualityScore?: number;
    popularityScore?: number;
    tags?: string[];
  }) {
    const { tags, ...contentData } = data;

    // Check for duplicate content
    if (data.externalId && data.source) {
      const existing = await prisma.content.findUnique({
        where: {
          externalId_source: {
            externalId: data.externalId,
            source: data.source,
          },
        },
      });

      if (existing) {
        throw new AppError('Content already exists', 409);
      }
    }

    const content = await prisma.content.create({
      data: contentData,
      include: {
        category: true,
      },
    });

    // Add tags if provided
    if (tags && tags.length > 0) {
      await this.addTagsToContent(content.id, tags);
    }

    return content;
  }

  async updateContent(id: string, data: Partial<{
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    author: string;
    publishedAt: Date;
    duration: number;
    wordCount: number;
    qualityScore: number;
    popularityScore: number;
    metadata: any;
  }>) {
    const content = await prisma.content.update({
      where: { id },
      data,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return {
      ...content,
      tags: content.tags.map((ct) => ct.tag),
    };
  }

  async deleteContent(id: string) {
    await prisma.content.delete({
      where: { id },
    });
  }

  async addTagsToContent(contentId: string, tagSlugs: string[]) {
    // Get or create tags
    const tags = await Promise.all(
      tagSlugs.map(async (slug) => {
        const tag = await prisma.tag.upsert({
          where: { slug },
          create: {
            name: slug.replace(/-/g, ' '),
            slug,
          },
          update: {},
        });
        return tag;
      })
    );

    // Create content-tag relationships
    for (const tag of tags) {
      await prisma.contentTag.upsert({
        where: {
          contentId_tagId: {
            contentId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          contentId,
          tagId: tag.id,
        },
      });
    }

    return tags;
  }

  async removeTagsFromContent(contentId: string, tagSlugs: string[]) {
    const tags = await prisma.tag.findMany({
      where: { slug: { in: tagSlugs } },
    });

    await prisma.contentTag.deleteMany({
      where: {
        contentId,
        tagId: { in: tags.map((t) => t.id) },
      },
    });
  }

  async getTrendingContent(days: number = 7, limit: number = 10) {
    // Try to get from cache first
    const cached = await trendingCache.get(days, limit);
    if (cached) {
      logger.info(`📦 Trending cache HIT (${days}d, limit=${limit})`);
      return cached;
    }

    logger.info(`🔍 Trending cache MISS (${days}d, limit=${limit}) - fetching from DB`);

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const content = await prisma.$queryRaw`
      SELECT
        c.id,
        c.title,
        c.content_type as "contentType",
        c.source,
        c.url,
        c.thumbnail_url as "thumbnailUrl",
        c.author,
        c.published_at as "publishedAt",
        cat.name as "categoryName",
        COUNT(DISTINCT uci.user_id) as "uniqueViews",
        COUNT(*) FILTER (WHERE uci.status = 'read') as "readCount",
        COUNT(*) FILTER (WHERE uci.is_saved = true) as "saveCount",
        AVG(uci.rating) as "avgRating",
        (COUNT(DISTINCT uci.user_id) * 2 +
         COUNT(*) FILTER (WHERE uci.status = 'read') * 3 +
         COUNT(*) FILTER (WHERE uci.is_saved = true) * 5) as "trendingScore"
      FROM content c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN user_content_interaction uci ON c.id = uci.content_id
      WHERE uci.created_at >= ${dateFrom}
      GROUP BY c.id, c.title, c.content_type, c.source, c.url,
               c.thumbnail_url, c.author, c.published_at, cat.name
      ORDER BY "trendingScore" DESC
      LIMIT ${limit}
    `;

    // Store in cache for 15 minutes
    await trendingCache.set(days, limit, content);

    return content;
  }

  async searchContent(query: string, limit: number = 20) {
    // Try to get from cache first
    const cached = await searchCache.get(query, limit);
    if (cached) {
      logger.info(`📦 Search cache HIT (q="${query}", limit=${limit})`);
      return cached;
    }

    logger.info(`🔍 Search cache MISS (q="${query}", limit=${limit}) - fetching from DB`);

    const content = await prisma.content.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { author: { contains: query } },
        ],
      },
      take: limit,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        qualityScore: 'desc',
      },
    });

    const result = content.map((item) => ({
      ...item,
      tags: item.tags.map((ct) => ct.tag),
    }));

    // Store in cache for 1 hour
    await searchCache.set(query, limit, result);

    return result;
  }

  /**
   * Check if content is stale (older than 6 hours)
   * Returns freshness information for content
   */
  async checkContentFreshness(categoryId?: string) {
    const SIX_HOURS_AGO = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Get the most recent content
    const mostRecentContent = await prisma.content.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, categoryId: true, category: true },
    });

    // Count total content
    const totalContent = await prisma.content.count({ where });

    // Count stale content (older than 6 hours)
    const staleContent = await prisma.content.count({
      where: {
        ...where,
        createdAt: { lt: SIX_HOURS_AGO },
      },
    });

    // Count fresh content (less than 6 hours old)
    const freshContent = await prisma.content.count({
      where: {
        ...where,
        createdAt: { gte: SIX_HOURS_AGO },
      },
    });

    const isStale = !mostRecentContent || mostRecentContent.createdAt < SIX_HOURS_AGO;
    const lastUpdated = mostRecentContent?.createdAt || null;
    const ageInHours = lastUpdated
      ? (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60)
      : null;

    return {
      isStale,
      lastUpdated,
      ageInHours: ageInHours ? Math.round(ageInHours * 10) / 10 : null,
      totalContent,
      freshContent,
      staleContent,
      freshnessPercentage: totalContent > 0 ? Math.round((freshContent / totalContent) * 100) : 0,
      shouldRefresh: isStale || freshnessPercentage < 50,
      category: mostRecentContent?.category || null,
    };
  }
}
