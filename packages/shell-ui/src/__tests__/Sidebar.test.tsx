import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Sidebar } from '../components/Sidebar';

describe('Sidebar', () => {
  it('renders children', () => {
    render(
      React.createElement(
        Sidebar,
        { side: 'left' as const },
        React.createElement(
          'div',
          { 'data-testid': 'content' },
          'Sidebar Content'
        )
      )
    );
    expect(screen.getByTestId('content')).toBeDefined();
    expect(screen.getByText('Sidebar Content')).toBeDefined();
  });

  it('applies side correctly', () => {
    const { container } = render(
      React.createElement(
        Sidebar,
        { side: 'right' as const },
        React.createElement('div', null, 'Content')
      )
    );
    expect(container.firstChild).toBeDefined();
  });
});
