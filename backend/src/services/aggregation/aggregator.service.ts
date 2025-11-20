import logger from '../../utils/logger';
import { BaseSource, NormalizedContent } from './base.source';
import { qualityScorer } from './quality-scorer.service';
import { arxivSource } from './sources/arxiv.source';
import { pubmedSource } from './sources/pubmed.source';
import { ieeeSource } from './sources/ieee.source';
import { springerSource } from './sources/springer.source';
import { scholarSource } from './sources/scholar.source';

export interface AggregationResult {
  source: string;
  fetched: number;
  saved: number;
  skipped: number;
  errors: number;
}

export class AggregatorService {
  private sources: Map<string, BaseSource> = new Map();

  constructor() {
    // Register available sources
    this.registerSource(arxivSource);
    this.registerSource(pubmedSource);
    this.registerSource(ieeeSource);
    this.registerSource(springerSource);
    this.registerSource(scholarSource);
  }

  /**
   * Register a content source
   */
  registerSource(source: BaseSource) {
    this.sources.set(source.sourceType, source);
    logger.info(`✅ Registered source: ${source.name}`);
  }

  /**
   * Get all registered sources
   */
  getSources(): BaseSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Get a specific source by type
   */
  getSource(sourceType: string): BaseSource | undefined {
    return this.sources.get(sourceType);
  }

  /**
   * Fetch content from all sources
   */
  async fetchFromAllSources(options?: {
    category?: string;
    limit?: number;
    keywords?: string[];
  }): Promise<NormalizedContent[]> {
    const allContent: NormalizedContent[] = [];

    for (const source of this.sources.values()) {
      try {
        logger.info(`Fetching from ${source.name}...`);

        const content = await source.fetch({
          category: options?.category,
          limit: options?.limit || 20,
          keywords: options?.keywords,
        });

        allContent.push(...content);
      } catch (error) {
        logger.error(`Error fetching from ${source.name}:`, error);
      }
    }

    return allContent;
  }

  /**
   * Fetch content from a specific source
   */
  async fetchFromSource(
    sourceType: string,
    options?: {
      category?: string;
      limit?: number;
      keywords?: string[];
    }
  ): Promise<NormalizedContent[]> {
    const source = this.sources.get(sourceType);

    if (!source) {
      throw new Error(`Source ${sourceType} not found`);
    }

    return await source.fetch({
      category: options?.category,
      limit: options?.limit || 50,
      keywords: options?.keywords,
    });
  }

  /**
   * Aggregate and save content for a category
   * This is the main method called by the scheduler
   */
  async aggregateForCategory(categoryId: string, categoryName: string): Promise<AggregationResult> {
    logger.info(`\n🔄 Aggregating content for category: ${categoryName}`);

    const result: AggregationResult = {
      source: 'all',
      fetched: 0,
      saved: 0,
      skipped: 0,
      errors: 0,
    };

    try {
      // Fetch content from all sources
      const content = await this.fetchFromAllSources({
        category: categoryName,
        limit: 20, // Fetch 20 per source
      });

      result.fetched = content.length;

      if (content.length === 0) {
        logger.info(`No content fetched for ${categoryName}`);
        return result;
      }

      // Score quality
      const scoredContent = qualityScorer.batchScore(content);

      // Filter by quality threshold (0.5 or higher)
      const qualityContent = scoredContent.filter(c => c.qualityScore >= 0.5);

      logger.info(`Quality filtered: ${qualityContent.length}/${scoredContent.length} items`);

      // Save to database (TODO: Implement when Prisma is working)
      for (const item of qualityContent) {
        try {
          // TODO: Uncomment when Prisma is generated
          /*
          await prisma.content.upsert({
            where: {
              externalId_source: {
                externalId: item.externalId,
                source: item.source,
              },
            },
            create: {
              ...item,
              categoryId: categoryId,
              qualityScore: item.qualityScore,
            },
            update: {
              title: item.title,
              description: item.description,
              url: item.url,
              qualityScore: item.qualityScore,
            },
          });
          */

          result.saved++;
          logger.info(`✅ Saved: ${item.title.substring(0, 60)}...`);
        } catch (error) {
          logger.error(`Error saving content:`, error);
          result.errors++;
        }
      }

      result.skipped = result.fetched - result.saved - result.errors;

      logger.info(`✅ Aggregation complete for ${categoryName}:`);
      logger.info(`   Fetched: ${result.fetched}`);
      logger.info(`   Saved: ${result.saved}`);
      logger.info(`   Skipped: ${result.skipped}`);
      logger.info(`   Errors: ${result.errors}`);

      return result;
    } catch (error) {
      logger.error(`Error aggregating for ${categoryName}:`, error);
      result.errors++;
      return result;
    }
  }

  /**
   * Aggregate content for all categories
   */
  async aggregateAll(): Promise<AggregationResult[]> {
    logger.info('\n🚀 Starting content aggregation for all categories...\n');

    // TODO: Fetch categories from database when Prisma is working
    const categories = [
      { id: 'cat-1', name: 'Software Development' },
      { id: 'cat-2', name: 'Astronomy' },
      { id: 'cat-3', name: 'Physics' },
      { id: 'cat-4', name: 'Medicine' },
      { id: 'cat-5', name: 'Mathematics' },
    ];

    const results: AggregationResult[] = [];

    for (const category of categories) {
      const result = await this.aggregateForCategory(category.id, category.name);
      results.push(result);

      // Add delay to avoid rate limiting
      await this.delay(2000); // 2 second delay between categories
    }

    logger.info('\n✅ Aggregation complete for all categories\n');

    return results;
  }

  /**
   * Utility: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check health of all sources
   */
  async checkSourcesHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const source of this.sources.values()) {
      try {
        const isAvailable = await source.isAvailable();
        health[source.name] = isAvailable;
        logger.info(`${source.name}: ${isAvailable ? '✅ Available' : '❌ Unavailable'}`);
      } catch (error) {
        health[source.name] = false;
        logger.info(`${source.name}: ❌ Error`);
      }
    }

    return health;
  }
}

export const aggregatorService = new AggregatorService();
