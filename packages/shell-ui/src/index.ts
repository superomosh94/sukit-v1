'use client';

export { ShellProvider } from './ShellProvider';
export type { ShellProviderProps } from './ShellProvider';

export { SlotRenderer } from './slots/SlotRenderer';
export type { SlotRendererProps } from './slots/SlotRenderer';

export { SlotRegistry, BUILTIN_SLOTS } from './slots/SlotRegistry';
export type { SlotDefinition, BuiltinSlot } from './slots/SlotRegistry';

export { useShell } from './hooks/useShell';
export { useSlots } from './hooks/useSlots';
export { useBuilderContext } from './hooks/useBuilderContext';

export { useShellStore } from './state/shellStore';
export type { ShellState } from './state/shellStore';

export { useBuilderStore } from './state/builderStore';
export type { BuilderState } from './state/builderStore';

export { MainLayout } from './layouts/MainLayout';
export type { MainLayoutProps } from './layouts/MainLayout';

export { BuilderLayout } from './layouts/BuilderLayout';
export type { BuilderLayoutProps } from './layouts/BuilderLayout';

export { DashboardLayout } from './layouts/DashboardLayout';
export type { DashboardLayoutProps } from './layouts/DashboardLayout';

export { Toolbar } from './components/Toolbar';
export { StatusBar } from './components/StatusBar';
export { Sidebar } from './components/Sidebar';
export type { SidebarProps } from './components/Sidebar';

export { Canvas } from './components/Canvas';
export type { CanvasProps } from './components/Canvas';

export { ResizablePanel } from './components/ResizablePanel';
export type { ResizablePanelProps } from './components/ResizablePanel';

export { ModuleManager } from './components/ModuleManager';
export { SettingsPanel } from './components/SettingsPanel';
export { UserMenu } from './components/UserMenu';
