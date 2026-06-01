import { type ComponentType, type ReactNode } from 'react';
import type { SlotOptions } from '../types';
export declare function createUIAPI(): {
  registerSlot(
    slot: string,
    component: ComponentType<any>,
    options?: SlotOptions
  ): void;
  renderSlot(slot: string, props?: any): ReactNode;
  getSlotComponents(slot: string): {
    component: ComponentType<any>;
    options: SlotOptions;
    id: string;
  }[];
};
export type UIAPI = ReturnType<typeof createUIAPI>;
//# sourceMappingURL=ui.d.ts.map
