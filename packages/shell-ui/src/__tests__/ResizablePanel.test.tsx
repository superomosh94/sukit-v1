import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { ResizablePanel } from '../components/ResizablePanel';

describe('ResizablePanel', () => {
  it('renders children with given width', () => {
    const { container } = render(
      React.createElement(ResizablePanel, {
        width: 300,
        onResize: vi.fn(),
        side: 'left' as const,
        children: React.createElement(
          'div',
          { 'data-testid': 'content' },
          'Panel Content'
        ),
      })
    );
    const panel = container.firstChild as HTMLElement;
    expect(panel.style.width).toBe('300px');
  });

  it('renders resize handle', () => {
    const { container } = render(
      React.createElement(ResizablePanel, {
        width: 260,
        onResize: vi.fn(),
        side: 'left' as const,
        children: React.createElement('div', null, 'Content'),
      })
    );
    const handle = container.querySelector('.cursor-col-resize');
    expect(handle).toBeDefined();
  });

  it('positions resize handle on right for left sidebar', () => {
    const { container } = render(
      React.createElement(ResizablePanel, {
        width: 260,
        onResize: vi.fn(),
        side: 'left' as const,
        children: React.createElement('div', null, 'Content'),
      })
    );
    const handle = container.querySelector('.cursor-col-resize') as HTMLElement;
    expect(handle.className).toContain('right-0');
  });

  it('positions resize handle on left for right sidebar', () => {
    const { container } = render(
      React.createElement(ResizablePanel, {
        width: 320,
        onResize: vi.fn(),
        side: 'right' as const,
        children: React.createElement('div', null, 'Content'),
      })
    );
    const handle = container.querySelector('.cursor-col-resize') as HTMLElement;
    expect(handle.className).toContain('left-0');
  });

  it('calls onResize on mouse drag', () => {
    const onResize = vi.fn();
    const { container } = render(
      React.createElement(ResizablePanel, {
        width: 260,
        onResize,
        side: 'left' as const,
        children: React.createElement('div', null, 'Content'),
      })
    );
    const handle = container.querySelector('.cursor-col-resize') as HTMLElement;

    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 140 });
    fireEvent.mouseUp(window);

    expect(onResize).toHaveBeenCalledWith(300);
  });

  it('clamps width to min/max on drag', () => {
    const onResize = vi.fn();
    const { container } = render(
      React.createElement(ResizablePanel, {
        width: 260,
        onResize,
        minWidth: 200,
        maxWidth: 400,
        side: 'left' as const,
        children: React.createElement('div', null, 'Content'),
      })
    );
    const handle = container.querySelector('.cursor-col-resize') as HTMLElement;

    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: -200 });
    fireEvent.mouseUp(window);

    expect(onResize).toHaveBeenCalledWith(200);
  });

  it('toggles bg-primary class while resizing', () => {
    const { container } = render(
      React.createElement(ResizablePanel, {
        width: 260,
        onResize: vi.fn(),
        side: 'left' as const,
        children: React.createElement('div', null, 'Content'),
      })
    );
    const handle = container.querySelector('.cursor-col-resize') as HTMLElement;

    const classNames = () => handle.className.split(' ').filter(Boolean);
    expect(classNames()).not.toContain('bg-primary');
    fireEvent.mouseDown(handle, { clientX: 100 });
    expect(classNames()).toContain('bg-primary');
    fireEvent.mouseUp(window);
    expect(classNames()).not.toContain('bg-primary');
  });
});
