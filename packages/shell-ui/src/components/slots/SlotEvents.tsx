'use client';

import React, { useEffect } from 'react';
import { useShell } from '../../hooks/useShell';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface SlotEventsProps {
  slotName: string;
  eventName: string;
  context?: any;
}

export function SlotEvents({ slotName, eventName, context }: SlotEventsProps) {
  const { kernel } = useShell();

  useEffect(() => {
    if (!kernel?.events) return;
    const handler = (payload: any) => {
      kernel.events.emit(eventName, { slotName, ...payload });
    };
    kernel.events.on(eventName, handler);
    return () => {
      kernel.events.off(eventName, handler);
    };
  }, [kernel, slotName, eventName]);

  return <SlotRenderer name={slotName} context={context} />;
}
