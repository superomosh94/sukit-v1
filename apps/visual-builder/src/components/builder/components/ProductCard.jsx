import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const ProductCard = ({ 
    product,
    onAddToCart,
    onAddToWishlist,
    layout = 'vertical',
    showRating = true,
    showActions = true,
    className 
}) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        onAddToWishlist?.(product);
    };

    const discountPercentage = product.originalPrice && product.price 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : 0;

    if (layout === 'horizontal') {
        return (
            <div className={cn('flex gap-4 bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow', className)}>
                <div className="w-32 h-32 relative bg-surface-light">
                    {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-surface-light" />}
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className={cn('w-full h-full object-cover transition-opacity', imageLoaded ? 'opacity-100' : 'opacity-0')}
                        onLoad={() => setImageLoaded(true)}
                    />
                    {discountPercentage > 0 && (
                        <div className="absolute top-2 left-2 bg-danger-500 text-white text-xs px-1.5 py-0.5 rounded">
                            -{discountPercentage}%
                        </div>
                    )}
                </div>
                <div className="flex-1 p-3">
                    <h3 className="font-semibold text-text-primary hover:text-primary-500 transition-colors">
                        <a href={`/product/${product.id}`}>{product.name}</a>
                    </h3>
                    {showRating && (
                        <div className="flex items-center gap-1 mt-1">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn(
                                        'w-3 h-3',
                                        i < Math.floor(product.rating || 0) ? 'fill-warning-500 text-warning-500' : 'text-text-secondary'
                                    )} />
                                ))}
                            </div>
                            <span className="text-xs text-text-secondary">({product.reviews || 0})</span>
                        </div>
                    )}
                    <div className="mt-2">
                        {product.originalPrice && (
                            <span className="text-sm text-text-secondary line-through mr-2">
                                ${product.originalPrice}
                            </span>
                        )}
                        <span className="text-lg font-bold text-primary-500">
                            ${product.price}
                        </span>
                    </div>
                    {showActions && (
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => onAddToCart?.(product)}
                                className="flex-1 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={handleWishlist}
                                className="p-1.5 border border-border rounded-lg hover:bg-surface-light transition-colors"
                            >
                                <Heart className={cn('w-4 h-4', isWishlisted && 'fill-danger-500 text-danger-500')} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn('bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all group', className)}>
            <div className="relative aspect-square bg-surface-light">
                {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-surface-light" />}
                <img 
                    src={product.image} 
                    alt={product.name}
                    className={cn('w-full h-full object-cover transition-transform group-hover:scale-105', imageLoaded ? 'opacity-100' : 'opacity-0')}
                    onLoad={() => setImageLoaded(true)}
                />
                {discountPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-danger-500 text-white text-xs px-1.5 py-0.5 rounded">
                        -{discountPercentage}%
                    </div>
                )}
                <button
                    onClick={handleWishlist}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Heart className={cn('w-4 h-4', isWishlisted && 'fill-danger-500 text-danger-500')} />
                </button>
            </div>
            <div className="p-3">
                <h3 className="font-semibold text-text-primary hover:text-primary-500 transition-colors line-clamp-1">
                    <a href={`/product/${product.id}`}>{product.name}</a>
                </h3>
                {showRating && (
                    <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn(
                                    'w-3 h-3',
                                    i < Math.floor(product.rating || 0) ? 'fill-warning-500 text-warning-500' : 'text-text-secondary'
                                )} />
                            ))}
                        </div>
                        <span className="text-xs text-text-secondary">({product.reviews || 0})</span>
                    </div>
                )}
                <div className="mt-2">
                    {product.originalPrice && (
                        <span className="text-sm text-text-secondary line-through mr-2">
                            ${product.originalPrice}
                        </span>
                    )}
                    <span className="text-lg font-bold text-primary-500">
                        ${product.price}
                    </span>
                </div>
                {showActions && (
                    <button
                        onClick={() => onAddToCart?.(product)}
                        className="w-full mt-3 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </button>
                )}
            </div>
        </div>
    );
};

ProductCard.displayName = 'ProductCard';
export default ProductCard;