'use client';

import React, { useRef, useCallback, type ReactNode } from 'react';

export interface CanvasTouchGesturesProps {
  children: ReactNode;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onPinch?: (scale: number) => void;
  onTap?: (x: number, y: number) => void;
  className?: string;
}

export function CanvasTouchGestures({
  children,
  onSwipe,
  onPinch,
  onTap,
  className,
}: CanvasTouchGesturesProps) {
  const touchStart = useRef<{ x: number; y: number; distance: number } | null>(
    null
  );

  const getDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        distance: 0,
      };
    } else if (e.touches.length === 2) {
      touchStart.current = {
        x: 0,
        y: 0,
        distance: getDistance(e.touches),
      };
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      if (e.changedTouches.length === 1 && touchStart.current.distance === 0) {
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        const threshold = 50;

        if (Math.abs(dx) > threshold) {
          onSwipe?.(dx > 0 ? 'right' : 'left');
        } else if (Math.abs(dy) > threshold) {
          onSwipe?.(dy > 0 ? 'down' : 'up');
        } else {
          onTap?.(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
      }

      touchStart.current = null;
    },
    [onSwipe, onTap]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current || touchStart.current.distance === 0) return;
      if (e.touches.length === 2) {
        const newDist = getDistance(e.touches);
        const scale = newDist / touchStart.current.distance;
        onPinch?.(scale);
        touchStart.current.distance = newDist;
      }
    },
    [onPinch]
  );

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={className}
    >
      {children}
    </div>
  );
}
