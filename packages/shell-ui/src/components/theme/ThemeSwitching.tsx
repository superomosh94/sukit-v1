'use client';

import React, { useCallback, type ReactNode } from 'react';
import { useShellStore } from '../../state/shellStore';

export interface ThemeSwitchingProps {
  children: ReactNode;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

export function ThemeSwitching({
  children,
  onThemeChange,
}: ThemeSwitchingProps) {
  const setTheme = useShellStore((state) => state.setTheme);
  const currentTheme = useShellStore((state) => state.theme);

  const switchTheme = useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      setTheme(theme);
      onThemeChange?.(theme);
    },
    [setTheme, onThemeChange]
  );

  return (
    <div data-current-theme={currentTheme}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              onThemeSwitch: switchTheme,
              currentTheme,
            })
          : child
      )}
    </div>
  );
}
