import React from 'react';
import { Quote as QuoteIcon } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Quote = ({ 
    text, 
    author, 
    align = 'left',
    className 
}) => {
    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    };

    return (
        <div className={cn('relative p-6 bg-surface-light rounded-lg', alignClasses[align], className)}>
            <QuoteIcon className="absolute top-4 left-4 w-8 h-8 text-primary-500/20" />
            <blockquote className="relative z-10">
                <p className="text-text-primary italic text-lg leading-relaxed">
                    "{text}"
                </p>
                {author && (
                    <footer className="mt-4">
                        <cite className="text-text-secondary not-italic">
                            — {author}
                        </cite>
                    </footer>
                )}
            </blockquote>
        </div>
    );
};

Quote.displayName = 'Quote';
export default Quote;
