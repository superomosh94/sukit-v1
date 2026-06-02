'use client';

import { useState, useEffect } from 'react';

export default function SEOPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [summary, setSummary] = useState({ seoScore: 0, issues: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/seo/stats');
        const data = await res.json();
        setSites(data.sites ?? []);
        setSummary(data.summary ?? { seoScore: 0, issues: 0, pages: 0 });
      } catch {
        setSites([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const issuesList = sites.flatMap((site: any) =>
    site.issues > 0
      ? [
          {
            site: site.name,
            issue: `${site.issues} SEO issues found`,
            impact: site.seoScore < 50 ? 'high' : ('medium' as const),
          },
        ]
      : []
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">SEO</h1>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">SEO</h1>
      <p className="text-sm text-gray-500 mt-1">
        Optimize your sites for search engines.
      </p>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">SEO Score</p>
          <p className="text-2xl font-bold text-gray-900">{summary.seoScore}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Issues</p>
          <p className="text-2xl font-bold text-amber-600">{summary.issues}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Pages</p>
          <p className="text-2xl font-bold text-gray-900">{summary.pages}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Sites</p>
          <p className="text-2xl font-bold text-gray-900">{sites.length}</p>
        </div>
      </div>
      {sites.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b font-semibold text-sm">
            Sites Overview
          </div>
          {sites.map((site: any) => (
            <div
              key={site.id}
              className="px-4 py-3 border-b border-gray-100 flex items-center justify-between text-sm"
            >
              <span className="font-medium text-gray-900">{site.name}</span>
              <div className="flex items-center gap-4 text-xs">
                <span>Score: {site.seoScore}</span>
                <span
                  className={
                    site.issues > 0 ? 'text-amber-600' : 'text-green-600'
                  }
                >
                  {site.issues} issues
                </span>
                <span>{site.pages} pages</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {issuesList.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b font-semibold text-sm">
            Issues to Fix
          </div>
          {issuesList.map((item, i) => (
            <div
              key={i}
              className="px-4 py-3 border-b border-gray-100 flex items-center justify-between text-sm"
            >
              <div>
                <span className="font-medium text-gray-900">{item.issue}</span>
                <span className="text-gray-500 ml-2">{item.site}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${item.impact === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
              >
                {item.impact}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
