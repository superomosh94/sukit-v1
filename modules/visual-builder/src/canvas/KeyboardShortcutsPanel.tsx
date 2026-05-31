'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

interface ShortcutGroup {
  group: string;
  shortcuts: { keys: string; description: string }[];
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    group: 'General',
    shortcuts: [
      { keys: 'Ctrl+Z', description: 'Undo' },
      { keys: 'Ctrl+Y / Ctrl+Shift+Z', description: 'Redo' },
      { keys: 'Ctrl+S', description: 'Save' },
      { keys: 'Ctrl+D', description: 'Duplicate selected' },
      { keys: 'Delete / Backspace', description: 'Delete selected' },
      { keys: 'Escape', description: 'Clear selection' },
    ],
  },
  {
    group: 'Selection',
    shortcuts: [
      { keys: 'Click', description: 'Select component' },
      { keys: 'Ctrl+Click', description: 'Multi-select' },
      { keys: 'Space+Drag', description: 'Pan canvas' },
    ],
  },
  {
    group: 'Clipboard',
    shortcuts: [
      { keys: 'Ctrl+C', description: 'Copy selected' },
      { keys: 'Ctrl+V', description: 'Paste' },
    ],
  },
  {
    group: 'Nudge',
    shortcuts: [
      { keys: 'Arrow Keys', description: 'Nudge 1px' },
      { keys: 'Shift+Arrow Keys', description: 'Nudge 10px' },
    ],
  },
  {
    group: 'View',
    shortcuts: [
      { keys: '+ / -', description: 'Zoom in / out' },
      { keys: 'Ctrl+0', description: 'Reset zoom to 100%' },
      { keys: 'F', description: 'Toggle fullscreen' },
      { keys: 'G', description: 'Toggle grid' },
      { keys: '?', description: 'Show keyboard shortcuts' },
    ],
  },
];

interface KeyboardShortcutsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsPanel({
  open,
  onOpenChange,
}: KeyboardShortcutsPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {SHORTCUTS.map((group) => (
            <div key={group.group}>
              <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {group.group}
              </h4>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5"
                  >
                    <span className="text-xs text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <kbd className="rounded-md border bg-background px-2 py-0.5 text-xs font-mono shadow-sm">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
