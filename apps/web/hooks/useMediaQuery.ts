import { useSyncExternalStore } from 'react';

function getMediaQueryList(query: string) {
  if (typeof window === 'undefined') return null;
  return window.matchMedia(query);
}

export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const mql = getMediaQueryList(query);
    if (!mql) return () => {};
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    const mql = getMediaQueryList(query);
    return mql ? mql.matches : false;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () =>
  useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
