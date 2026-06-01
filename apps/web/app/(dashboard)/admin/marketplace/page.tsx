'use client';

import { useEffect, useState } from 'react';
import { useMarketplace, useMarketplaceStore } from '@sukit/marketplace';
import type { MarketplaceModuleData } from '@sukit/marketplace';

export default function AdminMarketplacePage() {
  const marketplace = useMarketplace();
  const { loading } = useMarketplaceStore();
  const [pendingModules, setPendingModules] = useState<MarketplaceModuleData[]>(
    []
  );
  const [tab, setTab] = useState<'pending' | 'approved' | 'reports'>('pending');

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    const result = await marketplace.registry.listModules({
      status: 'submitted',
    });
    setPendingModules(result.modules);
  }

  async function handleApprove(moduleId: string) {
    await marketplace.registry.setFeatured(moduleId, true);
    setPendingModules((prev) => prev.filter((m) => m.moduleId !== moduleId));
  }

  async function handleReject(moduleId: string) {
    await marketplace.registry.deleteModule(moduleId);
    setPendingModules((prev) => prev.filter((m) => m.moduleId !== moduleId));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage marketplace modules, reviews, and platform stats.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(['pending', 'approved', 'reports'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium border-b-2 ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'pending' && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Pending Submissions ({pendingModules.length})
          </h2>
          {pendingModules.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-lg border border-gray-200 p-4 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {m.name}
                  </h3>
                  <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  by {m.authorName} &middot; v{m.version} &middot; {m.category}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {m.description}
                </p>
                {m.permissions.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {m.permissions.map((p) => (
                      <span
                        key={p}
                        className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => handleApprove(m.moduleId)}
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(m.moduleId)}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {pendingModules.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              No pending submissions.
            </p>
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Modules</p>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Developers</p>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Downloads</p>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
        </div>
      )}
    </div>
  );
}
