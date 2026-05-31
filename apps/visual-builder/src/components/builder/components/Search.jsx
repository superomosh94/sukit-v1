import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Filter } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Search = ({ 
    onSearch, 
    placeholder = 'Search...',
    showFilters = true,
    className 
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({ category: '', type: 'all' });
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        
        setIsLoading(true);
        const searchResults = await onSearch?.(query, filters);
        setResults(searchResults || []);
        setIsLoading(false);
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (query) handleSearch();
            else setResults([]);
        }, 300);
        return () => clearTimeout(debounce);
    }, [query, filters]);

    const categories = ['All', 'Products', 'Posts', 'Pages', 'Components'];

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search Input */}
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-20 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <X className="w-4 h-4 text-text-secondary hover:text-text-primary" />
                    </button>
                )}
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <span className="text-xs text-text-secondary">
                        {isLoading ? 'Searching...' : results.length > 0 ? `${results.length} results found` : ''}
                    </span>
                </div>
            )}

            {showFilterPanel && (
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat === 'All' ? '' : cat.toLowerCase()}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-2">
                    {results.map((result, idx) => (
                        <a
                            key={idx}
                            href={result.url}
                            className="block p-3 bg-surface border border-border rounded-lg hover:border-primary-500 transition-colors"
                        >
                            <h4 className="font-medium text-text-primary">{result.title}</h4>
                            <p className="text-sm text-text-secondary mt-1">{result.description}</p>
                            <span className="text-xs text-primary-500 mt-1 inline-block">{result.type}</span>
                        </a>
                    ))}
                </div>
            )}

            {query && results.length === 0 && !isLoading && (
                <div className="text-center py-8">
                    <p className="text-text-secondary">No results found for "{query}"</p>
                </div>
            )}
        </div>
    );
};

Search.displayName = 'Search';
export default Search;