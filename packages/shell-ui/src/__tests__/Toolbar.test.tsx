import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Toolbar } from '../components/Toolbar';
import { ShellContext } from '../contexts/ShellContext';
import { useShellStore } from '../state/shellStore';
import { SlotRegistry } from '../slots/SlotRegistry';

function createMockContext() {
  const kernel = {
    log: { warn: vi.fn(), debug: vi.fn(), info: vi.fn(), error: vi.fn() },
    events: {
      on: vi.fn(() => vi.fn()),
      emit: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
    },
    export: { toStatic: vi.fn() },
  };
  const slotRegistry = new SlotRegistry(kernel);
  return { kernel, slotRegistry };
}

describe('Toolbar', () => {
  beforeEach(() => {
    useShellStore.setState({
      sidebarLeftOpen: true,
      sidebarRightOpen: true,
      currentMode: 'visual',
      currentSiteId: 'site-test',
      theme: 'light',
    });
  });

  it('renders all mode buttons', () => {
    const ctx = createMockContext();
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(Toolbar, null)
      )
    );
    expect(screen.getByText('Visual')).toBeDefined();
    expect(screen.getByText('Code')).toBeDefined();
    expect(screen.getByText('Split')).toBeDefined();
  });

  it('highlights current mode', () => {
    const ctx = createMockContext();
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(Toolbar, null)
      )
    );
    const visualBtn = screen.getByText('Visual').closest('button')!;
    expect(visualBtn.className).toContain('bg-background');
  });

  it('switches mode on click', () => {
    const ctx = createMockContext();
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(Toolbar, null)
      )
    );
    fireEvent.click(screen.getByText('Code'));
    expect(useShellStore.getState().currentMode).toBe('code');
    fireEvent.click(screen.getByText('Split'));
    expect(useShellStore.getState().currentMode).toBe('split');
  });

  it('toggles left sidebar on menu click', () => {
    const ctx = createMockContext();
    useShellStore.setState({ sidebarLeftOpen: true });
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(Toolbar, null)
      )
    );
    const menuBtn = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(menuBtn);
    expect(useShellStore.getState().sidebarLeftOpen).toBe(false);
  });

  it('emits save event on save click', () => {
    const ctx = createMockContext();
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(Toolbar, null)
      )
    );
    fireEvent.click(screen.getByLabelText('Save'));
    expect(ctx.kernel.events.emit).toHaveBeenCalledWith('editor:save', {
      auto: false,
    });
  });

  it('emits export event on export click', () => {
    const ctx = createMockContext();
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(Toolbar, null)
      )
    );
    fireEvent.click(screen.getByLabelText('Export'));
    expect(ctx.kernel.events.emit).toHaveBeenCalledWith('editor:export', {
      siteId: 'site-test',
    });
  });

  it('emits open-settings on settings click', () => {
    const ctx = createMockContext();
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(Toolbar, null)
      )
    );
    fireEvent.click(screen.getByLabelText('Settings'));
    expect(ctx.kernel.events.emit).toHaveBeenCalledWith('ui:open-settings');
  });

  it('undo and redo buttons are disabled', () => {
    const ctx = createMockContext();
    render(
      React.createElement(
        ShellContext.Provider,
        { value: ctx },
        React.createElement(Toolbar, null)
      )
    );
    expect(screen.getByLabelText('Undo')).toBeDisabled();
    expect(screen.getByLabelText('Redo')).toBeDisabled();
  });
});
