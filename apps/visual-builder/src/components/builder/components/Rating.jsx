import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Rating = ({ 
    label,
    value = 0,
    onChange,
    max = 5,
    size = 'md',
    readonly = false,
    className 
}) => {
    const [hoverValue, setHoverValue] = useState(0);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const handleClick = (rating) => {
        if (!readonly) {
            onChange?.(rating);
        }
    };

    return (
        <div className={cn('space-y-1', className)}>
            {label && <label className="block text-sm font-medium text-text-primary">{label}</label>}
            <div className="flex items-center gap-1">
                {[...Array(max)].map((_, i) => {
                    const ratingValue = i + 1;
                    const isActive = ratingValue <= (hoverValue || value);
                    
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleClick(ratingValue)}
                            onMouseEnter={() => !readonly && setHoverValue(ratingValue)}
                            onMouseLeave={() => !readonly && setHoverValue(0)}
                            className={cn(
                                'transition-colors',
                                !readonly && 'cursor-pointer hover:scale-110',
                                readonly && 'cursor-default'
                            )}
                        >
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    isActive ? 'fill-warning-500 text-warning-500' : 'text-text-secondary'
                                )}
                            />
                        </button>
                    );
                })}
                {value > 0 && (
                    <span className="ml-2 text-sm text-text-secondary">({value} / {max})</span>
                )}
            </div>
        </div>
    );
};

Rating.displayName = 'Rating';
export default Rating;
