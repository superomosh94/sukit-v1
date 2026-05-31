import { describe, it, expect, beforeEach } from 'vitest';
import { useBuilderStore } from '../state/builderStore';

describe('builderStore', () => {
  beforeEach(() => {
    useBuilderStore.setState({
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      undoStack: [],
      redoStack: [],
      zoom: 100,
      showGuides: true,
      showGrid: false,
      snapToGrid: true,
      gridSize: 8,
    });
  });

  it('manages dirty state', () => {
    expect(useBuilderStore.getState().isDirty).toBe(false);
    useBuilderStore.getState().setIsDirty(true);
    expect(useBuilderStore.getState().isDirty).toBe(true);
  });

  it('manages saving state', () => {
    useBuilderStore.getState().setIsSaving(true);
    expect(useBuilderStore.getState().isSaving).toBe(true);
    useBuilderStore.getState().setIsSaving(false);
    expect(useBuilderStore.getState().isSaving).toBe(false);
  });

  it('sets last saved date', () => {
    const now = new Date();
    useBuilderStore.getState().setLastSaved(now);
    expect(useBuilderStore.getState().lastSaved).toBe(now);
  });

  it('push undo adds to stack and clears redo', () => {
    useBuilderStore.getState().pushRedo('redo-snap');
    useBuilderStore.getState().pushUndo('snapshot-1');
    expect(useBuilderStore.getState().undoStack).toHaveLength(1);
    expect(useBuilderStore.getState().undoStack[0]).toBe('snapshot-1');
    expect(useBuilderStore.getState().redoStack).toHaveLength(0);
  });

  it('push undo limits stack to 50', () => {
    for (let i = 0; i < 55; i++) {
      useBuilderStore.getState().pushUndo(`snap-${i}`);
    }
    expect(useBuilderStore.getState().undoStack).toHaveLength(50);
  });

  it('pop undo returns last snapshot and removes it', () => {
    useBuilderStore.getState().pushUndo('first');
    useBuilderStore.getState().pushUndo('second');
    const snap = useBuilderStore.getState().popUndo();
    expect(snap).toBe('second');
    expect(useBuilderStore.getState().undoStack).toHaveLength(1);
    expect(useBuilderStore.getState().undoStack[0]).toBe('first');
  });

  it('pop undo returns undefined on empty stack', () => {
    expect(useBuilderStore.getState().popUndo()).toBeUndefined();
  });

  it('pop redo returns last snapshot and removes it', () => {
    useBuilderStore.getState().pushRedo('r1');
    useBuilderStore.getState().pushRedo('r2');
    expect(useBuilderStore.getState().popRedo()).toBe('r2');
    expect(useBuilderStore.getState().redoStack).toHaveLength(1);
  });

  it('clears undo/redo stacks', () => {
    useBuilderStore.getState().pushUndo('snap');
    useBuilderStore.getState().pushRedo('rsnap');
    useBuilderStore.getState().clearUndo();
    expect(useBuilderStore.getState().undoStack).toHaveLength(0);
    useBuilderStore.getState().clearRedo();
    expect(useBuilderStore.getState().redoStack).toHaveLength(0);
  });

  it('sets zoom within bounds', () => {
    useBuilderStore.getState().setZoom(150);
    expect(useBuilderStore.getState().zoom).toBe(150);
    useBuilderStore.getState().setZoom(10);
    expect(useBuilderStore.getState().zoom).toBe(25);
    useBuilderStore.getState().setZoom(300);
    expect(useBuilderStore.getState().zoom).toBe(200);
  });

  it('toggles guides and grid', () => {
    useBuilderStore.getState().setShowGuides(false);
    expect(useBuilderStore.getState().showGuides).toBe(false);
    useBuilderStore.getState().setShowGrid(true);
    expect(useBuilderStore.getState().showGrid).toBe(true);
    useBuilderStore.getState().setSnapToGrid(false);
    expect(useBuilderStore.getState().snapToGrid).toBe(false);
    useBuilderStore.getState().setGridSize(16);
    expect(useBuilderStore.getState().gridSize).toBe(16);
  });
});
