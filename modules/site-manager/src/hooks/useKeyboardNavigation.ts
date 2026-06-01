'use client';

import { useEffect, useCallback } from 'react';
import { useSiteManagerStore } from '../stores/siteManagerStore';

export function useKeyboardNavigation() {
  const pages = useSiteManagerStore((s) => s.pages);
  const currentPageId = useSiteManagerStore((s) => s.currentPageId);
  const setCurrentPage = useSiteManagerStore((s) => s.setCurrentPage);
  const deletePage = useSiteManagerStore((s) => s.deletePage);
  const duplicatePage = useSiteManagerStore((s) => s.duplicatePage);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return;

      const currentIndex = pages.findIndex((p) => p.id === currentPageId);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < pages.length - 1) {
            setCurrentPage(pages[currentIndex + 1].id);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            setCurrentPage(pages[currentIndex - 1].id);
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (currentPageId && e.metaKey) {
            e.preventDefault();
            deletePage(currentPageId);
          }
          break;
        case 'd':
          if (e.metaKey && e.shiftKey && currentPageId) {
            e.preventDefault();
            duplicatePage(currentPageId);
          }
          break;
        case 'Enter':
          if (currentPageId) {
            e.preventDefault();
            const link = document.querySelector(
              `[data-page-id="${currentPageId}"]`
            ) as HTMLElement | null;
            link?.click();
          }
          break;
      }
    },
    [pages, currentPageId, setCurrentPage, deletePage, duplicatePage]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
