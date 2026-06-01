'use client';

import { useCallback } from 'react';
import { useBuilderStore } from '../stores/builderStore';

export function useCodeEditorIntegration() {
  const sections = useBuilderStore((s) => s.sections);
  const setSections = useBuilderStore((s) => s.setSections);

  const syncToCode = useCallback(() => {
    return JSON.stringify(sections, null, 2);
  }, [sections]);

  const syncFromCode = useCallback(
    (code: string) => {
      try {
        const parsed = JSON.parse(code);
        setSections(parsed);
      } catch {
        console.error('Failed to parse code from code editor');
      }
    },
    [setSections]
  );

  return { syncToCode, syncFromCode };
}
