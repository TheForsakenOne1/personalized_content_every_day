import logger from '../utils/logger';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';
import { feedCache } from './cache/feed.cache';

export class UserService {
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        preferences: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateUserProfile(
    userId: string,
    data: {
      fullName?: string;
      avatarUrl?: string;
      email?: string;
      username?: string;
    }
  ) {
    // Check if email or username is already taken
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
    }

    if (data.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new AppError('Username already in use', 400);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return user;
  }

  async getUserPreferences(userId: string) {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      return await prisma.userPreferences.create({
        data: {
          userId,
          contentFrequency: 'daily',
          preferredContentTypes: ['video', 'article', 'paper', 'blog'] as any,
          notificationEnabled: true,
          emailDigest: true,
          theme: 'light',
        },
      });
    }

    return preferences;
  }

  async updateUserPreferences(
    userId: string,
    data: {
      contentFrequency?: string;
      preferredContentTypes?: string[];
      notificationEnabled?: boolean;
      emailDigest?: boolean;
      theme?: string;
    }
  ) {
    // Convert preferredContentTypes to match Prisma Json type
    const updateData: any = { ...data };
    const createData: any = { userId, ...data };

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: createData,
    });

    return preferences;
  }

  async getUserCategories(userId: string) {
    const categories = await prisma.userCategory.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { priority: 'desc' },
    });

    return categories;
  }

  async updateUserCategories(
    userId: string,
    categoryIds: string[],
    priorities?: number[]
  ) {
    // Remove all existing categories
    await prisma.userCategory.deleteMany({
      where: { userId },
    });

    // Add new categories
    const userCategories = await Promise.all(
      categoryIds.map((categoryId, index) =>
        prisma.userCategory.create({
          data: {
            userId,
            categoryId,
            priority: priorities?.[index] || 5,
            isActive: true,
          },
          include: {
            category: true,
          },
        })
      )
    );

    return userCategories;
  }

  async saveContent(userId: string, contentId: string) {
    const interaction = await prisma.userContentInteraction.upsert({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
      update: {
        isSaved: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        contentId,
        isSaved: true,
        status: 'unread',
      },
      include: {
        content: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    return interaction;
  }

  async unsaveContent(userId: string, contentId: string) {
    const interaction = await prisma.userContentInteraction.upsert({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
      update: {
        isSaved: false,
        updatedAt: new Date(),
      },
      create: {
        userId,
        contentId,
        isSaved: false,
        status: 'unread',
      },
    });

    return interaction;
  }

  async markAsRead(userId: string, contentId: string) {
    const interaction = await prisma.userContentInteraction.upsert({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
      update: {
        status: 'read',
        readAt: new Date(),
        readProgress: 1.0,
        updatedAt: new Date(),
      },
      create: {
        userId,
        contentId,
        status: 'read',
        readAt: new Date(),
        readProgress: 1.0,
      },
    });

    return interaction;
  }

  async getUserFeed(userId: string, filter?: 'all' | 'unread' | 'saved') {
    // Try to get from cache first
    const cached = await feedCache.get(userId, filter);
    if (cached) {
      logger.info(`📦 Feed cache HIT (user=${userId}, filter=${filter || 'all'})`);
      return cached;
    }

    logger.info(`🔍 Feed cache MISS (user=${userId}, filter=${filter || 'all'}) - fetching from DB`);

    const userCategories = await prisma.userCategory.findMany({
      where: { userId, isActive: true },
      select: { categoryId: true },
    });

    const categoryIds = userCategories.map((uc) => uc.categoryId);

    const whereClause: any = {
      categoryId: { in: categoryIds },
    };

    // Get user interactions
    let interactionWhere: any = { userId };

    if (filter === 'saved') {
      interactionWhere.isSaved = true;
    } else if (filter === 'unread') {
      interactionWhere.status = 'unread';
    }

    // If filtering by saved or unread, we need to join with interactions
    if (filter === 'saved' || filter === 'unread') {
      const interactions = await prisma.userContentInteraction.findMany({
        where: interactionWhere,
        select: { contentId: true, isSaved: true, status: true, readAt: true },
      });

      const contentIds = interactions.map((i) => i.contentId);
      whereClause.id = { in: contentIds };

      const content = await prisma.content.findMany({
        where: whereClause,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 50,
      });

      // Add interaction data to content
      const result = content.map((item) => {
        const interaction = interactions.find((i) => i.contentId === item.id);
        return {
          ...item,
          isRead: interaction?.status === 'read',
          isSaved: interaction?.isSaved || false,
          readAt: interaction?.readAt,
        };
      });

      // Store in cache for 5 minutes
      await feedCache.set(userId, result, filter);

      return result;
    } else {
      // Get all content for user's categories
      const content = await prisma.content.findMany({
        where: whereClause,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 50,
      });

      // Get all interactions for these content items
      const contentIds = content.map((c) => c.id);
      const interactions = await prisma.userContentInteraction.findMany({
        where: {
          userId,
          contentId: { in: contentIds },
        },
      });

      const interactionMap = new Map(
        interactions.map((i) => [i.contentId, i])
      );

      const result = content.map((item) => {
        const interaction = interactionMap.get(item.id) as any;
        return {
          ...item,
          isRead: interaction?.status === 'read',
          isSaved: interaction?.isSaved || false,
          readAt: interaction?.readAt,
        };
      });

      // Store in cache for 5 minutes
      await feedCache.set(userId, result, filter);

      return result;
    }
  }

  async getSavedContent(userId: string) {
    const interactions = await prisma.userContentInteraction.findMany({
      where: {
        userId,
        isSaved: true,
      },
      include: {
        content: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return interactions.map((interaction) => ({
      ...interaction.content,
      isRead: interaction.status === 'read',
      isSaved: true,
      readAt: interaction.readAt,
    }));
  }

  async getUserStats(userId: string) {
    const [totalRead, totalSaved, readToday, readContent, userCategories] = await Promise.all([
      prisma.userContentInteraction.count({
        where: {
          userId,
          status: 'read',
        },
      }),
      prisma.userContentInteraction.count({
        where: {
          userId,
          isSaved: true,
        },
      }),
      prisma.userContentInteraction.count({
        where: {
          userId,
          status: 'read',
          readAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      // Get all read content with details
      prisma.userContentInteraction.findMany({
        where: {
          userId,
          status: 'read',
        },
        include: {
          content: {
            select: {
              contentType: true,
              duration: true,
              wordCount: true,
              categoryId: true,
            },
          },
        },
      }),
      // Get user's selected categories
      prisma.userCategory.findMany({
        where: {
          userId,
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          priority: 'desc',
        },
        take: 5,
      }),
    ]);

    // Calculate content type breakdown
    const contentTypeBreakdown: Record<string, number> = {};
    let totalReadingTimeMinutes = 0;

    readContent.forEach((interaction) => {
      const contentType = interaction.content.contentType;
      contentTypeBreakdown[contentType] = (contentTypeBreakdown[contentType] || 0) + 1;

      // Calculate reading time
      if (interaction.content.duration) {
        // Duration is in seconds for videos
        totalReadingTimeMinutes += Math.ceil(interaction.content.duration / 60);
      } else if (interaction.content.wordCount) {
        // Average reading speed: 200-250 words per minute
        totalReadingTimeMinutes += Math.ceil(interaction.content.wordCount / 225);
      }
    });

    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {};
    readContent.forEach((interaction) => {
      const categoryId = interaction.content.categoryId;
      categoryBreakdown[categoryId] = (categoryBreakdown[categoryId] || 0) + 1;
    });

    // Get top categories with names
    const topCategories = await Promise.all(
      Object.entries(categoryBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(async ([categoryId, count]) => {
          const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { name: true },
          });
          return {
            name: category?.name || 'Unknown',
            count,
          };
        })
    );

    return {
      totalRead,
      totalSaved,
      readToday,
      contentTypeBreakdown: {
        article: contentTypeBreakdown.article || 0,
        video: contentTypeBreakdown.video || 0,
        paper: contentTypeBreakdown.paper || 0,
        blog: contentTypeBreakdown.blog || 0,
      },
      totalReadingTimeMinutes,
      topCategories: topCategories.length > 0 ? topCategories : userCategories.map(uc => ({
        name: uc.category.name,
        count: 0,
      })),
    };
  }
}
