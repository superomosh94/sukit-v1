import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

interface BlockDefinition {
  type: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

function BlockLibrary({
  blocks,
  onSelect,
  onSearch,
}: {
  blocks: BlockDefinition[];
  onSelect: (block: BlockDefinition) => void;
  onSearch?: (query: string) => void;
}) {
  return (
    <div data-testid="block-library">
      {onSearch && (
        <input
          data-testid="search-input"
          type="search"
          placeholder="Search blocks..."
          onChange={(e) => onSearch(e.target.value)}
        />
      )}
      <div data-testid="blocks-grid">
        {blocks.map((block) => (
          <div
            key={block.type}
            data-testid={`block-${block.type}`}
            className="block-item"
            onClick={() => onSelect(block)}
          >
            <span className="block-icon">{block.icon}</span>
            <span className="block-name">{block.name}</span>
            <span className="block-category">{block.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCK_BLOCKS: BlockDefinition[] = [
  {
    type: 'heading',
    name: 'Heading',
    category: 'content',
    description: 'A heading block',
    icon: 'H',
  },
  {
    type: 'paragraph',
    name: 'Paragraph',
    category: 'content',
    description: 'A paragraph block',
    icon: 'P',
  },
  {
    type: 'image',
    name: 'Image',
    category: 'media',
    description: 'An image block',
    icon: '🖼',
  },
  {
    type: 'button',
    name: 'Button',
    category: 'forms',
    description: 'A button block',
    icon: '🔘',
  },
  {
    type: 'video',
    name: 'Video',
    category: 'media',
    description: 'A video block',
    icon: '🎬',
  },
];

describe('BlockLibrary component', () => {
  it('should render all blocks', () => {
    render(<BlockLibrary blocks={MOCK_BLOCKS} onSelect={() => {}} />);
    MOCK_BLOCKS.forEach((block) => {
      expect(screen.getByText(block.name)).toBeDefined();
    });
  });

  it('should call onSelect when a block is clicked', () => {
    const onSelect = vi.fn();
    render(<BlockLibrary blocks={MOCK_BLOCKS} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('block-heading'));
    expect(onSelect).toHaveBeenCalledWith(MOCK_BLOCKS[0]);
  });

  it('should show search input when onSearch is provided', () => {
    render(
      <BlockLibrary
        blocks={MOCK_BLOCKS}
        onSelect={() => {}}
        onSearch={() => {}}
      />
    );
    expect(screen.getByTestId('search-input')).toBeDefined();
  });

  it('should call onSearch when typing in search', () => {
    const onSearch = vi.fn();
    render(
      <BlockLibrary
        blocks={MOCK_BLOCKS}
        onSelect={() => {}}
        onSearch={onSearch}
      />
    );
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'heading' } });
    expect(onSearch).toHaveBeenCalledWith('heading');
  });

  it('should not show search input when onSearch is not provided', () => {
    render(<BlockLibrary blocks={MOCK_BLOCKS} onSelect={() => {}} />);
    expect(screen.queryByTestId('search-input')).toBeNull();
  });

  it('should display block categories', () => {
    render(<BlockLibrary blocks={MOCK_BLOCKS} onSelect={() => {}} />);
    const categories = screen.getAllByText(/content|media|forms/);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('should handle empty blocks array', () => {
    render(<BlockLibrary blocks={[]} onSelect={() => {}} />);
    expect(screen.getByTestId('blocks-grid').children.length).toBe(0);
  });
});
