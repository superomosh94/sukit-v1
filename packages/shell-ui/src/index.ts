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

// 2.1 Layout Components
export { MinimalLayout } from './components/layout/MinimalLayout';
export type { MinimalLayoutProps } from './components/layout/MinimalLayout';
export { PrintLayout } from './components/layout/PrintLayout';
export type { PrintLayoutProps } from './components/layout/PrintLayout';
export { MobileLayout as LayoutMobileLayout } from './components/layout/MobileLayout';
export type { MobileLayoutProps as LayoutMobileLayoutProps } from './components/layout/MobileLayout';
export { TabletLayout as LayoutTabletLayout } from './components/layout/TabletLayout';
export type { TabletLayoutProps as LayoutTabletLayoutProps } from './components/layout/TabletLayout';
export { DesktopLayout as LayoutDesktopLayout } from './components/layout/DesktopLayout';
export type { DesktopLayoutProps as LayoutDesktopLayoutProps } from './components/layout/DesktopLayout';
export { Grid } from './components/layout/Grid';
export type { GridProps } from './components/layout/Grid';
export { Container } from './components/layout/Container';
export type { ContainerProps } from './components/layout/Container';
export { Section } from './components/layout/Section';
export type { SectionProps } from './components/layout/Section';
export { Stack } from './components/layout/Stack';
export type { StackProps } from './components/layout/Stack';
export { Flex } from './components/layout/Flex';
export type { FlexProps } from './components/layout/Flex';
export { Spacing } from './components/layout/PaddingMargin';
export type { SpacingProps } from './components/layout/PaddingMargin';

// 2.2 Slot System
export { NestedSlots } from './components/slots/NestedSlots';
export type { NestedSlotsProps } from './components/slots/NestedSlots';
export { SlotDebugger } from './components/slots/SlotDebugger';
export type { SlotDebuggerProps } from './components/slots/SlotDebugger';
export { SlotMetadata } from './components/slots/SlotMetadata';
export type { SlotMetadataProps } from './components/slots/SlotMetadata';
export { SlotGroups } from './components/slots/SlotGroups';
export type { SlotGroupsProps } from './components/slots/SlotGroups';
export { SlotEvents } from './components/slots/SlotEvents';
export type { SlotEventsProps } from './components/slots/SlotEvents';
export { SlotLazyLoader } from './components/slots/SlotLazyLoader';
export type { SlotLazyLoaderProps } from './components/slots/SlotLazyLoader';
export {
  SlotCacheProvider,
  useSlotCache,
} from './components/slots/SlotCacheProvider';
export type { SlotCacheProviderProps } from './components/slots/SlotCacheProvider';
export { SlotPermissionGate } from './components/slots/SlotPermissionGate';
export type { SlotPermissionGateProps } from './components/slots/SlotPermissionGate';
export { SlotOverride } from './components/slots/SlotOverride';
export type { SlotOverrideProps } from './components/slots/SlotOverride';

// 2.3 Toolbar
export { ContextToolbar } from './components/toolbar/ContextToolbar';
export type { ContextToolbarProps } from './components/toolbar/ContextToolbar';
export { MobileToolbar } from './components/toolbar/MobileToolbar';
export type { MobileToolbarProps } from './components/toolbar/MobileToolbar';
export {
  ToolbarDropdown,
  ToolbarDropdownItem,
} from './components/toolbar/ToolbarDropdown';
export type {
  ToolbarDropdownProps,
  ToolbarDropdownItemProps,
} from './components/toolbar/ToolbarDropdown';
export { ToolbarDivider } from './components/toolbar/ToolbarDivider';
export type { ToolbarDividerProps } from './components/toolbar/ToolbarDivider';
export { ToolbarGroup } from './components/toolbar/ToolbarGroup';
export type { ToolbarGroupProps } from './components/toolbar/ToolbarGroup';
export { ToolbarSearch } from './components/toolbar/ToolbarSearch';
export type { ToolbarSearchProps } from './components/toolbar/ToolbarSearch';
export { ToolbarBreadcrumbs } from './components/toolbar/ToolbarBreadcrumbs';
export type { ToolbarBreadcrumbsProps } from './components/toolbar/ToolbarBreadcrumbs';
export { ToolbarTabs } from './components/toolbar/ToolbarTabs';
export type { ToolbarTabsProps } from './components/toolbar/ToolbarTabs';
export { ToolbarCollapse } from './components/toolbar/ToolbarCollapse';
export type { ToolbarCollapseProps } from './components/toolbar/ToolbarCollapse';
export { ToolbarOverflow } from './components/toolbar/ToolbarOverflow';
export type { ToolbarOverflowProps } from './components/toolbar/ToolbarOverflow';
export { ToolbarLabels } from './components/toolbar/ToolbarLabels';
export type { ToolbarLabelsProps } from './components/toolbar/ToolbarLabels';

// 2.4 Sidebar
export { BottomSidebar } from './components/sidebar/BottomSidebar';
export type { BottomSidebarProps } from './components/sidebar/BottomSidebar';
export { SidebarPanel } from './components/sidebar/SidebarPanel';
export type { SidebarPanelProps } from './components/sidebar/SidebarPanel';
export { SidebarTabs } from './components/sidebar/SidebarTabs';
export type { SidebarTabsProps } from './components/sidebar/SidebarTabs';
export { SidebarHeader } from './components/sidebar/SidebarHeader';
export type { SidebarHeaderProps } from './components/sidebar/SidebarHeader';
export { SidebarFooter } from './components/sidebar/SidebarFooter';
export type { SidebarFooterProps } from './components/sidebar/SidebarFooter';
export { SidebarTree } from './components/sidebar/SidebarTree';
export type {
  SidebarTreeProps,
  TreeNode,
} from './components/sidebar/SidebarTree';
export { SidebarMenu } from './components/sidebar/SidebarMenu';
export type {
  SidebarMenuProps,
  MenuItem,
} from './components/sidebar/SidebarMenu';
export { SidebarSection } from './components/sidebar/SidebarSection';
export type { SidebarSectionProps } from './components/sidebar/SidebarSection';
export { SidebarSeparator } from './components/sidebar/SidebarSeparator';
export type { SidebarSeparatorProps } from './components/sidebar/SidebarSeparator';
export { SidebarBadge } from './components/sidebar/SidebarBadge';
export type { SidebarBadgeProps } from './components/sidebar/SidebarBadge';
export { SidebarTooltip } from './components/sidebar/SidebarTooltip';
export type { SidebarTooltipProps } from './components/sidebar/SidebarTooltip';
export { SidebarAnimation } from './components/sidebar/SidebarAnimation';
export type { SidebarAnimationProps } from './components/sidebar/SidebarAnimation';

// 2.5 Canvas
export { CanvasOverlay } from './components/canvas/CanvasOverlay';
export type { CanvasOverlayProps } from './components/canvas/CanvasOverlay';
export { CanvasZoom } from './components/canvas/CanvasZoom';
export type { CanvasZoomProps } from './components/canvas/CanvasZoom';
export { CanvasPan } from './components/canvas/CanvasPan';
export type { CanvasPanProps } from './components/canvas/CanvasPan';
export { CanvasRulers } from './components/canvas/CanvasRulers';
export type { CanvasRulersProps } from './components/canvas/CanvasRulers';
export { CanvasGuides } from './components/canvas/CanvasGuides';
export type { CanvasGuidesProps } from './components/canvas/CanvasGuides';
export { CanvasMiniMap } from './components/canvas/CanvasMiniMap';
export type { CanvasMiniMapProps } from './components/canvas/CanvasMiniMap';
export { CanvasFrame } from './components/canvas/CanvasFrame';
export type { CanvasFrameProps } from './components/canvas/CanvasFrame';
export { CanvasBackground } from './components/canvas/CanvasBackground';
export type { CanvasBackgroundProps } from './components/canvas/CanvasBackground';
export { CanvasDropZone } from './components/canvas/CanvasDropZone';
export type { CanvasDropZoneProps } from './components/canvas/CanvasDropZone';
export { CanvasContextMenu } from './components/canvas/CanvasContextMenu';
export type {
  CanvasContextMenuProps,
  ContextMenuItem,
} from './components/canvas/CanvasContextMenu';
export { CanvasKeyboardNav } from './components/canvas/CanvasKeyboardNav';
export type { CanvasKeyboardNavProps } from './components/canvas/CanvasKeyboardNav';
export { CanvasTouchGestures } from './components/canvas/CanvasTouchGestures';
export type { CanvasTouchGesturesProps } from './components/canvas/CanvasTouchGestures';
export { CanvasPerformance } from './components/canvas/CanvasPerformance';
export type { CanvasPerformanceProps } from './components/canvas/CanvasPerformance';

// 2.6 Modal
export { ModalDialog } from './components/modal/ModalDialog';
export type { ModalDialogProps } from './components/modal/ModalDialog';
export { ModalConfirm } from './components/modal/ModalConfirm';
export type { ModalConfirmProps } from './components/modal/ModalConfirm';
export { ModalPrompt } from './components/modal/ModalPrompt';
export type { ModalPromptProps } from './components/modal/ModalPrompt';
export { ModalDrawer } from './components/modal/ModalDrawer';
export type { ModalDrawerProps } from './components/modal/ModalDrawer';
export { ModalFullscreen } from './components/modal/ModalFullscreen';
export type { ModalFullscreenProps } from './components/modal/ModalFullscreen';
export { ModalStack, useModalStack } from './components/modal/ModalStack';
export type { ModalStackProps } from './components/modal/ModalStack';
export { ModalFocusTrap } from './components/modal/ModalFocusTrap';
export type { ModalFocusTrapProps } from './components/modal/ModalFocusTrap';
export { ModalBackdrop } from './components/modal/ModalBackdrop';
export type { ModalBackdropProps } from './components/modal/ModalBackdrop';
export { ModalEscape } from './components/modal/ModalEscape';
export type { ModalEscapeProps } from './components/modal/ModalEscape';
export { ModalSize } from './components/modal/ModalSize';
export type { ModalSizeProps } from './components/modal/ModalSize';
export { ModalPosition } from './components/modal/ModalPosition';
export type { ModalPositionProps } from './components/modal/ModalPosition';
export { ModalAnimation } from './components/modal/ModalAnimation';
export type { ModalAnimationProps } from './components/modal/ModalAnimation';
export { ModalPortal } from './components/modal/ModalPortal';
export type { ModalPortalProps } from './components/modal/ModalPortal';
export { ModalZIndex } from './components/modal/ModalZIndex';
export type { ModalZIndexProps } from './components/modal/ModalZIndex';

// 2.7 Toast
export { ToastContainer } from './components/toast/ToastContainer';
export type { ToastContainerProps } from './components/toast/ToastContainer';
export { ToastSuccess } from './components/toast/ToastSuccess';
export { ToastError } from './components/toast/ToastError';
export { ToastWarning } from './components/toast/ToastWarning';
export { ToastInfo } from './components/toast/ToastInfo';
export { ToastLoading } from './components/toast/ToastLoading';
export { ToastProgress } from './components/toast/ToastProgress';
export { ToastUndo } from './components/toast/ToastUndo';
export { ToastDuration } from './components/toast/ToastDuration';
export type { ToastDurationProps } from './components/toast/ToastDuration';
export { ToastPosition } from './components/toast/ToastPosition';
export type { ToastPositionType } from './components/toast/ToastPosition';
export { ToastStack } from './components/toast/ToastStack';
export { ToastDismiss } from './components/toast/ToastDismiss';
export { ToastAction } from './components/toast/ToastAction';
export type { ToastActionProps } from './components/toast/ToastAction';
export { ToastAnimation } from './components/toast/ToastAnimation';
export type { ToastAnimationProps } from './components/toast/ToastAnimation';
export { ToastAccessibility } from './components/toast/ToastAccessibility';

// 2.8 Theme
export { CustomThemes, useCustomThemes } from './components/theme/CustomThemes';
export type {
  CustomThemesProps,
  CustomTheme,
} from './components/theme/CustomThemes';
export { ThemePreview } from './components/theme/ThemePreview';
export type { ThemePreviewProps } from './components/theme/ThemePreview';
export {
  ComponentLevelThemes,
  useComponentTheme,
} from './components/theme/ComponentLevelThemes';
export type { ComponentLevelThemesProps } from './components/theme/ComponentLevelThemes';
export { ThemeTokens } from './components/theme/ThemeTokens';
export type { ThemeTokensProps } from './components/theme/ThemeTokens';
export { ThemeVariables } from './components/theme/ThemeVariables';
export type { ThemeVariablesProps } from './components/theme/ThemeVariables';
export {
  ThemeInheritance,
  useThemeInheritance,
} from './components/theme/ThemeInheritance';
export type { ThemeInheritanceProps } from './components/theme/ThemeInheritance';
export { ThemeSwitching } from './components/theme/ThemeSwitching';
export type { ThemeSwitchingProps } from './components/theme/ThemeSwitching';
export { ThemeContrast } from './components/theme/ThemeContrast';
export type { ThemeContrastProps } from './components/theme/ThemeContrast';
export { ThemePerformance } from './components/theme/ThemePerformance';
export type { ThemePerformanceProps } from './components/theme/ThemePerformance';

// 2.9 Responsive
export { ResponsiveSlots } from './components/responsive/ResponsiveSlots';
export type { ResponsiveSlotsProps } from './components/responsive/ResponsiveSlots';
export { ResponsiveSidebars } from './components/responsive/ResponsiveSidebars';
export type { ResponsiveSidebarsProps } from './components/responsive/ResponsiveSidebars';
export { ResponsiveToolbar } from './components/responsive/ResponsiveToolbar';
export type { ResponsiveToolbarProps } from './components/responsive/ResponsiveToolbar';
export { TouchOptimizations } from './components/responsive/TouchOptimizations';
export type { TouchOptimizationsProps } from './components/responsive/TouchOptimizations';
export { OrientationDetection } from './components/responsive/OrientationDetection';
export type { OrientationDetectionProps } from './components/responsive/OrientationDetection';
export { DeviceDetection } from './components/responsive/DeviceDetection';
export type {
  DeviceDetectionProps,
  DeviceType,
} from './components/responsive/DeviceDetection';

// 2.10 Navigation
export { TabNavigation } from './components/navigation/TabNavigation';
export type { TabNavigationProps } from './components/navigation/TabNavigation';
export { KeyboardNavigation } from './components/navigation/KeyboardNavigation';
export type {
  KeyboardNavigationProps,
  KeyboardNavItem,
} from './components/navigation/KeyboardNavigation';
export { QuickFind } from './components/navigation/QuickFind';
export type {
  QuickFindProps,
  QuickFindItem,
} from './components/navigation/QuickFind';
export { CommandPalette } from './components/navigation/CommandPalette';
export type {
  CommandPaletteProps,
  CommandItem,
} from './components/navigation/CommandPalette';
export { RecentItems } from './components/navigation/RecentItems';
export type {
  RecentItemsProps,
  RecentItem,
} from './components/navigation/RecentItems';
export { Favorites } from './components/navigation/Favorites';
export type {
  FavoritesProps,
  FavoriteItem,
} from './components/navigation/Favorites';
export { RouteHistory } from './components/navigation/RouteHistory';
export type { RouteHistoryProps } from './components/navigation/RouteHistory';
export { DeepLinking } from './components/navigation/DeepLinking';
export type { DeepLinkingProps } from './components/navigation/DeepLinking';
export { NavigationGuards } from './components/navigation/NavigationGuards';
export type {
  NavigationGuardsProps,
  NavigationGuard,
} from './components/navigation/NavigationGuards';

// 2.11 UI Components
export { SiteSwitcher } from './components/ui-elements/SiteSwitcher';
export type {
  SiteSwitcherProps,
  Site,
} from './components/ui-elements/SiteSwitcher';
export { NotificationCenter } from './components/ui-elements/NotificationCenter';
export type {
  NotificationCenterProps,
  Notification,
} from './components/ui-elements/NotificationCenter';
export { HelpMenu } from './components/ui-elements/HelpMenu';
export type {
  HelpMenuProps,
  HelpMenuItem,
} from './components/ui-elements/HelpMenu';
export { SettingsButton } from './components/ui-elements/SettingsButton';
export type { SettingsButtonProps } from './components/ui-elements/SettingsButton';
export { SearchBar } from './components/ui-elements/SearchBar';
export type { SearchBarProps } from './components/ui-elements/SearchBar';
export { ProfileEditor } from './components/ui-elements/ProfileEditor';
export type { ProfileEditorProps } from './components/ui-elements/ProfileEditor';
export { Avatar } from './components/ui-elements/Avatar';
export type { AvatarProps } from './components/ui-elements/Avatar';
export { StatusBadge } from './components/ui-elements/StatusBadge';
export type { StatusBadgeProps } from './components/ui-elements/StatusBadge';
export { ActivityFeed } from './components/ui-elements/ActivityFeed';
export type {
  ActivityFeedProps,
  Activity,
} from './components/ui-elements/ActivityFeed';

// 2.12 Form Components
export { RadioGroup } from './components/forms/RadioGroup';
export type {
  RadioGroupProps,
  RadioOption,
} from './components/forms/RadioGroup';
export { Toggle } from './components/forms/Toggle';
export type { ToggleProps } from './components/forms/Toggle';
export { DatePicker } from './components/forms/DatePicker';
export type { DatePickerProps } from './components/forms/DatePicker';
export { ColorPicker } from './components/forms/ColorPicker';
export type { ColorPickerProps } from './components/forms/ColorPicker';
export { FileUpload } from './components/forms/FileUpload';
export type { FileUploadProps } from './components/forms/FileUpload';
export { RichTextEditor } from './components/forms/RichTextEditor';
export type { RichTextEditorProps } from './components/forms/RichTextEditor';

// 2.13 Data Display
export { DataTable } from './components/data-display/DataTable';
export type {
  DataTableProps,
  ColumnDef,
} from './components/data-display/DataTable';
export { DataGrid } from './components/data-display/DataGrid';
export type { DataGridProps } from './components/data-display/DataGrid';
export { Pagination } from './components/data-display/Pagination';
export type { PaginationProps } from './components/data-display/Pagination';
export { InfiniteScroll } from './components/data-display/InfiniteScroll';
export type { InfiniteScrollProps } from './components/data-display/InfiniteScroll';
export { SkeletonLoader } from './components/data-display/SkeletonLoader';
export type { SkeletonLoaderProps } from './components/data-display/SkeletonLoader';
export { EmptyState } from './components/data-display/EmptyState';
export type { EmptyStateProps } from './components/data-display/EmptyState';
export { ErrorState } from './components/data-display/ErrorState';
export type { ErrorStateProps } from './components/data-display/ErrorState';
export { ProgressBar } from './components/data-display/ProgressBar';
export type { ProgressBarProps } from './components/data-display/ProgressBar';
export { StatCard } from './components/data-display/StatCard';
export type { StatCardProps } from './components/data-display/StatCard';
export { Chart } from './components/data-display/Chart';
export type { ChartProps } from './components/data-display/Chart';

// 2.14 Accessibility
export {
  ScreenReaderAnnouncer,
  announceToScreenReader,
} from './components/a11y/ScreenReaderAnnouncer';
export { FocusTrap } from './components/a11y/FocusTrap';
export type { FocusTrapProps } from './components/a11y/FocusTrap';
export { SkipLink } from './components/a11y/SkipLink';
export type { SkipLinkProps } from './components/a11y/SkipLink';
export {
  HighContrastMode,
  useHighContrastMode,
} from './components/a11y/HighContrastMode';
export type { HighContrastModeProps } from './components/a11y/HighContrastMode';
export {
  ReducedMotion,
  useReducedMotion,
} from './components/a11y/ReducedMotion';
export type { ReducedMotionProps } from './components/a11y/ReducedMotion';
export {
  LargeTextMode,
  useLargeTextMode,
} from './components/a11y/LargeTextMode';
export type { LargeTextModeProps } from './components/a11y/LargeTextMode';
export { KeyboardHints } from './components/a11y/KeyboardHints';
export type { KeyboardHintsProps } from './components/a11y/KeyboardHints';
export { AriaAnnotations } from './components/a11y/AriaAnnotations';
export type { AriaAnnotationsProps } from './components/a11y/AriaAnnotations';
export { FocusVisible } from './components/a11y/FocusVisible';
export type { FocusVisibleProps } from './components/a11y/FocusVisible';
export { LandmarkNavigation } from './components/a11y/LandmarkNavigation';
export type { LandmarkNavigationProps } from './components/a11y/LandmarkNavigation';

// 2.15 Loading & Error
export { FullPageLoader } from './components/loading/FullPageLoader';
export type { FullPageLoaderProps } from './components/loading/FullPageLoader';
export { SkeletonScreen } from './components/loading/SkeletonScreen';
export type { SkeletonScreenProps } from './components/loading/SkeletonScreen';
export { RetryButton } from './components/loading/RetryButton';
export type { RetryButtonProps } from './components/loading/RetryButton';
export { OfflineIndicator } from './components/loading/OfflineIndicator';
export type { OfflineIndicatorProps } from './components/loading/OfflineIndicator';
export { SyncStatus } from './components/loading/SyncStatus';
export type { SyncStatusProps } from './components/loading/SyncStatus';
export { ProgressIndicator } from './components/loading/ProgressIndicator';
export type { ProgressIndicatorProps } from './components/loading/ProgressIndicator';
export { SuspenseBoundary } from './components/loading/SuspenseBoundary';
export type { SuspenseBoundaryProps } from './components/loading/SuspenseBoundary';
export { ErrorReset } from './components/loading/ErrorReset';

export { cn } from './lib/cn';
