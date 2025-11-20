import logger from '../../utils/logger';
import { ScoredContent } from './recommendation.service';

/**
 * Feed Generator with Diversity Boost
 * Prevents filter bubbles by ensuring variety in recommendations
 */
export class FeedGenerator {
  /**
   * Apply diversity boost to prevent showing too many items from same category
   */
  applyDiversityBoost(scored: ScoredContent[], allContent: any[]): ScoredContent[] {
    const contentMap = new Map(allContent.map(c => [c.id, c]));
    const categoryCount = new Map<string, number>();
    const sourceCount = new Map<string, number>();
    const typeCount = new Map<string, number>();

    // Apply penalties for over-representation
    const boosted = scored.map(item => {
      const content = contentMap.get(item.contentId);
      if (!content) return item;

      const catCount = categoryCount.get(content.categoryId) || 0;
      const srcCount = sourceCount.get(content.source) || 0;
      const typeCount2 = typeCount.get(content.contentType) || 0;

      // Calculate diversity penalty
      let penalty = 0;

      // Category diversity: reduce score if we've seen too many from this category
      if (catCount >= 3) penalty += (catCount - 2) * 2;
      if (catCount >= 5) penalty += (catCount - 4) * 3;

      // Source diversity: reduce score if we've seen too many from this source
      if (srcCount >= 2) penalty += (srcCount - 1) * 1.5;

      // Type diversity: reduce score if we've seen too many of this type
      if (typeCount2 >= 4) penalty += (typeCount2 - 3) * 1;

      // Update counts
      categoryCount.set(content.categoryId, catCount + 1);
      sourceCount.set(content.source, srcCount + 1);
      typeCount.set(content.contentType, typeCount2 + 1);

      return {
        ...item,
        score: Math.max(item.score - penalty, 0),
      };
    });

    // Re-sort after applying diversity boost
    return boosted.sort((a, b) => b.score - a.score);
  }

  /**
   * Balance feed by content type
   * Ensures a mix of papers, articles, videos, etc.
   */
  balanceByContentType(
    scored: ScoredContent[],
    allContent: any[],
    targetDistribution?: Map<string, number>
  ): ScoredContent[] {
    const contentMap = new Map(allContent.map(c => [c.id, c]));

    // Default distribution: 40% papers, 30% articles, 20% videos, 10% other
    const defaultDistribution = new Map([
      ['paper', 0.4],
      ['article', 0.3],
      ['video', 0.2],
      ['blog', 0.1],
    ]);

    const distribution = targetDistribution || defaultDistribution;

    // Group by content type
    const typeGroups = new Map<string, ScoredContent[]>();

    for (const item of scored) {
      const content = contentMap.get(item.contentId);
      if (!content) continue;

      const type = content.contentType;
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(item);
    }

    // Calculate target counts
    const totalItems = scored.length;
    const balanced: ScoredContent[] = [];

    for (const [type, ratio] of distribution.entries()) {
      const targetCount = Math.floor(totalItems * ratio);
      const items = typeGroups.get(type) || [];

      // Take top N items of this type
      balanced.push(...items.slice(0, targetCount));
    }

    // Fill remaining slots with highest-scored items
    const remaining = scored.filter(item => !balanced.includes(item));
    const remainingSlots = totalItems - balanced.length;

    balanced.push(...remaining.slice(0, remainingSlots));

    return balanced;
  }

  /**
   * Interleave content from different categories
   * Ensures users see variety instead of all content from one category
   */
  interleaveByCategory(scored: ScoredContent[], allContent: any[]): ScoredContent[] {
    const contentMap = new Map(allContent.map(c => [c.id, c]));

    // Group by category
    const categoryGroups = new Map<string, ScoredContent[]>();

    for (const item of scored) {
      const content = contentMap.get(item.contentId);
      if (!content) continue;

      const categoryId = content.categoryId;
      if (!categoryGroups.has(categoryId)) {
        categoryGroups.set(categoryId, []);
      }
      categoryGroups.get(categoryId)!.push(item);
    }

    // Interleave round-robin
    const interleaved: ScoredContent[] = [];
    const categoryArrays = Array.from(categoryGroups.values());

    let maxLength = Math.max(...categoryArrays.map(arr => arr.length));
    let position = 0;

    while (interleaved.length < scored.length) {
      for (const categoryItems of categoryArrays) {
        if (position < categoryItems.length) {
          interleaved.push(categoryItems[position]);
        }
      }
      position++;

      // Prevent infinite loop
      if (position > maxLength) break;
    }

    return interleaved;
  }

  /**
   * Inject trending content into feed
   * Adds popular content to personalized recommendations
   */
  injectTrendingContent(
    personalizedFeed: ScoredContent[],
    trendingContent: any[],
    injectionRate: number = 0.2
  ): ScoredContent[] {
    const trendingCount = Math.floor(personalizedFeed.length * injectionRate);

    if (trendingCount === 0 || trendingContent.length === 0) {
      return personalizedFeed;
    }

    // Convert trending to scored format
    const trendingScored: ScoredContent[] = trendingContent.slice(0, trendingCount).map(content => ({
      contentId: content.id,
      score: 75, // High score to ensure visibility
      reason: 'trending',
    }));

    // Inject at regular intervals
    const result: ScoredContent[] = [];
    const interval = Math.floor(personalizedFeed.length / trendingCount);

    let trendingIndex = 0;

    for (let i = 0; i < personalizedFeed.length; i++) {
      // Inject trending item
      if (i > 0 && i % interval === 0 && trendingIndex < trendingScored.length) {
        result.push(trendingScored[trendingIndex]);
        trendingIndex++;
      }

      // Add personalized item
      result.push(personalizedFeed[i]);
    }

    // Add any remaining trending items at the end
    while (trendingIndex < trendingScored.length) {
      result.push(trendingScored[trendingIndex]);
      trendingIndex++;
    }

    return result;
  }

  /**
   * Add serendipity - random high-quality content outside user's interests
   * Helps users discover new topics
   */
  addSerendipity(
    feed: ScoredContent[],
    allContent: any[],
    serendipityRate: number = 0.1
  ): ScoredContent[] {
    const serendipityCount = Math.floor(feed.length * serendipityRate);

    if (serendipityCount === 0) return feed;

    // Get high-quality content not in current feed
    const feedContentIds = new Set(feed.map(f => f.contentId));
    const serendipityPool = allContent
      .filter(c => !feedContentIds.has(c.id) && Number(c.qualityScore) >= 0.7)
      .slice(0, serendipityCount * 2); // Get more than needed for random selection

    // Randomly select serendipity items
    const serendipityItems: ScoredContent[] = [];

    for (let i = 0; i < serendipityCount && i < serendipityPool.length; i++) {
      const randomIndex = Math.floor(Math.random() * serendipityPool.length);
      const content = serendipityPool[randomIndex];

      serendipityItems.push({
        contentId: content.id,
        score: 50, // Medium score
        reason: 'discover something new',
      });

      // Remove from pool to avoid duplicates
      serendipityPool.splice(randomIndex, 1);
    }

    // Inject serendipity items at random positions
    const result = [...feed];

    for (const item of serendipityItems) {
      const position = Math.floor(Math.random() * result.length);
      result.splice(position, 0, item);
    }

    return result;
  }
}

export const feedGenerator = new FeedGenerator();
