import React, { type ComponentType, type ReactNode } from 'react';
import type { SlotOptions } from '../types';

export function createUIAPI() {
  const slots = new Map<
    string,
    Array<{ component: ComponentType<any>; options: SlotOptions; id: string }>
  >();

  return {
    registerSlot(
      slot: string,
      component: ComponentType<any>,
      options: SlotOptions = {}
    ): void {
      if (!slots.has(slot)) slots.set(slot, []);
      const list = slots.get(slot)!;
      list.push({ component, options, id: `${slot}-${list.length}` });
      list.sort(
        (a, b) => (a.options.position ?? 50) - (b.options.position ?? 50)
      );
    },

    renderSlot(slot: string, props?: any): ReactNode {
      const components = slots.get(slot);
      if (!components) return null;
      return components.map(({ component: Component, id }) =>
        React.createElement(Component, { ...props, key: id })
      );
    },

    getSlotComponents(slot: string) {
      return slots.get(slot) ?? [];
    },
  };
}

export type UIAPI = ReturnType<typeof createUIAPI>;
