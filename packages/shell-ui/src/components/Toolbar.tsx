'use client';

import React from 'react';
import { useShellStore } from '../state/shellStore';
import { useShell } from '../hooks/useShell';
import {
  Menu,
  Save,
  Undo,
  Redo,
  Eye,
  Code,
  Columns,
  Download,
  Settings,
  HelpCircle,
  User,
} from 'lucide-react';

export function Toolbar() {
  const { toggleSidebarLeft, currentMode, setCurrentMode, currentSiteId } =
    useShellStore();
  const { kernel } = useShell();

  const handleSave = async () => {
    await kernel.events.emit('editor:save', { auto: false });
  };

  const handleExport = async () => {
    if (currentSiteId) {
      await kernel.events.emit('editor:export', { siteId: currentSiteId });
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebarLeft}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        <button
          onClick={handleSave}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Save"
        >
          <Save size={20} />
        </button>

        <button
          className="p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          aria-label="Undo"
          disabled
        >
          <Undo size={20} />
        </button>

        <button
          className="p-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          aria-label="Redo"
          disabled
        >
          <Redo size={20} />
        </button>
      </div>

      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setCurrentMode('visual')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            currentMode === 'visual'
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          }`}
        >
          <Eye size={16} />
          <span className="text-sm">Visual</span>
        </button>

        <button
          onClick={() => setCurrentMode('code')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            currentMode === 'code'
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          }`}
        >
          <Code size={16} />
          <span className="text-sm">Code</span>
        </button>

        <button
          onClick={() => setCurrentMode('split')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            currentMode === 'split'
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          }`}
        >
          <Columns size={16} />
          <span className="text-sm">Split</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Export"
        >
          <Download size={20} />
        </button>

        <button
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Settings"
          onClick={() => kernel.events.emit('ui:open-settings')}
        >
          <Settings size={20} />
        </button>

        <button
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Help"
        >
          <HelpCircle size={20} />
        </button>

        <button
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="User menu"
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
}
