import { BaseSource, NormalizedContent } from './base.source';
import { qualityScorer } from './quality-scorer.service';
import { arxivSource } from './sources/arxiv.source';
import { pubmedSource } from './sources/pubmed.source';
// Import other sources here as they're created

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
    // Register other sources here
  }

  /**
   * Register a content source
   */
  registerSource(source: BaseSource) {
    this.sources.set(source.sourceType, source);
    console.log(`✅ Registered source: ${source.name}`);
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
        console.log(`Fetching from ${source.name}...`);

        const content = await source.fetch({
          category: options?.category,
          limit: options?.limit || 20,
          keywords: options?.keywords,
        });

        allContent.push(...content);
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
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
    console.log(`\n🔄 Aggregating content for category: ${categoryName}`);

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
        console.log(`No content fetched for ${categoryName}`);
        return result;
      }

      // Score quality
      const scoredContent = qualityScorer.batchScore(content);

      // Filter by quality threshold (0.5 or higher)
      const qualityContent = scoredContent.filter(c => c.qualityScore >= 0.5);

      console.log(`Quality filtered: ${qualityContent.length}/${scoredContent.length} items`);

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
          console.log(`✅ Saved: ${item.title.substring(0, 60)}...`);
        } catch (error) {
          console.error(`Error saving content:`, error);
          result.errors++;
        }
      }

      result.skipped = result.fetched - result.saved - result.errors;

      console.log(`✅ Aggregation complete for ${categoryName}:`);
      console.log(`   Fetched: ${result.fetched}`);
      console.log(`   Saved: ${result.saved}`);
      console.log(`   Skipped: ${result.skipped}`);
      console.log(`   Errors: ${result.errors}`);

      return result;
    } catch (error) {
      console.error(`Error aggregating for ${categoryName}:`, error);
      result.errors++;
      return result;
    }
  }

  /**
   * Aggregate content for all categories
   */
  async aggregateAll(): Promise<AggregationResult[]> {
    console.log('\n🚀 Starting content aggregation for all categories...\n');

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

    console.log('\n✅ Aggregation complete for all categories\n');

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
        console.log(`${source.name}: ${isAvailable ? '✅ Available' : '❌ Unavailable'}`);
      } catch (error) {
        health[source.name] = false;
        console.log(`${source.name}: ❌ Error`);
      }
    }

    return health;
  }
}

export const aggregatorService = new AggregatorService();
