import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { StatusBar } from '../components/StatusBar';
import { ShellContext } from '../contexts/ShellContext';
import { SlotRegistry } from '../slots/SlotRegistry';
import { useShellStore } from '../state/shellStore';

function createMockKernel() {
  const handlers = new Map<string, Set<(...args: any[]) => void>>();
  return {
    log: { warn: vi.fn(), debug: vi.fn(), info: vi.fn(), error: vi.fn() },
    events: {
      on: vi.fn((event: string, handler: (...args: any[]) => void) => {
        if (!handlers.has(event)) handlers.set(event, new Set());
        handlers.get(event)!.add(handler);
        return () => handlers.get(event)?.delete(handler);
      }),
      emit: vi.fn(async (event: string, payload?: any) => {
        const h = handlers.get(event);
        if (h) for (const fn of h) await fn(payload);
      }),
      off: vi.fn(),
      once: vi.fn(),
    },
  };
}

describe('StatusBar', () => {
  beforeEach(() => {
    useShellStore.setState({
      currentSiteId: 'site-abc123',
      currentPageId: 'page-xyz789',
      currentMode: 'visual',
    });
  });

  it('shows ready status by default', () => {
    const kernel = createMockKernel();
    const slotRegistry = new SlotRegistry(kernel);
    render(
      React.createElement(
        ShellContext.Provider,
        { value: { kernel, slotRegistry } },
        React.createElement(StatusBar, null)
      )
    );
    expect(screen.getByText('Ready')).toBeDefined();
  });

  it('displays site and page IDs', () => {
    const kernel = createMockKernel();
    const slotRegistry = new SlotRegistry(kernel);
    render(
      React.createElement(
        ShellContext.Provider,
        { value: { kernel, slotRegistry } },
        React.createElement(StatusBar, null)
      )
    );
    expect(screen.getByText('Site: site-abc')).toBeDefined();
    expect(screen.getByText('Page: page-xyz')).toBeDefined();
    expect(screen.getByText('Mode: visual')).toBeDefined();
  });

  it("shows 'None' when no site is selected", () => {
    useShellStore.setState({ currentSiteId: null, currentPageId: null });
    const kernel = createMockKernel();
    const slotRegistry = new SlotRegistry(kernel);
    render(
      React.createElement(
        ShellContext.Provider,
        { value: { kernel, slotRegistry } },
        React.createElement(StatusBar, null)
      )
    );
    expect(screen.getByText('Site: None')).toBeDefined();
    expect(screen.getByText('Page: None')).toBeDefined();
  });

  it('shows saving status on save-start event', async () => {
    const kernel = createMockKernel();
    const slotRegistry = new SlotRegistry(kernel);
    render(
      React.createElement(
        ShellContext.Provider,
        { value: { kernel, slotRegistry } },
        React.createElement(StatusBar, null)
      )
    );
    await act(async () => {
      await kernel.events.emit('editor:save-start');
    });
    expect(screen.getByText('Saving...')).toBeDefined();
  });

  it('shows saved on save-complete event', async () => {
    const kernel = createMockKernel();
    const slotRegistry = new SlotRegistry(kernel);
    render(
      React.createElement(
        ShellContext.Provider,
        { value: { kernel, slotRegistry } },
        React.createElement(StatusBar, null)
      )
    );
    await act(async () => {
      await kernel.events.emit('editor:save-complete');
    });
    expect(screen.getByText('Saved')).toBeDefined();
  });

  it('shows error on save-error event', async () => {
    const kernel = createMockKernel();
    const slotRegistry = new SlotRegistry(kernel);
    render(
      React.createElement(
        ShellContext.Provider,
        { value: { kernel, slotRegistry } },
        React.createElement(StatusBar, null)
      )
    );
    await act(async () => {
      await kernel.events.emit('editor:save-error', new Error('Disk full'));
    });
    expect(screen.getByText('Error: Disk full')).toBeDefined();
  });
});
