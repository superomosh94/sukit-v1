import { useEffect, useRef, useCallback } from 'react';
import { usePopupStore } from '../stores/popupStore';
import { popupApi, PopupData } from '../services/api';

export function usePopups() {
  const { popups, isLoading, setPopups, setLoading } = usePopupStore();

  const fetchPopups = useCallback(async (params?: { status?: string }) => {
    setLoading(true);
    try {
      const data = await popupApi.list(params);
      setPopups(data);
    } finally {
      setLoading(false);
    }
  }, [setPopups, setLoading]);

  return { popups, isLoading, fetchPopups };
}

export function usePopupTriggers(popups: PopupData[]) {
  const activePopups = popups.filter(p => p.status === 'ACTIVE');
  const shownPopups = useRef<Set<string>>(new Set());
  const pageViews = useRef(0);

  useEffect(() => {
    pageViews.current += 1;
  }, []);

  const getTriggeredPopups = useCallback(() => {
    return activePopups.filter(popup => {
      if (shownPopups.current.has(popup.id!)) return false;

      switch (popup.triggerType) {
        case 'time': {
          const delay = Number(popup.triggerValue || '5') * 1000;
          setTimeout(() => {
            shownPopups.current.add(popup.id!);
          }, delay);
          return false; // Handled by timer
        }
        case 'page-views':
          return pageViews.current >= Number(popup.triggerValue || '1');
        case 'on-load':
          return true;
        default:
          return false;
      }
    });
  }, [activePopups]);

  const markShown = useCallback((id: string) => {
    shownPopups.current.add(id);
  }, []);

  return { getTriggeredPopups, markShown };
}
