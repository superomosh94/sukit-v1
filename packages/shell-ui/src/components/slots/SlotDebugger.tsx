'use client';

import React, { useState } from 'react';
import { useShell } from '../../hooks/useShell';

export interface SlotDebuggerProps {
  className?: string;
}

export function SlotDebugger({ className }: SlotDebuggerProps) {
  const { slotRegistry } = useShell();
  const [isOpen, setIsOpen] = useState(false);
  const slots = slotRegistry.getAvailableSlots();

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] ${className || ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-xs bg-card border border-border rounded shadow-lg hover:bg-accent"
      >
        Slots ({slots.length})
      </button>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-card border border-border rounded-lg shadow-xl max-h-80 overflow-auto">
          <div className="p-2 border-b border-border">
            <h3 className="text-xs font-semibold">Slot Debugger</h3>
          </div>
          <div className="p-2 space-y-1">
            {slots.map((slot) => (
              <div
                key={slot}
                className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-accent"
              >
                <code className="font-mono text-[10px]">{slot}</code>
                <span className="text-muted-foreground">
                  {slotRegistry.hasSlotContent(slot) ? 'filled' : 'empty'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
