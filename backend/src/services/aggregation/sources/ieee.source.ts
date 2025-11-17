import logger from '../../../utils/logger';
import axios from 'axios';
import { BaseSource, RawContent, NormalizedContent, FetchOptions } from '../base.source';
import { config } from '../../../config';

/**
 * IEEE Xplore Source
 * Note: Requires IEEE API key from https://developer.ieee.org/
 * Free tier: 200 calls/day
 */
export class IEEESource extends BaseSource {
  readonly name = 'IEEE Xplore';
  readonly sourceType = 'ieee';
  readonly contentType = 'paper';
  readonly baseUrl = 'https://ieeexploreapi.ieee.org/api/v1/search/articles';

  private categoryMap: Record<string, string> = {
    'software': 'Software Engineering',
    'software-development': 'Software Engineering',
    'computer-science': 'Computer Science',
    'engineering': 'Engineering',
    'physics': 'Engineering Physics',
    'mathematics': 'Mathematics',
    'cybersecurity': 'Computer Security',
  };

  protected getApiKey(): string | undefined {
    // IEEE requires API key - check config
    return process.env.IEEE_API_KEY || config.ieeApiKey;
  }

  async fetchContent(options: FetchOptions): Promise<RawContent[]> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      logger.warn('IEEE API key not configured. Skipping IEEE source.');
      return [];
    }

    const { category, limit = 25, since, keywords } = options;

    // Build query
    let query = '';

    if (keywords && keywords.length > 0) {
      // Search in title and abstract
      query = keywords.map(k => `"${k}"`).join(' AND ');
    } else if (category) {
      const mappedCategory = this.mapCategory(category);
      query = mappedCategory ? `"${mappedCategory}"` : category;
    } else {
      query = 'technology'; // Default broad search
    }

    const params: Record<string, any> = {
      apikey: apiKey,
      querytext: query,
      max_records: Math.min(limit, 200), // IEEE max is 200
      start_record: 1,
      sort_order: 'desc',
      sort_field: 'publication_date',
    };

    // Add date filter if provided
    if (since) {
      const year = since.getFullYear();
      params.start_year = year;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params,
        timeout: 30000,
      });

      if (!response.data || !response.data.articles) {
        return [];
      }

      return this.parseIEEEResponse(response.data.articles);
    } catch (error: any) {
      if (error.response?.status === 401) {
        logger.error('IEEE API authentication failed. Check API key.');
      } else {
        logger.error('IEEE API error:', error.message);
      }
      throw new Error(`Failed to fetch from IEEE: ${error.message}`);
    }
  }

  normalizeContent(raw: RawContent): NormalizedContent {
    return {
      externalId: raw.externalId,
      contentType: this.contentType,
      source: this.name,
      title: raw.title,
      description: raw.description,
      url: raw.url,
      author: raw.author,
      publishedAt: raw.publishedAt,
      wordCount: raw.description ? raw.description.split(/\s+/).length : undefined,
      language: 'en',
      metadata: {
        ...raw.metadata,
        source_type: this.sourceType,
      },
      tags: raw.tags,
    };
  }

  protected mapCategory(category?: string): string | undefined {
    if (!category) return undefined;

    const normalized = category.toLowerCase().replace(/\s+/g, '-');
    return this.categoryMap[normalized];
  }

  private parseIEEEResponse(articles: any[]): RawContent[] {
    return articles.map(article => {
      // Extract DOI for URL
      const doi = article.doi;
      const url = doi ? `https://doi.org/${doi}` : article.html_url;

      // Extract authors
      const authors = article.authors?.authors
        ?.map((a: any) => a.full_name)
        .join(', ') || 'Unknown';

      // Parse publication date
      const pubDate = this.parseDate(article.publication_date);

      // Extract keywords as tags
      const tags = [
        ...(article.index_terms?.ieee_terms?.terms || []),
        ...(article.index_terms?.author_terms?.terms || []),
      ].slice(0, 10);

      return {
        externalId: article.article_number || doi,
        title: article.title,
        description: article.abstract || article.title,
        url: url,
        author: authors,
        publishedAt: pubDate,
        language: 'en',
        metadata: {
          doi: doi,
          isbn: article.isbn,
          issn: article.issn,
          publication_title: article.publication_title,
          publisher: article.publisher,
          content_type: article.content_type,
        },
        tags: tags,
      };
    });
  }

  private parseDate(dateStr: string): Date {
    try {
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  }
}

export const ieeeSource = new IEEESource();
