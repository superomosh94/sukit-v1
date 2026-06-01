'use client';

import React, { useState, useEffect, type ReactNode } from 'react';

export interface OrientationDetectionProps {
  children: (orientation: 'portrait' | 'landscape') => ReactNode;
}

export function OrientationDetection({ children }: OrientationDetectionProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  useEffect(() => {
    const check = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return <>{children(orientation)}</>;
}
