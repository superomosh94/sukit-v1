'use client';

import { useCallback } from 'react';
import { useShell } from './useShell';
import type { SlotDefinition } from '../slots/SlotRegistry';

export function useSlots() {
  const { slotRegistry, kernel } = useShell();

  const registerSlot = useCallback(
    (
      moduleId: string,
      slotName: string,
      definition: Omit<SlotDefinition, 'moduleId' | 'name'>
    ) => {
      slotRegistry.register(moduleId, slotName, definition);
    },
    [slotRegistry]
  );

  const unregisterSlot = useCallback(
    (moduleId: string, slotName: string) => {
      slotRegistry.unregister(moduleId, slotName);
    },
    [slotRegistry]
  );

  const getSlotComponents = useCallback(
    (slotName: string, context?: any) => {
      return slotRegistry.getSlotComponents(slotName, context);
    },
    [slotRegistry]
  );

  return {
    registerSlot,
    unregisterSlot,
    getSlotComponents,
    hasSlotContent: slotRegistry.hasSlotContent.bind(slotRegistry),
    kernel,
  };
}
