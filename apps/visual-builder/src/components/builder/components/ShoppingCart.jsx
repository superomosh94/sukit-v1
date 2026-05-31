import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const ShoppingCart = ({ 
    items = [], 
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    className 
}) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <p className="text-text-primary mb-2">Your cart is empty</p>
                <p className="text-sm text-text-secondary">Add some products to your cart</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Cart Items */}
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-surface border border-border rounded-lg">
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-text-primary">{item.name}</h4>
                            <p className="text-sm text-text-secondary">${item.price}</p>
                            {item.variant && (
                                <p className="text-xs text-text-secondary">Option: {item.variant}</p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onUpdateQuantity?.(item.id, Math.max(1, item.quantity - 1))}
                                    className="p-1 rounded border border-border hover:bg-surface-light"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-text-primary">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                                    className="p-1 rounded border border-border hover:bg-surface-light"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                            <button
                                onClick={() => onRemoveItem?.(item.id)}
                                className="text-danger-500 hover:text-danger-600"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Summary */}
            <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="font-semibold text-text-primary mb-3">Order Summary</h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Subtotal</span>
                        <span className="text-text-primary">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Shipping</span>
                        <span className="text-text-primary">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Tax (10%)</span>
                        <span className="text-text-primary">${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                            <span className="text-text-primary">Total</span>
                            <span className="text-primary-500">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onCheckout}
                    className="w-full mt-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

ShoppingCart.displayName = 'ShoppingCart';
export default ShoppingCart;