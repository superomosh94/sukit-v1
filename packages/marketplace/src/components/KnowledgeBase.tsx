'use client';

import { useState } from 'react';
import type { KnowledgeBaseArticleData } from '../types';

interface KnowledgeBaseProps {
  articles: KnowledgeBaseArticleData[];
  categories: { name: string; count: number }[];
  onSearch: (query: string) => Promise<void>;
  onSelectArticle: (slug: string) => void;
  onVote: (articleId: string, helpful: boolean) => Promise<void>;
  loading?: boolean;
}

export function KnowledgeBase({
  articles,
  categories,
  onSearch,
  onSelectArticle,
  onVote,
  loading,
}: KnowledgeBaseProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? articles.filter((a) => a.category === activeCategory)
    : articles;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
        <p className="text-sm text-gray-500 mt-1">
          Find answers and guides for using SUKIT modules.
        </p>
      </div>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
          placeholder="Search the knowledge base..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-xs px-3 py-1.5 rounded-full border ${!activeCategory ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
        >
          All ({articles.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => setActiveCategory(c.name)}
            className={`text-xs px-3 py-1.5 rounded-full border ${activeCategory === c.name ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No articles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article.slug)}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <h3 className="text-sm font-medium text-gray-900">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {article.excerpt}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {article.category}
                </span>
                <span>{article.views} views</span>
                <span>{article.helpful} found helpful</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote(article.id, true);
                  }}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  Helpful
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote(article.id, false);
                  }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Not Helpful
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
