import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from '@/lib/builder/store';

describe('BuilderStore', () => {
  beforeEach(() => {
    useBuilderStore.setState({
      sections: [],
      viewport: 'desktop',
      history: [],
      historyIndex: -1,
    });
  });

  it('addSection adds to sections array', () => {
    const section = { id: 'sec-1', type: 'empty', blocks: [], settings: {} };
    useBuilderStore.getState().addSection(section);
    expect(useBuilderStore.getState().sections).toHaveLength(1);
    expect(useBuilderStore.getState().sections[0].id).toBe('sec-1');
  });

  it('deleteSection removes section', () => {
    useBuilderStore.getState().addSection({ id: 'sec-1', type: 'empty', blocks: [], settings: {} });
    useBuilderStore.getState().addSection({ id: 'sec-2', type: 'cover', blocks: [], settings: {} });
    useBuilderStore.getState().deleteSection('sec-1');
    expect(useBuilderStore.getState().sections).toHaveLength(1);
    expect(useBuilderStore.getState().sections[0].id).toBe('sec-2');
  });

  it('updateBlock updates props and styles correctly', () => {
    useBuilderStore.getState().addSection({
      id: 'sec-1',
      type: 'empty',
      blocks: [{ id: 'blk-1', type: 'text', props: { content: 'hello' }, styles: {} }],
      settings: {},
    });
    useBuilderStore.getState().updateBlock('blk-1', { props: { content: 'world' } });
    const block = useBuilderStore.getState().sections[0].blocks[0];
    expect(block.props.content).toBe('world');
  });

  it('undo/redo works', () => {
    useBuilderStore.getState().addSection({ id: 'sec-1', type: 'empty', blocks: [], settings: {} });
    useBuilderStore.getState().addSection({ id: 'sec-2', type: 'cover', blocks: [], settings: {} });
    expect(useBuilderStore.getState().sections).toHaveLength(2);
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().sections).toHaveLength(1);
    useBuilderStore.getState().redo();
    expect(useBuilderStore.getState().sections).toHaveLength(2);
  });

  it('setViewport changes viewport', () => {
    useBuilderStore.getState().setViewport('tablet');
    expect(useBuilderStore.getState().viewport).toBe('tablet');
    useBuilderStore.getState().setViewport('mobile');
    expect(useBuilderStore.getState().viewport).toBe('mobile');
  });

  it('reorderSections moves section to new position', () => {
    useBuilderStore.getState().addSection({ id: 'sec-1', type: 'empty', blocks: [], settings: {} });
    useBuilderStore.getState().addSection({ id: 'sec-2', type: 'cover', blocks: [], settings: {} });
    useBuilderStore.getState().addSection({ id: 'sec-3', type: 'parallax', blocks: [], settings: {} });
    useBuilderStore.getState().reorderSections(0, 2);
    const ids = useBuilderStore.getState().sections.map(s => s.id);
    expect(ids).toEqual(['sec-2', 'sec-3', 'sec-1']);
  });

  it('history limited to 50 snapshots', () => {
    for (let i = 0; i < 60; i++) {
      useBuilderStore.getState().addSection({
        id: `sec-${i}`,
        type: 'empty',
        blocks: [],
        settings: {},
        _undoSkip: i < 55,
      });
    }
    expect(useBuilderStore.getState().history.length).toBeLessThanOrEqual(50);
  });
});
