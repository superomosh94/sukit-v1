import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export const FullscreenMode = ({ isFullscreen, onToggle, targetRef }) => {
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported(!!document.fullscreenEnabled);
    }, []);

    const enterFullscreen = async () => {
        const element = targetRef?.current || document.documentElement;
        try {
            await element.requestFullscreen();
            onToggle?.(true);
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    const exitFullscreen = async () => {
        try {
            await document.exitFullscreen();
            onToggle?.(false);
        } catch (error) {
            console.error('Exit fullscreen error:', error);
        }
    };

    const toggleFullscreen = () => {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            onToggle?.(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [onToggle]);

    if (!isSupported) return null;

    return (
        <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-surface-light transition-colors"
            title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
        >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-text-secondary" /> : <Maximize2 className="w-4 h-4 text-text-secondary" />}
        </button>
    );
};
