'use client';

import React from 'react';
import { WifiOff } from 'lucide-react';

export interface OfflineIndicatorProps {
  isOffline?: boolean;
  className?: string;
}

export function OfflineIndicator({
  isOffline,
  className,
}: OfflineIndicatorProps) {
  const [offline, setOffline] = React.useState(isOffline ?? !navigator.onLine);

  React.useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-sm text-yellow-600 ${className || ''}`}
    >
      <WifiOff size={14} />
      <span>You are offline</span>
    </div>
  );
}
