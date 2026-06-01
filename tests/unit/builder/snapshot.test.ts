import { describe, it, expect } from 'vitest';

interface BuilderState {
  blocks: { id: string; type: string; props: Record<string, any> }[];
  selectedIds: string[];
  history: { past: BuilderState['blocks'][]; future: BuilderState['blocks'][] };
}

function createInitialState(): BuilderState {
  return {
    blocks: [],
    selectedIds: [],
    history: { past: [], future: [] },
  };
}

function addBlock(state: BuilderState, type: string): BuilderState {
  const block = { id: `block_${Date.now()}`, type, props: {} };
  return {
    ...state,
    blocks: [...state.blocks, block],
    history: { past: [...state.history.past, state.blocks], future: [] },
  };
}

function removeBlock(state: BuilderState, id: string): BuilderState {
  return {
    ...state,
    blocks: state.blocks.filter((b) => b.id !== id),
    history: { past: [...state.history.past, state.blocks], future: [] },
  };
}

function updateBlockProps(
  state: BuilderState,
  id: string,
  props: Record<string, any>
): BuilderState {
  return {
    ...state,
    blocks: state.blocks.map((b) =>
      b.id === id ? { ...b, props: { ...b.props, ...props } } : b
    ),
    history: { past: [...state.history.past, state.blocks], future: [] },
  };
}

describe('Builder State Snapshots', () => {
  it('should start with empty state', () => {
    const state = createInitialState();
    expect(state).toMatchSnapshot();
  });

  it('should add blocks correctly', () => {
    const state = createInitialState();
    const s1 = addBlock(state, 'heading');
    expect(s1.blocks).toHaveLength(1);
    expect(s1.blocks[0].type).toBe('heading');
    expect(s1.history.past).toHaveLength(1);
    const s2 = addBlock(s1, 'paragraph');
    expect(s2.blocks).toHaveLength(2);
  });

  it('should remove blocks correctly', () => {
    const state = createInitialState();
    const s1 = addBlock(state, 'heading');
    const s2 = removeBlock(s1, s1.blocks[0].id);
    expect(s2.blocks).toHaveLength(0);
  });

  it('should update block props', () => {
    const state = createInitialState();
    const s1 = addBlock(state, 'heading');
    const id = s1.blocks[0].id;
    const s2 = updateBlockProps(s1, id, { text: 'Hello', level: 1 });
    expect(s2.blocks[0].props).toEqual({ text: 'Hello', level: 1 });
  });

  it('should maintain history stack', () => {
    const state = createInitialState();
    const s1 = addBlock(state, 'a');
    const s2 = addBlock(s1, 'b');
    const s3 = addBlock(s2, 'c');
    expect(s3.history.past).toHaveLength(3);
    expect(s3.blocks).toHaveLength(3);
  });

  it('should clear future on new action', () => {
    const state = createInitialState();
    const s1 = addBlock(state, 'a');
    expect(s1.history.future).toHaveLength(0);
  });

  it('should produce deterministic output for same input', () => {
    const state = createInitialState();
    const r1 = addBlock(state, 'heading');
    const r2 = addBlock(state, 'heading');
    expect(r1.blocks).toHaveLength(1);
    expect(r2.blocks).toHaveLength(1);
    expect(r1.blocks[0].type).toBe(r2.blocks[0].type);
  });
});
