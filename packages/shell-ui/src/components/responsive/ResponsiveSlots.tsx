'use client';

import React, { type ReactNode } from 'react';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface ResponsiveSlotsProps {
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  context?: any;
}

export function ResponsiveSlots({ breakpoint, context }: ResponsiveSlotsProps) {
  const slotName = `${breakpoint}:content`;

  return (
    <div
      className={`responsive-slots responsive-${breakpoint}`}
      data-breakpoint={breakpoint}
    >
      <SlotRenderer name={slotName} context={context} />
    </div>
  );
}
