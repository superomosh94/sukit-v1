import { useState } from 'react';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function useResponsivePreview(defaultMode: DeviceMode = 'desktop') {
  const [device, setDevice] = useState<DeviceMode>(defaultMode);
  const [scale, setScale] = useState(1);

  const deviceWidths: Record<DeviceMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return {
    device,
    setDevice,
    scale,
    setScale,
    width: deviceWidths[device],
    isDesktop: device === 'desktop',
    isTablet: device === 'tablet',
    isMobile: device === 'mobile',
  };
}
