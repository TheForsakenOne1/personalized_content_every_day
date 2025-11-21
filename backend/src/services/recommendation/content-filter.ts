import logger from '../../utils/logger';
/**
 * Content-Based Filtering
 * "Because you liked X, you might like Y (similar content)"
 */
export class ContentBasedFilter {
  /**
   * Score content based on similarity to user's liked content
   * Returns 0-10 points
   */
  async score(content: any, userInteractions: any[]): Promise<number> {
    try {
      // Get content that user liked
      const likedContent = userInteractions.filter(
        i => i.status === 'read' || i.isSaved || (i.rating && i.rating >= 4)
      );

      if (likedContent.length === 0) {
        return 5; // Default neutral score
      }

      // Calculate similarity to liked content
      let totalSimilarity = 0;
      let comparisons = 0;

      for (const liked of likedContent.slice(0, 10)) { // Compare with top 10 liked items
        const similarity = this.calculateContentSimilarity(content, liked.content);
        totalSimilarity += similarity;
        comparisons++;
      }

      if (comparisons === 0) return 5;

      // Average similarity, scale to 0-10
      const avgSimilarity = totalSimilarity / comparisons;
      return avgSimilarity * 10;
    } catch (error) {
      logger.error('Content-based filtering error:', error);
      return 5; // Default score on error
    }
  }

  /**
   * Calculate similarity between two content items
   * Returns 0.0 to 1.0
   */
  private calculateContentSimilarity(contentA: any, contentB: any): number {
    let similarity = 0;
    let factors = 0;

    // 1. Same category (30% weight)
    if (contentA.categoryId === contentB?.categoryId) {
      similarity += 0.3;
    }
    factors++;

    // 2. Same content type (20% weight)
    if (contentA.contentType === contentB?.contentType) {
      similarity += 0.2;
    }
    factors++;

    // 3. Same source (15% weight)
    if (contentA.source === contentB?.source) {
      similarity += 0.15;
    }
    factors++;

    // 4. Tag overlap (35% weight)
    const tagSimilarity = this.calculateTagSimilarity(contentA.tags, contentB?.tags);
    similarity += tagSimilarity * 0.35;
    factors++;

    return similarity;
  }

  /**
   * Calculate tag overlap using Jaccard similarity
   */
  private calculateTagSimilarity(tagsA: any[], tagsB: any[]): number {
    if (!tagsA || !tagsB || tagsA.length === 0 || tagsB.length === 0) {
      return 0;
    }

    // Extract tag names/slugs
    const setA = new Set(tagsA.map(t => t.tag?.slug || t.slug || t));
    const setB = new Set(tagsB.map(t => t.tag?.slug || t.slug || t));

    // Calculate Jaccard similarity
    const intersection = new Set([...setA].filter(tag => setB.has(tag)));
    const union = new Set([...setA, ...setB]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
  }

  /**
   * Calculate TF-IDF similarity between text fields
   * Simplified version using word overlap
   */
  // @ts-ignore - Reserved for future use
  private _calculateTextSimilarity(textA: string, textB: string): number {
    if (!textA || !textB) return 0;

    // Tokenize and clean
    const tokensA = this.tokenize(textA);
    const tokensB = this.tokenize(textB);

    if (tokensA.length === 0 || tokensB.length === 0) return 0;

    // Calculate word overlap
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    const intersection = new Set([...setA].filter(word => setB.has(word)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 3) // Filter short words
      .filter(word => !this.isStopWord(word)); // Filter stop words
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
      'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get',
      'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
      'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let',
      'put', 'say', 'she', 'too', 'use', 'that', 'this', 'with',
      'from', 'have', 'been', 'were', 'will', 'would', 'could',
    ]);

    return stopWords.has(word);
  }

  /**
   * Calculate cosine similarity between two vectors
   * Used for advanced text similarity
   */
  // @ts-ignore - Reserved for future use
  private _cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const contentBasedFilter = new ContentBasedFilter();
