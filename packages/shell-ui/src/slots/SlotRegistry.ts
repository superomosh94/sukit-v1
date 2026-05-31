'use client';

import type { ComponentType } from 'react';

export interface SlotDefinition {
  name: string;
  component: ComponentType<any>;
  moduleId: string;
  position: number;
  when?: (context: any) => boolean;
  props?: Record<string, any>;
}

export interface BuiltinSlot {
  name: string;
  description: string;
  multiple: boolean;
  defaultPosition: number;
}

export const BUILTIN_SLOTS: Record<string, BuiltinSlot> = {
  'toolbar:top': {
    name: 'toolbar:top',
    description: 'Top toolbar area for buttons and controls',
    multiple: true,
    defaultPosition: 50,
  },
  'toolbar:bottom': {
    name: 'toolbar:bottom',
    description: 'Bottom status bar',
    multiple: true,
    defaultPosition: 50,
  },
  'sidebar:left': {
    name: 'sidebar:left',
    description: 'Left sidebar for navigation and blocks library',
    multiple: true,
    defaultPosition: 100,
  },
  'sidebar:right': {
    name: 'sidebar:right',
    description: 'Right sidebar for property panels',
    multiple: true,
    defaultPosition: 100,
  },
  'canvas:main': {
    name: 'canvas:main',
    description: 'Main canvas area (usually occupied by visual builder)',
    multiple: false,
    defaultPosition: 0,
  },
  'canvas:code': {
    name: 'canvas:code',
    description: 'Code editor area in split mode',
    multiple: false,
    defaultPosition: 0,
  },
  'canvas:overlay': {
    name: 'canvas:overlay',
    description: 'Overlay on top of canvas (for guides, rulers)',
    multiple: true,
    defaultPosition: 50,
  },
  'modal:center': {
    name: 'modal:center',
    description: 'Global modal dialogs',
    multiple: true,
    defaultPosition: 50,
  },
  'settings:tabs': {
    name: 'settings:tabs',
    description: 'Tabs in the settings panel',
    multiple: true,
    defaultPosition: 50,
  },
  'dashboard:widgets': {
    name: 'dashboard:widgets',
    description: 'Widgets on the dashboard',
    multiple: true,
    defaultPosition: 50,
  },
  'editor:context-menu': {
    name: 'editor:context-menu',
    description: 'Right-click context menu items',
    multiple: true,
    defaultPosition: 50,
  },
};

export class SlotRegistry {
  private slots = new Map<string, SlotDefinition[]>();
  private kernel: any;

  constructor(kernel: any) {
    this.kernel = kernel;
    this.initializeBuiltinSlots();
  }

  private initializeBuiltinSlots() {
    for (const slotName of Object.keys(BUILTIN_SLOTS)) {
      this.slots.set(slotName, []);
    }
  }

  register(
    moduleId: string,
    slotName: string,
    definition: Omit<SlotDefinition, 'moduleId' | 'name'>
  ) {
    if (!this.slots.has(slotName)) {
      this.kernel.log.warn(`Unknown slot: ${slotName}`, { moduleId });
      return;
    }

    const slotDef: SlotDefinition = {
      name: slotName,
      moduleId,
      component: definition.component,
      position:
        definition.position ?? BUILTIN_SLOTS[slotName]?.defaultPosition ?? 100,
      when: definition.when,
      props: definition.props,
    };

    const currentSlots = this.slots.get(slotName)!;
    currentSlots.push(slotDef);
    currentSlots.sort((a, b) => a.position - b.position);

    this.kernel.log.debug(`Registered component in slot: ${slotName}`, {
      moduleId,
    });
  }

  unregister(moduleId: string, slotName: string) {
    const currentSlots = this.slots.get(slotName);
    if (currentSlots) {
      const filtered = currentSlots.filter(
        (slot) => slot.moduleId !== moduleId
      );
      this.slots.set(slotName, filtered);
    }
  }

  unregisterAll(moduleId: string) {
    for (const [slotName, slots] of this.slots) {
      const filtered = slots.filter((slot) => slot.moduleId !== moduleId);
      this.slots.set(slotName, filtered);
    }
  }

  getSlotComponents(slotName: string, context?: any): SlotDefinition[] {
    const slots = this.slots.get(slotName) || [];
    return slots.filter((slot) => {
      if (slot.when && context) {
        return slot.when(context);
      }
      return true;
    });
  }

  hasSlotContent(slotName: string): boolean {
    return (this.slots.get(slotName)?.length ?? 0) > 0;
  }

  getAvailableSlots(): string[] {
    return Array.from(this.slots.keys());
  }
}
