import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PageRenderer, SectionRenderer, BlockRenderer } from '@/lib/builder/renderer';
import { resolveBlock } from '@/lib/builder/renderer';
import { useBuilderStore } from '@/lib/builder/store';

describe('PageRenderer', () => {
  it('renders all sections', () => {
    useBuilderStore.setState({
      sections: [
        { id: 'sec-1', type: 'empty', blocks: [], settings: { bgColor: '#fff' } },
        { id: 'sec-2', type: 'cover', blocks: [], settings: { bgColor: '#000' } },
      ],
    });
    render(<PageRenderer />);
    expect(screen.getByTestId('section-sec-1')).toBeDefined();
    expect(screen.getByTestId('section-sec-2')).toBeDefined();
  });
});

describe('SectionRenderer', () => {
  it('applies settings (bgColor, padding)', () => {
    const section = {
      id: 'sec-1',
      type: 'empty',
      blocks: [],
      settings: { bgColor: '#ff0000', padding: '2rem' },
    };
    const { container } = render(<SectionRenderer section={section} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('#ff0000');
    expect(el.style.padding).toBe('2rem');
  });
});

describe('BlockRenderer', () => {
  it('renders registered block component', () => {
    const block = {
      id: 'blk-1',
      type: 'text',
      props: { content: 'Hello World' },
      styles: {},
    };
    render(<BlockRenderer block={block} />);
    expect(screen.getByText('Hello World')).toBeDefined();
  });
});

describe('resolveBlock', () => {
  it('merges responsive overrides', () => {
    const block = {
      id: 'blk-1',
      type: 'text',
      props: { content: 'test', size: 'base' },
      styles: { color: '#333', fontSize: '16px' },
      responsive: {
        mobile: { styles: { fontSize: '14px' } },
        tablet: { styles: { fontSize: '15px' } },
      },
    };
    const desktop = resolveBlock(block, 'desktop');
    expect(desktop.styles.fontSize).toBe('16px');
    const mobile = resolveBlock(block, 'mobile');
    expect(mobile.styles.fontSize).toBe('14px');
    const tablet = resolveBlock(block, 'tablet');
    expect(tablet.styles.fontSize).toBe('15px');
  });
});
