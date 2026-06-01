'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface InfiniteScrollProps {
  children: ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  threshold?: number;
  loading?: ReactNode;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  threshold = 200,
  loading,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { rootMargin: `${threshold}px` }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, threshold]);

  return (
    <div>
      {children}
      <div ref={sentinelRef} className="h-px" />
      {loading && hasMore && (
        <div className="py-4 flex justify-center">{loading}</div>
      )}
    </div>
  );
}
