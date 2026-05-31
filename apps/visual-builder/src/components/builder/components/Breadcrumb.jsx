import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Breadcrumb = ({ 
    items = [], 
    separator = 'chevron',
    showHome = true,
    className 
}) => {
    const SeparatorIcon = separator === 'chevron' ? ChevronRight : 
                         separator === 'slash' ? () => <span className="mx-2">/</span> :
                         () => <span className="mx-2">•</span>;

    const allItems = showHome ? [{ label: 'Home', href: '/' }, ...items] : items;

    return (
        <nav className={cn('flex items-center flex-wrap', className)}>
            {allItems.map((item, idx) => (
                <React.Fragment key={idx}>
                    {idx > 0 && <SeparatorIcon className="w-4 h-4 text-text-secondary mx-2" />}
                    {idx === allItems.length - 1 ? (
                        <span className="text-text-primary font-medium">
                            {item.icon === 'home' ? <Home className="w-4 h-4" /> : item.label}
                        </span>
                    ) : (
                        <a
                            href={item.href}
                            className="text-text-secondary hover:text-primary-500 transition-colors"
                        >
                            {item.icon === 'home' ? <Home className="w-4 h-4" /> : item.label}
                        </a>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

Breadcrumb.displayName = 'Breadcrumb';
export default Breadcrumb;
