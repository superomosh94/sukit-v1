import React from 'react';
import { cn } from '../../../utils/cn';

export const Timeline = ({ 
    items = [], 
    orientation = 'vertical',
    className 
}) => {
    if (orientation === 'horizontal') {
        return (
            <div className={cn('relative py-8', className)}>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
                <div className="flex justify-between relative">
                    {items.map((item, idx) => (
                        <div key={idx} className="text-center flex-1">
                            <div className="relative">
                                <div className="w-4 h-4 bg-primary-500 rounded-full mx-auto relative z-10" />
                                <div className="mt-2">
                                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                                    <p className="text-xs text-text-secondary">{item.date}</p>
                                    <p className="text-xs text-text-secondary mt-1">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-primary-500" />
                        {idx !== items.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-1" />
                        )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-4">
                        <div className="bg-surface border border-border rounded-lg p-4">
                            <h4 className="font-semibold text-text-primary">{item.title}</h4>
                            <p className="text-xs text-text-secondary mt-1">{item.date}</p>
                            <p className="text-sm text-text-secondary mt-2">{item.description}</p>
                            {item.icon && (
                                <div className="mt-2 text-primary-500">
                                    {item.icon}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

Timeline.displayName = 'Timeline';
export default Timeline;