import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

function useHistory<T>(initial: T, maxSize = 50) {
  const state = { past: [] as T[], present: initial, future: [] as T[] };

  const push = (value: T) => {
    state.past.push(state.present);
    state.present = value;
    state.future = [];
    if (state.past.length > maxSize) state.past.shift();
  };

  const undo = (): T | null => {
    if (state.past.length === 0) return null;
    const previous = state.past.pop()!;
    state.future.unshift(state.present);
    state.present = previous;
    return previous;
  };

  const redo = (): T | null => {
    if (state.future.length === 0) return null;
    const next = state.future.shift()!;
    state.past.push(state.present);
    state.present = next;
    return next;
  };

  const clear = () => {
    state.past = [];
    state.future = [];
  };

  const canUndo = () => state.past.length > 0;
  const canRedo = () => state.future.length > 0;

  return { state: () => state, push, undo, redo, clear, canUndo, canRedo };
}

describe('useHistory hook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useHistory('initial'));
    expect(result.current.state().present).toBe('initial');
    expect(result.current.canUndo()).toBe(false);
    expect(result.current.canRedo()).toBe(false);
  });

  it('should push new states and track history', () => {
    const { result } = renderHook(() => useHistory(''));
    act(() => result.current.push('a'));
    act(() => result.current.push('b'));
    act(() => result.current.push('c'));
    expect(result.current.state().present).toBe('c');
    expect(result.current.canUndo()).toBe(true);
  });

  it('should undo to previous state', () => {
    const { result } = renderHook(() => useHistory('start'));
    act(() => result.current.push('step1'));
    act(() => result.current.push('step2'));
    let undone: string | null = null;
    act(() => {
      undone = result.current.undo();
    });
    expect(undone).toBe('step1');
    expect(result.current.state().present).toBe('step1');
  });

  it('should redo after undo', () => {
    const { result } = renderHook(() => useHistory('start'));
    act(() => result.current.push('step1'));
    act(() => result.current.push('step2'));
    act(() => {
      result.current.undo();
    });
    let redone: string | null = null;
    act(() => {
      redone = result.current.redo();
    });
    expect(redone).toBe('step2');
    expect(result.current.state().present).toBe('step2');
  });

  it('should clear history on new push after undo', () => {
    const { result } = renderHook(() => useHistory('start'));
    act(() => result.current.push('a'));
    act(() => result.current.push('b'));
    act(() => result.current.undo());
    act(() => result.current.push('c'));
    expect(result.current.state().present).toBe('c');
    expect(result.current.canRedo()).toBe(false);
  });

  it('should respect maximum history size', () => {
    const { result } = renderHook(() => useHistory(0, 3));
    for (let i = 1; i <= 5; i++) {
      act(() => result.current.push(i));
    }
    expect(result.current.state().past.length).toBe(3);
    expect(result.current.state().present).toBe(5);
  });

  it('should return null when nothing to undo', () => {
    const { result } = renderHook(() => useHistory('only'));
    let undone: string | null = 'not-null';
    act(() => {
      undone = result.current.undo();
    });
    expect(undone).toBeNull();
  });

  it('should support object states', () => {
    const { result } = renderHook(() => useHistory({ x: 0, y: 0 }));
    act(() => result.current.push({ x: 1, y: 0 }));
    act(() => result.current.push({ x: 1, y: 1 }));
    expect(result.current.state().present).toEqual({ x: 1, y: 1 });
    act(() => {
      result.current.undo();
    });
    expect(result.current.state().present).toEqual({ x: 1, y: 0 });
  });
});
