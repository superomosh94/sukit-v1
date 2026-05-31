import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SlotRenderer } from '../slots/SlotRenderer';
import { SlotRegistry } from '../slots/SlotRegistry';
import { ShellContext } from '../contexts/ShellContext';

function createTestContext() {
  const kernel = {
    log: { warn: vi.fn(), debug: vi.fn(), info: vi.fn(), error: vi.fn() },
  };
  const slotRegistry = new SlotRegistry(kernel);
  return { kernel, slotRegistry };
}

function Wrapper({ context }: { context: any }) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(ShellContext.Provider, { value: context }, children);
}

describe('SlotRenderer', () => {
  it('renders nothing when slot is empty', () => {
    const ctx = createTestContext();
    const { container } = render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(SlotRenderer, { name: 'toolbar:top' })
      )
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders fallback when slot is empty', () => {
    const ctx = createTestContext();
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(SlotRenderer, {
          name: 'toolbar:top',
          fallback: React.createElement(
            'div',
            { 'data-testid': 'fallback' },
            'No content'
          ),
        })
      )
    );
    expect(screen.getByTestId('fallback')).toBeDefined();
  });

  it('renders registered components', () => {
    const ctx = createTestContext();
    ctx.slotRegistry.register('test', 'toolbar:top', {
      component: () =>
        React.createElement('button', { 'data-testid': 'slot-btn' }, 'Click'),
      position: 10,
    });
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(SlotRenderer, { name: 'toolbar:top' })
      )
    );
    expect(screen.getByTestId('slot-btn')).toBeDefined();
  });

  it('renders multiple components in a multi slot', () => {
    const ctx = createTestContext();
    ctx.slotRegistry.register('mod-a', 'toolbar:top', {
      component: () => React.createElement('span', { 'data-testid': 'a' }, 'A'),
      position: 10,
    });
    ctx.slotRegistry.register('mod-b', 'toolbar:top', {
      component: () => React.createElement('span', { 'data-testid': 'b' }, 'B'),
      position: 20,
    });
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(SlotRenderer, { name: 'toolbar:top' })
      )
    );
    expect(screen.getByTestId('a')).toBeDefined();
    expect(screen.getByTestId('b')).toBeDefined();
  });

  it('renders only first component in exclusive slot (canvas:main)', () => {
    const ctx = createTestContext();
    ctx.slotRegistry.register('mod-a', 'canvas:main', {
      component: () =>
        React.createElement('div', { 'data-testid': 'first' }, 'First'),
      position: 10,
    });
    ctx.slotRegistry.register('mod-b', 'canvas:main', {
      component: () =>
        React.createElement('div', { 'data-testid': 'second' }, 'Second'),
      position: 20,
    });
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(SlotRenderer, { name: 'canvas:main' })
      )
    );
    expect(screen.getByTestId('first')).toBeDefined();
    expect(screen.queryByTestId('second')).toBeNull();
  });

  it('renders context-aware components based on when condition', () => {
    const ctx = createTestContext();
    ctx.slotRegistry.register('test', 'toolbar:top', {
      component: () =>
        React.createElement('div', { 'data-testid': 'conditional' }, 'Visible'),
      when: (c: any) => c?.show === true,
    });
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(SlotRenderer, {
          name: 'toolbar:top',
          context: { show: true },
        })
      )
    );
    expect(screen.getByTestId('conditional')).toBeDefined();
  });

  it('does not render when context mismatches when condition', () => {
    const ctx = createTestContext();
    ctx.slotRegistry.register('test', 'toolbar:top', {
      component: () =>
        React.createElement('div', { 'data-testid': 'conditional' }, 'Visible'),
      when: (c: any) => c?.show === true,
    });
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(SlotRenderer, {
          name: 'toolbar:top',
          context: { show: false },
        })
      )
    );
    expect(screen.queryByTestId('conditional')).toBeNull();
  });

  it('applies custom className', () => {
    const ctx = createTestContext();
    ctx.slotRegistry.register('test', 'toolbar:top', {
      component: () => React.createElement('span', null, 'item'),
      position: 10,
    });
    const { container } = render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(SlotRenderer, {
          name: 'toolbar:top',
          className: 'my-custom-class',
        })
      )
    );
    const slotContainer = container.firstChild as HTMLElement;
    expect(slotContainer.className).toContain('my-custom-class');
  });
});
