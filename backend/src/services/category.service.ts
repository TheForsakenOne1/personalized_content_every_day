import logger from '../utils/logger';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export class CategoryService {
  async getAllCategories(includeStats: boolean = false) {
    const categories = await prisma.category.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    if (!includeStats) {
      return categories;
    }

    // Get content count and subscriber count for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const [contentCount, subscriberCount] = await Promise.all([
          prisma.content.count({
            where: { categoryId: category.id },
          }),
          prisma.userCategory.count({
            where: {
              categoryId: category.id,
              isActive: true,
            },
          }),
        ]);

        return {
          ...category,
          contentCount,
          subscriberCount,
        };
      })
    );

    return categoriesWithStats;
  }

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const [contentCount, subscriberCount] = await Promise.all([
      prisma.content.count({
        where: { categoryId: id },
      }),
      prisma.userCategory.count({
        where: {
          categoryId: id,
          isActive: true,
        },
      }),
    ]);

    return {
      ...category,
      contentCount,
      subscriberCount,
    };
  }

  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  async getUserCategories(userId: string) {
    const userCategories = await prisma.userCategory.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: [
        { priority: 'desc' },
        { category: { name: 'asc' } },
      ],
    });

    return userCategories.map((uc) => ({
      id: uc.id,
      priority: uc.priority,
      isActive: uc.isActive,
      createdAt: uc.createdAt,
      category: uc.category,
    }));
  }

  async subscribeToCategory(
    userId: string,
    categoryId: string,
    priority: number = 5
  ) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Create or update subscription
    const userCategory = await prisma.userCategory.upsert({
      where: {
        userId_categoryId: {
          userId,
          categoryId,
        },
      },
      create: {
        userId,
        categoryId,
        priority,
        isActive: true,
      },
      update: {
        isActive: true,
        priority,
      },
      include: {
        category: true,
      },
    });

    return userCategory;
  }

  async updateCategoryPriority(
    userId: string,
    userCategoryId: string,
    priority: number
  ) {
    // Verify ownership
    const userCategory = await prisma.userCategory.findFirst({
      where: {
        id: userCategoryId,
        userId,
      },
    });

    if (!userCategory) {
      throw new AppError('User category not found', 404);
    }

    const updated = await prisma.userCategory.update({
      where: { id: userCategoryId },
      data: { priority },
      include: {
        category: true,
      },
    });

    return updated;
  }

  async toggleCategoryStatus(userId: string, userCategoryId: string) {
    // Verify ownership
    const userCategory = await prisma.userCategory.findFirst({
      where: {
        id: userCategoryId,
        userId,
      },
    });

    if (!userCategory) {
      throw new AppError('User category not found', 404);
    }

    const updated = await prisma.userCategory.update({
      where: { id: userCategoryId },
      data: { isActive: !userCategory.isActive },
      include: {
        category: true,
      },
    });

    return updated;
  }

  async unsubscribeFromCategory(userId: string, userCategoryId: string) {
    // Verify ownership
    const userCategory = await prisma.userCategory.findFirst({
      where: {
        id: userCategoryId,
        userId,
      },
    });

    if (!userCategory) {
      throw new AppError('User category not found', 404);
    }

    await prisma.userCategory.delete({
      where: { id: userCategoryId },
    });
  }

  // Admin functions
  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
  }) {
    const category = await prisma.category.create({
      data: {
        ...data,
        isDefault: false,
      },
    });

    return category;
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
    }
  ) {
    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return category;
  }

  async deleteCategory(id: string) {
    // Check if category has content
    const contentCount = await prisma.content.count({
      where: { categoryId: id },
    });

    if (contentCount > 0) {
      throw new AppError(
        'Cannot delete category with existing content',
        400
      );
    }

    await prisma.category.delete({
      where: { id },
    });
  }
}
