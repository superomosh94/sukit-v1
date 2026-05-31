import React, { useState, useMemo, useEffect } from 'react';
import { Search, Grid3X3, List, Download, Star, Eye, Filter, ChevronDown, Check, Plug } from 'lucide-react';
import { usePluginStore } from '../stores/pluginStore';
import Button from '../components/shared/Button';
import { PluginPreviewModal } from '../components/marketplace/PluginPreviewModal';
import { cn } from '../utils/cn';

const categories = [
    { id: 'all', label: 'All Plugins' },
    { id: 'payments', label: 'Payments' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'seo', label: 'SEO & Analytics' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'performance', label: 'Performance' },
    { id: 'monitoring', label: 'Monitoring' }
];

const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'newest', label: 'Newest' },
    { id: 'downloads', label: 'Most Downloads' }
];

const PluginMarketplace = () => {
    const { availablePlugins, installPlugin, fetchPlugins } = usePluginStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchPlugins(); }, []);
    const [viewMode, setViewMode] = useState('grid');
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [selectedPlugin, setSelectedPlugin] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const filteredPlugins = useMemo(() => {
        let list = [...(availablePlugins || [])];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(p =>
                p.displayName?.toLowerCase().includes(term) ||
                p.name?.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term) ||
                p.tags?.some(t => t.toLowerCase().includes(term))
            );
        }

        if (category !== 'all') {
            list = list.filter(p => p.category === category);
        }

        switch (sortBy) {
            case 'rating':
                list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                list.sort((a, b) => (b.version || '').localeCompare(a.version || ''));
                break;
            case 'downloads':
                list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
                break;
            default:
                list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        }

        return list;
    }, [availablePlugins, searchTerm, category, sortBy]);

    const handleInstall = (plugin, settings = {}) => {
        installPlugin(plugin, settings);
        setSelectedPlugin(null);
    };

    return (
        <section className="p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Plugin Marketplace</h1>
                    <p className="text-text-secondary mt-1">Discover and manage plugins for your projects</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn('p-2 rounded transition-colors', viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-secondary')}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn('p-2 rounded transition-colors', viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-surface border border-border text-text-secondary')}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search plugins by name, keyword, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                    {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {filteredPlugins.length === 0 ? (
                <div className="text-center py-20">
                    <Download className="w-16 h-16 mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary text-lg">No plugins found</p>
                    <p className="text-text-secondary text-sm mt-1">Try adjusting your search or filters</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPlugins.map(plugin => (
                        <div key={plugin.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all group">
                            <div className="relative h-40 bg-background flex items-center justify-center">
                                <div className="opacity-60 group-hover:opacity-40 transition-opacity">
                                    {plugin.icon ? <img src={plugin.icon} alt="" className="w-16 h-16" /> : <Plug className="w-16 h-16 text-text-secondary" />}
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setSelectedPlugin(plugin)}
                                        className="px-3 py-1.5 bg-surface text-text-primary rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-surface-light transition-colors"
                                    >
                                        <Eye size={14} /> Preview
                                    </button>
                                </div>
                                {plugin.preview?.interactive && (
                                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-success-500 text-white text-[10px] font-medium rounded flex items-center gap-0.5">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        DEMO
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-text-primary text-sm truncate">{plugin.displayName || plugin.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-warning-500 flex-shrink-0 ml-2">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span>{plugin.rating || 'N/A'}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-text-secondary mb-3 line-clamp-2 leading-relaxed">{plugin.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                        <Download size={11} />
                                        <span>{(plugin.downloads || 0).toLocaleString()}</span>
                                        <span className="text-text-secondary">|</span>
                                        <span className="capitalize">{plugin.category}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className={cn(
                                            'px-2 py-0.5 rounded text-xs font-medium',
                                            plugin.price === 'free'
                                                ? 'bg-success-500/10 text-success-500'
                                                : 'bg-primary-500/10 text-primary-500'
                                        )}>
                                            {plugin.price === 'free' ? 'Free' : `$${plugin.price}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredPlugins.map(plugin => (
                        <div key={plugin.id} className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                                {plugin.icon ? <img src={plugin.icon} alt="" className="w-6 h-6" /> : <Plug className="w-6 h-6 text-text-secondary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-text-primary truncate">{plugin.displayName || plugin.name}</h3>
                                    {plugin.preview?.interactive && (
                                        <span className="px-1 py-0.5 bg-success-500/10 text-success-500 text-[10px] font-medium rounded">DEMO</span>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary truncate mt-0.5">{plugin.description}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                                    <span className="capitalize">{plugin.category}</span>
                                    <span>{plugin.version}</span>
                                    <div className="flex items-center gap-1">
                                        <Star size={11} className="text-warning-500 fill-current" />
                                        {plugin.rating || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Download size={11} />
                                        {(plugin.downloads || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => setSelectedPlugin(plugin)}
                                    className="px-3 py-1.5 border border-border text-text-secondary rounded-lg text-sm hover:bg-surface-light transition-colors flex items-center gap-1"
                                >
                                    <Eye size={13} />
                                    Preview
                                </button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleInstall(plugin)}
                                >
                                    <Download className="w-3 h-3 mr-1" /> Install
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedPlugin && (
                <PluginPreviewModal
                    plugin={selectedPlugin}
                    onClose={() => setSelectedPlugin(null)}
                    onInstall={handleInstall}
                />
            )}
        </section>
    );
};

export default PluginMarketplace;
