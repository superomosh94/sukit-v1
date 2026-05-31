'use client';

import { useShellStore } from '../state/shellStore';
import { useBuilderStore } from '../state/builderStore';
import { useShell } from './useShell';

export function useBuilderContext() {
  const shell = useShellStore();
  const builder = useBuilderStore();
  const { kernel } = useShell();

  return {
    ...shell,
    ...builder,
    kernel,
  };
}
