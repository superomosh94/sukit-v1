'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ModuleItem } from './ModulePreviewModal';

const INSTALLED_KEY = 'sukit-installed-modules';

function getStored(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INSTALLED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStored(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INSTALLED_KEY, JSON.stringify(ids));
}

export function useModuleInstaller() {
  const [installedIds, setInstalledIds] = useState<string[]>([]);

  useEffect(() => {
    setInstalledIds(getStored());
  }, []);

  const isInstalled = useCallback(
    (id: string) => installedIds.includes(id),
    [installedIds]
  );

  const install = useCallback((mod: ModuleItem) => {
    setInstalledIds((prev) => {
      if (prev.includes(mod.id)) return prev;
      const next = [...prev, mod.id];
      setStored(next);
      return next;
    });
  }, []);

  const uninstall = useCallback((mod: ModuleItem) => {
    setInstalledIds((prev) => {
      const next = prev.filter((id) => id !== mod.id);
      setStored(next);
      return next;
    });
  }, []);

  return { installedIds, isInstalled, install, uninstall };
}
