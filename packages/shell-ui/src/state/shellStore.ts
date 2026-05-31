'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShellState {
  sidebarLeftOpen: boolean;
  sidebarRightOpen: boolean;
  sidebarWidth: number;
  activeTab: string | null;
  currentMode: 'visual' | 'code' | 'split';
  theme: 'light' | 'dark' | 'system';

  currentSiteId: string | null;
  currentPageId: string | null;
  selectedBlockId: string | null;

  toggleSidebarLeft: () => void;
  toggleSidebarRight: () => void;
  setSidebarWidth: (width: number) => void;
  setActiveTab: (tab: string | null) => void;
  setCurrentMode: (mode: 'visual' | 'code' | 'split') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCurrentSite: (siteId: string | null) => void;
  setCurrentPage: (pageId: string | null) => void;
  setSelectedBlock: (blockId: string | null) => void;
}

export const useShellStore = create<ShellState>()(
  persist(
    (set) => ({
      sidebarLeftOpen: true,
      sidebarRightOpen: true,
      sidebarWidth: 260,
      activeTab: null,
      currentMode: 'visual',
      theme: 'system',
      currentSiteId: null,
      currentPageId: null,
      selectedBlockId: null,

      toggleSidebarLeft: () =>
        set((state) => ({ sidebarLeftOpen: !state.sidebarLeftOpen })),
      toggleSidebarRight: () =>
        set((state) => ({ sidebarRightOpen: !state.sidebarRightOpen })),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setCurrentMode: (mode) => set({ currentMode: mode }),
      setTheme: (theme) => set({ theme }),
      setCurrentSite: (siteId) => set({ currentSiteId: siteId }),
      setCurrentPage: (pageId) => set({ currentPageId: pageId }),
      setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),
    }),
    {
      name: 'sukit-shell-storage',
      partialize: (state) => ({
        sidebarLeftOpen: state.sidebarLeftOpen,
        sidebarRightOpen: state.sidebarRightOpen,
        sidebarWidth: state.sidebarWidth,
        theme: state.theme,
      }),
    }
  )
);
