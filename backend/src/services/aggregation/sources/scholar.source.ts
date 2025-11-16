import axios from 'axios';
import { BaseSource, RawContent, NormalizedContent, FetchOptions } from '../base.source';
import { config } from '../../../config';

/**
 * Google Scholar Source (via SerpAPI)
 * Note: Requires SerpAPI key from https://serpapi.com/
 * Google Scholar doesn't have official API, so we use SerpAPI as a proxy
 * Free tier: 100 searches/month
 */
export class ScholarSource extends BaseSource {
  readonly name = 'Google Scholar';
  readonly sourceType = 'scholar';
  readonly contentType = 'paper';
  readonly baseUrl = 'https://serpapi.com/search';

  protected getApiKey(): string | undefined {
    return process.env.SERP_API_KEY || config.serpApiKey;
  }

  async fetchContent(options: FetchOptions): Promise<RawContent[]> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.warn('SerpAPI key not configured. Skipping Google Scholar source.');
      return [];
    }

    const { category, limit = 20, since, keywords } = options;

    // Build query
    let query = '';

    if (keywords && keywords.length > 0) {
      query = keywords.join(' ');
    } else if (category) {
      query = category;
    } else {
      query = 'research'; // Default broad search
    }

    const params: Record<string, any> = {
      engine: 'google_scholar',
      q: query,
      api_key: apiKey,
      num: Math.min(limit, 20), // SerpAPI max is 20 per request
      as_ylo: since ? since.getFullYear() : undefined, // Year low
    };

    try {
      const response = await axios.get(this.baseUrl, {
        params,
        timeout: 30000,
      });

      if (!response.data || !response.data.organic_results) {
        return [];
      }

      return this.parseScholarResponse(response.data.organic_results);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('SerpAPI authentication failed. Check API key.');
      } else {
        console.error('Google Scholar API error:', error.message);
      }
      throw new Error(`Failed to fetch from Google Scholar: ${error.message}`);
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

  private parseScholarResponse(results: any[]): RawContent[] {
    return results
      .filter(result => result.title && result.link) // Filter out incomplete results
      .map(result => {
        // Extract publication info
        const pubInfo = result.publication_info || {};
        const authors = pubInfo.authors?.map((a: any) => a.name).join(', ') || 'Unknown';

        // Extract year from publication info
        const year = pubInfo.summary?.match(/\b(19|20)\d{2}\b/)?.[0];
        const pubDate = year ? new Date(`${year}-01-01`) : new Date();

        // Generate ID from link
        const externalId = this.extractIdFromUrl(result.link);

        return {
          externalId: externalId,
          title: result.title,
          description: result.snippet || result.title,
          url: result.link,
          author: authors,
          publishedAt: pubDate,
          language: 'en',
          metadata: {
            cited_by: result.inline_links?.cited_by?.total || 0,
            related_pages: result.inline_links?.related_pages_link || null,
            versions: result.inline_links?.versions?.total || 0,
            publication_info: pubInfo.summary,
          },
          tags: this.extractTagsFromSnippet(result.snippet || ''),
        };
      });
  }

  private extractIdFromUrl(url: string): string {
    // Try to extract paper ID from URL
    const match = url.match(/cluster=(\d+)/);
    if (match) return match[1];

    // Fallback: use hash of URL
    return Buffer.from(url).toString('base64').substring(0, 20);
  }

  private extractTagsFromSnippet(snippet: string): string[] {
    // Very basic keyword extraction
    const words = snippet
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4);

    // Get unique words
    return [...new Set(words)].slice(0, 5);
  }
}

export const scholarSource = new ScholarSource();
