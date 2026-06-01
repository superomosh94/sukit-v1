'use client';

import { useState } from 'react';

export default function SEOPage() {
  const [sites] = useState([
    { id: '1', name: 'My Blog', seoScore: 85, issues: 3, pages: 12 },
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">SEO</h1>
      <p className="text-sm text-gray-500 mt-1">
        Optimize your sites for search engines.
      </p>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">SEO Score</p>
          <p className="text-2xl font-bold text-gray-900">85</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Issues</p>
          <p className="text-2xl font-bold text-amber-600">3</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Pages</p>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Keywords</p>
          <p className="text-2xl font-bold text-gray-900">24</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b font-semibold text-sm">
          Issues to Fix
        </div>
        {[
          { issue: 'Missing meta description', page: '/about', impact: 'high' },
          {
            issue: 'Image missing alt text',
            page: '/blog/post-1',
            impact: 'medium',
          },
          { issue: 'Slow page load', page: '/', impact: 'high' },
        ].map((item, i) => (
          <div
            key={i}
            className="px-4 py-3 border-b border-gray-100 flex items-center justify-between text-sm"
          >
            <div>
              <span className="font-medium text-gray-900">{item.issue}</span>
              <span className="text-gray-500 ml-2">{item.page}</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${item.impact === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
            >
              {item.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
