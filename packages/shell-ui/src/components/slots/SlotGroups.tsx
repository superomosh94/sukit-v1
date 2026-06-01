'use client';

import React, { type ReactNode } from 'react';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface SlotGroupsProps {
  group: string;
  context?: any;
  children?: ReactNode;
}

export function SlotGroups({ group, context, children }: SlotGroupsProps) {
  const slotName = `group:${group}`;

  return (
    <div className="slot-group" data-group={group}>
      <SlotRenderer name={slotName} context={context} />
      {children}
    </div>
  );
}
