import type { SukitKernel } from '@sukit/core';
import type { SearchResult, SearchFilters, SearchDocument } from '../../types';

interface MeilisearchConfig {
  host: string;
  apiKey?: string;
  index?: string;
}

interface ElasticsearchConfig {
  node: string;
  apiKey?: string;
  index?: string;
}

interface AnalyticsEntry {
  query: string;
  results: number;
  userId: string;
  timestamp: string;
}

const CJK_LOCALES = new Set([
  'zh',
  'zh-CN',
  'zh-TW',
  'zh-HK',
  'zh-SG',
  'ja',
  'ja-JP',
  'ko',
  'ko-KR',
]);

export class SearchEngine {
  private kernel: SukitKernel;
  private index: Map<string, SearchDocument> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  private indexing = false;
  private provider: 'memory' | 'meilisearch' | 'elasticsearch' = 'memory';
  private providerClient: any = null;
  private connected = false;
  private analytics: AnalyticsEntry[] = [];
  private locale = 'en';

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  async connectMeilisearch(config: MeilisearchConfig): Promise<void> {
    const { MeiliSearch } = await import('meilisearch');
    this.providerClient = new MeiliSearch({
      host: config.host,
      apiKey: config.apiKey,
    });
    await this.providerClient.health();
    this.connected = true;
  }

  async connectElasticsearch(config: ElasticsearchConfig): Promise<void> {
    const { Client } = await import('@elastic/elasticsearch');
    this.providerClient = new Client({
      node: config.node,
      auth: config.apiKey ? { apiKey: config.apiKey } : undefined,
    });
    await this.providerClient.ping();
    this.connected = true;
  }

  setProvider(provider: 'memory' | 'meilisearch' | 'elasticsearch'): void {
    if (provider !== 'memory' && !this.connected) {
      throw new Error(
        `Cannot switch to ${provider}: not connected. Call connect${provider.charAt(0).toUpperCase() + provider.slice(1)}() first.`
      );
    }
    this.provider = provider;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    if (this.providerClient?.close) {
      await this.providerClient.close();
    }
    this.providerClient = null;
    this.connected = false;
    this.provider = 'memory';
  }

  async indexContent(content: {
    id: string;
    siteId: string;
    siteName: string;
    title: string;
    slug: string;
    body: string;
    tags?: string[];
    author?: string;
    status?: string;
  }): Promise<void> {
    const doc: SearchDocument = {
      id: content.id,
      siteId: content.siteId,
      siteName: content.siteName,
      title: content.title,
      slug: content.slug,
      content: content.body,
      tags: content.tags || [],
      author: content.author || 'unknown',
      status: content.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.provider !== 'memory' && this.connected) {
      const indexName = `${this.provider}_pages`;
      if (this.provider === 'meilisearch') {
        await this.providerClient.index(indexName).addDocuments([doc]);
      } else if (this.provider === 'elasticsearch') {
        await this.providerClient.index({
          index: indexName,
          id: doc.id,
          body: doc,
          refresh: 'wait_for',
        });
      }
      return;
    }

    this.index.set(doc.id, doc);
    const terms = this.tokenize(
      `${doc.title} ${doc.content} ${doc.tags.join(' ')} ${doc.author}`
    );
    for (const term of terms) {
      if (!this.invertedIndex.has(term))
        this.invertedIndex.set(term, new Set());
      this.invertedIndex.get(term)!.add(doc.id);
    }
  }

  async removeFromIndex(id: string): Promise<void> {
    if (this.provider !== 'memory' && this.connected) {
      const indexName = `${this.provider}_pages`;
      if (this.provider === 'meilisearch') {
        await this.providerClient.index(indexName).deleteDocument(id);
      } else if (this.provider === 'elasticsearch') {
        await this.providerClient.delete({
          index: indexName,
          id,
          refresh: 'wait_for',
        });
      }
      return;
    }

    const doc = this.index.get(id);
    if (!doc) return;
    const terms = this.tokenize(`${doc.title} ${doc.content}`);
    for (const term of terms) this.invertedIndex.get(term)?.delete(id);
    this.index.delete(id);
  }

  async search(
    query: string,
    filters?: SearchFilters,
    tolerance?: number,
    facets?: string[]
  ): Promise<SearchResult> {
    if (this.provider !== 'memory' && this.connected) {
      return this.searchProvider(query, filters, tolerance, facets);
    }

    const terms = this.tokenize(query);
    if (terms.length === 0) return { hits: [], total: 0, query };

    let docIds: Set<string> | null = null;
    for (const term of terms) {
      let matching = this.invertedIndex.get(term) || new Set();

      if (tolerance && tolerance > 0) {
        for (const [idxTerm] of this.invertedIndex) {
          if (
            idxTerm !== term &&
            this.levenshtein(term, idxTerm) <= tolerance
          ) {
            const similar = this.invertedIndex.get(idxTerm)!;
            matching = new Set([...matching, ...similar]);
          }
        }
      }

      docIds = docIds
        ? new Set([...docIds].filter((id) => matching.has(id)))
        : new Set(matching);
    }

    let docs = Array.from(docIds || [])
      .map((id) => this.index.get(id)!)
      .filter(Boolean);
    if (filters?.siteId) docs = docs.filter((d) => d.siteId === filters.siteId);
    if (filters?.status) docs = docs.filter((d) => d.status === filters.status);
    if (filters?.author) docs = docs.filter((d) => d.author === filters.author);
    if (filters?.tags?.length)
      docs = docs.filter((d) => filters.tags!.some((t) => d.tags.includes(t)));
    if (filters?.dateFrom)
      docs = docs.filter(
        (d) => new Date(d.createdAt) >= new Date(filters.dateFrom!)
      );
    if (filters?.dateTo)
      docs = docs.filter(
        (d) => new Date(d.createdAt) <= new Date(filters.dateTo!)
      );

    docs.sort((a, b) => this.score(b, query) - this.score(a, query));
    const total = docs.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    docs = docs.slice(offset, offset + limit);

    const facetDistribution: Record<string, Record<string, number>> = {};
    if (facets?.length) {
      const allDocs = Array.from(this.index.values());
      for (const field of facets) {
        const counts: Record<string, number> = {};
        for (const doc of allDocs) {
          const val = (doc as any)[field];
          if (val !== undefined && val !== null) {
            const key = Array.isArray(val) ? val : String(val);
            if (Array.isArray(val)) {
              for (const v of val) {
                const sk = String(v);
                counts[sk] = (counts[sk] || 0) + 1;
              }
            } else {
              counts[key] = (counts[key] || 0) + 1;
            }
          }
        }
        if (Object.keys(counts).length > 0) {
          facetDistribution[field] = counts;
        }
      }
    }

    return {
      hits: docs.map((d) => ({
        id: d.id,
        title: d.title,
        excerpt: d.content.substring(0, 200),
        siteId: d.siteId,
        siteName: d.siteName,
        slug: d.slug,
        score: this.score(d, query),
        highlights: {
          title: this.highlight(d.title, terms),
          content: this.highlight(d.content, terms),
        },
      })),
      total,
      query,
      facetDistribution:
        Object.keys(facetDistribution).length > 0
          ? facetDistribution
          : undefined,
    };
  }

  private async searchProvider(
    query: string,
    filters?: SearchFilters,
    tolerance?: number,
    facets?: string[]
  ): Promise<SearchResult> {
    const indexName = `${this.provider}_pages`;

    if (this.provider === 'meilisearch') {
      const filterParts: string[] = [];
      if (filters?.siteId) filterParts.push(`siteId = ${filters.siteId}`);
      if (filters?.status) filterParts.push(`status = ${filters.status}`);
      if (filters?.author) filterParts.push(`author = ${filters.author}`);

      const result = await this.providerClient.index(indexName).search(query, {
        filter: filterParts.length > 0 ? filterParts.join(' AND ') : undefined,
        offset: filters?.offset || 0,
        limit: filters?.limit || 20,
        facets: facets,
        attributesToHighlight: ['title', 'content'],
      });

      const hits = (result.hits || []).map((h: any) => ({
        id: h.id,
        title: h.title,
        excerpt: (h.content || '').substring(0, 200),
        siteId: h.siteId,
        siteName: h.siteName,
        slug: h.slug,
        score: h._rankingScore ?? 0,
        highlights: {
          title:
            h._formatted?.title ||
            this.highlight(h.title || '', this.tokenize(query)),
          content:
            h._formatted?.content ||
            this.highlight(h.content || '', this.tokenize(query)),
        },
      }));

      const facetDistribution: Record<string, Record<string, number>> = {};
      if (result.facetDistribution) {
        for (const [field, counts] of Object.entries(
          result.facetDistribution
        )) {
          facetDistribution[field] = counts as Record<string, number>;
        }
      }

      return {
        hits,
        total: result.estimatedTotalHits ?? result.nbHits ?? hits.length,
        query,
        facetDistribution:
          Object.keys(facetDistribution).length > 0
            ? facetDistribution
            : undefined,
      };
    }

    if (this.provider === 'elasticsearch') {
      const must: any[] = [
        {
          multi_match: {
            query,
            fields: ['title^10', 'content', 'tags^5', 'author'],
            fuzziness: tolerance ? `${tolerance}` : 'AUTO',
          },
        },
      ];

      const filterClauses: any[] = [];
      if (filters?.siteId)
        filterClauses.push({ term: { siteId: filters.siteId } });
      if (filters?.status)
        filterClauses.push({ term: { status: filters.status } });
      if (filters?.author)
        filterClauses.push({ term: { author: filters.author } });
      if (filters?.dateFrom)
        filterClauses.push({ range: { createdAt: { gte: filters.dateFrom } } });
      if (filters?.dateTo)
        filterClauses.push({ range: { createdAt: { lte: filters.dateTo } } });

      const body: any = {
        query: {
          bool: {
            must,
            filter: filterClauses.length > 0 ? filterClauses : undefined,
          },
        },
        from: filters?.offset || 0,
        size: filters?.limit || 20,
        highlight: {
          fields: { title: {}, content: {} },
        },
      };

      if (facets?.length) {
        body.aggs = {};
        for (const field of facets) {
          body.aggs[field] = { terms: { field } };
        }
      }

      const result = await this.providerClient.search({
        index: indexName,
        body,
      });

      const hits = (result.hits?.hits || []).map((h: any) => ({
        id: h._id,
        title: h._source.title,
        excerpt: (h._source.content || '').substring(0, 200),
        siteId: h._source.siteId,
        siteName: h._source.siteName,
        slug: h._source.slug,
        score: h._score ?? 0,
        highlights: {
          title:
            h.highlight?.title?.[0] ||
            this.highlight(h._source.title || '', this.tokenize(query)),
          content:
            h.highlight?.content?.[0] ||
            this.highlight(h._source.content || '', this.tokenize(query)),
        },
      }));

      const facetDistribution: Record<string, Record<string, number>> = {};
      if (result.aggregations) {
        for (const [field, agg] of Object.entries(result.aggregations)) {
          const buckets = (agg as any).buckets || [];
          facetDistribution[field] = {};
          for (const bucket of buckets) {
            facetDistribution[field][bucket.key] = bucket.doc_count;
          }
        }
      }

      return {
        hits,
        total:
          typeof result.hits?.total === 'object'
            ? result.hits.total.value
            : (result.hits?.total ?? hits.length),
        query,
        facetDistribution:
          Object.keys(facetDistribution).length > 0
            ? facetDistribution
            : undefined,
      };
    }

    return { hits: [], total: 0, query };
  }

  async indexFromPrisma(kernel: SukitKernel): Promise<{
    total: number;
    duration: number;
  }> {
    const start = Date.now();
    let count = 0;

    const sites = await kernel.sites.list();
    for (const site of sites) {
      const pages = await kernel.pages.list(site.id);
      for (const page of pages) {
        const body =
          page.settings?.content ||
          page.sections
            ?.map((s: any) => (typeof s === 'string' ? s : s.content || ''))
            .filter(Boolean)
            .join(' ') ||
          '';

        await this.indexContent({
          id: page.id,
          siteId: site.id,
          siteName: site.name,
          title: page.title,
          slug: page.slug,
          body,
          tags: page.settings?.tags || [],
          author: page.settings?.author || 'unknown',
          status: page.settings?.status || 'published',
        });
        count++;
      }
    }

    return { total: count, duration: Date.now() - start };
  }

  trackSearch(query: string, results: number, userId: string): void {
    this.analytics.push({
      query,
      results,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  getPopularQueries(limit = 10): { query: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const entry of this.analytics) {
      counts.set(entry.query, (counts.get(entry.query) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  getNoResultQueries(): { query: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const entry of this.analytics) {
      if (entry.results === 0) {
        counts.set(entry.query, (counts.get(entry.query) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([query, count]) => ({
      query,
      count,
    }));
  }

  setLanguage(locale: string): void {
    this.locale = locale;
  }

  getFacets(field: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const doc of this.index.values()) {
      const val = (doc as any)[field];
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          for (const v of val) {
            const key = String(v);
            counts[key] = (counts[key] || 0) + 1;
          }
        } else {
          const key = String(val);
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }
    return counts;
  }

  async suggest(query: string, limit = 5): Promise<string[]> {
    if (this.provider !== 'memory' && this.connected) {
      const indexName = `${this.provider}_pages`;
      if (this.provider === 'meilisearch') {
        const result = await this.providerClient
          .index(indexName)
          .search(query, {
            limit: 0,
            attributesToRetrieve: [],
            showMatchesPosition: false,
            facets: [],
          });
        return [];
      }
    }

    const terms = this.tokenize(query);
    if (terms.length === 0) return [];
    const lastTerm = terms[terms.length - 1];
    const suggestions = new Set<string>();
    for (const [term] of this.invertedIndex) {
      if (term.startsWith(lastTerm) && term !== lastTerm) {
        suggestions.add(term);
        if (suggestions.size >= limit) break;
      }
    }
    return Array.from(suggestions);
  }

  async reindexAll(): Promise<{ total: number; duration: number }> {
    const start = Date.now();
    this.index.clear();
    this.invertedIndex.clear();

    const pages = [];
    let count = 0;
    for (const page of pages) {
      await this.indexContent(page);
      count++;
    }

    return { total: count, duration: Date.now() - start };
  }

  getIndexStats(): {
    totalDocuments: number;
    totalTerms: number;
    averageContentLength: number;
  } {
    const docs = Array.from(this.index.values());
    return {
      totalDocuments: docs.length,
      totalTerms: this.invertedIndex.size,
      averageContentLength: docs.length
        ? Math.round(
            docs.reduce((a, d) => a + d.content.length, 0) / docs.length
          )
        : 0,
    };
  }

  private score(doc: SearchDocument, query: string): number {
    const queryTerms = this.tokenize(query);
    let score = 0;
    for (const term of queryTerms) {
      if (doc.title.toLowerCase().includes(term)) score += 10;
      if (doc.tags.some((t) => t.includes(term))) score += 5;
      if (doc.content.toLowerCase().includes(term)) score += 1;
    }
    return score;
  }

  private tokenize(text: string): string[] {
    if (CJK_LOCALES.has(this.locale)) {
      return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .split(/\s+/)
        .filter(Boolean);
    }
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  }

  private highlight(text: string, terms: string[]): string {
    let result = text.substring(0, 300);
    for (const term of terms) {
      const regex = new RegExp(`(${term})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    }
    return result;
  }

  private levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      new Array(n + 1).fill(0)
    );
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] =
          a[i - 1] === b[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }
}
