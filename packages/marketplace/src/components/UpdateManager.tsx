'use client';

import { useState } from 'react';
import type { UpdateInfo, UpdateCheckResult } from '../types';

interface UpdateManagerProps {
  updates: UpdateCheckResult | null;
  onCheckForUpdates: () => Promise<void>;
  onUpdateModule: (
    moduleId: string,
    options?: { version?: string }
  ) => Promise<void>;
  onUpdateAll: () => Promise<void>;
  onRollback: (moduleId: string, version: string) => Promise<void>;
  updating?: string[];
  checking?: boolean;
}

export function UpdateManager({
  updates,
  onCheckForUpdates,
  onUpdateModule,
  onUpdateAll,
  onRollback,
  updating,
  checking,
}: UpdateManagerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Module Updates
          </h2>
          {updates && (
            <p className="text-sm text-gray-500 mt-0.5">
              {updates.totalCount} update{updates.totalCount !== 1 ? 's' : ''}{' '}
              available
              {updates.securityCount > 0 && (
                <span className="text-red-600 ml-1">
                  ({updates.securityCount} security update
                  {updates.securityCount !== 1 ? 's' : ''})
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCheckForUpdates}
            disabled={checking}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {checking ? 'Checking...' : 'Check for Updates'}
          </button>
          {updates && updates.totalCount > 0 && (
            <button
              onClick={onUpdateAll}
              disabled={updating?.length === updates.totalCount}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {updating?.length === updates.totalCount
                ? 'Updating...'
                : `Update All (${updates.totalCount})`}
            </button>
          )}
        </div>
      </div>

      {checking && (
        <div className="text-sm text-gray-500 flex items-center gap-2 py-4">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Checking for updates...
        </div>
      )}

      {updates && updates.totalCount === 0 && !checking && (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-green-400 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-gray-500">All modules are up to date.</p>
          <p className="text-xs text-gray-400 mt-1">
            Last checked: {new Date(updates.lastChecked).toLocaleString()}
          </p>
        </div>
      )}

      {updates && updates.updatesAvailable.length > 0 && (
        <div className="space-y-3">
          {updates.updatesAvailable.map((update) => (
            <div
              key={update.moduleId}
              className="bg-white rounded-lg border border-gray-200"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${update.isSecurityUpdate ? 'bg-red-500' : update.isBreaking ? 'bg-amber-500' : 'bg-blue-500'}`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {update.moduleName}
                        </h3>
                        {update.isSecurityUpdate && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                            Security
                          </span>
                        )}
                        {update.isBreaking && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                            Breaking
                          </span>
                        )}
                        {update.isBeta && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                            Beta
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {update.installedVersion} &rarr; {update.latestVersion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateModule(update.moduleId)}
                      disabled={updating?.includes(update.moduleId)}
                      className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {updating?.includes(update.moduleId)
                        ? 'Updating...'
                        : 'Update'}
                    </button>
                    <button
                      onClick={() =>
                        setExpanded(
                          expanded === update.moduleId ? null : update.moduleId
                        )
                      }
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${expanded === update.moduleId ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {expanded === update.moduleId && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {update.changelog && (
                      <div className="text-sm text-gray-600 mb-3">
                        {update.changelog}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium text-gray-700">Size:</span>{' '}
                        {(update.fileSize / 1024).toFixed(1)} KB
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Published:
                        </span>{' '}
                        {new Date(update.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {update.isBreaking && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-xs text-amber-800 font-medium">
                          Breaking Changes
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          This update may require changes to your site. We
                          recommend testing on a staging environment first.
                        </p>
                        <button
                          onClick={() => setScheduling(true)}
                          className="text-xs text-amber-700 underline mt-1 hover:text-amber-900"
                        >
                          Schedule update for off-hours
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {scheduling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Schedule Updates
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose when to apply pending updates.
            </p>
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  defaultChecked
                  className="text-indigo-600"
                />
                <span className="text-sm">Update now</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  className="text-indigo-600"
                />
                <span className="text-sm">Schedule for off-hours (2 AM)</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setScheduling(false)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setScheduling(false);
                  onUpdateAll();
                }}
                className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
