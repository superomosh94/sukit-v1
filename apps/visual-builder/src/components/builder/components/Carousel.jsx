import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Carousel = ({ 
    items = [], 
    autoplay = false,
    interval = 5000,
    showArrows = true,
    showDots = true,
    className 
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!autoplay || items.length === 0) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, interval);
        
        return () => clearInterval(timer);
    }, [autoplay, interval, items.length]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    if (items.length === 0) {
        return (
            <div className="bg-surface border border-border rounded-lg p-8 text-center text-text-secondary">
                No items to display
            </div>
        );
    }

    return (
        <div className={cn('relative group', className)}>
            {/* Main Content */}
            <div className="overflow-hidden rounded-lg">
                <div 
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {items.map((item, idx) => (
                        <div key={idx} className="w-full flex-shrink-0">
                            {item.image && (
                                <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className="w-full h-64 object-cover"
                                />
                            )}
                            <div className="p-4 bg-surface">
                                <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                                <p className="text-text-secondary mt-1">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Arrows */}
            {showArrows && items.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Dots */}
            {showDots && items.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                'w-2 h-2 rounded-full transition-all',
                                currentIndex === idx ? 'w-4 bg-primary-500' : 'bg-border hover:bg-primary-500/50'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

Carousel.displayName = 'Carousel';
export default Carousel;