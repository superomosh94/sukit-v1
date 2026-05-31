# SUKIT Visual Builder – React Migration Implementation Plan

## Goal Description
Migrate the existing vanilla‑JS visual‑builder prototype to a modern React application using Vite, Tailwind CSS, and Zustand for state management. The final product will include a complete component library, page structure, routing, and retain all existing functionality while enabling future extensibility.

## User Review Required
- **Project structure**: The proposed folder layout follows conventional React conventions. Confirm if any custom directories are required.
- **State management**: We will use Zustand stores as placeholders. Verify if additional stores or specific slice implementations are needed now.
- **Styling**: Tailwind is configured with a dark‑mode palette. Let us know if you have a brand‑color scheme to replace the placeholder HSL values.
- **Routing**: Basic React Router setup will be added. Confirm if you need nested routes or a different router (e.g., Next.js).

## Open Questions
> [!IMPORTANT] 
> * Do you want any additional pages beyond the Dashboard (e.g., Settings, ProjectEditor) now, or should we scaffold them later?
> * Should we include any third‑party UI libraries (e.g., shadcn/ui) besides the custom shared components?
> * Are there any existing vanilla assets (images, fonts) that need to be copied into `public/`?

## Proposed Changes
---
### Project Scaffold
- **package.json** – Add React, React‑DOM, Zustand, Lucide‑React, Vite, Tailwind, React‑Router‑Dom.
- **vite.config.js** – Vite config with React plugin and path alias `@` → `src`.
- **tailwind.config.js** – Tailwind content paths covering `index.html` and `src/**/*.tsx/jsx`.
- **postcss.config.js** – Basic PostCSS setup for Tailwind.
- **index.html** – Updated to include `<div id="root"></div>` for React mount.
- **src/main.jsx** – React entry point rendering `<App />`.
- **src/App.jsx** – Root component wrapping `BrowserRouter` and layout.
- **src/index.css** – Tailwind base imports and custom utilities.
- **src/utils/cn.js** – Simple class‑names helper (wrapper around `clsx`).

---
### Zustand Stores (placeholders)
Create minimal stores in `src/stores/`:
- `editorStore.js`
- `canvasStore.js`
- `historyStore.js`
- `projectStore.js`
- `themeStore.js`
- `formStore.js`
- `popupStore.js`
- `templateStore.js`
- `pluginStore.js`
- `userStore.js`
Each store will export a hook created with `create` from `zustand` and contain stub state/functions.

---
### Component Library
Create directories and skeleton components:
- `src/components/shared/` – Button, Modal, Toast, LoadingSpinner, EmptyState, ConfirmationDialog, Tooltip, Dropdown, Tabs, Pagination.
- `src/components/dashboard/` – StatsCard, RecentProjectsList, QuickActions, ActivityFeed, GettingStarted, AnnouncementBanner.
- `src/components/builder/` – TopToolbar, ComponentLibrary, Canvas, CanvasComponent, PropertyPanel, LayerPanel, PageManager.
- `src/components/library/` – (Component preview cards, etc.)
- `src/components/marketplace/`, `src/components/projects/`, `src/components/account/` – placeholder components for future sections.
All components will be functional, use Tailwind classes, and export default.

---
### Pages
- `src/pages/Dashboard.jsx` – Assembles dashboard components.
- Additional pages (e.g., `Editor.jsx`, `ProjectList.jsx`) can be added later.

---
### Routing
- Configure `react-router-dom` routes in `App.jsx` for `/` → Dashboard and placeholders for future routes.

---
### Assets
- Create `public/` folder for static assets (icons, images) and copy any existing assets from the vanilla version.

---
## Verification Plan
### Automated Tests
- Run `npm install` and `npm run dev` to ensure the dev server starts without errors.
- Verify that `http://localhost:5173` renders the Dashboard with placeholder data.
- Lint with `eslint` (if configured) to catch syntax issues.

### Manual Verification
- Open the browser, check that UI components display correctly with Tailwind styling.
- Ensure Zustand stores are importable and no runtime errors occur.
- Verify navigation between routes works.

---
## Next Steps
1. Create the scaffold files listed above.
2. Populate each store and component with minimal stub implementations.
3. Commit the changes.
4. Run the dev server for manual verification.

---
**Please review the plan, answer the open questions, and approve** so we can start generating the files.
