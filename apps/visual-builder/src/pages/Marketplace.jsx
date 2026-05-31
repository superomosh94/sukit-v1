import React, { useState } from 'react';
import { ShoppingBag, Search, Filter, Download, Star, Eye, Grid3X3, List, ChevronRight } from 'lucide-react';
import Button from '../components/shared/Button';

const INITIAL_ASSETS = [
  { id: '1', name: 'Hero Section Pack', category: 'sections', type: 'block', downloads: 12340, rating: 4.8, price: 'Free', image: null, author: 'SuKit Labs', description: '20 responsive hero section templates' },
  { id: '2', name: 'Dashboard UI Kit', category: 'ui-kits', type: 'ui-kit', downloads: 8920, rating: 4.9, price: '$29', image: null, author: 'UI Studio', description: 'Complete dashboard interface kit' },
  { id: '3', name: 'E-commerce Bundle', category: 'sections', type: 'block', downloads: 6750, rating: 4.7, price: '$49', image: null, author: 'ShopDev', description: 'Product pages, cart, checkout templates' },
  { id: '4', name: 'Icon Set Pro', category: 'icons', type: 'icon', downloads: 15000, rating: 4.9, price: '$19', image: null, author: 'Iconify', description: '2000+ professional SVG icons' },
  { id: '5', name: 'Background Patterns', category: 'graphics', type: 'graphic', downloads: 4500, rating: 4.5, price: 'Free', image: null, author: 'PatternLab', description: '100 seamless background patterns' },
  { id: '6', name: 'Font Pack Premium', category: 'fonts', type: 'font', downloads: 3200, rating: 4.6, price: '$39', image: null, author: 'TypeFoundry', description: '50 premium web fonts with licenses' },
  { id: '7', name: 'Animations Library', category: 'sections', type: 'block', downloads: 7800, rating: 4.7, price: '$24', image: null, author: 'MotionDev', description: '300+ CSS and JS animations' },
  { id: '8', name: 'Stock Photo Pack', category: 'graphics', type: 'graphic', downloads: 2100, rating: 4.3, price: '$59', image: null, author: 'MediaPro', description: '500 high-resolution stock photos' },
  { id: '9', name: 'Form Templates', category: 'sections', type: 'block', downloads: 5600, rating: 4.6, price: 'Free', image: null, author: 'SuKit Labs', description: '20 pre-built form templates' },
  { id: '10', name: 'Color Palette Bundle', category: 'ui-kits', type: 'ui-kit', downloads: 9800, rating: 4.8, price: '$12', image: null, author: 'ColorLab', description: '200 curated color palettes for web design' },
];

const CATEGORIES = ['all', 'sections', 'ui-kits', 'icons', 'graphics', 'fonts'];
const TYPES = ['all', 'block', 'ui-kit', 'icon', 'graphic', 'font'];

const Marketplace = () => {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = category === 'all' || a.category === category;
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    return matchSearch && matchCategory && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Marketplace</h1>
          <p className="text-text-secondary mt-1">Discover assets to enhance your projects</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-secondary'} transition-colors`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-secondary'} transition-colors`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input type="text" aria-label="Search marketplace" placeholder="Search marketplace..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm">
            {TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}</option>)}
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === cat ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-secondary hover:text-text-primary'}`}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto text-text-secondary mb-4" />
          <p className="text-text-secondary text-lg">No assets found</p>
          <p className="text-text-secondary text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(asset => (
            <div key={asset.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-36 bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-50 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-primary-300" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-text-primary truncate flex-1">{asset.name}</h3>
                  <span className="text-xs bg-surface-light text-text-secondary px-2 py-0.5 rounded ml-2 capitalize">{asset.type}</span>
                </div>
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{asset.description}</p>
                <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
                  <span>{asset.author}</span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" /> {asset.downloads.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-current" /> {asset.rating}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-sm font-bold text-text-primary">{asset.price}</span>
                    <Button variant="primary" size="sm">
                      <Download className="w-3 h-3 mr-1" /> Get
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(asset => (
            <div key={asset.id} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-7 h-7 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-text-primary truncate">{asset.name}</h3>
                  <span className="text-xs bg-surface-light text-text-secondary px-2 py-0.5 rounded capitalize">{asset.type}</span>
                </div>
                <p className="text-sm text-text-secondary truncate">{asset.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> {asset.rating}</span>
                <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {asset.downloads.toLocaleString()}</span>
                <span className="font-bold text-text-primary">{asset.price}</span>
                <Button variant="primary" size="sm">
                  <Download className="w-3 h-3 mr-1" /> Get
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
