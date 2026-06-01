import type { SukitKernel } from '@sukit/core';
import type {
  MarketplaceModuleData,
  ModuleVersionData,
  ModuleSearchOptions,
  ModuleSearchResult,
} from './types';

export class ModuleRegistry {
  private kernel: SukitKernel;
  private modulesCache: Map<string, MarketplaceModuleData> = new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ─── CRUD Operations ──────────────────────────────────────────

  async getModule(moduleId: string): Promise<MarketplaceModuleData | null> {
    const cached = this.modulesCache.get(moduleId);
    if (cached) return cached;

    const module = await this.fetchJson<MarketplaceModuleData | null>(
      `/api/marketplace/modules/${moduleId}`
    );
    if (module) this.modulesCache.set(moduleId, module);
    return module;
  }

  async listModules(options?: {
    category?: string;
    status?: string;
    authorId?: string;
    featured?: boolean;
    staffPick?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<ModuleSearchResult> {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.status) params.set('status', options.status);
    if (options?.authorId) params.set('authorId', options.authorId);
    if (options?.featured) params.set('featured', 'true');
    if (options?.staffPick) params.set('staffPick', 'true');
    params.set('page', String(options?.page ?? 1));
    params.set('pageSize', String(options?.pageSize ?? 20));

    return this.fetchJson<ModuleSearchResult>(
      `/api/marketplace/modules?${params}`
    );
  }

  async searchModules(
    options: ModuleSearchOptions
  ): Promise<ModuleSearchResult> {
    const params = new URLSearchParams();
    if (options.query) params.set('query', options.query);
    if (options.category) params.set('category', options.category);
    if (options.tags?.length) params.set('tags', options.tags.join(','));
    if (options.priceModel) params.set('priceModel', options.priceModel);
    if (options.minRating) params.set('minRating', String(options.minRating));
    if (options.sukVersion) params.set('sukVersion', options.sukVersion);
    if (options.sortBy) params.set('sortBy', options.sortBy);
    if (options.sortOrder) params.set('sortOrder', options.sortOrder);
    params.set('page', String(options.page ?? 1));
    params.set('pageSize', String(options.pageSize ?? 20));

    return this.fetchJson<ModuleSearchResult>(
      `/api/marketplace/search?${params}`
    );
  }

  async getVersions(moduleId: string): Promise<ModuleVersionData[]> {
    return this.fetchJson<ModuleVersionData[]>(
      `/api/marketplace/modules/${moduleId}/versions`
    );
  }

  async getFeaturedModules(): Promise<MarketplaceModuleData[]> {
    return this.fetchJson<MarketplaceModuleData[]>('/api/marketplace/featured');
  }

  async getPopularModules(): Promise<MarketplaceModuleData[]> {
    return this.fetchJson<MarketplaceModuleData[]>('/api/marketplace/popular');
  }

  async getNewModules(): Promise<MarketplaceModuleData[]> {
    return this.fetchJson<MarketplaceModuleData[]>('/api/marketplace/new');
  }

  // ─── Dependency Management ─────────────────────────────────────

  async getDependencyGraph(moduleId: string): Promise<{
    module: MarketplaceModuleData;
    dependencies: { module: MarketplaceModuleData; optional: boolean }[];
    dependents: MarketplaceModuleData[];
  }> {
    return this.fetchJson(`/api/marketplace/modules/${moduleId}/dependencies`);
  }

  async checkDependencies(
    moduleId: string,
    version?: string
  ): Promise<{
    resolved: string[];
    missing: string[];
    conflicts: string[];
    circular: string[];
  }> {
    const params = version ? `?version=${version}` : '';
    return this.fetchJson(
      `/api/marketplace/modules/${moduleId}/dependencies/check${params}`
    );
  }

  async resolveDependencies(
    moduleId: string,
    version?: string
  ): Promise<{
    modules: { moduleId: string; version: string; optional: boolean }[];
    unresolved: string[];
  }> {
    const params = version ? `?version=${version}` : '';
    return this.fetchJson(
      `/api/marketplace/modules/${moduleId}/dependencies/resolve${params}`
    );
  }

  // ─── Categories & Metadata ─────────────────────────────────────

  async getCategories(): Promise<{ category: string; count: number }[]> {
    return this.fetchJson('/api/marketplace/categories');
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    return this.fetchJson(
      `/api/marketplace/search/suggestions?q=${encodeURIComponent(query)}`
    );
  }

  // ─── Admin Operations ──────────────────────────────────────────

  async setFeatured(moduleId: string, featured: boolean): Promise<void> {
    await this.fetchJson(`/api/admin/marketplace/modules/${moduleId}/feature`, {
      method: 'PUT',
      body: JSON.stringify({ featured }),
    });
  }

  async deleteModule(moduleId: string): Promise<void> {
    await this.fetchJson(`/api/admin/marketplace/modules/${moduleId}`, {
      method: 'DELETE',
    });
  }

  async getAnalytics(): Promise<{
    totalModules: number;
    totalDownloads: number;
    totalRevenue: number;
    totalDevelopers: number;
    modulesByCategory: Record<string, number>;
    downloadsByDay: { date: string; count: number }[];
  }> {
    return this.fetchJson('/api/admin/marketplace/stats');
  }

  // ─── Internal Helpers ──────────────────────────────────────────

  invalidateCache(moduleId?: string): void {
    if (moduleId) {
      this.modulesCache.delete(moduleId);
    } else {
      this.modulesCache.clear();
    }
  }

  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `Request failed: ${res.status}`);
    }
    return res.json();
  }
}
