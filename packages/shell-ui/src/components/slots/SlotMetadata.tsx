'use client';

import React from 'react';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface SlotMetadataProps {
  slotName: string;
  context?: any;
}

export function SlotMetadata({ slotName, context }: SlotMetadataProps) {
  return (
    <div className="slot-metadata">
      <SlotRenderer name={slotName} context={context} />
    </div>
  );
}
