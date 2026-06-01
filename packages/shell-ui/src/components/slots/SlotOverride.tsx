'use client';

import React from 'react';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface SlotOverrideProps {
  slotName: string;
  overrideWith: React.ReactNode;
  context?: any;
}

export function SlotOverride({
  slotName,
  overrideWith,
  context,
}: SlotOverrideProps) {
  if (overrideWith) {
    return <>{overrideWith}</>;
  }
  return <SlotRenderer name={slotName} context={context} />;
}
