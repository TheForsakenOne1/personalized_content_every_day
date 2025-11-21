/**
 * Email Digest Scheduled Job
 * Sends daily/weekly email digests to users based on their preferences
 */

import cron from 'node-cron';
import { prisma } from '../config/database';
import logger from '../utils/logger';
import { emailService } from '../services/email/email.service';

/**
 * Send daily digest to eligible users
 */
async function sendDailyDigests(): Promise<void> {
  try {
    logger.info('📧 Starting daily digest job...');

    // Get users who have email digest enabled with daily frequency
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        emailVerified: true,
        preferences: {
          emailDigest: true,
          contentFrequency: 'daily',
        },
      },
      include: {
        preferences: true,
        categories: {
          where: { isActive: true },
          include: { category: true },
        },
      },
    });

    logger.info(`Found ${users.length} users for daily digest`);

    // Get today's feed for each user
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Get user's daily feed content
        const feedItems = await prisma.dailyFeed.findMany({
          where: {
            userId: user.id,
            feedDate: today,
          },
          include: {
            content: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            recommendationScore: 'desc',
          },
          take: 10, // Top 10 recommendations
        });

        if (feedItems.length === 0) {
          logger.info(`No feed items for user ${user.email}, skipping digest`);
          continue;
        }

        // Format content for digest
        const digestContent = feedItems.map((item) => ({
          title: item.content.title,
          description: item.content.description || '',
          url: item.content.url,
          thumbnailUrl: item.content.thumbnailUrl || undefined,
          contentType: item.content.contentType,
          category: item.content.category.name,
          author: item.content.author || undefined,
          publishedAt: item.content.publishedAt || undefined,
          qualityScore: Number(item.content.qualityScore),
          reason: item.reason || undefined,
        }));

        // Send digest email
        await emailService.sendDailyDigest(user.email, digestContent);
        successCount++;

        logger.info(`✅ Daily digest sent to ${user.email}`);
      } catch (error) {
        errorCount++;
        logger.error(`❌ Failed to send digest to ${user.email}:`, error);
      }
    }

    logger.info(
      `📧 Daily digest job completed: ${successCount} sent, ${errorCount} failed`
    );
  } catch (error) {
    logger.error('❌ Daily digest job failed:', error);
  }
}

/**
 * Send weekly digest to eligible users
 */
async function sendWeeklyDigests(): Promise<void> {
  try {
    logger.info('📧 Starting weekly digest job...');

    // Get users who have email digest enabled with weekly frequency
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        emailVerified: true,
        preferences: {
          emailDigest: true,
          contentFrequency: 'weekly',
        },
      },
      include: {
        preferences: true,
        categories: {
          where: { isActive: true },
          include: { category: true },
        },
      },
    });

    logger.info(`Found ${users.length} users for weekly digest`);

    // Get this week's feed for each user
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Get user's weekly feed content
        const feedItems = await prisma.dailyFeed.findMany({
          where: {
            userId: user.id,
            feedDate: {
              gte: weekStart,
            },
          },
          include: {
            content: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            recommendationScore: 'desc',
          },
          take: 20, // Top 20 recommendations for the week
        });

        if (feedItems.length === 0) {
          logger.info(`No feed items for user ${user.email}, skipping digest`);
          continue;
        }

        // Format content for digest
        const digestContent = feedItems.map((item) => ({
          title: item.content.title,
          description: item.content.description || '',
          url: item.content.url,
          thumbnailUrl: item.content.thumbnailUrl || undefined,
          contentType: item.content.contentType,
          category: item.content.category.name,
          author: item.content.author || undefined,
          publishedAt: item.content.publishedAt || undefined,
          qualityScore: Number(item.content.qualityScore),
          reason: item.reason || undefined,
        }));

        // Calculate user stats for the week
        const weeklyStats = {
          contentRead: await prisma.userContentInteraction.count({
            where: {
              userId: user.id,
              status: 'read',
              readAt: {
                gte: weekStart,
              },
            },
          }),
          timeSpent: await prisma.userContentInteraction.aggregate({
            where: {
              userId: user.id,
              readAt: {
                gte: weekStart,
              },
            },
            _sum: {
              timeSpent: true,
            },
          }),
          categoriesExplored: await prisma.userContentInteraction.groupBy({
            by: ['contentId'],
            where: {
              userId: user.id,
              readAt: {
                gte: weekStart,
              },
            },
          }),
        };

        // Send weekly digest email
        await emailService.sendWeeklyDigest(
          user.email,
          digestContent,
          weeklyStats
        );
        successCount++;

        logger.info(`✅ Weekly digest sent to ${user.email}`);
      } catch (error) {
        errorCount++;
        logger.error(`❌ Failed to send digest to ${user.email}:`, error);
      }
    }

    logger.info(
      `📧 Weekly digest job completed: ${successCount} sent, ${errorCount} failed`
    );
  } catch (error) {
    logger.error('❌ Weekly digest job failed:', error);
  }
}

/**
 * Initialize email digest scheduled jobs
 */
export function initializeEmailDigestJobs(): void {
  // Daily digest - Send at 8 AM every day
  cron.schedule('0 8 * * *', async () => {
    logger.info('⏰ Daily digest cron triggered');
    await sendDailyDigests();
  });

  // Weekly digest - Send at 9 AM every Monday
  cron.schedule('0 9 * * 1', async () => {
    logger.info('⏰ Weekly digest cron triggered');
    await sendWeeklyDigests();
  });

  logger.info('✅ Email digest jobs scheduled:');
  logger.info('   • Daily digest: Every day at 8:00 AM');
  logger.info('   • Weekly digest: Every Monday at 9:00 AM');
}

// Export functions for manual triggering
export { sendDailyDigests, sendWeeklyDigests };
