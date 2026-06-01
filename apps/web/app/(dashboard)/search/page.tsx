'use client';

import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<
    {
      id: string;
      title: string;
      excerpt: string;
      siteId: string;
      siteName: string;
    }[]
  >([]);

  async function handleSearch() {
    if (!query.trim()) return;
    const res = await fetch(
      `/api/marketplace/search?query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setResults(data.modules || []);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Search</h1>
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search sites, pages, modules..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          Search
        </button>
      </div>
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-medium text-gray-900">{r.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{r.excerpt}</p>
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && query && (
        <p className="text-sm text-gray-500 text-center py-8">
          No results for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
