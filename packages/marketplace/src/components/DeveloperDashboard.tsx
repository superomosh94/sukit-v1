'use client';

import { useState } from 'react';
import type { DeveloperDashboardStats, MarketplaceModuleData } from '../types';

interface DeveloperDashboardProps {
  stats: DeveloperDashboardStats | null;
  modules: MarketplaceModuleData[];
  loading?: boolean;
  onCreateModule?: () => void;
  onEditModule?: (moduleId: string) => void;
  onSubmitModule?: (moduleId: string) => void;
}

export function DeveloperDashboard({
  stats,
  modules,
  loading,
  onCreateModule,
  onEditModule,
  onSubmitModule,
}: DeveloperDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'modules' | 'revenue'
  >('overview');

  if (loading || !stats) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Developer Dashboard
        </h1>
        <button
          onClick={onCreateModule}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Module
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(['overview', 'modules', 'revenue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Modules" value={stats.totalModules} />
            <StatCard
              label="Published"
              value={stats.publishedModules}
              color="green"
            />
            <StatCard
              label="Total Downloads"
              value={stats.totalDownloads.toLocaleString()}
            />
            <StatCard
              label="Avg. Rating"
              value={stats.averageRating.toFixed(1)}
            />
            <StatCard
              label="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              color="green"
            />
            <StatCard label="MRR" value={`$${stats.mrr.toLocaleString()}`} />
            <StatCard
              label="Revenue This Month"
              value={`$${stats.revenueThisMonth.toLocaleString()}`}
              color="green"
            />
            <StatCard
              label="Revenue Growth"
              value={`${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%`}
              color={stats.revenueGrowth >= 0 ? 'green' : 'red'}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Installs
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Today</span>
                  <span className="font-medium">{stats.installsToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">This Week</span>
                  <span className="font-medium">{stats.installsThisWeek}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">This Month</span>
                  <span className="font-medium">{stats.installsThisMonth}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Engagement
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reviews</span>
                  <span className="font-medium">{stats.reviewCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Open Tickets</span>
                  <span className="font-medium">{stats.openTickets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Churn Rate</span>
                  <span className="font-medium">{stats.churnRate}%</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Payouts
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Unpaid Earnings</span>
                  <span className="font-medium text-green-600">
                    ${stats.unpaidEarnings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending Submissions</span>
                  <span className="font-medium">
                    {stats.pendingSubmissions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'modules' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Module
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Version
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Downloads
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Rating
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{m.name}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">v{m.version}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {m.downloads.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {m.rating.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {m.price
                      ? `$${(m.downloads * m.price).toLocaleString()}`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEditModule?.(m.moduleId)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        Edit
                      </button>
                      {m.status === 'draft' && (
                        <button
                          onClick={() => onSubmitModule?.(m.moduleId)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {modules.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-gray-500 text-sm"
                  >
                    No modules yet. Click "+ New Module" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Revenue Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="text-lg font-bold text-gray-900">
                  ${stats.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Monthly Recurring Revenue (MRR)
                </span>
                <span className="text-lg font-bold text-gray-900">
                  ${stats.mrr.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span
                  className={`text-lg font-bold ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {stats.revenueGrowth >= 0 ? '+' : ''}
                  {stats.revenueGrowth}%
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Unpaid Earnings (available for payout)
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    ${stats.unpaidEarnings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                View detailed sales report
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                Export revenue data (CSV)
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                Update payout information
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                View payout history
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color = 'gray',
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  const colors: Record<string, string> = {
    gray: 'text-gray-900',
    green: 'text-green-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold mt-1 ${colors[color] || colors.gray}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    in_review: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    changes_requested: 'bg-orange-100 text-orange-700',
    deprecated: 'bg-gray-200 text-gray-500',
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
