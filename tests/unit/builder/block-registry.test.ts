import { describe, it, expect, beforeEach } from 'vitest';
import { blockRegistry } from '@/lib/builder/block-registry';

describe('BlockRegistry', () => {
  beforeEach(() => {
    blockRegistry.clear();
  });

  it('registerBlockType stores registration', () => {
    const registration = {
      type: 'text',
      component: () => null,
      category: 'content',
      schema: {},
      defaultProps: { content: 'text' },
    };
    blockRegistry.registerBlockType(registration);
    expect(blockRegistry.getBlockType('text')).toBeDefined();
  });

  it('getBlockType returns by type string', () => {
    const registration = {
      type: 'image',
      component: () => null,
      category: 'media',
      schema: {},
      defaultProps: { src: '' },
    };
    blockRegistry.registerBlockType(registration);
    const retrieved = blockRegistry.getBlockType('image');
    expect(retrieved?.type).toBe('image');
  });

  it('getBlocksByCategory filters correctly', () => {
    blockRegistry.registerBlockType({
      type: 'text',
      component: () => null,
      category: 'content',
      schema: {},
      defaultProps: {},
    });
    blockRegistry.registerBlockType({
      type: 'button',
      component: () => null,
      category: 'content',
      schema: {},
      defaultProps: {},
    });
    blockRegistry.registerBlockType({
      type: 'image',
      component: () => null,
      category: 'media',
      schema: {},
      defaultProps: {},
    });
    const contentBlocks = blockRegistry.getBlocksByCategory('content');
    expect(contentBlocks).toHaveLength(2);
    const mediaBlocks = blockRegistry.getBlocksByCategory('media');
    expect(mediaBlocks).toHaveLength(1);
  });

  it('getAllBlockTypes returns all', () => {
    blockRegistry.registerBlockType({
      type: 'text',
      component: () => null,
      category: 'content',
      schema: {},
      defaultProps: {},
    });
    blockRegistry.registerBlockType({
      type: 'image',
      component: () => null,
      category: 'media',
      schema: {},
      defaultProps: {},
    });
    expect(blockRegistry.getAllBlockTypes()).toHaveLength(2);
  });
});
