import { prisma } from '../../utils/prisma';

export interface ReadingStats {
  totalReadingTimeMinutes: number;
  averageReadingTimeMinutes: number;
  totalContentRead: number;
  contentReadThisWeek: number;
  contentReadThisMonth: number;
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: Date | null;
  streakActive: boolean;
}

export interface TopicBreakdown {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  contentRead: number;
  timeSpentMinutes: number;
  percentage: number;
}

export interface ActivityPoint {
  date: string; // YYYY-MM-DD
  contentRead: number;
  timeSpentMinutes: number;
  saves: number;
  searches: number;
}

export interface DailyActivity {
  timeline: ActivityPoint[];
  totalDays: number;
  activeDays: number;
}

/**
 * Analytics Service
 * Provides comprehensive user analytics including:
 * - Reading time tracking
 * - Reading streaks
 * - Topic breakdown
 * - Activity timelines
 */
export class AnalyticsService {
  /**
   * Get user's reading statistics
   */
  async getReadingStats(userId: string): Promise<ReadingStats> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get all read interactions
      const allRead = await prisma.userContentInteraction.findMany({
        where: {
          userId,
          status: 'read',
        },
        select: {
          timeSpent: true,
          readAt: true,
        },
      });

      // Calculate totals
      const totalReadingTimeMinutes = allRead.reduce(
        (sum, interaction) => sum + (interaction.timeSpent || 0),
        0
      );

      const totalContentRead = allRead.length;

      const averageReadingTimeMinutes =
        totalContentRead > 0 ? totalReadingTimeMinutes / totalContentRead : 0;

      // Count this week
      const contentReadThisWeek = allRead.filter(
        (i) => i.readAt && i.readAt >= oneWeekAgo
      ).length;

      // Count this month
      const contentReadThisMonth = allRead.filter(
        (i) => i.readAt && i.readAt >= oneMonthAgo
      ).length;

      return {
        totalReadingTimeMinutes: Math.round(totalReadingTimeMinutes / 60), // Convert seconds to minutes
        averageReadingTimeMinutes: Math.round(averageReadingTimeMinutes / 60),
        totalContentRead,
        contentReadThisWeek,
        contentReadThisMonth,
      };
      */

      return {
        totalReadingTimeMinutes: 0,
        averageReadingTimeMinutes: 0,
        totalContentRead: 0,
        contentReadThisWeek: 0,
        contentReadThisMonth: 0,
      };
    } catch (error) {
      console.error('Error fetching reading stats:', error);
      throw error;
    }
  }

  /**
   * Calculate user's reading streak
   * Streak = consecutive days with at least one read
   */
  async getReadingStreak(userId: string): Promise<ReadingStreak> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      // Get all read dates
      const interactions = await prisma.userContentInteraction.findMany({
        where: {
          userId,
          status: 'read',
          readAt: { not: null },
        },
        select: { readAt: true },
        orderBy: { readAt: 'desc' },
      });

      if (interactions.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastReadDate: null,
          streakActive: false,
        };
      }

      // Extract unique dates (YYYY-MM-DD)
      const readDates = new Set(
        interactions
          .map((i) => i.readAt!)
          .map((date) => date.toISOString().split('T')[0])
      );

      const sortedDates = Array.from(readDates).sort().reverse();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Check if streak is active (read today or yesterday)
      const streakActive =
        sortedDates[0] === today || sortedDates[0] === yesterday;

      // Calculate current streak
      let currentStreak = 0;
      if (streakActive) {
        let expectedDate = sortedDates[0] === today ? today : yesterday;

        for (const date of sortedDates) {
          if (date === expectedDate) {
            currentStreak++;
            // Move to previous day
            const prevDate = new Date(expectedDate);
            prevDate.setDate(prevDate.getDate() - 1);
            expectedDate = prevDate.toISOString().split('T')[0];
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);

        const dayDiff = Math.round(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
      longestStreak = Math.max(longestStreak, currentStreak);

      return {
        currentStreak,
        longestStreak,
        lastReadDate: interactions[0].readAt,
        streakActive,
      };
      */

      return {
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: null,
        streakActive: false,
      };
    } catch (error) {
      console.error('Error calculating reading streak:', error);
      throw error;
    }
  }

  /**
   * Get topic breakdown (time spent per category)
   */
  async getTopicBreakdown(userId: string): Promise<TopicBreakdown[]> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      const interactions = await prisma.userContentInteraction.findMany({
        where: {
          userId,
          status: 'read',
        },
        include: {
          content: {
            include: {
              category: true,
            },
          },
        },
      });

      // Group by category
      const categoryMap = new Map<
        string,
        { name: string; slug: string; contentRead: number; timeSpent: number }
      >();

      interactions.forEach((interaction) => {
        const categoryId = interaction.content.categoryId;
        const category = interaction.content.category;

        const existing = categoryMap.get(categoryId) || {
          name: category.name,
          slug: category.slug,
          contentRead: 0,
          timeSpent: 0,
        };

        existing.contentRead++;
        existing.timeSpent += interaction.timeSpent || 0;

        categoryMap.set(categoryId, existing);
      });

      // Calculate total time for percentages
      const totalTime = Array.from(categoryMap.values()).reduce(
        (sum, cat) => sum + cat.timeSpent,
        0
      );

      // Convert to array and calculate percentages
      const breakdown: TopicBreakdown[] = Array.from(categoryMap.entries())
        .map(([categoryId, data]) => ({
          categoryId,
          categoryName: data.name,
          categorySlug: data.slug,
          contentRead: data.contentRead,
          timeSpentMinutes: Math.round(data.timeSpent / 60),
          percentage: totalTime > 0 ? (data.timeSpent / totalTime) * 100 : 0,
        }))
        .sort((a, b) => b.timeSpentMinutes - a.timeSpentMinutes);

      return breakdown;
      */

      return [];
    } catch (error) {
      console.error('Error fetching topic breakdown:', error);
      throw error;
    }
  }

  /**
   * Get daily activity timeline (last N days)
   */
  async getActivityTimeline(
    userId: string,
    days: number = 30
  ): Promise<DailyActivity> {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      // Get content interactions
      const interactions = await prisma.userContentInteraction.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        select: {
          status: true,
          isSaved: true,
          timeSpent: true,
          readAt: true,
          createdAt: true,
        },
      });

      // Get search history
      const searches = await prisma.searchHistory.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
      });

      // Build timeline
      const timeline: ActivityPoint[] = [];
      const activityByDate = new Map<
        string,
        { contentRead: number; timeSpent: number; saves: number; searches: number }
      >();

      // Process interactions
      interactions.forEach((interaction) => {
        const date =
          interaction.readAt?.toISOString().split('T')[0] ||
          interaction.createdAt.toISOString().split('T')[0];

        const existing = activityByDate.get(date) || {
          contentRead: 0,
          timeSpent: 0,
          saves: 0,
          searches: 0,
        };

        if (interaction.status === 'read') {
          existing.contentRead++;
          existing.timeSpent += interaction.timeSpent || 0;
        }

        if (interaction.isSaved) {
          existing.saves++;
        }

        activityByDate.set(date, existing);
      });

      // Process searches
      searches.forEach((search) => {
        const date = search.createdAt.toISOString().split('T')[0];
        const existing = activityByDate.get(date) || {
          contentRead: 0,
          timeSpent: 0,
          saves: 0,
          searches: 0,
        };
        existing.searches++;
        activityByDate.set(date, existing);
      });

      // Generate timeline for all days
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];

        const activity = activityByDate.get(dateStr) || {
          contentRead: 0,
          timeSpent: 0,
          saves: 0,
          searches: 0,
        };

        timeline.push({
          date: dateStr,
          contentRead: activity.contentRead,
          timeSpentMinutes: Math.round(activity.timeSpent / 60),
          saves: activity.saves,
          searches: activity.searches,
        });
      }

      const activeDays = timeline.filter(
        (day) =>
          day.contentRead > 0 || day.saves > 0 || day.searches > 0
      ).length;

      return {
        timeline,
        totalDays: days,
        activeDays,
      };
      */

      // Generate empty timeline
      const timeline: ActivityPoint[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        timeline.push({
          date: date.toISOString().split('T')[0],
          contentRead: 0,
          timeSpentMinutes: 0,
          saves: 0,
          searches: 0,
        });
      }

      return {
        timeline,
        totalDays: days,
        activeDays: 0,
      };
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardAnalytics(userId: string) {
    try {
      const [readingStats, streak, topicBreakdown, activity] = await Promise.all([
        this.getReadingStats(userId),
        this.getReadingStreak(userId),
        this.getTopicBreakdown(userId),
        this.getActivityTimeline(userId, 30),
      ]);

      return {
        readingStats,
        streak,
        topicBreakdown: topicBreakdown.slice(0, 10), // Top 10 categories
        activity,
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  /**
   * Get recommendation performance metrics
   * Measures how well recommendations are working
   */
  async getRecommendationMetrics(userId: string) {
    try {
      // TODO: Uncomment when Prisma is generated
      /*
      // Get daily feed recommendations
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recommendations = await prisma.dailyFeed.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          content: {
            include: {
              interactions: {
                where: { userId },
                select: {
                  status: true,
                  isSaved: true,
                  rating: true,
                },
              },
            },
          },
        },
      });

      const totalRecommendations = recommendations.length;
      let clicked = 0;
      let saved = 0;
      let rated = 0;
      let totalRating = 0;

      recommendations.forEach((rec) => {
        const interaction = rec.content.interactions[0];
        if (interaction) {
          if (interaction.status === 'read') clicked++;
          if (interaction.isSaved) saved++;
          if (interaction.rating) {
            rated++;
            totalRating += interaction.rating;
          }
        }
      });

      const clickThroughRate =
        totalRecommendations > 0 ? (clicked / totalRecommendations) * 100 : 0;
      const saveRate =
        totalRecommendations > 0 ? (saved / totalRecommendations) * 100 : 0;
      const averageRating = rated > 0 ? totalRating / rated : 0;

      return {
        totalRecommendations,
        clicked,
        saved,
        rated,
        clickThroughRate: Math.round(clickThroughRate * 100) / 100,
        saveRate: Math.round(saveRate * 100) / 100,
        averageRating: Math.round(averageRating * 10) / 10,
      };
      */

      return {
        totalRecommendations: 0,
        clicked: 0,
        saved: 0,
        rated: 0,
        clickThroughRate: 0,
        saveRate: 0,
        averageRating: 0,
      };
    } catch (error) {
      console.error('Error fetching recommendation metrics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
