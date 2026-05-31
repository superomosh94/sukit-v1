import { useState, useEffect, useCallback } from 'react';

export const breakpoints = {
    mobile: 375,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
};

export const devices = {
    mobile: `(max-width: ${breakpoints.tablet - 1}px)`,
    tablet: `(min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`,
    desktop: `(min-width: ${breakpoints.desktop}px) and (max-width: ${breakpoints.wide - 1}px)`,
    wide: `(min-width: ${breakpoints.wide}px)`,
    landscape: `(orientation: landscape)`,
    portrait: `(orientation: portrait)`,
};

export const useResponsive = () => {
    const [currentDevice, setCurrentDevice] = useState('desktop');
    const [orientation, setOrientation] = useState('landscape');
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
    });

    const updateDevice = useCallback(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setWindowSize({ width, height });
        setOrientation(width > height ? 'landscape' : 'portrait');
        
        if (width < breakpoints.tablet) {
            setCurrentDevice('mobile');
        } else if (width < breakpoints.desktop) {
            setCurrentDevice('tablet');
        } else if (width < breakpoints.wide) {
            setCurrentDevice('desktop');
        } else {
            setCurrentDevice('wide');
        }
    }, []);

    useEffect(() => {
        updateDevice();
        window.addEventListener('resize', updateDevice);
        window.addEventListener('orientationchange', updateDevice);
        return () => {
            window.removeEventListener('resize', updateDevice);
            window.removeEventListener('orientationchange', updateDevice);
        };
    }, [updateDevice]);

    const isMobile = currentDevice === 'mobile';
    const isTablet = currentDevice === 'tablet';
    const isDesktop = currentDevice === 'desktop' || currentDevice === 'wide';
    const isLandscape = orientation === 'landscape';
    const isPortrait = orientation === 'portrait';

    return {
        currentDevice,
        orientation,
        windowSize,
        isMobile,
        isTablet,
        isDesktop,
        isLandscape,
        isPortrait,
        breakpoints,
    };
};

export const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = (e) => setMatches(e.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
};