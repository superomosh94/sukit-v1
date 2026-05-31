'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { useBuilderStore } from '../stores/builderStore';
import { showToast } from '../components/Toast';

interface BuilderContextValue {
  siteId: string;
  pageId: string;
  isLoading: boolean;
  retrySave: () => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function useBuilderContext() {
  const ctx = useContext(BuilderContext);
  if (!ctx)
    throw new Error('useBuilderContext must be used within BuilderProvider');
  return ctx;
}

interface BuilderProviderProps {
  siteId: string;
  pageId: string;
  children: ReactNode;
}

const SAVE_RETRY_KEY = 'sukit-pending-save';

export default function BuilderProvider({
  siteId,
  pageId,
  children,
}: BuilderProviderProps) {
  const setSections = useBuilderStore((s) => s.setSections);
  const setOffline = useBuilderStore((s) => s.setOffline);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const sections = useBuilderStore((s) => s.sections);
  const pageSettings = useBuilderStore((s) => s.pageSettings);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveAttempts, setSaveAttempts] = useState(0);

  // Load page blocks from database on mount
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/sites/${siteId}/pages/${pageId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.sections) setSections(data.sections);
        }
      } catch {
        // Page may not exist yet or network issue
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [siteId, pageId, setSections]);

  // Auto-save recovery: check for pending save from a crash
  useEffect(() => {
    try {
      const pending = localStorage.getItem(SAVE_RETRY_KEY);
      if (pending) {
        const data = JSON.parse(pending);
        showToast('Unsaved changes found. Attempting recovery...', 'info');
        setSections(data.sections);
        localStorage.removeItem(SAVE_RETRY_KEY);
      }
    } catch {
      localStorage.removeItem(SAVE_RETRY_KEY);
    }
  }, [setSections]);

  // Online/offline detection
  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => {
      setOffline(true);
      showToast('You are offline — changes saved locally', 'info');
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [setOffline]);

  // Auto-save with retry
  const saveNow = useCallback(async (): Promise<boolean> => {
    const store = useBuilderStore.getState();
    try {
      const res = await fetch(`/api/sites/${siteId}/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: store.sections,
          pageSettings: store.pageSettings,
        }),
      });
      if (res.ok) {
        useBuilderStore.setState({
          isDirty: false,
          lastSaved: new Date().toISOString(),
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [siteId, pageId]);

  const retrySave = useCallback(async () => {
    setSaveAttempts(0);
    const ok = await saveNow();
    if (ok) {
      showToast('Saved successfully', 'success');
    } else {
      showToast('Save failed — changes saved locally', 'error');
      // Store backup
      const store = useBuilderStore.getState();
      localStorage.setItem(
        SAVE_RETRY_KEY,
        JSON.stringify({
          sections: store.sections,
          pageSettings: store.pageSettings,
        })
      );
    }
  }, [saveNow]);

  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      const ok = await saveNow();
      if (!ok) {
        setSaveAttempts((prev) => prev + 1);
        if (saveAttempts < 3) {
          // Retry once more after delay
          setTimeout(retrySave, 3000);
        } else {
          // Save pending backup for recovery
          const store = useBuilderStore.getState();
          localStorage.setItem(
            SAVE_RETRY_KEY,
            JSON.stringify({
              sections: store.sections,
              pageSettings: store.pageSettings,
            })
          );
          showToast('Auto-save failed — changes saved locally', 'error');
        }
      }
    }, 2000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [
    isDirty,
    sections,
    pageSettings,
    siteId,
    pageId,
    saveNow,
    retrySave,
    saveAttempts,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const store = useBuilderStore.getState();
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (store.selection) {
          e.preventDefault();
          store.copySelection();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        if (store.clipboard) {
          e.preventDefault();
          store.pasteClipboard();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        retrySave();
      }
    },
    [retrySave]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <BuilderContext.Provider value={{ siteId, pageId, isLoading, retrySave }}>
      {children}
    </BuilderContext.Provider>
  );
}
