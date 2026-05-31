import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Canvas } from '../components/Canvas';
import { useShellStore } from '../state/shellStore';

describe('Canvas', () => {
  beforeEach(() => {
    useShellStore.setState({ selectedBlockId: null });
  });

  it('renders children', () => {
    render(
      React.createElement(Canvas, {
        children: React.createElement(
          'div',
          { 'data-testid': 'child' },
          'Builder Content'
        ),
      })
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('shows empty state when no children provided', () => {
    render(React.createElement(Canvas, { children: null }));
    expect(screen.getByText('No builder loaded')).toBeDefined();
    expect(
      screen.getByText('Install a visual builder module to get started')
    ).toBeDefined();
  });

  it('shows selection overlay when block is selected', () => {
    useShellStore.setState({ selectedBlockId: 'block-1' });
    const { container } = render(
      React.createElement(Canvas, {
        children: React.createElement('div', null, 'Content'),
      })
    );
    const overlay = container.querySelector('.selection-overlay');
    expect(overlay).toBeDefined();
  });

  it('hides selection overlay when no block selected', () => {
    const { container } = render(
      React.createElement(Canvas, {
        children: React.createElement('div', null, 'Content'),
      })
    );
    const overlay = container.querySelector('.selection-overlay');
    expect(overlay).toBeNull();
  });
});
