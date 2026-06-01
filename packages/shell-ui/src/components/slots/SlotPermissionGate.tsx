'use client';

import React, { type ReactNode } from 'react';
import { useShell } from '../../hooks/useShell';
import { SlotRenderer } from '../../slots/SlotRenderer';

export interface SlotPermissionGateProps {
  slotName: string;
  permission: string;
  fallback?: ReactNode;
  context?: any;
}

export function SlotPermissionGate({
  slotName,
  permission,
  fallback,
  context,
}: SlotPermissionGateProps) {
  const { kernel } = useShell();
  const hasPermission = kernel?.permissions?.check?.(permission);

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null;
  }

  return <SlotRenderer name={slotName} context={context} />;
}
