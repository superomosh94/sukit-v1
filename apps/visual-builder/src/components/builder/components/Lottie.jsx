import React, { useEffect, useRef } from 'react';
import { cn } from '../../../utils/cn';

// Note: This component requires lottie-web to be installed
// npm install lottie-web

export const Lottie = ({ 
    animationData, 
    path,
    loop = true,
    autoplay = true,
    speed = 1,
    width = '100%',
    height = 'auto',
    className 
}) => {
    const containerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        // Dynamic import to avoid bundle size issues
        import('lottie-web').then((lottieModule) => {
            const lottie = lottieModule.default;
            
            if (animationRef.current) {
                animationRef.current.destroy();
            }
            
            const options = {
                container: containerRef.current,
                loop: loop,
                autoplay: autoplay,
                renderer: 'svg',
            };
            
            if (animationData) {
                options.animationData = animationData;
            } else if (path) {
                options.path = path;
            }
            
            animationRef.current = lottie.loadAnimation(options);
            animationRef.current.setSpeed(speed);
        });
        
        return () => {
            if (animationRef.current) {
                animationRef.current.destroy();
            }
        };
    }, [animationData, path, loop, autoplay, speed]);

    return (
        <div 
            ref={containerRef} 
            className={cn('lottie-container', className)}
            style={{ width, height }}
        />
    );
};

Lottie.displayName = 'Lottie';
export default Lottie;