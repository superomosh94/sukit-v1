import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const AddToCart = ({ 
    product,
    variants = [],
    onAddToCart,
    showQuantity = true,
    className 
}) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        onAddToCart?.({
            ...product,
            quantity,
            variant: selectedVariant
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    const getVariantPrice = () => {
        if (!selectedVariant) return product.price;
        const variant = variants.find(v => v.id === selectedVariant);
        return variant?.price || product.price;
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Variants */}
            {variants.length > 0 && (
                <div>
                    <label className="block text-sm text-text-secondary mb-2">Select Option</label>
                    <div className="flex gap-2">
                        {variants.map(variant => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant.id)}
                                className={cn(
                                    'px-4 py-2 border rounded-lg text-sm transition-colors',
                                    selectedVariant === variant.id
                                        ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                                        : 'border-border text-text-secondary hover:border-primary-500'
                                )}
                            >
                                {variant.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity Selector */}
            {showQuantity && (
                <div>
                    <label className="block text-sm text-text-secondary mb-2">Quantity</label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={decrementQuantity}
                            className="p-2 border border-border rounded-lg hover:bg-surface-light"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-text-primary">{quantity}</span>
                        <button
                            onClick={incrementQuantity}
                            className="p-2 border border-border rounded-lg hover:bg-surface-light"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Price & Add to Cart Button */}
            <div className="flex items-center justify-between pt-2">
                <div>
                    <span className="text-2xl font-bold text-primary-500">
                        ${(getVariantPrice() * quantity).toFixed(2)}
                    </span>
                    {quantity > 1 && (
                        <span className="text-sm text-text-secondary ml-2">
                            (${getVariantPrice()} each)
                        </span>
                    )}
                </div>
                <button
                    onClick={handleAddToCart}
                    className={cn(
                        'px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2',
                        added ? 'bg-success-500 text-white' : 'bg-primary-500 text-white hover:bg-primary-600'
                    )}
                >
                    {added ? (
                        <>
                            <Check className="w-4 h-4" />
                            Added to Cart!
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

AddToCart.displayName = 'AddToCart';
export default AddToCart;