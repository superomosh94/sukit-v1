import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useShell } from '../hooks/useShell';
import { useSlots } from '../hooks/useSlots';
import { useBuilderContext } from '../hooks/useBuilderContext';
import { ShellContext } from '../contexts/ShellContext';
import { SlotRegistry } from '../slots/SlotRegistry';

function createWrapper() {
  const kernel = {
    log: { warn: vi.fn(), debug: vi.fn(), info: vi.fn(), error: vi.fn() },
  };
  const slotRegistry = new SlotRegistry(kernel);
  return {
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        ShellContext.Provider,
        { value: { kernel, slotRegistry } },
        children
      ),
    kernel,
    slotRegistry,
  };
}

describe('useShell', () => {
  it('returns kernel and slotRegistry from context', () => {
    const { wrapper, kernel, slotRegistry } = createWrapper();
    const { result } = renderHook(() => useShell(), { wrapper });
    expect(result.current.kernel).toBe(kernel);
    expect(result.current.slotRegistry).toBe(slotRegistry);
  });

  it('throws when used outside ShellProvider', () => {
    expect(() => renderHook(() => useShell())).toThrow(
      'useShell must be used within a ShellProvider'
    );
  });
});

describe('useSlots', () => {
  it('provides register, unregister, and query methods', () => {
    const { wrapper, slotRegistry } = createWrapper();
    const { result } = renderHook(() => useSlots(), { wrapper });
    expect(result.current.registerSlot).toBeDefined();
    expect(result.current.unregisterSlot).toBeDefined();
    expect(result.current.getSlotComponents).toBeDefined();
    expect(result.current.hasSlotContent).toBeDefined();
    expect(result.current.kernel).toBeDefined();
  });

  it('registerSlot adds to the registry', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSlots(), { wrapper });
    const Dummy = () => null;
    result.current.registerSlot('test-mod', 'toolbar:top', {
      component: Dummy,
      position: 10,
    });
    const components = result.current.getSlotComponents('toolbar:top');
    expect(components).toHaveLength(1);
    expect(components[0].moduleId).toBe('test-mod');
  });

  it('unregisterSlot removes from registry', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useSlots(), { wrapper });
    const Dummy = () => null;
    result.current.registerSlot('mod-a', 'toolbar:top', { component: Dummy });
    expect(result.current.hasSlotContent('toolbar:top')).toBe(true);
    result.current.unregisterSlot('mod-a', 'toolbar:top');
    expect(result.current.hasSlotContent('toolbar:top')).toBe(false);
  });
});

describe('useBuilderContext', () => {
  it('combines shell and builder state', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useBuilderContext(), { wrapper });
    expect(result.current.sidebarLeftOpen).toBeDefined();
    expect(result.current.currentMode).toBeDefined();
    expect(result.current.zoom).toBeDefined();
    expect(result.current.isDirty).toBeDefined();
    expect(result.current.kernel).toBeDefined();
  });
});
