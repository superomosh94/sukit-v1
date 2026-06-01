'use client';

import { useState } from 'react';
import type { PriceModel } from '../types';

interface ModuleFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  priceModel: PriceModel | '';
  minRating: number;
  freeOnly: boolean;
  tags: string[];
  compatibleOnly: boolean;
}

const priceModels: { value: PriceModel | ''; label: string }[] = [
  { value: '', label: 'Any Price' },
  { value: 'free', label: 'Free' },
  { value: 'one-time', label: 'One-Time' },
  { value: 'subscription', label: 'Subscription' },
];

const popularTags = [
  'analytics',
  'contact-form',
  'social-media',
  'payment',
  'ai',
  'chat',
  'calendar',
  'maps',
  'newsletter',
];

export function ModuleFilter({ onFilterChange }: ModuleFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceModel: '',
    minRating: 0,
    freeOnly: false,
    tags: [],
    compatibleOnly: false,
  });

  const [expanded, setExpanded] = useState(true);

  function updateFilter(partial: Partial<FilterState>) {
    const next = { ...filters, ...partial };
    setFilters(next);
    onFilterChange(next);
  }

  function toggleTag(tag: string) {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilter({ tags });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-900"
      >
        Filters
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
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

      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700">
              Price Model
            </label>
            <select
              value={filters.priceModel}
              onChange={(e) =>
                updateFilter({ priceModel: e.target.value as PriceModel | '' })
              }
              className="mt-1 w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
            >
              {priceModels.map((pm) => (
                <option key={pm.value} value={pm.value}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">
              Minimum Rating
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={filters.minRating}
                onChange={(e) =>
                  updateFilter({ minRating: parseFloat(e.target.value) })
                }
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-8">
                {filters.minRating}+
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.freeOnly}
              onChange={(e) => updateFilter({ freeOnly: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Free only</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.compatibleOnly}
              onChange={(e) =>
                updateFilter({ compatibleOnly: e.target.checked })
              }
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Compatible only</span>
          </label>

          <div>
            <label className="text-xs font-medium text-gray-700">Tags</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${filters.tags.includes(tag) ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              const reset: FilterState = {
                priceModel: '',
                minRating: 0,
                freeOnly: false,
                tags: [],
                compatibleOnly: false,
              };
              setFilters(reset);
              onFilterChange(reset);
            }}
            className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
