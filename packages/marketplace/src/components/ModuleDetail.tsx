'use client';

import { useState } from 'react';
import type { MarketplaceModuleData, ModuleVersionData } from '../types';
import { RatingStars } from './RatingStars';
import { InstallButton } from './InstallButton';

interface ModuleDetailProps {
  module: MarketplaceModuleData;
  versions?: ModuleVersionData[];
  onInstall: (moduleId: string, options?: { version?: string }) => void;
  onReport?: () => void;
}

export function ModuleDetail({
  module,
  versions = [],
  onInstall,
  onReport,
}: ModuleDetailProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>();
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {module.banner && (
          <div className="h-48 bg-gray-100 overflow-hidden">
            <img
              src={module.banner}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
              {module.icon ? (
                <img
                  src={module.icon}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {module.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                by {module.authorName} &middot; v{module.version}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <RatingStars rating={module.rating} size="md" />
                <span className="text-sm text-gray-500">
                  {module.ratingCount} review
                  {module.ratingCount !== 1 ? 's' : ''}
                </span>
                <span className="text-sm text-gray-500">
                  {module.downloads.toLocaleString()} downloads
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              {module.price != null && module.price > 0 ? (
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${module.price}
                  </div>
                  {module.subscriptionPriceMonthly && (
                    <div className="text-sm text-gray-500">
                      or ${module.subscriptionPriceMonthly}/mo
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-lg font-semibold text-green-600">
                  Free
                </span>
              )}
            </div>
          </div>

          {module.screenshots.length > 0 && (
            <div className="mt-6">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={module.screenshots[activeScreenshot]}
                  alt={`Screenshot ${activeScreenshot + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {module.screenshots.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {module.screenshots.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveScreenshot(i)}
                      className={`w-16 h-10 rounded overflow-hidden border-2 transition-colors ${i === activeScreenshot ? 'border-indigo-500' : 'border-transparent'}`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Description
              </h2>
              <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                {module.description}
              </p>

              {module.documentation && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Documentation
                  </h2>
                  <div className="mt-2 prose prose-sm max-w-none text-gray-600">
                    {module.documentation}
                  </div>
                </div>
              )}

              {versions.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Changelog
                  </h2>
                  <div className="mt-2 space-y-3">
                    {versions
                      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                      .slice(0, 5)
                      .map((v) => (
                        <div key={v.id} className="flex items-start gap-3">
                          <span
                            className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${v.isSecurityFix ? 'bg-red-100 text-red-700' : v.isBeta ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}
                          >
                            v{v.version}
                          </span>
                          <div>
                            <p className="text-sm text-gray-600">
                              {v.changelog || 'No changelog'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(v.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Installation
                </h3>
                <InstallButton
                  moduleId={module.moduleId}
                  price={module.price}
                  onInstall={(version) =>
                    onInstall(module.moduleId, { version })
                  }
                />
                {versions.length > 1 && (
                  <select
                    value={selectedVersion || module.version}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    className="mt-2 w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
                  >
                    {versions.map((v) => (
                      <option key={v.id} value={v.version}>
                        v{v.version} {v.isBeta ? '(Beta)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Requirements
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>SUKIT &ge; {module.minSukitVersion}</li>
                  {module.maxSukitVersion && (
                    <li>SUKIT &le; {module.maxSukitVersion}</li>
                  )}
                </ul>
              </div>

              {module.permissions.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Permissions
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {module.permissions.map((p) => (
                      <li key={p} className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {module.demoUrl && (
                  <a
                    href={module.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    &rarr; View Demo
                  </a>
                )}
                {module.documentation && (
                  <a
                    href={module.supportUrl || '#'}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    &rarr; Documentation
                  </a>
                )}
                {module.supportUrl && (
                  <a
                    href={module.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    &rarr; Get Support
                  </a>
                )}
                {module.sourceUrl && (
                  <a
                    href={module.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    &rarr; View Source
                  </a>
                )}
                {onReport && (
                  <button
                    onClick={onReport}
                    className="text-sm text-red-500 hover:text-red-700 text-left mt-2"
                  >
                    Report this module
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
