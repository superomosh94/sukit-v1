import React from 'react';
import { cn } from '../../../utils/cn';

export const Background = ({ 
    type = 'color',
    color = '#0F172A',
    image,
    video,
    parallax = false,
    overlay = false,
    overlayColor = 'rgba(0,0,0,0.5)',
    children,
    className 
}) => {
    const style = {};

    if (type === 'color') {
        style.backgroundColor = color;
    } else if (type === 'image' && image) {
        style.backgroundImage = `url(${image})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        if (parallax) {
            style.backgroundAttachment = 'fixed';
        }
    } else if (type === 'gradient') {
        style.background = `linear-gradient(135deg, ${color} 0%, ${color}2 100%)`;
    }

    return (
        <div className={cn('relative overflow-hidden', className)} style={style}>
            {type === 'video' && video && (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 0 }}
                >
                    <source src={video} type="video/mp4" />
                </video>
            )}
            
            {overlay && (
                <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: overlayColor, zIndex: 1 }}
                />
            )}
            
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

Background.displayName = 'Background';
export default Background;
