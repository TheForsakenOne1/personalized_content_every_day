import axios from 'axios';
import { BaseSource, RawContent, NormalizedContent, FetchOptions } from '../base.source';

interface PubMedSearchResult {
  esearchresult: {
    idlist: string[];
    count: string;
  };
}

interface PubMedArticle {
  uid: string;
  title: string;
  authors: { name: string }[];
  source: string;
  pubdate: string;
  sortpubdate: string;
  epubdate: string;
  fulljournalname: string;
  elocationid: string;
  articleids: { idtype: string; value: string }[];
}

export class PubMedSource extends BaseSource {
  readonly name = 'PubMed';
  readonly sourceType = 'pubmed';
  readonly contentType = 'paper';
  readonly baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

  // Category mapping: our categories -> PubMed search terms
  private categoryMap: Record<string, string> = {
    'medicine': 'medicine[MeSH Terms]',
    'biology': 'biology[MeSH Terms]',
    'psychology': 'psychology[MeSH Terms]',
    'environmental-science': 'environmental science[MeSH Terms]',
    'health': 'public health[MeSH Terms]',
  };

  async fetchContent(options: FetchOptions): Promise<RawContent[]> {
    const { category, limit = 50, since, keywords } = options;

    // Step 1: Search for article IDs
    const ids = await this.searchArticles(category, keywords, limit, since);

    if (ids.length === 0) {
      return [];
    }

    // Step 2: Fetch article details
    const articles = await this.fetchArticleDetails(ids);

    return articles;
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
      language: 'en', // PubMed is primarily English
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
    return this.categoryMap[normalized] || `${category}[MeSH Terms]`;
  }

  /**
   * Search for article IDs using PubMed's ESearch API
   */
  private async searchArticles(
    category?: string,
    keywords?: string[],
    limit: number = 50,
    since?: Date
  ): Promise<string[]> {
    let searchTerm = '';

    if (keywords && keywords.length > 0) {
      searchTerm = keywords.map(k => `"${k}"`).join(' AND ');
    } else if (category) {
      searchTerm = this.mapCategory(category) || '';
    }

    // Add date filter if provided
    if (since) {
      const dateStr = since.toISOString().split('T')[0]; // YYYY-MM-DD
      searchTerm += ` AND ("${dateStr}"[PDAT] : "3000"[PDAT])`;
    }

    const params = new URLSearchParams({
      db: 'pubmed',
      term: searchTerm || 'biomedicine',
      retmax: limit.toString(),
      retmode: 'json',
      sort: 'relevance',
    });

    try {
      const response = await axios.get<PubMedSearchResult>(
        `${this.baseUrl}/esearch.fcgi?${params.toString()}`,
        { timeout: 30000 }
      );

      return response.data.esearchresult.idlist || [];
    } catch (error) {
      console.error('PubMed search error:', error);
      throw new Error(`Failed to search PubMed: ${(error as any)?.message}`);
    }
  }

  /**
   * Fetch article details using PubMed's ESummary API
   */
  private async fetchArticleDetails(ids: string[]): Promise<RawContent[]> {
    if (ids.length === 0) return [];

    const params = new URLSearchParams({
      db: 'pubmed',
      id: ids.join(','),
      retmode: 'json',
    });

    try {
      const response = await axios.get(
        `${this.baseUrl}/esummary.fcgi?${params.toString()}`,
        { timeout: 30000 }
      );

      const result = response.data.result;

      const articles: RawContent[] = [];

      for (const id of ids) {
        const article = result[id];

        if (!article || article.error) {
          continue;
        }

        // Extract DOI for URL
        const doi = article.articleids?.find((aid: any) => aid.idtype === 'doi')?.value;
        const pmid = article.articleids?.find((aid: any) => aid.idtype === 'pubmed')?.value;

        // Build URL (prefer DOI, fallback to PubMed link)
        const url = doi
          ? `https://doi.org/${doi}`
          : `https://pubmed.ncbi.nlm.nih.gov/${pmid || id}/`;

        // Extract author names
        const authors = article.authors
          ?.map((a: any) => a.name)
          .join(', ') || 'Unknown';

        // Parse publication date
        const pubDate = this.parseDate(article.pubdate || article.sortpubdate);

        articles.push({
          externalId: pmid || id,
          title: article.title,
          description: article.source || article.fulljournalname,
          url: url,
          author: authors,
          publishedAt: pubDate,
          language: 'en',
          metadata: {
            pmid: pmid || id,
            doi: doi,
            journal: article.fulljournalname,
            pub_type: article.pubtype,
          },
          tags: this.extractMeshTerms(article),
        });
      }

      return articles;
    } catch (error) {
      console.error('PubMed fetch details error:', error);
      throw new Error(`Failed to fetch article details from PubMed: ${(error as any)?.message}`);
    }
  }

  private parseDate(dateStr: string): Date {
    // PubMed dates can be in various formats: "2023", "2023 May", "2023 May 15"
    try {
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  }

  private extractMeshTerms(article: any): string[] {
    // Extract MeSH (Medical Subject Headings) terms if available
    // This would require additional API calls to PubMed
    // For now, return empty array
    return [];
  }
}

export const pubmedSource = new PubMedSource();
