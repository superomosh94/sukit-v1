import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Link = ({ 
    href = '#', 
    target = '_self',
    rel = '',
    children,
    className,
    openInNewTab = false 
}) => {
    const finalTarget = openInNewTab ? '_blank' : target;
    const finalRel = openInNewTab ? 'noopener noreferrer' : rel;

    return (
        <a
            href={href}
            target={finalTarget}
            rel={finalRel}
            className={cn(
                'text-primary-500 hover:text-primary-600 underline-offset-2 hover:underline transition-colors',
                className
            )}
        >
            {children}
            {openInNewTab && <ExternalLink className="w-3 h-3 inline ml-1" />}
        </a>
    );
};

Link.displayName = 'Link';
export default Link;
