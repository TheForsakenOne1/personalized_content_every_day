import axios from 'axios';
import { BaseSource, RawContent, NormalizedContent, FetchOptions } from '../base.source';
import { config } from '../../../config';

/**
 * Springer Nature Source
 * Note: Requires Springer API key from https://dev.springernature.com/
 * Free tier: 5000 calls/day
 */
export class SpringerSource extends BaseSource {
  readonly name = 'Springer Nature';
  readonly sourceType = 'springer';
  readonly contentType = 'paper';
  readonly baseUrl = 'http://api.springernature.com/meta/v2/json';

  private categoryMap: Record<string, string> = {
    'physics': 'Physics',
    'mathematics': 'Mathematics',
    'biology': 'Biology',
    'medicine': 'Medicine',
    'chemistry': 'Chemistry',
    'environmental-science': 'Environmental Sciences',
    'computer-science': 'Computer Science',
    'engineering': 'Engineering',
    'psychology': 'Psychology',
  };

  protected getApiKey(): string | undefined {
    return process.env.SPRINGER_API_KEY || config.springerApiKey;
  }

  async fetchContent(options: FetchOptions): Promise<RawContent[]> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.warn('Springer API key not configured. Skipping Springer source.');
      return [];
    }

    const { category, limit = 50, since, keywords } = options;

    // Build query
    let query = '';

    if (keywords && keywords.length > 0) {
      query = keywords.map(k => `"${k}"`).join(' ');
    } else if (category) {
      const mappedCategory = this.mapCategory(category);
      query = `subject:"${mappedCategory || category}"`;
    } else {
      query = 'type:Journal'; // Default to journal articles
    }

    const params: Record<string, any> = {
      q: query,
      api_key: apiKey,
      p: Math.min(limit, 100), // Springer max is 100 per request
      s: 1, // Start record
    };

    // Add date filter
    if (since) {
      const year = since.getFullYear();
      params.q += ` year:${year}-${new Date().getFullYear()}`;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params,
        timeout: 30000,
      });

      if (!response.data || !response.data.records) {
        return [];
      }

      return this.parseSpringerResponse(response.data.records);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('Springer API authentication failed. Check API key.');
      } else {
        console.error('Springer API error:', error.message);
      }
      throw new Error(`Failed to fetch from Springer: ${error.message}`);
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
      language: raw.language || 'en',
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

  private parseSpringerResponse(records: any[]): RawContent[] {
    return records.map(record => {
      // Extract DOI for URL
      const doi = record.doi;
      const url = record.url?.[0]?.value || (doi ? `https://doi.org/${doi}` : '');

      // Extract authors
      const creators = record.creators || [];
      const authors = creators
        .map((c: any) => c.creator)
        .filter(Boolean)
        .join(', ') || 'Unknown';

      // Parse publication date
      const pubDate = this.parseDate(
        record.publicationDate || record.onlineDate || record.printDate
      );

      // Extract subjects as tags
      const subjects = record.subjects || [];
      const tags = subjects.map((s: any) => s.subject).slice(0, 10);

      return {
        externalId: doi || record.identifier,
        title: record.title,
        description: record.abstract || record.title,
        url: url,
        author: authors,
        publishedAt: pubDate,
        language: record.language || 'en',
        metadata: {
          doi: doi,
          issn: record.issn,
          isbn: record.isbn,
          publisher: record.publisher,
          publication_name: record.publicationName,
          content_type: record.contentType,
          open_access: record.openaccess === 'true',
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

export const springerSource = new SpringerSource();
