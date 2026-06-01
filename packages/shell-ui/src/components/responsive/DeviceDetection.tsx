'use client';

import React, { useState, useEffect, type ReactNode } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceDetectionProps {
  children: (device: DeviceType) => ReactNode;
}

export function DeviceDetection({ children }: DeviceDetectionProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 640) setDevice('mobile');
      else if (w < 1024) setDevice('tablet');
      else setDevice('desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return <>{children(device)}</>;
}
