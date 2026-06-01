'use client';

import type { MarketplaceModuleData } from '../types';
import { RatingStars } from './RatingStars';

interface ModuleCardProps {
  module: MarketplaceModuleData;
  onInstall?: (moduleId: string) => void;
  onDetail?: (moduleId: string) => void;
  compact?: boolean;
}

export function ModuleCard({
  module,
  onInstall,
  onDetail,
  compact = false,
}: ModuleCardProps) {
  return (
    <div
      className={`group relative bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer ${compact ? 'p-3' : 'p-4'}`}
      onClick={() => onDetail?.(module.moduleId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onDetail?.(module.moduleId)}
    >
      {module.featured && (
        <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          Featured
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {module.icon ? (
            <img
              src={module.icon}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-6 h-6 text-gray-400"
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

        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}
          >
            {module.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{module.authorName}</p>
          {!compact && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {module.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <RatingStars rating={module.rating} size="sm" />
            <span className="text-xs text-gray-400">
              {module.downloads.toLocaleString()} downloads
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {module.category}
          </span>
          <span className="text-xs text-gray-400">v{module.version}</span>
        </div>
        <div className="flex items-center gap-2">
          {module.price != null && module.price > 0 ? (
            <span className="text-sm font-semibold text-gray-900">
              ${module.price}
            </span>
          ) : (
            <span className="text-sm font-medium text-green-600">Free</span>
          )}
          {onInstall && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInstall(module.moduleId);
              }}
              className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors opacity-0 group-hover:opacity-100"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
