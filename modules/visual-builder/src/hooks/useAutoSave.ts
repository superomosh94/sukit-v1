import { useState, useEffect, useCallback, useRef } from 'react';

const AUTOSAVE_DELAY = 3000;

export function useAutoSave(
  data: any,
  onSave: (data: any) => Promise<void>,
  enabled: boolean = true
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const save = useCallback(async () => {
    if (!enabled) return;
    setSaving(true);
    try {
      await onSave(dataRef.current);
      setLastSaved(new Date());
      setDirty(false);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [enabled, onSave]);

  useEffect(() => {
    if (!enabled || !dirty) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, AUTOSAVE_DELAY);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, enabled, dirty, save]);

  const markDirty = useCallback(() => setDirty(true), []);

  return { lastSaved, saving, dirty, save, markDirty };
}
