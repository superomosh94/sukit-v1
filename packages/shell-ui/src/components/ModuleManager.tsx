'use client';

import React from 'react';
import { useShell } from '../hooks/useShell';
import { Package } from 'lucide-react';

export function ModuleManager() {
  const { kernel } = useShell();
  const [modules, setModules] = React.useState<
    Array<{ id: string; name: string; version: string }>
  >([]);

  React.useEffect(() => {
    const loaded = kernel.modules.list();
    setModules(
      loaded.map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        version: m.version || '1.0.0',
      }))
    );
  }, [kernel]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Package size={18} />
        <h2 className="font-semibold">Modules</h2>
        <span className="text-xs text-muted-foreground">
          ({modules.length})
        </span>
      </div>
      <div className="space-y-2">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm"
          >
            <span>{mod.name}</span>
            <span className="text-xs text-muted-foreground">
              v{mod.version}
            </span>
          </div>
        ))}
        {modules.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No modules loaded
          </p>
        )}
      </div>
    </div>
  );
}
