import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

export const OfflineMode = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setTimeout(() => setShowBanner(false), 3000);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showBanner) return null;

    return (
        <div
            className={cn(
                'fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300',
                isOnline
                    ? 'bg-success-500 text-white'
                    : 'bg-warning-500 text-white'
            )}
        >
            {isOnline ? (
                <>
                    <Wifi className="w-5 h-5" />
                    <div>
                        <p className="text-sm font-medium">Back Online</p>
                        <p className="text-xs opacity-90">Connection restored</p>
                    </div>
                </>
            ) : (
                <>
                    <WifiOff className="w-5 h-5" />
                    <div>
                        <p className="text-sm font-medium">You're Offline</p>
                        <p className="text-xs opacity-90">Some features may be unavailable</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-2 p-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>
    );
};

OfflineMode.displayName = 'OfflineMode';
export default OfflineMode;
