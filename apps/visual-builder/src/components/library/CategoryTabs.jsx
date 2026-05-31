import React from 'react';
import { cn } from '../../utils/cn';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'layout', label: 'Layout' },
  { key: 'typography', label: 'Typography' },
  { key: 'media', label: 'Media' },
  { key: 'forms', label: 'Forms' },
  { key: 'data', label: 'Data' },
  { key: 'navigation', label: 'Navigation' },
  { key: 'ecommerce', label: 'E‑commerce' },
];

const CategoryTabs = ({ active, onSelect }) => (
  <div className={cn('flex space-x-2 overflow-x-auto pb-2')}>
    {categories.map(cat => (
      <button
        key={cat.key}
        className={cn(
          'px-4 py-1 rounded-full whitespace-nowrap',
          active === cat.key ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-primary hover:bg-surface-light'
        )}
        onClick={() => onSelect(cat.key)}
      >
        {cat.label}
      </button>
    ))}
  </div>
);

export default CategoryTabs;
