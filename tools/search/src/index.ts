import type { SukitKernel } from '@sukit/core';
import type { SearchResult, SearchFilters, SearchDocument } from '../../types';

export class SearchEngine {
  private kernel: SukitKernel;
  private index: Map<string, SearchDocument> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  private indexing = false;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
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
    const doc = this.index.get(id);
    if (!doc) return;
    const terms = this.tokenize(`${doc.title} ${doc.content}`);
    for (const term of terms) this.invertedIndex.get(term)?.delete(id);
    this.index.delete(id);
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult> {
    const terms = this.tokenize(query);
    if (terms.length === 0) return { hits: [], total: 0, query };

    let docIds: Set<string> | null = null;
    for (const term of terms) {
      const matching = this.invertedIndex.get(term) || new Set();
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
    };
  }

  async suggest(query: string, limit = 5): Promise<string[]> {
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
}
