import logger from '../../../utils/logger';
import axios from 'axios';
import { BaseSource, RawContent, NormalizedContent, FetchOptions } from '../base.source';

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  author: { name: string }[];
  published: string;
  updated: string;
  link: { href: string; rel: string }[];
  category: { term: string; scheme: string }[];
  'arxiv:primary_category'?: { term: string };
}

export class ArxivSource extends BaseSource {
  readonly name = 'arXiv';
  readonly sourceType = 'arxiv';
  readonly contentType = 'paper';
  readonly baseUrl = 'http://export.arxiv.org/api/query';

  // Category mapping: our categories -> arXiv categories
  private categoryMap: Record<string, string> = {
    'physics': 'cat:physics.*',
    'mathematics': 'cat:math.*',
    'computer-science': 'cat:cs.*',
    'astronomy': 'cat:astro-ph.*',
    'software': 'cat:cs.SE+OR+cat:cs.PL+OR+cat:cs.AI',
    'software-development': 'cat:cs.SE',
  };

  async fetchContent(options: FetchOptions): Promise<RawContent[]> {
    const { category, limit = 50, since, keywords } = options;

    // Build search query
    let searchQuery = '';

    if (keywords && keywords.length > 0) {
      // Search in title and abstract
      searchQuery = keywords.map(k => `all:"${k}"`).join('+AND+');
    } else if (category) {
      searchQuery = this.mapCategory(category) || 'all:*';
    } else {
      searchQuery = 'all:*';
    }

    // Build query parameters
    const params = new URLSearchParams({
      search_query: searchQuery,
      start: '0',
      max_results: limit.toString(),
      sortBy: 'submittedDate',
      sortOrder: 'descending',
    });

    try {
      const response = await axios.get(`${this.baseUrl}?${params.toString()}`, {
        headers: {
          'Accept': 'application/atom+xml',
        },
        timeout: 30000, // 30 second timeout
      });

      // Parse XML response
      const entries = this.parseXmlResponse(response.data);

      return entries;
    } catch (error) {
      console.error('arXiv API error:', error);
      throw new Error(`Failed to fetch from arXiv: ${(error as any)?.message}`);
    }
  }

  normalizeContent(raw: RawContent): NormalizedContent {
    return {
      externalId: raw.externalId,
      contentType: this.contentType,
      source: this.name,
      title: this.cleanTitle(raw.title),
      description: raw.description,
      url: raw.url,
      author: raw.author,
      publishedAt: raw.publishedAt,
      wordCount: raw.description ? raw.description.split(/\s+/).length : undefined,
      language: 'en', // arXiv is primarily English
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
    return this.categoryMap[normalized] || `all:"${category}"`;
  }

  /**
   * Parse XML response from arXiv API
   * Note: This is a simplified parser. In production, use a proper XML parser like 'fast-xml-parser'
   */
  private parseXmlResponse(xml: string): RawContent[] {
    const entries: RawContent[] = [];

    // Simple regex-based parsing (for demonstration)
    // In production, use a proper XML parser
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const matches = xml.matchAll(entryRegex);

    for (const match of matches) {
      const entryXml = match[1];

      const id = this.extractTag(entryXml, 'id');
      const title = this.extractTag(entryXml, 'title');
      const summary = this.extractTag(entryXml, 'summary');
      const published = this.extractTag(entryXml, 'published');
      const author = this.extractAuthors(entryXml);
      const pdfLink = this.extractPdfLink(entryXml);
      const categories = this.extractCategories(entryXml);

      if (id && title && summary) {
        entries.push({
          externalId: id.split('/').pop() || id,
          title: title,
          description: summary,
          url: pdfLink || id,
          author: author,
          publishedAt: new Date(published),
          language: 'en',
          metadata: {
            arxiv_id: id.split('/').pop(),
            categories: categories,
            pdf_url: pdfLink,
          },
          tags: categories,
        });
      }
    }

    return entries;
  }

  private extractTag(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  private extractAuthors(xml: string): string {
    const authorRegex = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g;
    const authors: string[] = [];
    const matches = xml.matchAll(authorRegex);

    for (const match of matches) {
      authors.push(match[1].trim());
    }

    return authors.join(', ');
  }

  private extractPdfLink(xml: string): string | undefined {
    const linkRegex = /<link[^>]*href="([^"]*)"[^>]*type="application\/pdf"/;
    const match = xml.match(linkRegex);
    return match ? match[1] : undefined;
  }

  private extractCategories(xml: string): string[] {
    const categoryRegex = /<category[^>]*term="([^"]*)"/g;
    const categories: string[] = [];
    const matches = xml.matchAll(categoryRegex);

    for (const match of matches) {
      categories.push(match[1]);
    }

    return categories.slice(0, 5); // Limit to 5 categories
  }

  private cleanTitle(title: string): string {
    // Remove extra whitespace and newlines
    return title.replace(/\s+/g, ' ').trim();
  }
}

export const arxivSource = new ArxivSource();
