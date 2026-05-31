import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SlotRegistry, BUILTIN_SLOTS } from '../slots/SlotRegistry';

describe('SlotRegistry', () => {
  let kernel: any;
  let registry: SlotRegistry;

  beforeEach(() => {
    kernel = {
      log: { warn: vi.fn(), debug: vi.fn(), info: vi.fn(), error: vi.fn() },
    };
    registry = new SlotRegistry(kernel);
  });

  it('initializes with builtin slots', () => {
    const slots = registry.getAvailableSlots();
    expect(slots).toContain('toolbar:top');
    expect(slots).toContain('sidebar:left');
    expect(slots).toContain('sidebar:right');
    expect(slots).toContain('canvas:main');
    expect(slots).toContain('canvas:overlay');
    expect(slots).toContain('modal:center');
    expect(slots).toContain('settings:tabs');
    expect(slots).toContain('dashboard:widgets');
    expect(slots).toContain('editor:context-menu');
    expect(slots).toContain('toolbar:bottom');
    expect(slots).toContain('canvas:code');
    expect(Object.keys(BUILTIN_SLOTS).length).toBeGreaterThanOrEqual(11);
  });

  it('registers a component in a slot', () => {
    const Dummy = () => null;
    registry.register('test-module', 'toolbar:top', {
      component: Dummy,
      position: 10,
    });
    const components = registry.getSlotComponents('toolbar:top');
    expect(components).toHaveLength(1);
    expect(components[0].moduleId).toBe('test-module');
    expect(components[0].component).toBe(Dummy);
  });

  it('sorts components by position', () => {
    const DummyA = () => null;
    const DummyB = () => null;
    const DummyC = () => null;

    registry.register('mod-a', 'toolbar:top', {
      component: DummyA,
      position: 30,
    });
    registry.register('mod-b', 'toolbar:top', {
      component: DummyB,
      position: 10,
    });
    registry.register('mod-c', 'toolbar:top', {
      component: DummyC,
      position: 20,
    });

    const components = registry.getSlotComponents('toolbar:top');
    expect(components[0].moduleId).toBe('mod-b');
    expect(components[1].moduleId).toBe('mod-c');
    expect(components[2].moduleId).toBe('mod-a');
  });

  it('rejects unknown slots with warning', () => {
    const Dummy = () => null;
    registry.register('test', 'unknown:slot', { component: Dummy });
    expect(kernel.log.warn).toHaveBeenCalledWith('Unknown slot: unknown:slot', {
      moduleId: 'test',
    });
    expect(registry.getSlotComponents('unknown:slot')).toHaveLength(0);
  });

  it('filters by when condition', () => {
    const Dummy = () => null;
    registry.register('mod', 'toolbar:top', {
      component: Dummy,
      when: (ctx) => ctx?.page === 'home',
    });
    expect(registry.getSlotComponents('toolbar:top')).toHaveLength(1);
    expect(
      registry.getSlotComponents('toolbar:top', { page: 'home' })
    ).toHaveLength(1);
    expect(
      registry.getSlotComponents('toolbar:top', { page: 'about' })
    ).toHaveLength(0);
  });

  it('unregisters a single slot', () => {
    const Dummy = () => null;
    registry.register('mod-a', 'toolbar:top', { component: Dummy });
    registry.register('mod-b', 'toolbar:top', { component: Dummy });
    expect(registry.getSlotComponents('toolbar:top')).toHaveLength(2);
    registry.unregister('mod-a', 'toolbar:top');
    expect(registry.getSlotComponents('toolbar:top')).toHaveLength(1);
    expect(registry.getSlotComponents('toolbar:top')[0].moduleId).toBe('mod-b');
  });

  it('unregisters all slots for a module', () => {
    const Dummy = () => null;
    registry.register('mod-a', 'toolbar:top', { component: Dummy });
    registry.register('mod-a', 'sidebar:left', { component: Dummy });
    registry.register('mod-b', 'toolbar:top', { component: Dummy });
    registry.unregisterAll('mod-a');
    expect(registry.getSlotComponents('toolbar:top')).toHaveLength(1);
    expect(registry.getSlotComponents('sidebar:left')).toHaveLength(0);
  });

  it('hasSlotContent returns correct values', () => {
    expect(registry.hasSlotContent('toolbar:top')).toBe(false);
    const Dummy = () => null;
    registry.register('mod', 'toolbar:top', { component: Dummy });
    expect(registry.hasSlotContent('toolbar:top')).toBe(true);
    expect(registry.hasSlotContent('unknown')).toBe(false);
  });

  it('uses default position when not specified', () => {
    const Dummy = () => null;
    registry.register('mod', 'toolbar:top', { component: Dummy });
    expect(registry.getSlotComponents('toolbar:top')[0].position).toBe(
      BUILTIN_SLOTS['toolbar:top'].defaultPosition
    );
  });

  it('passes props through to slot definition', () => {
    const Dummy = () => null;
    registry.register('mod', 'toolbar:top', {
      component: Dummy,
      props: { color: 'red', size: 'lg' },
    });
    expect(registry.getSlotComponents('toolbar:top')[0].props).toEqual({
      color: 'red',
      size: 'lg',
    });
  });
});
