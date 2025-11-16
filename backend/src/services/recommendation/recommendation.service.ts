import { prisma } from '../../utils/prisma';
import { collaborativeFilter } from './collaborative-filter';
import { contentBasedFilter } from './content-filter';
import { feedGenerator } from './feed-generator';

export interface ScoredContent {
  contentId: string;
  score: number;
  reason?: string;
}

export interface RecommendationOptions {
  userId: string;
  limit?: number;
  excludeRead?: boolean;
  diversityBoost?: boolean;
}

export class RecommendationService {
  /**
   * Generate personalized recommendations for a user
   */
  async generateRecommendations(options: RecommendationOptions): Promise<ScoredContent[]> {
    const { userId, limit = 50, excludeRead = true, diversityBoost = true } = options;

    console.log(`📊 Generating recommendations for user ${userId}`);

    // Get user's categories and preferences
    const userProfile = await this.getUserProfile(userId);

    if (!userProfile) {
      console.warn(`User ${userId} not found`);
      return [];
    }

    // Get candidate content from user's categories
    const candidates = await this.getCandidateContent(userId, userProfile.categoryIds, excludeRead);

    if (candidates.length === 0) {
      console.log('No candidate content found');
      return [];
    }

    console.log(`Found ${candidates.length} candidate items`);

    // Score each candidate using multiple algorithms
    const scored = await this.scoreContent(userId, candidates, userProfile);

    // Sort by score
    let ranked = scored.sort((a, b) => b.score - a.score);

    // Apply diversity boost if enabled
    if (diversityBoost) {
      ranked = feedGenerator.applyDiversityBoost(ranked, candidates);
    }

    // Take top N
    const topRecommendations = ranked.slice(0, limit);

    console.log(`✅ Generated ${topRecommendations.length} recommendations`);

    return topRecommendations;
  }

  /**
   * Generate daily feed for a user
   * This is stored in the DailyFeed table for caching
   */
  async generateDailyFeed(userId: string): Promise<void> {
    console.log(`\n🔄 Generating daily feed for user ${userId}`);

    // Generate recommendations
    const recommendations = await this.generateRecommendations({
      userId,
      limit: 50,
      excludeRead: true,
      diversityBoost: true,
    });

    if (recommendations.length === 0) {
      console.log('No recommendations to save');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Save to DailyFeed table (TODO: Uncomment when Prisma works)
    /*
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];

      await prisma.dailyFeed.upsert({
        where: {
          userId_contentId_feedDate: {
            userId,
            contentId: rec.contentId,
            feedDate: today,
          },
        },
        create: {
          userId,
          contentId: rec.contentId,
          feedDate: today,
          recommendationScore: rec.score,
          position: i + 1,
          reason: rec.reason,
        },
        update: {
          recommendationScore: rec.score,
          position: i + 1,
          reason: rec.reason,
        },
      });
    }
    */

    console.log(`✅ Daily feed generated: ${recommendations.length} items`);
  }

  /**
   * Get user profile with categories and interactions
   */
  private async getUserProfile(userId: string) {
    // TODO: Uncomment when Prisma works
    /*
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        categories: {
          where: { isActive: true },
          include: { category: true },
        },
        preferences: true,
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Recent 100 interactions
        },
      },
    });

    if (!user) return null;

    return {
      categoryIds: user.categories.map(uc => uc.categoryId),
      categoryPriorities: new Map(user.categories.map(uc => [uc.categoryId, uc.priority])),
      preferences: user.preferences,
      recentInteractions: user.interactions,
    };
    */

    // Mock data for now
    return {
      categoryIds: ['cat-1', 'cat-2'],
      categoryPriorities: new Map([['cat-1', 8], ['cat-2', 6]]),
      preferences: {
        preferredContentTypes: ['paper', 'article'],
        contentFrequency: 'daily',
      },
      recentInteractions: [],
    };
  }

  /**
   * Get candidate content from user's categories
   */
  private async getCandidateContent(userId: string, categoryIds: string[], excludeRead: boolean) {
    // TODO: Uncomment when Prisma works
    /*
    const where: any = {
      categoryId: { in: categoryIds },
    };

    // Exclude already read content
    if (excludeRead) {
      const readContentIds = await prisma.userContentInteraction.findMany({
        where: {
          userId,
          status: 'read',
        },
        select: { contentId: true },
      });

      if (readContentIds.length > 0) {
        where.id = { notIn: readContentIds.map(i => i.contentId) };
      }
    }

    const content = await prisma.content.findMany({
      where,
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 200, // Get recent 200 items as candidates
    });

    return content;
    */

    // Mock data for now
    return [];
  }

  /**
   * Score content using multiple algorithms
   */
  private async scoreContent(userId: string, candidates: any[], userProfile: any) {
    const scored: ScoredContent[] = [];

    for (const content of candidates) {
      let totalScore = 0;
      const reasons: string[] = [];

      // 1. Category priority score (0-30 points)
      const categoryPriority = userProfile.categoryPriorities.get(content.categoryId) || 5;
      const categoryScore = (categoryPriority / 10) * 30;
      totalScore += categoryScore;
      if (categoryScore > 15) reasons.push('high priority category');

      // 2. Recency score (0-15 points)
      const recencyScore = this.calculateRecencyScore(content.publishedAt);
      totalScore += recencyScore;
      if (recencyScore > 10) reasons.push('recent');

      // 3. Quality score (0-20 points)
      const qualityScore = Number(content.qualityScore || 0.5) * 20;
      totalScore += qualityScore;

      // 4. Content type preference (0-10 points)
      const typeScore = userProfile.preferences.preferredContentTypes?.includes(content.contentType) ? 10 : 5;
      totalScore += typeScore;

      // 5. Collaborative filtering (0-15 points)
      const collabScore = await collaborativeFilter.score(userId, content.id, userProfile.recentInteractions);
      totalScore += collabScore;
      if (collabScore > 10) reasons.push('similar users liked');

      // 6. Content-based filtering (0-10 points)
      const contentScore = await contentBasedFilter.score(content, userProfile.recentInteractions);
      totalScore += contentScore;
      if (contentScore > 5) reasons.push('similar to your interests');

      scored.push({
        contentId: content.id,
        score: totalScore,
        reason: reasons.length > 0 ? reasons.join(', ') : undefined,
      });
    }

    return scored;
  }

  /**
   * Calculate recency score (0-15)
   */
  private calculateRecencyScore(publishedAt: Date): number {
    const now = new Date();
    const ageInDays = (now.getTime() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays <= 7) return 15; // Last week
    if (ageInDays <= 30) return 12; // Last month
    if (ageInDays <= 90) return 9;  // Last 3 months
    if (ageInDays <= 180) return 6; // Last 6 months
    if (ageInDays <= 365) return 3; // Last year
    return 1; // Older than 1 year
  }
}

export const recommendationService = new RecommendationService();
