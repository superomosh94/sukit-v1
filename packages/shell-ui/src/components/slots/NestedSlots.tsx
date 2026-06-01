'use client';

import React, { type ReactNode } from 'react';
import { useShell } from '../../hooks/useShell';

export interface NestedSlotsProps {
  slotName: string;
  context?: any;
  children?: ReactNode;
}

export function NestedSlots({ slotName, context, children }: NestedSlotsProps) {
  const { slotRegistry } = useShell();
  const childSlots = slotRegistry
    .getAvailableSlots()
    .filter((s) => s.startsWith(slotName) && s !== slotName);

  return (
    <>
      {childSlots.length > 0 && (
        <div className="nested-slots">
          {childSlots.map((childSlot) => (
            <div
              key={childSlot}
              className={`nested-slot nested-slot-${childSlot.replace(':', '-')}`}
            />
          ))}
        </div>
      )}
      {children}
    </>
  );
}
