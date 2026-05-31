import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { cn } from '../../../utils/cn';
import ProductCard from './ProductCard';

export const RelatedProducts = ({ 
    products = [], 
    title = 'You May Also Like',
    onAddToCart,
    onAddToWishlist,
    className 
}) => {
    if (products.length === 0) return null;

    return (
        <div className={cn('space-y-4', className)}>
            <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        layout="vertical"
                        showActions={true}
                        onAddToCart={onAddToCart}
                        onAddToWishlist={onAddToWishlist}
                    />
                ))}
            </div>
        </div>
    );
};

RelatedProducts.displayName = 'RelatedProducts';
export default RelatedProducts;