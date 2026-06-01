'use client';

import { useState, useCallback } from 'react';

export function useTreeExpandCollapse() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((pageId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback((pageIds: string[]) => {
    setExpandedNodes(new Set(pageIds));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const isExpanded = useCallback(
    (pageId: string) => expandedNodes.has(pageId),
    [expandedNodes]
  );

  return { expandedNodes, toggleExpand, expandAll, collapseAll, isExpanded };
}
