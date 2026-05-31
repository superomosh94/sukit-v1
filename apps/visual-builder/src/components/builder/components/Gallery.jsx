import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Gallery = ({ 
    images = [], 
    layout = 'grid',
    columns = 3,
    gap = 4,
    lightbox = true,
    className 
}) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const gapClasses = {
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6'
    };

    const openLightbox = (index) => {
        if (lightbox) {
            setSelectedImage(index);
            setLightboxOpen(true);
        }
    };

    const nextImage = () => {
        setSelectedImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    };

    if (layout === 'grid') {
        return (
            <>
                <div className={cn('grid', `grid-cols-${columns}`, gapClasses[gap], className)}>
                    {images.map((image, idx) => (
                        <div 
                            key={idx}
                            className="relative aspect-square bg-surface-light rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => openLightbox(idx)}
                        >
                            <img 
                                src={image.url} 
                                alt={image.alt || `Gallery image ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            {lightbox && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Maximize2 className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Lightbox */}
                {lightboxOpen && selectedImage !== null && (
                    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                        <button
                            onClick={() => setLightboxOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                        
                        <button
                            onClick={prevImage}
                            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft className="w-8 h-8 text-white" />
                        </button>
                        
                        <img 
                            src={images[selectedImage].url} 
                            alt={images[selectedImage].alt}
                            className="max-w-[90vw] max-h-[90vh] object-contain"
                        />
                        
                        <button
                            onClick={nextImage}
                            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ChevronRight className="w-8 h-8 text-white" />
                        </button>
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                            {selectedImage + 1} / {images.length}
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Carousel layout
    return (
        <div className="relative">
            <div className="overflow-hidden">
                <div 
                    className="flex transition-transform duration-300"
                    style={{ transform: `translateX(-${selectedImage * 100}%)` }}
                >
                    {images.map((image, idx) => (
                        <div key={idx} className="w-full flex-shrink-0">
                            <img 
                                src={image.url} 
                                alt={image.alt || `Gallery image ${idx + 1}`}
                                className="w-full aspect-video object-cover rounded-lg"
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={cn(
                                    'w-2 h-2 rounded-full transition-colors',
                                    selectedImage === idx ? 'bg-white' : 'bg-white/50'
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

Gallery.displayName = 'Gallery';
export default Gallery;
