/**
 * Content Freshness Monitoring Job
 * Checks content staleness and triggers aggregation when needed
 */

import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import logger from '../utils/logger';
import { ContentService } from '../services/content.service';
import { aggregatorService } from '../services/aggregation/aggregator.service';
import { generateAllUserFeeds } from './feed-generation.job';

const contentService = new ContentService();

/**
 * Check content freshness and trigger aggregation if stale
 */
async function checkContentFreshness(): Promise<void> {
  try {
    logger.info('🔍 Checking content freshness across all categories...');

    // Get all categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const staleCategories: string[] = [];
    const freshCategories: string[] = [];

    // Check each category for staleness
    for (const category of categories) {
      try {
        const freshnessStatus = await contentService.checkContentFreshness(category.id);

        if (freshnessStatus.isStale) {
          staleCategories.push(category.name);
          logger.warn(
            `⚠️  Category "${category.name}" is stale (last updated: ${freshnessStatus.ageInHours}h ago)`
          );
        } else {
          freshCategories.push(category.name);
        }
      } catch (error) {
        logger.error(`Error checking freshness for category ${category.name}:`, error);
      }
    }

    logger.info(
      `Freshness check: ${freshCategories.length} fresh, ${staleCategories.length} stale`
    );

    // If any categories are stale, trigger aggregation
    if (staleCategories.length > 0) {
      logger.info(`🚀 Triggering content aggregation for ${staleCategories.length} stale categories`);

      // Aggregate content for all categories
      await aggregatorService.aggregateAll();

      logger.info('✅ Content aggregation completed');

      // After aggregation, regenerate feeds for all users
      logger.info('🎯 Regenerating user feeds with fresh content...');
      await generateAllUserFeeds();

      logger.info('✅ User feeds regenerated');
    } else {
      logger.info('✅ All content is fresh, no aggregation needed');
    }
  } catch (error) {
    logger.error('❌ Content freshness check failed:', error);
  }
}

/**
 * Check for categories that need urgent updates
 * Categories with no content in last 12 hours
 */
async function checkUrgentUpdates(): Promise<void> {
  try {
    const TWELVE_HOURS_AGO = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // Find categories with no recent content
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            contents: {
              where: {
                createdAt: {
                  gte: TWELVE_HOURS_AGO,
                },
              },
            },
          },
        },
      },
    });

    const urgentCategories = categories.filter((cat: any) => cat._count.contents === 0);

    if (urgentCategories.length > 0) {
      logger.warn(
        `⚠️  ${urgentCategories.length} categories have no content in last 12 hours:`,
        urgentCategories.map((c: any) => c.name)
      );

      // Trigger aggregation for these categories
      for (const category of urgentCategories) {
        try {
          await aggregatorService.aggregateForCategory(category.id, category.name);
          logger.info(`✅ Aggregated content for urgent category: ${category.name}`);
        } catch (error) {
          logger.error(`Failed to aggregate ${category.name}:`, error);
        }
      }
    }
  } catch (error) {
    logger.error('Error checking urgent updates:', error);
  }
}

/**
 * Initialize content freshness monitoring jobs
 */
export function initializeContentFreshnessJobs(): void {
  // Check content freshness every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('⏰ Hourly content freshness check triggered');
    await checkContentFreshness();
  });

  // Check for urgent updates every 3 hours
  cron.schedule('0 */3 * * *', async () => {
    logger.info('⏰ Urgent content update check triggered');
    await checkUrgentUpdates();
  });

  logger.info('✅ Content freshness monitoring jobs scheduled:');
  logger.info('   • Freshness check: Every hour');
  logger.info('   • Urgent updates: Every 3 hours');
}

// Export functions for manual triggering
export { checkContentFreshness, checkUrgentUpdates };
