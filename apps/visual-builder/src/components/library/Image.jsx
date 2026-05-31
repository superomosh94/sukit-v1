import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ImageOff } from 'lucide-react';

export const Image = ({
    src,
    alt = '',
    width,
    height,
    objectFit = 'cover',
    rounded = false,
    shadow = false,
    lazy = true,
    onLoad,
    onError,
    className,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const objectFitClasses = {
        cover: 'object-cover',
        contain: 'object-contain',
        fill: 'object-fill',
        none: 'object-none',
        'scale-down': 'object-scale-down',
    };

    const roundedClasses = {
        false: '',
        true: 'rounded',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
    };

    const shadowClasses = {
        false: '',
        true: 'shadow',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
    };

    const handleLoad = (e) => {
        setIsLoaded(true);
        onLoad?.(e);
    };

    const handleError = (e) => {
        setHasError(true);
        onError?.(e);
    };

    if (hasError || !src) {
        return (
            <div
                className={cn(
                    'bg-surface-light flex items-center justify-center gap-2',
                    roundedClasses[rounded === true ? 'md' : rounded] || 'rounded',
                    className
                )}
                style={{ width, height, minHeight: 100 }}
            >
                <ImageOff className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">Image not available</span>
            </div>
        );
    }

    return (
        <div className="relative inline-block" style={{ width, height }}>
            {!isLoaded && (
                <div
                    className="absolute inset-0 bg-surface-light animate-pulse rounded"
                    style={{ width, height }}
                />
            )}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={lazy ? 'lazy' : 'eager'}
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                    'transition-opacity duration-300',
                    objectFitClasses[objectFit] || 'object-cover',
                    roundedClasses[rounded === true ? 'md' : rounded],
                    shadowClasses[shadow === true ? 'md' : shadow],
                    !isLoaded && 'opacity-0',
                    isLoaded && 'opacity-100',
                    className
                )}
                style={{ width, height, objectFit }}
                {...props}
            />
        </div>
    );
};

export default Image;