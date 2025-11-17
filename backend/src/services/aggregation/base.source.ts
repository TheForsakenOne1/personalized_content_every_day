import logger from '../../utils/logger';
export interface RawContent {
  externalId: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  author?: string;
  publishedAt?: Date;
  duration?: number;
  wordCount?: number;
  language?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface NormalizedContent {
  externalId: string;
  contentType: string;
  source: string;
  categoryId?: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  author?: string;
  publishedAt?: Date;
  duration?: number;
  wordCount?: number;
  language: string;
  metadata: Record<string, any>;
  tags?: string[];
}

export interface FetchOptions {
  category?: string;
  limit?: number;
  since?: Date;
  keywords?: string[];
}

export abstract class BaseSource {
  abstract readonly name: string;
  abstract readonly sourceType: string; // 'arxiv', 'pubmed', 'ieee', etc.
  abstract readonly contentType: string; // 'paper', 'article', 'video'
  abstract readonly baseUrl: string;

  /**
   * Fetch raw content from the source
   */
  abstract fetchContent(options: FetchOptions): Promise<RawContent[]>;

  /**
   * Normalize raw content to our standard format
   */
  abstract normalizeContent(raw: RawContent): NormalizedContent;

  /**
   * Get API key or credentials (can be overridden)
   */
  protected getApiKey(): string | undefined {
    return undefined;
  }

  /**
   * Check if source is available and configured
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try to fetch a single item to test connectivity
      const results = await this.fetchContent({ limit: 1 });
      return results.length >= 0; // Even 0 results means the API is working
    } catch (error) {
      logger.error(`${this.name} is not available:`, error);
      return false;
    }
  }

  /**
   * Fetch and normalize content
   */
  async fetch(options: FetchOptions): Promise<NormalizedContent[]> {
    try {
      const raw = await this.fetchContent(options);
      const normalized = raw.map(r => this.normalizeContent(r));

      logger.info(`${this.name}: Fetched ${normalized.length} items`);

      return normalized;
    } catch (error) {
      logger.error(`${this.name} fetch error:`, error);
      throw error;
    }
  }

  /**
   * Map our category to source-specific category/query
   */
  protected mapCategory(category?: string): string | undefined {
    // Override in subclasses for source-specific mapping
    return category;
  }

  /**
   * Estimate read time based on word count or duration
   */
  protected estimateReadTime(wordCount?: number, duration?: number): number {
    if (duration) {
      return Math.ceil(duration / 60); // Convert seconds to minutes
    }

    if (wordCount) {
      // Average reading speed: 200 words per minute
      return Math.ceil(wordCount / 200);
    }

    return 5; // Default 5 minutes
  }

  /**
   * Extract tags from text
   */
  protected extractTags(text: string, existingTags: string[] = []): string[] {
    // Combine existing tags with extracted keywords
    const tags = new Set(existingTags);

    // Simple keyword extraction (can be enhanced with NLP)
    const keywords = text
      .toLowerCase()
      .match(/\b[a-z]{4,}\b/g) || [];

    // Filter common words (very basic stop word list)
    const stopWords = new Set(['that', 'this', 'with', 'from', 'have', 'been', 'were', 'will', 'would', 'could', 'should']);

    keywords.forEach(word => {
      if (!stopWords.has(word) && word.length >= 4) {
        tags.add(word);
      }
    });

    // Limit to 10 tags
    return Array.from(tags).slice(0, 10);
  }
}
