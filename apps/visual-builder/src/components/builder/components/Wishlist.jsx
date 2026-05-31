import React from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Wishlist = ({ 
    items = [], 
    onRemove,
    onAddToCart,
    className 
}) => {
    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <Heart className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <p className="text-text-primary mb-2">Your wishlist is empty</p>
                <p className="text-sm text-text-secondary">Save items you love to your wishlist</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, idx) => (
                    <div key={idx} className="bg-surface border border-border rounded-lg overflow-hidden group">
                        <div className="relative aspect-square bg-surface-light">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            <button
                                onClick={() => onRemove?.(item.id)}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4 text-danger-500" />
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-text-primary">{item.name}</h3>
                            <p className="text-lg font-bold text-primary-500 mt-1">${item.price}</p>
                            <button
                                onClick={() => onAddToCart?.(item)}
                                className="w-full mt-3 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

Wishlist.displayName = 'Wishlist';
export default Wishlist;