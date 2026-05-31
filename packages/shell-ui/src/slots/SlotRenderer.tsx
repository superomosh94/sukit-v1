'use client';

import React from 'react';
import { useShell } from '../hooks/useShell';

export interface SlotRendererProps {
  name: string;
  context?: any;
  fallback?: React.ReactNode;
  className?: string;
}

export function SlotRenderer({
  name,
  context,
  fallback,
  className,
}: SlotRendererProps) {
  const { slotRegistry } = useShell();
  const components = slotRegistry.getSlotComponents(name, context);

  if (components.length === 0) {
    return fallback ? <>{fallback}</> : null;
  }

  const isExclusive = BUILTIN_SLOTS_MULTIPLE[name] === false;
  const toRender = isExclusive ? components.slice(0, 1) : components;

  return (
    <div
      className={`slot-container slot-${name.replace(':', '-')} ${className || ''}`}
    >
      {toRender.map(({ component: Component, moduleId, props: slotProps }) => (
        <React.Fragment key={`${moduleId}-${name}`}>
          <Component {...slotProps} context={context} />
        </React.Fragment>
      ))}
    </div>
  );
}

const BUILTIN_SLOTS_MULTIPLE: Record<string, boolean> = {
  'canvas:main': false,
  'canvas:code': false,
};
