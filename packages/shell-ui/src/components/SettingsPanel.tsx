'use client';

import React from 'react';
import { useShellStore } from '../state/shellStore';
import { SlotRenderer } from '../slots/SlotRenderer';
import { X, Sun, Moon, Monitor } from 'lucide-react';

export function SettingsPanel() {
  const { theme, setTheme } = useShellStore();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const unsub = () => {};
    return unsub;
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-md hover:bg-accent"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Theme</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent'
                }`}
              >
                <Sun size={16} />
                <span className="text-sm">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent'
                }`}
              >
                <Moon size={16} />
                <span className="text-sm">Dark</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  theme === 'system'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-accent'
                }`}
              >
                <Monitor size={16} />
                <span className="text-sm">System</span>
              </button>
            </div>
          </div>

          <SlotRenderer name="settings:tabs" />
        </div>
      </div>
    </div>
  );
}
