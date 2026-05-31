import { describe, it, expect, beforeEach } from 'vitest';
import { useShellStore } from '../state/shellStore';

describe('shellStore', () => {
  beforeEach(() => {
    useShellStore.setState({
      sidebarLeftOpen: true,
      sidebarRightOpen: true,
      sidebarWidth: 260,
      activeTab: null,
      currentMode: 'visual',
      theme: 'system',
      currentSiteId: null,
      currentPageId: null,
      selectedBlockId: null,
    });
  });

  it('toggles left sidebar', () => {
    expect(useShellStore.getState().sidebarLeftOpen).toBe(true);
    useShellStore.getState().toggleSidebarLeft();
    expect(useShellStore.getState().sidebarLeftOpen).toBe(false);
    useShellStore.getState().toggleSidebarLeft();
    expect(useShellStore.getState().sidebarLeftOpen).toBe(true);
  });

  it('toggles right sidebar', () => {
    useShellStore.getState().toggleSidebarRight();
    expect(useShellStore.getState().sidebarRightOpen).toBe(false);
    useShellStore.getState().toggleSidebarRight();
    expect(useShellStore.getState().sidebarRightOpen).toBe(true);
  });

  it('sets sidebar width', () => {
    useShellStore.getState().setSidebarWidth(300);
    expect(useShellStore.getState().sidebarWidth).toBe(300);
  });

  it('sets active tab', () => {
    useShellStore.getState().setActiveTab('blocks');
    expect(useShellStore.getState().activeTab).toBe('blocks');
    useShellStore.getState().setActiveTab(null);
    expect(useShellStore.getState().activeTab).toBeNull();
  });

  it('sets current mode', () => {
    useShellStore.getState().setCurrentMode('code');
    expect(useShellStore.getState().currentMode).toBe('code');
    useShellStore.getState().setCurrentMode('split');
    expect(useShellStore.getState().currentMode).toBe('split');
    useShellStore.getState().setCurrentMode('visual');
    expect(useShellStore.getState().currentMode).toBe('visual');
  });

  it('sets theme', () => {
    useShellStore.getState().setTheme('dark');
    expect(useShellStore.getState().theme).toBe('dark');
    useShellStore.getState().setTheme('light');
    expect(useShellStore.getState().theme).toBe('light');
    useShellStore.getState().setTheme('system');
    expect(useShellStore.getState().theme).toBe('system');
  });

  it('sets current site and page', () => {
    useShellStore.getState().setCurrentSite('site-abc');
    expect(useShellStore.getState().currentSiteId).toBe('site-abc');
    useShellStore.getState().setCurrentPage('page-xyz');
    expect(useShellStore.getState().currentPageId).toBe('page-xyz');
    useShellStore.getState().setCurrentSite(null);
    expect(useShellStore.getState().currentSiteId).toBeNull();
  });

  it('sets selected block', () => {
    useShellStore.getState().setSelectedBlock('block-123');
    expect(useShellStore.getState().selectedBlockId).toBe('block-123');
    useShellStore.getState().setSelectedBlock(null);
    expect(useShellStore.getState().selectedBlockId).toBeNull();
  });
});
