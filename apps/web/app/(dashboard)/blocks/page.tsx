'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Grid3X3,
  List,
  Blocks,
  Puzzle,
} from 'lucide-react';

const ALL_BLOCKS = [
  { type: 'heading', name: 'Heading', category: 'content', source: 'core', description: 'Section headings H1-H6' },
  { type: 'text', name: 'Text', category: 'content', source: 'core', description: 'Rich text paragraph' },
  { type: 'image', name: 'Image', category: 'media', source: 'media-library', description: 'Single image with alt text' },
  { type: 'gallery', name: 'Gallery', category: 'media', source: 'media-library', description: 'Image grid gallery' },
  { type: 'carousel', name: 'Carousel', category: 'media', source: 'media-library', description: 'Sliding image carousel' },
  { type: 'video', name: 'Video', category: 'media', source: 'core', description: 'Embedded video player' },
  { type: 'button', name: 'Button', category: 'content', source: 'core', description: 'Call to action button' },
  { type: 'divider', name: 'Divider', category: 'layout', source: 'core', description: 'Horizontal rule' },
  { type: 'spacer', name: 'Spacer', category: 'layout', source: 'core', description: 'Vertical spacing' },
  { type: 'columns', name: 'Columns', category: 'layout', source: 'core', description: 'Multi-column layout' },
  { type: 'container', name: 'Container', category: 'layout', source: 'core', description: 'Content wrapper' },
  { type: 'form', name: 'Form', category: 'forms', source: 'form-builder', description: 'Contact / subscription form' },
  { type: 'map', name: 'Map', category: 'content', source: 'core', description: 'Embedded map location' },
  { type: 'icon', name: 'Icon', category: 'content', source: 'core', description: 'SVG icon picker' },
  { type: 'avatar', name: 'Avatar', category: 'media', source: 'core', description: 'User avatar display' },
  { type: 'card', name: 'Card', category: 'layout', source: 'core', description: 'Content card with image' },
  { type: 'testimonial', name: 'Testimonial', category: 'widgets', source: 'testimonials', description: 'Customer review card' },
  { type: 'pricing', name: 'Pricing Table', category: 'widgets', source: 'pricing-table', description: 'Pricing plan card' },
  { type: 'faq', name: 'FAQ', category: 'widgets', source: 'faq', description: 'Expandable FAQ item' },
  { type: 'accordion', name: 'Accordion', category: 'widgets', source: 'core', description: 'Collapsible sections' },
  { type: 'tabs', name: 'Tabs', category: 'widgets', source: 'core', description: 'Tabbed content panels' },
  { type: 'countdown', name: 'Countdown', category: 'widgets', source: 'countdown', description: 'Timer countdown' },
  { type: 'social-feed', name: 'Social Feed', category: 'widgets', source: 'social-feed', description: 'Social media embed' },
  { type: 'mpesa', name: 'M-Pesa Pay Button', category: 'widgets', source: 'mpesa', description: 'M-Pesa payment button' },
  { type: 'avatar-block', name: 'Avatar Block', category: 'media', source: 'core', description: 'Styled avatar with name' },
  { type: 'card-block', name: 'Card Block', category: 'layout', source: 'core', description: 'Reusable card component' },
];

const CATEGORIES = ['all', 'content', 'media', 'layout', 'forms', 'widgets'] as const;

const categoryColors: Record<string, string> = {
  content: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  media: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  layout: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  forms: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  widgets: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const MODULE_SOURCES = [...new Set(ALL_BLOCKS.map(b => b.source))].sort();

export default function BlocksPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return ALL_BLOCKS.filter((b) => {
      if (category !== 'all' && b.category !== category) return false;
      if (sourceFilter !== 'all' && b.source !== sourceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.type.includes(q);
      }
      return true;
    });
  }, [search, category, sourceFilter]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, b) => {
      if (!acc[b.category]) acc[b.category] = [];
      acc[b.category].push(b);
      return acc;
    }, {} as Record<string, typeof ALL_BLOCKS>);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold">Blocks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse all {ALL_BLOCKS.length} available blocks across modules
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none"
        >
          <option value="all">All Sources</option>
          {MODULE_SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex items-center rounded-lg border">
          <button
            onClick={() => setView('grid')}
            className={`rounded-l-lg p-2 transition-colors ${view === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Grid3X3 className="size-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded-r-lg p-2 transition-colors ${view === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.filter(c => c !== 'all').map((cat) => {
          const count = ALL_BLOCKS.filter(b => b.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? 'all' : cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? categoryColors[cat] + ' ring-2 ring-offset-1 ring-offset-background'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── Results ── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
          <Blocks className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No blocks match your search</p>
          <button
            onClick={() => { setSearch(''); setCategory('all'); setSourceFilter('all'); }}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, blocks]) => (
            <section key={cat}>
              <h2 className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${categoryColors[cat] || ''}`}>
                {cat} ({blocks.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {blocks.map((block) => (
                  <div key={block.type} className="block-grid-item group">
                    <div className={`mb-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${categoryColors[block.category] || ''}`}>
                      {block.category}
                    </div>
                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors">{block.name}</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{block.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="block-source">via <span className="font-medium text-foreground">{block.source}</span></span>
                      <span className="font-mono text-[10px] text-muted-foreground/60">{block.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Block</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 hidden md:table-cell">Description</th>
                <th className="px-4 py-3 hidden sm:table-cell">Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((block) => (
                <tr key={block.type} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{block.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${categoryColors[block.category] || ''}`}>
                      {block.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{block.source}</td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{block.description}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground hidden sm:table-cell">{block.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
