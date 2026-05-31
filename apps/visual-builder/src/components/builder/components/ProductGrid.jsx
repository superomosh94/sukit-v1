import React, { useState } from 'react';
import { Grid3X3, LayoutList, Filter, ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';
import ProductCard from './ProductCard';

export const ProductGrid = ({ 
    products = [], 
    columns = 4,
    showFilters = true,
    showSort = true,
    onAddToCart,
    onAddToWishlist,
    className 
}) => {
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('default');
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

    const categories = [...new Set(products.map(p => p.category))];
    
    const filteredProducts = products.filter(product => {
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
        if (product.price < priceRange.min || product.price > priceRange.max) return false;
        return true;
    });

    const sortedProducts = [...filteredProducts];
    if (sortBy === 'price-asc') sortedProducts.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') sortedProducts.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'newest') sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const gridCols = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    {showFilters && (
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-text-primary"
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                            <ChevronDown className={cn('w-4 h-4 transition-transform', filterOpen && 'rotate-180')} />
                        </button>
                    )}
                    <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn('p-1.5 rounded', viewMode === 'grid' && 'bg-primary-500 text-white')}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn('p-1.5 rounded', viewMode === 'list' && 'bg-primary-500 text-white')}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                {showSort && (
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                    >
                        <option value="default">Sort by: Default</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Best Rating</option>
                        <option value="newest">Newest First</option>
                    </select>
                )}
            </div>

            {/* Filters Panel */}
            {filterOpen && (
                <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-medium text-text-primary mb-2">Categories</h4>
                            {categories.map(cat => (
                                <label key={cat} className="flex items-center gap-2 py-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCategories([...selectedCategories, cat]);
                                            } else {
                                                setSelectedCategories(selectedCategories.filter(c => c !== cat));
                                            }
                                        }}
                                        className="rounded border-border text-primary-500"
                                    />
                                    <span className="text-sm text-text-secondary">{cat}</span>
                                </label>
                            ))}
                        </div>
                        <div>
                            <h4 className="font-medium text-text-primary mb-2">Price Range</h4>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                                    className="w-full px-2 py-1 bg-surface border border-border rounded text-sm"
                                />
                                <span className="text-text-secondary">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 1000 })}
                                    className="w-full px-2 py-1 bg-surface border border-border rounded text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Grid/List */}
            {viewMode === 'grid' ? (
                <div className={cn('grid gap-4', gridCols[columns])}>
                    {sortedProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            layout="vertical"
                            onAddToCart={onAddToCart}
                            onAddToWishlist={onAddToWishlist}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            layout="horizontal"
                            onAddToCart={onAddToCart}
                            onAddToWishlist={onAddToWishlist}
                        />
                    ))}
                </div>
            )}

            {sortedProducts.length === 0 && (
                <div className="text-center py-12 text-text-secondary">
                    No products found
                </div>
            )}
        </div>
    );
};

ProductGrid.displayName = 'ProductGrid';
export default ProductGrid;