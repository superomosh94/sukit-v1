import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from '@/lib/builder/store';

describe('BuilderStore', () => {
  beforeEach(() => {
    useBuilderStore.setState({
      sections: [],
      pageSettings: { headHtml: '', pageSettings: {}, seoSettings: {} },
      selection: null,
      selectedIds: [],
      clipboard: null,
      viewport: 'desktop',
      zoom: 100,
      showGrid: false,
      gridSize: 20,
      snapToGrid: false,
      snapDistance: 8,
      fullscreen: false,
      isPanning: false,
      panOffset: { x: 0, y: 0 },
      history: { past: [], future: [] },
      siteId: null,
      pageId: null,
      pageTitle: '',
      isDirty: false,
      lastSaved: null,
      isSaving: false,
      isLoading: false,
      loadingMessage: null,
      sceneVersion: crypto.randomUUID().slice(0, 8),
      remoteSceneVersion: null,
    });
  });

  it('addBlock adds a block to a column', () => {
    useBuilderStore.getState().addSection('header');
    const state = useBuilderStore.getState();
    const section = state.sections[0];
    const columnId = section.columns[0].id;
    useBuilderStore.getState().addBlock(section.id, columnId, 'text');
    const updated = useBuilderStore.getState().sections[0];
    expect(updated.columns[0].blocks).toHaveLength(1);
    expect(updated.columns[0].blocks[0].blockType).toBe('text');
  });

  it('addBlock adds second block after first', () => {
    useBuilderStore.getState().addSection('cover');
    const state = useBuilderStore.getState();
    const section = state.sections[0];
    const columnId = section.columns[0].id;
    useBuilderStore.getState().addBlock(section.id, columnId, 'heading');
    useBuilderStore.getState().addBlock(section.id, columnId, 'paragraph');
    const blocks = useBuilderStore.getState().sections[0].columns[0].blocks;
    expect(blocks).toHaveLength(2);
    expect(blocks[1].blockType).toBe('paragraph');
  });

  it('deleteBlock removes a block', () => {
    useBuilderStore.getState().addSection('empty');
    const state = useBuilderStore.getState();
    const section = state.sections[0];
    const columnId = section.columns[0].id;
    useBuilderStore.getState().addBlock(section.id, columnId, 'text');
    useBuilderStore.getState().addBlock(section.id, columnId, 'image');
    const blocks = useBuilderStore.getState().sections[0].columns[0].blocks;
    useBuilderStore.getState().deleteBlock(section.id, columnId, blocks[0].id);
    const remaining = useBuilderStore.getState().sections[0].columns[0].blocks;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].blockType).toBe('image');
  });

  it('select marks selection state', () => {
    useBuilderStore.getState().addSection('hero');
    const sectionId = useBuilderStore.getState().sections[0].id;
    useBuilderStore.getState().select(sectionId, 'section');
    expect(useBuilderStore.getState().selection).toEqual({
      id: sectionId,
      type: 'section',
    });
    expect(useBuilderStore.getState().selectedIds).toEqual([sectionId]);
  });

  it('select toggles between selections', () => {
    useBuilderStore.getState().addSection('hero');
    useBuilderStore.getState().addSection('footer');
    const sections = useBuilderStore.getState().sections;
    useBuilderStore.getState().select(sections[0].id, 'section');
    useBuilderStore.getState().select(sections[1].id, 'section');
    expect(useBuilderStore.getState().selection!.id).toBe(sections[1].id);
  });

  it('clearSelection resets selection', () => {
    useBuilderStore.getState().addSection('hero');
    const sectionId = useBuilderStore.getState().sections[0].id;
    useBuilderStore.getState().select(sectionId, 'section');
    useBuilderStore.getState().clearSelection();
    expect(useBuilderStore.getState().selection).toBeNull();
    expect(useBuilderStore.getState().selectedIds).toEqual([]);
  });

  it('undo reverts last mutation', () => {
    useBuilderStore.getState().addSection('header');
    useBuilderStore.getState().addSection('footer');
    expect(useBuilderStore.getState().sections).toHaveLength(2);
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().sections).toHaveLength(1);
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().sections).toHaveLength(0);
  });

  it('undo cannot go past initial state', () => {
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().sections).toHaveLength(0);
  });

  it('redo restores undone mutation', () => {
    useBuilderStore.getState().addSection('cover');
    const sectionsAfterAdd = useBuilderStore.getState().sections;
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().sections).toHaveLength(0);
    useBuilderStore.getState().redo();
    expect(useBuilderStore.getState().sections).toHaveLength(1);
    expect(useBuilderStore.getState().sections[0].sectionType).toBe('cover');
  });

  it('redo is cleared after new mutation', () => {
    useBuilderStore.getState().addSection('header');
    useBuilderStore.getState().undo();
    useBuilderStore.getState().addSection('footer');
    useBuilderStore.getState().redo();
    expect(useBuilderStore.getState().sections).toHaveLength(1);
    expect(useBuilderStore.getState().sections[0].sectionType).toBe('footer');
  });

  it('addSection records undo history', () => {
    useBuilderStore.getState().addSection('header');
    useBuilderStore.getState().addSection('cover');
    useBuilderStore.getState().undo();
    expect(useBuilderStore.getState().sections).toHaveLength(1);
    useBuilderStore.getState().redo();
    expect(useBuilderStore.getState().sections).toHaveLength(2);
  });

  it('history past is capped at MAX_HISTORY', () => {
    for (let i = 0; i < 60; i++) {
      useBuilderStore.getState().addSection('empty');
    }
    expect(useBuilderStore.getState().history.past.length).toBeLessThanOrEqual(
      50
    );
  });

  it('clearSelection works after multi-select', () => {
    useBuilderStore.getState().addSection('hero');
    useBuilderStore.getState().addSection('features');
    const sections = useBuilderStore.getState().sections;
    useBuilderStore.getState().toggleSelection(sections[0].id, 'section');
    useBuilderStore.getState().toggleSelection(sections[1].id, 'section');
    useBuilderStore.getState().clearSelection();
    expect(useBuilderStore.getState().selection).toBeNull();
  });
});
