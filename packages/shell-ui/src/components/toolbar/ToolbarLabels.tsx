'use client';

import React, { useState, type ReactNode } from 'react';
import { Tag } from 'lucide-react';

export interface ToolbarLabelsProps {
  labels: Array<{
    id: string;
    label: string;
    color?: string;
    onClick?: () => void;
  }>;
}

export function ToolbarLabels({ labels }: ToolbarLabelsProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? labels : labels.slice(0, 3);

  return (
    <div className="flex items-center gap-1">
      <Tag size={14} className="text-muted-foreground" />
      {visible.map((label) => (
        <button
          key={label.id}
          onClick={label.onClick}
          className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-border hover:bg-accent transition-colors"
          style={
            label.color
              ? { borderColor: label.color, color: label.color }
              : undefined
          }
        >
          {label.label}
        </button>
      ))}
      {labels.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          +{labels.length - 3}
        </button>
      )}
    </div>
  );
}
