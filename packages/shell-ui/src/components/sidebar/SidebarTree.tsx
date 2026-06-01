'use client';

import React, { useState, type ReactNode } from 'react';
import { ChevronRight, ChevronDown, type LucideIcon } from 'lucide-react';

export interface TreeNode {
  id: string;
  label: string;
  icon?: LucideIcon;
  children?: TreeNode[];
  onClick?: () => void;
  defaultExpanded?: boolean;
}

export interface SidebarTreeProps {
  nodes: TreeNode[];
  className?: string;
}

function TreeItem({ node, depth }: { node: TreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(node.defaultExpanded ?? true);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = node.icon;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          node.onClick?.();
        }}
        className="flex items-center gap-1.5 w-full px-2 py-1 text-sm rounded-md hover:bg-accent transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )
        ) : (
          <span className="w-[14px]" />
        )}
        {Icon && <Icon size={14} />}
        <span>{node.label}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarTree({ nodes, className }: SidebarTreeProps) {
  return (
    <div className={`space-y-0.5 ${className || ''}`}>
      {nodes.map((node) => (
        <TreeItem key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
