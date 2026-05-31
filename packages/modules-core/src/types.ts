import { ComponentType } from 'react';

export interface ModuleWidget {
  component: ComponentType<any>;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'bottom-right' | 'bottom-left';
  settings?: Record<string, any>;
}

export interface ModuleAPIRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: string;
}

export interface ModuleSettings {
  [key: string]: {
    type: 'text' | 'number' | 'boolean' | 'select' | 'file' | 'image' | 'color' | 'code' | 'encrypted' | 'json';
    label?: string;
    default?: any;
    options?: { label: string; value: any }[];
    required?: boolean;
    description?: string;
  };
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  icon?: string;
  screenshots?: string[];
  minAppVersion?: string;
  dependencies?: Record<string, string>;
  settings?: ModuleSettings;
}

export interface SukitModule {
  id: string;
  name: string;
  version: string;
  description?: string;
  enabled: boolean;
  manifest?: ModuleManifest;
  widget?: ModuleWidget;
  apiRoutes?: ModuleAPIRoute[];
  settings?: ModuleSettings;
  onActivate?: () => void | Promise<void>;
  onDeactivate?: () => void | Promise<void>;
  onInstall?: () => void | Promise<void>;
  onUninstall?: () => void | Promise<void>;
}
