import { prisma } from '../../utils/prisma';

/**
 * Collaborative Filtering
 * "Users who liked X also liked Y"
 */
export class CollaborativeFilter {
  /**
   * Score content based on similar users' interactions
   * Returns 0-15 points
   */
  async score(userId: string, contentId: string, userInteractions: any[]): Promise<number> {
    try {
      // Get similar users based on interaction patterns
      const similarUsers = await this.findSimilarUsers(userId, userInteractions);

      if (similarUsers.length === 0) {
        return 5; // Default neutral score
      }

      // Check if similar users interacted with this content
      const similarUserInteractions = await this.getSimilarUserInteractions(
        similarUsers,
        contentId
      );

      // Calculate score based on interactions
      let score = 0;

      for (const interaction of similarUserInteractions) {
        // Positive interactions
        if (interaction.status === 'read') score += 3;
        if (interaction.isSaved) score += 5;
        if (interaction.rating && interaction.rating >= 4) score += 4;
        if (interaction.rating === 5) score += 2; // Bonus for 5-star

        // Negative interactions
        if (interaction.rating && interaction.rating <= 2) score -= 3;
      }

      // Normalize to 0-15
      return Math.min(Math.max(score, 0), 15);
    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return 5; // Default score on error
    }
  }

  /**
   * Find users with similar interaction patterns
   */
  private async findSimilarUsers(userId: string, userInteractions: any[]): Promise<string[]> {
    if (userInteractions.length === 0) {
      return [];
    }

    // TODO: Uncomment when Prisma works
    /*
    // Get content IDs that user has interacted with positively
    const likedContentIds = userInteractions
      .filter(i => i.status === 'read' || i.isSaved || (i.rating && i.rating >= 4))
      .map(i => i.contentId);

    if (likedContentIds.length === 0) {
      return [];
    }

    // Find users who also interacted with the same content
    const similarUserInteractions = await prisma.userContentInteraction.findMany({
      where: {
        contentId: { in: likedContentIds },
        userId: { not: userId },
        OR: [
          { status: 'read' },
          { isSaved: true },
          { rating: { gte: 4 } },
        ],
      },
      select: {
        userId: true,
        contentId: true,
      },
    });

    // Count overlapping interactions per user
    const userOverlaps = new Map<string, number>();

    for (const interaction of similarUserInteractions) {
      const count = userOverlaps.get(interaction.userId) || 0;
      userOverlaps.set(interaction.userId, count + 1);
    }

    // Get users with at least 3 overlapping interactions
    const similarUsers = Array.from(userOverlaps.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1]) // Sort by overlap count
      .slice(0, 10) // Top 10 most similar users
      .map(([userId]) => userId);

    return similarUsers;
    */

    // Mock data for now
    return [];
  }

  /**
   * Get interactions from similar users for specific content
   */
  private async getSimilarUserInteractions(similarUserIds: string[], contentId: string): Promise<Array<{ status: string; isSaved: boolean; rating: number | null }>> {
    if (similarUserIds.length === 0) {
      return [];
    }

    // TODO: Uncomment when Prisma works
    /*
    return await prisma.userContentInteraction.findMany({
      where: {
        userId: { in: similarUserIds },
        contentId: contentId,
      },
      select: {
        status: true,
        isSaved: true,
        rating: true,
      },
    });
    */

    // Mock data for now
    return [];
  }

  /**
   * Calculate Jaccard similarity between two users
   * Based on their liked content sets
   */
  calculateJaccardSimilarity(userALikes: Set<string>, userBLikes: Set<string>): number {
    const intersection = new Set([...userALikes].filter(id => userBLikes.has(id)));
    const union = new Set([...userALikes, ...userBLikes]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
  }
}

export const collaborativeFilter = new CollaborativeFilter();
