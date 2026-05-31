# Module Development Guide

Modules are installable extensions that add functionality to SUKIT. They can provide widgets, API routes, admin settings panels, and more.

## Module Structure

```
my-module/
├── package.json          # npm package with @sukit/module keyword
├── module.json           # Module manifest
└── src/
    ├── index.ts          # Module entry point (exports SukitModule)
    ├── widget.tsx        # Optional frontend widget component
    ├── settings.tsx      # Optional admin settings panel
    ├── api.ts            # Optional API route handlers
    └── types.ts          # TypeScript types
```

### module.json

```json
{
  "id": "sukit-chat",
  "name": "AI Chat Assistant",
  "version": "1.0.0",
  "description": "Add an AI chat widget to your sites",
  "icon": "message-square",
  "minSukitVersion": "1.0.0",
  "permissions": ["api:write", "media:read"],
  "settings": {
    "openaiApiKey": { "type": "encrypted", "required": true },
    "model": { "type": "select", "options": ["gpt-4", "gpt-3.5-turbo"], "default": "gpt-4" },
    "theme": { "type": "select", "options": ["light", "dark"], "default": "light" }
  }
}
```

## SukitModule Interface

```typescript
interface SukitModule {
  id: string;
  name: string;
  version: string;
  description?: string;
  icon?: string;

  widget?: {
    component: React.ComponentType<WidgetProps>;
    position?: 'bottom-right' | 'bottom-left' | 'inline';
    defaultSettings?: Record<string, unknown>;
  };

  apiRoutes?: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    handler: (req: Request, res: Response) => void | Promise<void>;
  }>;

  settings?: React.ComponentType<SettingsProps>;

  hooks?: {
    onEnable?: () => void | Promise<void>;
    onDisable?: () => void | Promise<void>;
    onInstall?: () => void | Promise<void>;
  };
}
```

## Registering in Module Registry

```typescript
// src/index.ts
import { registerModule } from '@sukit/modules-core';
import { ChatWidget } from './widget';
import { ChatSettings } from './settings';
import { handleMessage, handleUpload } from './api';

export default registerModule({
  id: 'sukit-chat',
  name: 'AI Chat Assistant',
  version: '1.0.0',
  widget: {
    component: ChatWidget,
    position: 'bottom-right',
  },
  apiRoutes: [
    { method: 'POST', path: '/api/chat/message', handler: handleMessage },
    { method: 'POST', path: '/api/chat/upload', handler: handleUpload },
  ],
  settings: ChatSettings,
});
```

## Widget Component Pattern

```typescript
interface WidgetProps {
  settings: Record<string, unknown>;
  pageContext: { siteId: string; pageId: string };
  onUpdate: (settings: Record<string, unknown>) => void;
}

const ChatWidget: React.FC<WidgetProps> = ({ settings }) => {
  return <div className="sukit-chat-widget">{/* Chat UI */}</div>;
};
```

## API Route Handlers

```typescript
import { createRouteHandler } from '@sukit/modules-core';

export const handleMessage = createRouteHandler(async (req, res) => {
  const { message, conversationId } = req.body;
  const response = await callLLM(message, conversationId);
  res.json({ response, conversationId });
});
```

## Publishing to Marketplace

1. Build your module: `pnpm build`
2. Publish to npm with the `@sukit/module` keyword
3. Submit to the SUKIT marketplace at `https://marketplace.sukit.dev`
