import { useEffect, useCallback, useRef } from 'react';

type HotkeyMap = Record<string, () => void>;

export function useHotkeys(hotkeys: HotkeyMap, enabled: boolean = true) {
  const hotkeysRef = useRef(hotkeys);

  useEffect(() => {
    hotkeysRef.current = hotkeys;
  }, [hotkeys]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;

      const key = [
        e.ctrlKey || e.metaKey ? 'mod' : '',
        e.shiftKey ? 'shift' : '',
        e.altKey ? 'alt' : '',
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      const handler = hotkeysRef.current[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    },
    [enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
