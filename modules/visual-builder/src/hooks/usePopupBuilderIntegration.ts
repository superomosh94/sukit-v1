'use client';

import { useCallback, useState } from 'react';
import { useBuilderStore } from '../stores/builderStore';

export function usePopupBuilderIntegration() {
  const sections = useBuilderStore((s) => s.sections);
  const [popups, setPopups] = useState<any[]>([]);

  const loadPopups = useCallback(async () => {
    try {
      const res = await fetch('/api/popups');
      const data = await res.json();
      setPopups(data);
      return data;
    } catch {
      return [];
    }
  }, []);

  const linkBlockToPopup = useCallback(
    (blockId: string, popupId: string) => {
      for (const s of sections) {
        for (const c of s.columns) {
          for (const b of c.blocks) {
            if (b.id === blockId) {
              const store = useBuilderStore.getState();
              store.updateBlock(s.id, c.id, blockId, {
                props: { ...b.props, popupId },
              });
              return;
            }
          }
        }
      }
    },
    [sections]
  );

  return { popups, loadPopups, linkBlockToPopup };
}
