import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export const ResponsiveImage = ({ 
    src, 
    alt,
    mobileSrc,
    tabletSrc,
    desktopSrc,
    width,
    height,
    lazyLoad = true,
    className,
    objectFit = 'cover',
    sizes = '100vw'
}) => {
    const [loaded, setLoaded] = useState(false);
    
    const srcSet = [];
    if (mobileSrc) srcSet.push(`${mobileSrc} 375w`);
    if (tabletSrc) srcSet.push(`${tabletSrc} 768w`);
    if (desktopSrc) srcSet.push(`${desktopSrc} 1024w`);
    if (src) srcSet.push(`${src} 1920w`);
    
    const objectFitClasses = {
        cover: 'object-cover',
        contain: 'object-contain',
        fill: 'object-fill',
        none: 'object-none',
        scale: 'object-scale-down',
    };

    return (
        <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
            {!loaded && (
                <div className="absolute inset-0 bg-surface-light animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                srcSet={srcSet.join(', ')}
                sizes={sizes}
                loading={lazyLoad ? 'lazy' : 'eager'}
                onLoad={() => setLoaded(true)}
                className={cn(
                    'w-full h-full transition-opacity duration-300',
                    objectFitClasses[objectFit],
                    loaded ? 'opacity-100' : 'opacity-0'
                )}
            />
        </div>
    );
};

export default ResponsiveImage;
📦 BATCH 2: FLUID TYPOGRAPHY & CUSTOM BREAKPOINTS