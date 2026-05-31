import React, { lazy, Suspense, ComponentType } from 'react';
import { SukitModule } from './types';

const moduleCache = new Map<string, ComponentType<any>>();

export function loadModuleComponent(mod: SukitModule): ComponentType<any> | null {
  if (!mod.widget?.component) return null;

  return mod.widget.component;
}

export function createModuleWidget(mod: SukitModule): React.ReactNode {
  const Component = loadModuleComponent(mod);
  if (!Component) return null;

  return React.createElement(
    Suspense,
    { fallback: React.createElement('div', null, 'Loading...') },
    React.createElement(Component, mod.widget?.settings || {})
  );
}

export function clearModuleCache(): void {
  moduleCache.clear();
}
