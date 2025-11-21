/**
 * Feed Generation Background Job
 * Generates personalized content recommendations for users
 */

import { prisma } from '../utils/prisma';
import logger from '../utils/logger';
import { recommendationService } from '../services/recommendation/recommendation.service';

/**
 * Generate daily feed for a specific user
 */
export async function generateUserFeed(userId: string): Promise<void> {
  try {
    logger.info(`🎯 Generating personalized feed for user ${userId}`);

    // Get user with categories
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        categories: {
          where: { isActive: true },
          include: { category: true },
        },
        preferences: true,
      },
    });

    if (!user) {
      logger.warn(`User ${userId} not found`);
      return;
    }

    if (user.categories.length === 0) {
      logger.warn(`User ${userId} has no active categories`);
      return;
    }

    // Generate recommendations for the user
    // Note: The recommendation service will automatically create daily feed entries
    await recommendationService.generateRecommendations({
      userId,
      limit: 10,
      excludeRead: false, // Include all content for feed generation
      diversityBoost: true,
    });

    logger.info(`✅ Feed generated successfully for user ${userId}`);
  } catch (error) {
    logger.error(`❌ Failed to generate feed for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Generate feeds for all active users
 */
export async function generateAllUserFeeds(): Promise<void> {
  try {
    logger.info('🎯 Starting feed generation for all active users...');

    // Get all active users with at least one category
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        emailVerified: true,
        categories: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    logger.info(`Found ${users.length} users for feed generation`);

    let successCount = 0;
    let errorCount = 0;

    // Generate feeds in batches to avoid overwhelming the system
    const BATCH_SIZE = 10;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            await generateUserFeed(user.id);
            successCount++;
          } catch (error) {
            errorCount++;
            logger.error(`Failed to generate feed for ${user.email}:`, error);
          }
        })
      );

      // Small delay between batches
      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    logger.info(
      `🎯 Feed generation completed: ${successCount} successful, ${errorCount} failed`
    );
  } catch (error) {
    logger.error('❌ Feed generation job failed:', error);
    throw error;
  }
}

/**
 * Queue a user for feed generation (async, non-blocking)
 */
export function queueUserFeedGeneration(userId: string): void {
  // Run feed generation asynchronously without blocking the response
  setImmediate(() => {
    generateUserFeed(userId).catch((error) => {
      logger.error(`Background feed generation failed for user ${userId}:`, error);
    });
  });

  logger.info(`📋 Queued feed generation for user ${userId}`);
}

/**
 * Queue multiple users for feed generation
 */
export function queueMultipleUserFeeds(userIds: string[]): void {
  setImmediate(() => {
    Promise.all(userIds.map((userId) => generateUserFeed(userId))).catch((error) => {
      logger.error('Background feed generation failed for multiple users:', error);
    });
  });

  logger.info(`📋 Queued feed generation for ${userIds.length} users`);
}
