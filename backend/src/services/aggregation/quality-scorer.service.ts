import { NormalizedContent } from './base.source';

export interface QualityScore {
  score: number; // 0.0 to 1.0
  breakdown: {
    sourceReliability: number;
    recency: number;
    authorCredibility: number;
    completeness: number;
    engagement: number;
  };
}

export class QualityScorer {
  /**
   * Calculate quality score for content
   */
  calculateScore(content: NormalizedContent): QualityScore {
    const sourceReliability = this.scoreSourceReliability(content.source);
    const recency = this.scoreRecency(content.publishedAt);
    const authorCredibility = this.scoreAuthorCredibility(content.author, content.source);
    const completeness = this.scoreCompleteness(content);
    const engagement = this.scoreEngagement(content);

    // Weighted average
    const weights = {
      sourceReliability: 0.30,
      recency: 0.20,
      authorCredibility: 0.20,
      completeness: 0.20,
      engagement: 0.10,
    };

    const score =
      sourceReliability * weights.sourceReliability +
      recency * weights.recency +
      authorCredibility * weights.authorCredibility +
      completeness * weights.completeness +
      engagement * weights.engagement;

    return {
      score: Math.min(Math.max(score, 0), 1), // Clamp between 0 and 1
      breakdown: {
        sourceReliability,
        recency,
        authorCredibility,
        completeness,
        engagement,
      },
    };
  }

  /**
   * Score source reliability (0.0 to 1.0)
   */
  private scoreSourceReliability(source: string): number {
    const sourceScores: Record<string, number> = {
      // High-quality academic sources
      'arXiv': 0.95,
      'PubMed': 0.95,
      'Nature': 1.0,
      'Science': 1.0,
      'IEEE Xplore': 0.95,
      'Springer Nature': 0.90,
      'ScienceDirect': 0.90,
      'JSTOR': 0.90,
      'Google Scholar': 0.85,

      // Other sources
      'Medium': 0.60,
      'Dev.to': 0.65,
      'Hacker News': 0.70,
      'Reddit': 0.50,
      'YouTube': 0.60,
    };

    return sourceScores[source] || 0.50; // Default to 0.5 for unknown sources
  }

  /**
   * Score recency (0.0 to 1.0)
   * More recent content scores higher
   */
  private scoreRecency(publishedAt?: Date): number {
    if (!publishedAt) return 0.3;

    const now = new Date();
    const ageInDays = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);

    // Scoring curve:
    // 0-30 days: 1.0
    // 30-90 days: 0.9
    // 90-180 days: 0.8
    // 180-365 days: 0.7
    // 1-2 years: 0.6
    // 2-3 years: 0.5
    // 3+ years: 0.4

    if (ageInDays <= 30) return 1.0;
    if (ageInDays <= 90) return 0.9;
    if (ageInDays <= 180) return 0.8;
    if (ageInDays <= 365) return 0.7;
    if (ageInDays <= 730) return 0.6;
    if (ageInDays <= 1095) return 0.5;
    return 0.4;
  }

  /**
   * Score author credibility (0.0 to 1.0)
   */
  private scoreAuthorCredibility(author?: string, source?: string): number {
    if (!author) return 0.5;

    // If from high-quality academic source, boost credibility
    if (source && ['arXiv', 'PubMed', 'Nature', 'Science'].includes(source)) {
      return 0.9;
    }

    // Check if author has credentials in name (Dr., PhD, Professor, etc.)
    const hasCredentials = /\b(dr\.|ph\.?d|professor|prof\.)\b/i.test(author);
    if (hasCredentials) return 0.85;

    // Check if multiple authors (collaboration often indicates quality)
    const hasMultipleAuthors = author.includes(',') || author.includes(' and ');
    if (hasMultipleAuthors) return 0.75;

    return 0.60; // Default for single author without credentials
  }

  /**
   * Score completeness (0.0 to 1.0)
   * Based on how much information is available
   */
  private scoreCompleteness(content: NormalizedContent): number {
    let score = 0.0;

    // Required fields (total: 0.4)
    if (content.title && content.title.length > 10) score += 0.15;
    if (content.description && content.description.length > 50) score += 0.15;
    if (content.url) score += 0.10;

    // Optional but valuable fields (total: 0.4)
    if (content.author) score += 0.10;
    if (content.publishedAt) score += 0.10;
    if (content.thumbnailUrl) score += 0.10;
    if (content.tags && content.tags.length > 0) score += 0.10;

    // Metadata richness (total: 0.2)
    const metadataKeys = Object.keys(content.metadata || {});
    if (metadataKeys.length > 0) score += 0.05;
    if (metadataKeys.length > 3) score += 0.05;
    if (metadataKeys.length > 5) score += 0.10;

    return Math.min(score, 1.0);
  }

  /**
   * Score engagement potential (0.0 to 1.0)
   * Based on title quality, description, tags
   */
  private scoreEngagement(content: NormalizedContent): number {
    let score = 0.5; // Base score

    // Title quality
    if (content.title) {
      const titleLength = content.title.length;

      // Optimal title length: 40-80 characters
      if (titleLength >= 40 && titleLength <= 80) {
        score += 0.15;
      } else if (titleLength >= 20 && titleLength <= 100) {
        score += 0.10;
      }

      // Title has numbers/data (often more engaging)
      if (/\d/.test(content.title)) {
        score += 0.05;
      }

      // Title asks a question
      if (/\?/.test(content.title)) {
        score += 0.05;
      }
    }

    // Description quality
    if (content.description) {
      const descLength = content.description.length;

      // Optimal description: 100-500 characters
      if (descLength >= 100 && descLength <= 500) {
        score += 0.15;
      } else if (descLength >= 50) {
        score += 0.10;
      }
    }

    // Has tags (indicates categorization effort)
    if (content.tags && content.tags.length > 0) {
      score += 0.05;
      if (content.tags.length >= 3) score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Batch score multiple content items
   */
  batchScore(contents: NormalizedContent[]): Array<NormalizedContent & { qualityScore: number }> {
    return contents.map(content => ({
      ...content,
      qualityScore: this.calculateScore(content).score,
    }));
  }
}

export const qualityScorer = new QualityScorer();
