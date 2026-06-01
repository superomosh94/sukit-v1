'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ModuleSearchOptions, ModuleCategory } from '../types';

interface ModuleSearchProps {
  onSearch: (options: ModuleSearchOptions) => void;
  suggestions?: string[];
  loading?: boolean;
}

const categories: { value: ModuleCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'seo', label: 'SEO' },
  { value: 'forms', label: 'Forms' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'media', label: 'Media' },
  { value: 'social', label: 'Social' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'content', label: 'Content' },
  { value: 'performance', label: 'Performance' },
  { value: 'security', label: 'Security' },
  { value: 'ai', label: 'AI' },
  { value: 'automation', label: 'Automation' },
  { value: 'integration', label: 'Integration' },
  { value: 'theme', label: 'Theme' },
  { value: 'tool', label: 'Tool' },
];

export function ModuleSearch({
  onSearch,
  suggestions = [],
  loading,
}: ModuleSearchProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ModuleCategory | ''>('');
  const [sortBy, setSortBy] =
    useState<ModuleSearchOptions['sortBy']>('relevance');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(() => {
    onSearch({
      query: query || undefined,
      category: category || undefined,
      sortBy,
      page: 1,
      pageSize: 20,
    });
  }, [query, category, sortBy, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div ref={searchRef} className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search modules..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            {showSuggestions && suggestions.length > 0 && query && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(s);
                      setShowSuggestions(false);
                      onSearch({
                        query: s,
                        category: category || undefined,
                        sortBy,
                        page: 1,
                      });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as ModuleCategory | '');
              onSearch({
                query: query || undefined,
                category: (e.target.value || undefined) as
                  | ModuleCategory
                  | undefined,
                sortBy,
                page: 1,
              });
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as ModuleSearchOptions['sortBy']);
              onSearch({
                query: query || undefined,
                category: category || undefined,
                sortBy: e.target.value as ModuleSearchOptions['sortBy'],
                page: 1,
              });
            }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="relevance">Relevance</option>
            <option value="downloads">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="price">Price</option>
            <option value="trending">Trending</option>
          </select>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  );
}
