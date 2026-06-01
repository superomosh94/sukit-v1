'use client';

import { useState, useEffect } from 'react';
import type {
  MarketplaceModuleData,
  ModuleSearchOptions,
  ModuleSearchResult,
} from '../types';
import { ModuleCard } from './ModuleCard';
import { ModuleSearch } from './ModuleSearch';
import { ModuleFilter } from './ModuleFilter';
import type { FilterState } from './ModuleFilter';

interface MarketplaceHomeProps {
  onFetchModules?: (
    options: ModuleSearchOptions
  ) => Promise<ModuleSearchResult>;
  onFetchFeatured?: () => Promise<MarketplaceModuleData[]>;
  onFetchPopular?: () => Promise<MarketplaceModuleData[]>;
  onInstall?: (moduleId: string) => void;
  onDetail?: (moduleId: string) => void;
}

export function MarketplaceHome({
  onFetchModules,
  onFetchFeatured,
  onFetchPopular,
  onInstall,
  onDetail,
}: MarketplaceHomeProps) {
  const [featured, setFeatured] = useState<MarketplaceModuleData[]>([]);
  const [popular, setPopular] = useState<MarketplaceModuleData[]>([]);
  const [results, setResults] = useState<ModuleSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchOptions, setSearchOptions] = useState<ModuleSearchOptions>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [featuredData, popularData] = await Promise.all([
          onFetchFeatured?.(),
          onFetchPopular?.(),
        ]);
        if (featuredData) setFeatured(featuredData);
        if (popularData) setPopular(popularData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [onFetchFeatured, onFetchPopular]);

  function handleSearch(options: ModuleSearchOptions) {
    setSearchOptions(options);
    setLoading(true);
    onFetchModules?.(options)
      .then(setResults)
      .finally(() => setLoading(false));
  }

  function handleFilterChange(filters: FilterState) {
    handleSearch({
      ...searchOptions,
      priceModel: filters.priceModel || undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      category: filters.freeOnly ? undefined : searchOptions.category,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      page: 1,
    });
  }

  const displayModules = results?.modules || (searchOptions.query ? [] : null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-500 mt-1">
          Discover, install, and manage modules for your SUKIT site.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 space-y-4">
          <ModuleSearch onSearch={handleSearch} loading={loading} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded ${view === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="Grid view"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded ${view === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label="List view"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <ModuleFilter onFilterChange={handleFilterChange} />
        </div>

        <div className="flex-1 min-w-0">
          {displayModules ? (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
              }
            >
              {displayModules.map((m) => (
                <ModuleCard
                  key={m.id}
                  module={m}
                  onInstall={onInstall}
                  onDetail={onDetail}
                  compact={view === 'list'}
                />
              ))}
              {displayModules.length === 0 && (
                <p className="text-gray-500 text-sm col-span-full text-center py-12">
                  No modules found. Try adjusting your search or filters.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {featured.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Featured Modules
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.slice(0, 6).map((m) => (
                      <ModuleCard
                        key={m.id}
                        module={m}
                        onInstall={onInstall}
                        onDetail={onDetail}
                      />
                    ))}
                  </div>
                </section>
              )}

              {popular.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Popular Modules
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popular.slice(0, 6).map((m) => (
                      <ModuleCard
                        key={m.id}
                        module={m}
                        onInstall={onInstall}
                        onDetail={onDetail}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {results && results.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page {results.page} of {results.totalPages} ({results.total}{' '}
                results)
              </p>
              <div className="flex gap-2">
                <button
                  disabled={results.page <= 1}
                  onClick={() =>
                    handleSearch({ ...searchOptions, page: results.page - 1 })
                  }
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={results.page >= results.totalPages}
                  onClick={() =>
                    handleSearch({ ...searchOptions, page: results.page + 1 })
                  }
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
