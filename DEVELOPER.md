# 📚 SUKIT Developer Documentation

## Complete Guide for Extending and Contributing to SUKIT

---

# Part 1: Getting Started

## 1.1 What is SUKIT?

SUKIT is an **OS-style website builder platform** where the kernel provides core services and everything else is an installable module. Think of it as WordPress rebuilt with modern TypeScript, React, and Next.js, but designed like an operating system.

**The Core Philosophy:**
- The **Kernel** never changes (security/bug fixes only)
- The **Shell** provides the UI framework
- **Modules** provide all functionality (builder, editor, SEO, forms, etc.)

## 1.2 Prerequisites

Before developing for SUKIT, ensure you have:

```bash
Node.js >= 20.0.0
pnpm >= 8.0.0 (we use pnpm, not npm)
Git
PostgreSQL >= 15
```

## 1.3 Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/sukit/sukit.git
cd sukit

# Install dependencies (pnpm is required)
pnpm install

# Copy environment variables
cp .env.example .env.local

# Set up database
pnpm db:migrate
pnpm db:seed

# Start development server
pnpm dev

# Open http://localhost:3042
```

## 1.4 Project Structure Quick Reference

```
sukit/
├── packages/core/        # THE KERNEL - Never changes without major version
├── apps/web/             # THE SHELL - Next.js app with layout and slot system
├── modules/              # FIRST-PARTY MODULES - Built by SUKIT team
├── packages/             # Shared utilities (module-sdk, shared, ui, blocks)
├── scripts/              # CLI tooling for module management
└── marketplace/          # Community modules (git submodules)
```

---

# Part 2: The Kernel API Reference

## 2.1 Complete Kernel API

The kernel exposes a single object: `sukit`. This is what every module receives.

```typescript
import { sukit } from '@sukit/core';

// All kernel APIs are available here
```

### 2.1.1 Module Management (`sukit.modules`)

```typescript
// List all loaded modules
await sukit.modules.list();

// Load/unload modules dynamically
await sukit.modules.load('@sukit/seo-module');
await sukit.modules.unload('@sukit/seo-module');

// Check if a module is loaded
sukit.modules.isLoaded('@sukit/seo-module');

// Get module manifest
const manifest = sukit.modules.getManifest('@sukit/seo-module');
```

### 2.1.2 Event System (`sukit.events`)

```typescript
// Listen to events
const unsubscribe = sukit.events.on('page:saved', async ({ pageId, siteId }) => {
  console.log(`Page ${pageId} saved on site ${siteId}`);
});

// Listen once
sukit.events.once('kernel:ready', () => {
  console.log('SUKIT is ready!');
});

// Emit events (for modules to communicate)
await sukit.events.emit('custom:event', { some: 'data' });

// Remove listener
sukit.events.off('page:saved', myHandler);
```

**Built-in Events:**

| Event | Payload | When Triggered |
|-------|---------|----------------|
| `kernel:ready` | `{ timestamp }` | Kernel fully initialized |
| `module:loaded` | `{ moduleId }` | After module activates |
| `module:unloaded` | `{ moduleId }` | After module deactivates |
| `site:created` | `{ siteId, name }` | New site created |
| `site:deleted` | `{ siteId }` | Site removed |
| `page:saved` | `{ pageId, siteId, auto }` | Page saved (auto = auto-save) |
| `page:deleted` | `{ pageId, siteId }` | Page deleted |
| `block:selected` | `{ blockId, type }` | Block clicked in canvas |
| `block:updated` | `{ blockId, props }` | Block properties changed |
| `export:started` | `{ siteId, format }` | Export begins |
| `export:completed` | `{ siteId, outputPath }` | Export finishes |
| `deploy:completed` | `{ siteId, url }` | Deployment live |

### 2.1.3 Authentication (`sukit.auth`)

```typescript
// Login/logout
await sukit.auth.login('user@example.com', 'password');
await sukit.auth.logout();

// Get current user
const user = await sukit.auth.user();
// Returns: { id, email, name, avatar, isAdmin }

// Check authentication status
if (sukit.auth.isAuthenticated()) {
  // User is logged in
}

// Check user role (for site-specific permissions)
const isAdmin = sukit.auth.hasRole('admin', siteId);
const isEditor = sukit.auth.hasRole('editor', siteId);
const isViewer = sukit.auth.hasRole('viewer', siteId);
```

### 2.1.4 File System (`sukit.fs`)

```typescript
// Read/write files (scoped to project)
const content = await sukit.fs.read('src/pages/index.tsx');
await sukit.fs.write('src/pages/index.tsx', newContent);

// Check if file exists
const exists = await sukit.fs.exists('src/pages/index.tsx');

// List directory contents
const files = await sukit.fs.list('src/components');
// Returns: [{ name, path, isDirectory, size, modifiedAt }]

// Delete files
await sukit.fs.delete('temp/old-file.txt');

// Watch for file changes
const watcher = await sukit.fs.watch('src', (event, path) => {
  console.log(`${event}: ${path}`);
});
watcher.close(); // Stop watching
```

### 2.1.5 Storage (Key-Value Database) (`sukit.storage`)

Storage is automatically scoped to your module. No need to prefix keys.

```typescript
// Store data
await sukit.storage.set('userPreferences', { theme: 'dark' });
await sukit.storage.set('lastRun', Date.now());

// Retrieve data
const prefs = await sukit.storage.get('userPreferences');
// Returns: { theme: 'dark' } or null

// Check if key exists
if (await sukit.storage.has('lastRun')) {
  // Key exists
}

// Delete data
await sukit.storage.delete('userPreferences');

// Site-specific storage (requires siteId)
await sukit.storage.forSite(siteId).set('seoSettings', {
  metaTitle: 'My Site'
});
const seo = await sukit.storage.forSite(siteId).get('seoSettings');
```

### 2.1.6 Site Management (`sukit.sites`)

```typescript
// Create a new site
const site = await sukit.sites.create('My Awesome Site', {
  description: 'A portfolio site',
  language: 'en',
  timezone: 'America/New_York'
});

// Get site by ID
const site = await sukit.sites.get(siteId);

// Update site
await sukit.sites.update(siteId, { name: 'New Name' });

// Delete site
await sukit.sites.delete(siteId);

// List all sites
const sites = await sukit.sites.list();

// Get current working site (from URL context)
const currentSite = await sukit.sites.current();
```

### 2.1.7 Page Management (`sukit.pages`)

```typescript
// Create a page
const page = await sukit.pages.create(siteId, 'about', 'About Us');

// Get page
const page = await sukit.pages.get(siteId, pageId);

// Save page content
await sukit.pages.save({
  ...page,
  content: { blocks: [...] }
});

// Delete page
await sukit.pages.delete(siteId, pageId);

// List all pages in a site
const pages = await sukit.pages.list(siteId);
```

### 2.1.8 Block Management (`sukit.blocks`)

```typescript
// Register a custom block (from your module)
sukit.blocks.register({
  type: 'testimonial-slider',
  name: 'Testimonial Slider',
  category: 'content',
  icon: 'Star',
  component: TestimonialSlider,
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', default: 'What people say' },
      testimonials: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            quote: { type: 'string' },
            author: { type: 'string' }
          }
        }
      }
    }
  }
});

// Get block definition
const block = sukit.blocks.get('testimonial-slider');

// List all blocks
const allBlocks = sukit.blocks.getAll();

// List blocks by category
const contentBlocks = sukit.blocks.getByCategory('content');

// Validate block props
const { valid, errors } = sukit.blocks.validate('testimonial-slider', props);

// Unregister block (on module deactivation)
sukit.blocks.unregister('testimonial-slider');
```

### 2.1.9 Media Management (`sukit.media`)

```typescript
// Upload file (from browser File object)
const asset = await sukit.media.upload(file, siteId);

// Get asset metadata
const asset = await sukit.media.get(assetId);

// List site assets
const assets = await sukit.media.list(siteId);

// Get optimized URL
const thumbnailUrl = sukit.media.url(assetId, { width: 300, height: 200 });
const webpUrl = sukit.media.url(assetId, { format: 'webp', quality: 80 });

// Delete asset
await sukit.media.delete(assetId);
```

### 2.1.10 Export Engine (`sukit.export`)

```typescript
// Export as static HTML/CSS/JS
const outputPath = await sukit.export.toStatic(siteId);

// Export as full Next.js project
const projectPath = await sukit.export.toNextJS(siteId);

// Deploy to hosting providers
const deployment = await sukit.export.deploy(siteId, 'netlify');
console.log(`Live at: ${deployment.url}`);

// Deploy to Vercel
await sukit.export.deploy(siteId, 'vercel');

// Push to GitHub
await sukit.export.toGitHub(siteId, 'username/repo-name');
```

### 2.1.11 API Routes (`sukit.api`)

For modules that need custom API endpoints:

```typescript
// Register API endpoints
sukit.api.get('/api/seo/analyze', async (req, params) => {
  const { content } = await req.json();
  const analysis = await analyzeSEO(content);
  return Response.json(analysis);
});

sukit.api.post('/api/seo/sitemap/generate', async (req) => {
  const { siteId } = await req.json();
  await generateSitemap(siteId);
  return Response.json({ success: true });
});

// All routes are automatically prefixed with module's basePath
// e.g., module with basePath '/api/seo' registers '/api/seo/analyze'
```

### 2.1.12 UI Slots (`sukit.ui`)

For modules that need to extend the UI:

```typescript
// Register a sidebar panel
sukit.ui.registerSlot('sidebar:right', MyCustomPanel, {
  position: 10,
  when: (context) => context.selectedBlock !== null
});

// Available slots:
// - 'sidebar:left' (main navigation)
// - 'sidebar:right' (property panels)
// - 'toolbar:top' (top toolbar buttons)
// - 'toolbar:bottom' (status bar)
// - 'canvas:overlay' (over the design canvas)
// - 'modal:center' (global dialogs)
// - 'settings:tabs' (settings page tabs)
// - 'dashboard:widgets' (dashboard widgets)
```

### 2.1.13 Settings Panel (`sukit.settings`)

```typescript
// Register a settings panel
sukit.settings.registerPanel({
  id: 'seo-settings',
  label: 'SEO',
  category: 'site',  // 'site' or 'global'
  icon: 'Search',
  component: SEOSettingsPanel
});

// In your settings component:
const SEOSettingsPanel = () => {
  const [settings, setSettings] = sukit.settings.useSettings('seo-settings');

  return (
    <div>
      <input
        value={settings.metaTitle}
        onChange={e => setSettings({ metaTitle: e.target.value })}
      />
    </div>
  );
};
```

### 2.1.14 Background Tasks (`sukit.tasks`)

```typescript
// Queue a background task
const taskId = await sukit.tasks.enqueue({
  type: 'generate-sitemap',
  data: { siteId: '123' },
  priority: 'normal'
});

// Check task status
const status = await sukit.tasks.status(taskId);
// Returns: { status: 'completed', result: {...} }

// Schedule recurring task (cron syntax)
await sukit.tasks.schedule({
  type: 'backup-sites',
  data: {},
  schedule: '0 0 * * *',  // Daily at midnight
  timezone: 'UTC'
});
```

### 2.1.15 Caching (`sukit.cache`)

```typescript
// Cache data with TTL (seconds)
await sukit.cache.set('expensive-data', result, 3600);

// Retrieve from cache
const cached = await sukit.cache.get('expensive-data');

// Delete from cache
await sukit.cache.delete('expensive-data');

// Clear all cache (optional moduleId filter)
await sukit.cache.clear();  // All cache
await sukit.cache.clear('@sukit/seo-module');  // Module-specific
```

### 2.1.16 Logging (`sukit.log`)

```typescript
// Log messages with different levels
sukit.log.debug('Processing request', { url: '/api/test' });
sukit.log.info('User logged in', { userId: '123' });
sukit.log.warn('Slow query detected', { duration: 5000 });
sukit.log.error('Failed to save', error);

// Logs automatically include module ID and timestamp
```

---

# Part 3: Creating a Module

## 3.1 Module Structure

Every module must follow this structure:

```
my-module/
├── src/
│   ├── index.ts           # Main entry point (required)
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions
│   └── styles.css         # Optional CSS
├── manifest.json          # Module manifest (required)
├── package.json           # npm package.json
├── tsconfig.json          # TypeScript config
└── README.md              # Documentation
```

## 3.2 Manifest File (`manifest.json`)

```json
{
  "id": "@sukit/my-module",
  "name": "My Module",
  "version": "1.0.0",
  "description": "What this module does",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT",

  "sukit": {
    "minKernelVersion": "1.0.0",

    "capabilities": [
      "ui:sidebar",
      "api:routes",
      "blocks:register"
    ],

    "permissions": {
      "required": ["http:outbound"],
      "optional": {
        "fs:write": "To save generated files"
      }
    },

    "entrypoints": {
      "main": "./dist/index.js",
      "styles": "./dist/styles.css"
    },

    "slots": {
      "sidebar:right": {
        "component": "./dist/components/Sidebar.jsx",
        "position": 10
      }
    },

    "api": {
      "basePath": "/api/my-module",
      "routes": "./dist/api.js"
    },

    "dependencies": {
      "@sukit/core": "^1.0.0"
    }
  }
}
```

## 3.3 Module Entry Point (`src/index.ts`)

```typescript
import type { Kernel, Module } from '@sukit/core';
import { MyBlock } from './components/MyBlock';
import { SidebarPanel } from './components/SidebarPanel';

const myModule: Module = {
  // Called when module is activated
  async activate(kernel: Kernel) {
    // Register custom block
    kernel.blocks.register({
      type: 'my-block',
      name: 'My Custom Block',
      category: 'custom',
      component: MyBlock,
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', default: 'Hello World' },
          count: { type: 'number', default: 0 }
        }
      }
    });

    // Register UI slot
    kernel.ui.registerSlot('sidebar:right', SidebarPanel, {
      position: 10,
      when: (ctx) => ctx.selectedBlock?.type === 'my-block'
    });

    // Register API route
    kernel.api.post('/process', async (req) => {
      const data = await req.json();
      const result = await processData(data);
      return Response.json(result);
    });

    // Listen to events
    kernel.events.on('page:saved', async ({ pageId }) => {
      kernel.log.info(`Page ${pageId} saved`);
    });

    // Store some data
    await kernel.storage.set('activatedAt', Date.now());
  },

  // Called when module is deactivated (cleanup!)
  async deactivate(kernel: Kernel) {
    kernel.blocks.unregister('my-block');
    kernel.api.unregister('/process');
    // Event listeners auto-cleanup on deactivation
  }
};

export default myModule;
```

## 3.4 Creating a React Component Block

```typescript
// src/components/MyBlock.tsx
import React from 'react';
import { useNode } from '@sukit/sdk';

interface MyBlockProps {
  title: string;
  count: number;
}

export const MyBlock: React.FC<MyBlockProps> = ({ title, count }) => {
  const { isSelected, connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={ref => connect(drag(ref))}
      className={`p-4 border rounded ${isSelected ? 'border-blue-500 ring-2' : 'border-gray-200'}`}
    >
      <h3 className="text-xl font-bold">{title}</h3>
      <p>Count: {count}</p>
    </div>
  );
};

// Property panel for this block
export const MyBlockSettings: React.FC = () => {
  const { actions, props } = useNode();

  return (
    <div className="space-y-2">
      <label>Title</label>
      <input
        value={props.title}
        onChange={e => actions.setProp(p => p.title = e.target.value)}
        className="w-full px-2 py-1 border rounded"
      />

      <label>Count</label>
      <input
        type="number"
        value={props.count}
        onChange={e => actions.setProp(p => p.count = parseInt(e.target.value))}
        className="w-full px-2 py-1 border rounded"
      />
    </div>
  );
};
```

## 3.5 Testing Your Module Locally

```bash
# In your module directory
pnpm install
pnpm build

# Link it locally
cd /path/to/sukit
pnpm link --global /path/to/my-module

# Or copy to modules directory for development
cp -r my-module ./modules/

# Restart SUKIT dev server
pnpm dev
```

## 3.6 Publishing Your Module

```bash
# Build your module
pnpm build

# Publish to npm
npm publish --access public

# Users can now install:
# npx sukit module add @sukit/my-module
```

---

# Part 4: Advanced Topics

## 4.1 Permission Request Pattern

Always request permissions before using sensitive APIs:

```typescript
async function sendExternalRequest(data: any) {
  // Check if we have permission
  const hasPermission = await kernel.permissions.check('http:outbound');

  if (!hasPermission) {
    // Request permission from user
    const granted = await kernel.permissions.request(
      'http:outbound',
      'My module needs to send analytics data to our servers'
    );

    if (!granted) {
      kernel.log.warn('User denied http permission');
      return;
    }
  }

  // Now safe to make request
  await fetch('https://api.example.com/collect', { method: 'POST', body: data });
}
```

## 4.2 Event-Driven Communication

Don't import other modules directly. Use events:

```typescript
// Instead of:
// import { seoModule } from '@sukit/seo-module';
// seoModule.updateMetaTags();

// Do this:
await kernel.events.emit('seo:meta-update', { pageId, metaTags: {...} });

// SEO module listens:
kernel.events.on('seo:meta-update', ({ pageId, metaTags }) => {
  // Handle update
});
```

## 4.3 Creating a Full Example Module

Here's a complete example of a "Recent Posts" module:

```typescript
// src/index.ts
import { RecentPostsBlock, RecentPostsSettings } from './components/RecentPostsBlock';
import { fetchRecentPosts } from './api/posts';

export default {
  async activate(kernel) {
    // Register block
    kernel.blocks.register({
      type: 'recent-posts',
      name: 'Recent Posts',
      category: 'content',
      component: RecentPostsBlock,
      schema: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 5 },
          showExcerpt: { type: 'boolean', default: true },
          category: { type: 'string', default: 'all' }
        }
      }
    });

    // Register settings panel
    kernel.settings.registerPanel({
      id: 'recent-posts',
      label: 'Recent Posts',
      category: 'site',
      component: RecentPostsSettings
    });

    // Register API route for fetching posts
    kernel.api.get('/api/posts/recent', async (req, params) => {
      const { limit, category } = params;
      const posts = await fetchRecentPosts(limit, category);
      return Response.json(posts);
    });

    // Listen to page saves to update cache
    kernel.events.on('page:saved', async () => {
      await kernel.cache.delete('recent-posts');
    });

    kernel.log.info('Recent Posts module activated');
  },

  async deactivate(kernel) {
    kernel.blocks.unregister('recent-posts');
    kernel.api.unregister('/api/posts/recent');
    kernel.log.info('Recent Posts module deactivated');
  }
};
```

## 4.4 Best Practices

### DO's ✅

```typescript
// DO use TypeScript for type safety
interface MyProps { title: string }

// DO clean up on deactivation
async deactivate(kernel) {
  kernel.blocks.unregister('my-block');
  kernel.api.unregister('/my-route');
}

// DO use storage for persistence
await kernel.storage.set('settings', mySettings);

// DO log meaningful messages
kernel.log.info('Processing completed', { duration: 150 });

// DO check permissions before sensitive operations
if (await kernel.permissions.check('fs:write')) {
  await kernel.fs.write(path, content);
}

// DO use events for cross-module communication
await kernel.events.emit('my-module:data-ready', { data });
```

### DON'Ts ❌

```typescript
// DON'T import other modules directly
// import { something } from '@sukit/other-module';

// DON'T assume files exist without checking
if (await kernel.fs.exists(path)) {
  const content = await kernel.fs.read(path);
}

// DON'T forget to clean up
// Always unregister blocks, routes, and event listeners in deactivate

// DON'T use global state outside kernel storage
// window.myModuleState = {} // NO!

// DON'T mutate kernel objects directly
// kernel.blocks = {} // NO!

// DON'T make assumptions about other modules being loaded
if (kernel.modules.isLoaded('@sukit/seo-module')) {
  // Safe to emit SEO-related events
}
```

## 4.5 Debugging Your Module

```typescript
// Use the logger
kernel.log.debug('Component mounted', { props });

// Check module status
const isLoaded = kernel.modules.isLoaded('@sukit/my-module');
const manifest = kernel.modules.getManifest('@sukit/my-module');

// View all registered blocks
const allBlocks = kernel.blocks.getAll();
console.log('Available blocks:', allBlocks.map(b => b.type));

// Check event listeners (debug mode only)
kernel.events.listeners('page:saved'); // Returns count

// Monitor cache
const cached = await kernel.cache.get('my-key');
kernel.log.debug('Cache hit:', { key: 'my-key', exists: cached !== null });
```

---

# Part 5: Contributing to Core

## 5.1 Development Workflow

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/sukit.git
cd sukit

# Install dependencies
pnpm install

# Create branch
git checkout -b feature/my-awesome-feature

# Make changes
# ... edit files ...

# Run tests
pnpm test

# Build
pnpm build

# Run linting
pnpm lint

# Commit and push
git add .
git commit -m "feat: add awesome feature"
git push origin feature/my-awesome-feature

# Open pull request on GitHub
```

## 5.2 Code Style

SUKIT uses ESLint and Prettier. Run before committing:

```bash
pnpm format
pnpm lint:fix
```

**Naming Conventions:**
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase` (no 'I' prefix)
- Types: `PascalCase`

## 5.3 Commit Convention

```
type(scope): description

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(kernel): add task scheduling API
fix(modules): resolve memory leak in event bus
docs(api): update permission system documentation
```

## 5.4 Pull Request Process

1. Update documentation for any API changes
2. Add tests for new functionality
3. Ensure all tests pass (`pnpm test`)
4. Ensure build passes (`pnpm build`)
5. Request review from core team
6. Squash commits before merge

---

# Part 6: Troubleshooting

## Common Issues and Solutions

### Module fails to load

```bash
# Check module manifest validity
npx sukit module validate ./my-module

# Check kernel compatibility
npx sukit module check-compatibility ./my-module

# View error logs
tail -f logs/sukit.log
```

### Permission denied errors

```typescript
// Request permission explicitly
const granted = await kernel.permissions.request(
  'fs:write',
  'Module needs to save configuration files'
);
```

### Event not triggering

```typescript
// Verify event name spelling
kernel.events.on('page:save', handler);   // Wrong (should be 'page:saved')
kernel.events.on('page:saved', handler);  // Correct

// Check if module is loaded
if (!kernel.modules.isLoaded('@sukit/my-module')) {
  await kernel.modules.load('@sukit/my-module');
}
```

### Block not appearing in builder

```typescript
// Verify block is registered
const block = kernel.blocks.get('my-block');
if (!block) {
  kernel.log.error('Block not registered!');
}

// Check category - blocks only show in their category
// Make sure your block category exists or use 'custom'
category: 'custom'  // Safe fallback
```

---

# Part 7: API Reference Index

| API | Methods |
|-----|---------|
| `sukit.modules` | `list()`, `load()`, `unload()`, `isLoaded()`, `getManifest()` |
| `sukit.events` | `on()`, `once()`, `emit()`, `off()` |
| `sukit.auth` | `login()`, `logout()`, `user()`, `isAuthenticated()`, `hasRole()` |
| `sukit.permissions` | `check()`, `request()` |
| `sukit.fs` | `read()`, `write()`, `exists()`, `list()`, `delete()`, `watch()` |
| `sukit.storage` | `get()`, `set()`, `delete()`, `has()`, `forSite()` |
| `sukit.sites` | `create()`, `get()`, `update()`, `delete()`, `list()`, `current()` |
| `sukit.pages` | `create()`, `get()`, `save()`, `delete()`, `list()` |
| `sukit.blocks` | `register()`, `unregister()`, `get()`, `getAll()`, `getByCategory()`, `validate()` |
| `sukit.media` | `upload()`, `get()`, `list()`, `url()`, `delete()` |
| `sukit.export` | `toStatic()`, `toNextJS()`, `toGitHub()`, `deploy()` |
| `sukit.api` | `get()`, `post()`, `put()`, `delete()` |
| `sukit.ui` | `registerSlot()`, `renderSlot()` |
| `sukit.settings` | `get()`, `set()`, `registerPanel()`, `useSettings()` |
| `sukit.tasks` | `enqueue()`, `schedule()`, `status()` |
| `sukit.cache` | `get()`, `set()`, `delete()`, `clear()` |
| `sukit.log` | `debug()`, `info()`, `warn()`, `error()` |

---

# Quick Start: Your First Module in 5 Minutes

```bash
# 1. Create module directory
mkdir my-first-module
cd my-first-module

# 2. Create manifest.json
cat > manifest.json << 'EOF'
{
  "id": "@sukit/my-first-module",
  "name": "My First Module",
  "version": "1.0.0",
  "sukit": {
    "minKernelVersion": "1.0.0",
    "capabilities": ["ui:sidebar"],
    "permissions": { "required": [] },
    "entrypoints": { "main": "./dist/index.js" }
  }
}
EOF

# 3. Create module code
mkdir src
cat > src/index.ts << 'EOF'
export default {
  async activate(kernel) {
    kernel.log.info('Hello from my first module!');
    kernel.ui.registerSlot('sidebar:right', () =>
      <div className="p-4 bg-blue-100">My Module Active!</div>
    );
  },
  async deactivate(kernel) {
    kernel.log.info('Goodbye from my first module!');
  }
};
EOF

# 4. Install dependencies
npm init -y
npm install -D typescript @sukit/core @sukit/module-sdk

# 5. Build
npx tsc

# 6. Test in SUKIT
cd /path/to/sukit
npx sukit module link ../my-first-module
```

**Congratulations! You've built your first SUKIT module.**

---

For more help, join our [Discord](https://discord.gg/sukit) or open an issue on [GitHub](https://github.com/sukit/sukit).
