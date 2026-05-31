import React, { useState } from 'react';
import { Ticket, Check, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Coupon = ({ 
    onApply,
    className 
}) => {
    const [code, setCode] = useState('');
    const [isApplied, setIsApplied] = useState(false);
    const [error, setError] = useState(null);
    const [discount, setDiscount] = useState(null);

    const handleApply = () => {
        if (!code.trim()) {
            setError('Please enter a coupon code');
            return;
        }
        
        const result = onApply?.(code);
        if (result?.success) {
            setIsApplied(true);
            setDiscount(result.discount);
            setError(null);
        } else {
            setError(result?.error || 'Invalid coupon code');
            setIsApplied(false);
        }
    };

    const handleRemove = () => {
        setIsApplied(false);
        setDiscount(null);
        setCode('');
        setError(null);
    };

    if (isApplied && discount) {
        return (
            <div className={cn('bg-success-500/10 border border-success-500/20 rounded-lg p-3 flex items-center justify-between', className)}>
                <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-success-500" />
                    <div>
                        <p className="text-sm text-text-primary">Coupon Applied!</p>
                        <p className="text-xs text-text-secondary">You saved ${discount.amount}</p>
                    </div>
                </div>
                <button onClick={handleRemove} className="p-1 rounded hover:bg-surface-light">
                    <X className="w-4 h-4 text-text-secondary" />
                </button>
            </div>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                    Apply
                </button>
            </div>
            {error && (
                <p className="text-xs text-danger-500">{error}</p>
            )}
        </div>
    );
};

Coupon.displayName = 'Coupon';
export default Coupon;