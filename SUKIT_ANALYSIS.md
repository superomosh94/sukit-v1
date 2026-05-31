# SUKIT Visual Builder — Complete Analysis Report

Generated from 7 open-source repositories: andami, webframe, palacms, plasmic, excalidraw, open-webui, pocketbase

---

## Section A: Repository Summary Table

| Repository | Language | Version | Key Features | What to Extract |
|---|---|---|---|---|
| **andami** (morphika) | TS/React (Next.js) | 0.9.8 | Visual builder core, CMS, asset mgmt | Block system (registry + types), @dnd-kit drag-drop, Zustand 5 store with history slices, animation system (enter/hover), property panel, responsive controls |
| **webframe** (morphika) | TS/React (Next.js) | 0.1.2 | Core builder engine (simplified) | Canvas rendering, device viewport (desktop/tablet/phone), serializer (JSON↔state), cascade layout, SectionV2 grid system, custom sections, parallax groups |
| **palacms** | Svelte/Go (PocketBase) | 3.1.0 | Multisite CMS + static export | Multisite schema (sites, page_types, symbols, fields, entries), static export ZIP, block library marketplace, field type system (19 types), Docker deployment |
| **plasmic** | TS/React (monorepo) | - | Code integration visual builder | Component registration API (`registerComponent`), two-way sync, codegen output, prop controls mapping, 50+ plasmicpkgs integrations |
| **excalidraw** | TS/React (monorepo) | 0.18+ | Real-time collaboration canvas | Socket.IO collab, LWW reconciliation with version+nonce, fractional indexing for z-order, cursor tracking, Firebase persistence, AES-GCM encryption |
| **open-webui** | Python/Svelte | 0.9.5 | AI chat interface | Chat UI (Svelte), streaming SSE, multi-model dispatch (OpenAI/Ollama), RAG pipeline (document chunking + vector DB), linked-list message history |
| **pocketbase** | Go | latest | Single-file backend | CGO-free Go binary with embedded SQLite (modernc.org/sqlite), embedded admin UI (//go:embed), SSE real-time subscriptions, dual SQLite pools (concurrent+nonconcurrent), S3/local storage |

---

## Section B: Data Models — Prisma Schema

### Core Entities (from andami/webframe/palacms patterns)

```prisma
// ── Auth ──
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  image         String?
  role          Role      @default(USER) // USER, ADMIN, SUPERADMIN
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  apiKeys       ApiKey[]
  sites         Site[]    // sites owned by this user
  siteRoles     SiteRoleAssignment[]
  forms         Form[]
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  expires      DateTime
}

model ApiKey {
  id        String   @id @default(cuid())
  name      String
  key       String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  lastUsed  DateTime?
  expiresAt DateTime?
  createdAt DateTime @default(now())
}

enum Role { USER ADMIN SUPERADMIN }

// ── Site / Multi-tenant (from palacms) ──
model Site {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  domain      String?  // custom domain
  description String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  pages       Page[]
  media       Media[]
  siteSettings SiteSettings?
  forms       Form[]
  menus       Menu[]
}

model SiteSettings {
  id                  String  @id @default(cuid())
  siteId              String  @unique
  site                Site    @relation(fields: [siteId], references: [id])
  globalColors        Json?   // { background, text, primary, secondary, accent }
  globalTypography    Json?   // { headingFont, bodyFont, sizes... }
  gridSettings        Json?   // { width, outerPadding, gutterDesktop, gutterResponsive, gutterPhone }
  customCode          Json?   // { head, body }
  seoSettings         Json?   // { defaultTitle, defaultDescription, ogImage }
  exportSettings      Json?   // { exportPath, deployType }
}

// ── Site Role Assignment (from palacms) ──
model SiteRoleAssignment {
  id     String  @id @default(cuid())
  userId String
  user   User    @relation(fields: [userId], references: [id])
  siteId String
  site   Site    @relation(fields: [siteId], references: [id])
  role   String  // editor, developer, admin
  @@unique([userId, siteId])
}

// ── Pages (from andami/webframe/palacms) ──
model Page {
  id          String   @id @default(cuid())
  title       String
  slug        String
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
  pageType    PageType @default(PAGE) // PAGE, POST, LANDING, PROJECT
  status      PageStatus @default(DRAFT)
  parentId    String?  // for page hierarchy (tree)
  parent      Page?    @relation("PageTree", fields: [parentId], references: [id])
  children    Page[]   @relation("PageTree")
  sortOrder   Int      @default(0)
  isHome      Boolean  @default(false)
  metadata    Json?    // { seoTitle, seoDescription, ogImagePath }
  pageSettings Json?   // { backgroundColor, textColor, navColor, enterAnimation }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?

  sections    Section[]
  forms       Form[]
  popups      Popup[]
}

enum PageType { PAGE POST LANDING PROJECT }
enum PageStatus { DRAFT PUBLISHED ARCHIVED }

// ── Sections / Content rows (from andami/webframe) ──
model Section {
  id          String   @id @default(cuid())
  pageId      String
  page        Page     @relation(fields: [pageId], references: [id])
  sectionType String   @default("empty-v2") // empty-v2, coverSection, customSection, parallaxGroup
  sortOrder   Int      @default(0)
  settings    Json?    // { preset, gridColumns, colGap, rowGap, spacing, bgColor, bgImage, border, animation }
  responsive  Json?    // { tablet: {...}, phone: {...} }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  columns     Column[]
}

// ── Columns (from webframe cascade) ──
model Column {
  id        String   @id @default(cuid())
  sectionId String
  section   Section  @relation(fields: [sectionId], references: [id])
  gridRow   Int      @default(1)
  gridCol   Int      @default(1)
  span      Int      @default(12)
  sortOrder Int      @default(0)
  settings  Json?    // column-level settings + enter animation

  blocks    Block[]
}

// ── Blocks (from andami block-registry pattern) ──
model Block {
  id          String   @id @default(cuid())
  columnId    String
  column      Column   @relation(fields: [columnId], references: [id])
  blockType   String   // textBlock, imageBlock, buttonBlock, videoBlock, spacerBlock, etc.
  sortOrder   Int      @default(0)
  props       Json     // block-specific properties (varies by blockType)
  styles      Json?    // { fontSize, fontWeight, alignment, color, ... }
  responsive  Json?    // { tablet: { props: {...}, styles: {...} }, phone: {...} }
  animation   Json?    // { enter: { preset, duration, delay }, hover: { preset, intensity } }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ── Custom Sections / Reusable Blocks (from palacms symbols) ──
model CustomSection {
  id          String   @id @default(cuid())
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
  name        String
  slug        String
  description String?
  thumbnail   String?
  category    String?  // hero, features, footer, etc.
  sectionData Json     // full section JSON (columns + blocks)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([siteId, slug])
}

// ── Media (from andami/webframe) ──
model Media {
  id          String   @id @default(cuid())
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
  filename    String
  originalName String
  mimeType    String
  size        Int
  width       Int?
  height      Int?
  alt         String?
  url         String
  storageType String   @default("local") // local, s3, r2
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ── Forms (from webframe) ──
model Form {
  id          String   @id @default(cuid())
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
  pageId      String?
  page        Page?    @relation(fields: [pageId], references: [id])
  name        String
  fields      Json     // [{ type, label, placeholder, required, options }]
  settings    Json?    // { submitTarget, successMessage, redirectUrl }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  submissions FormSubmission[]
}

model FormSubmission {
  id        String   @id @default(cuid())
  formId    String
  form      Form     @relation(fields: [formId], references: [id])
  data      Json     // submitted field values
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())
}

// ── Popups (from webframe) ──
model Popup {
  id          String   @id @default(cuid())
  pageId      String
  page        Page     @relation(fields: [pageId], references: [id])
  name        String
  content     Json     // blocks/content inside popup
  trigger     Json     // { type: "time"|"scroll"|"exit"|"click", delay, scrollPercent }
  settings    Json?    // { width, position, overlay, animation, showOnMobile }
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ── Menu / Navigation (from webframe) ──
model Menu {
  id        String   @id @default(cuid())
  siteId    String
  site      Site     @relation(fields: [siteId], references: [id])
  name      String
  slug      String   @default("main")
  items     Json     // [{ label, url, target, children: [...] }]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ── Deployment (from palacms export) ──
model Deployment {
  id        String      @id @default(cuid())
  siteId    String
  site      Site        @relation(fields: [siteId], references: [id])
  status    DeployStatus @default(PENDING)
  type      String      // static, zip, github
  outputUrl String?
  error     String?
  pages     Int         @default(0)
  assets    Int         @default(0)
  size      Int         @default(0)
  createdAt DateTime    @default(now())
  completedAt DateTime?
}

enum DeployStatus { PENDING BUILDING SUCCESS FAILED }

// ── Collaboration (from excalidraw pattern) ──
model CollaborationLock {
  id        String   @id @default(cuid())
  blockId   String   @unique
  block     Block    @relation(fields: [blockId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  acquiredAt DateTime @default(now())
  expiresAt DateTime
}

model Presence {
  id        String   @id @default(cuid())
  siteId    String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  pageId    String?
  cursorPos Json?    // { x, y }
  isEditing Boolean  @default(false)
  updatedAt DateTime @updatedAt
}
```

---

## Section C: TypeScript Interfaces

### Block Interface (from andami/webframe)

```typescript
// ── Block Type Definitions ──

type DeviceViewport = 'desktop' | 'tablet' | 'phone';
type CanvasTool = 'select' | 'hand';
type BlockCategory = 'content' | 'section';

interface BlockTypeInfo {
  type: string;
  label: string;
  description: string;
  icon: string;
  category: BlockCategory;
  group?: string;
}

interface BlockRegistration<T extends Block = Block> {
  type: T['blockType'];
  label: string;
  description: string;
  category: BlockCategory;
  iconGlyph?: string;
  defaultFactory: (key: string) => T;
  renderer: React.ComponentType<{ block: T }>;
  livePreview: React.ComponentType<{ block: T; viewport?: DeviceViewport; editable?: boolean }>;
  editor: React.ComponentType<{ block: T }>;
  cardIcon: React.FC;
  compactIcon: React.FC<{ size?: number }>;
  enterPresets: readonly string[];
  hoverPresets: readonly string[];
}

interface Block {
  id: string;
  blockType: string;
  sortOrder: number;
  props: Record<string, unknown>;
  styles?: BlockStyles;
  responsive?: ResponsiveOverrides;
  animation?: AnimationConfig;
}

interface BlockStyles {
  fontSize?: number;
  fontWeight?: string;
  alignment?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  shadow?: string;
  opacity?: number;
  width?: string;
  height?: string;
}

interface ResponsiveOverrides {
  tablet?: Record<string, unknown>;
  phone?: Record<string, unknown>;
}

interface AnimationConfig {
  enter?: EnterAnimationConfig;
  hover?: HoverEffectConfig;
}

interface EnterAnimationConfig {
  preset: string;
  duration?: number;
  delay?: number;
  easing?: string;
  intensity?: number;
}

interface HoverEffectConfig {
  preset: string;
  intensity?: number;
}

// ── Page Interface ──

interface Page {
  id: string;
  title: string;
  slug: string;
  siteId: string;
  pageType: 'page' | 'post' | 'landing' | 'project';
  status: 'draft' | 'published' | 'archived';
  parentId?: string;
  isHome: boolean;
  sortOrder: number;
  metadata: PageMetadata;
  pageSettings: PageSettings;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface PageMetadata {
  seoTitle?: string;
  seoDescription?: string;
  ogImagePath?: string;
}

interface PageSettings {
  backgroundColor: string;
  textColor: string;
  navColor: string;
  enterAnimation?: EnterAnimationConfig;
}

// ── Section Interface ──

interface Section {
  id: string;
  pageId: string;
  sectionType: string;
  sortOrder: number;
  settings: SectionSettings;
  responsive?: Record<string, Partial<SectionSettings>>;
  columns: Column[];
}

interface SectionSettings {
  preset: string;
  gridColumns: number;
  colGap: number;
  rowGap: number;
  spacingTop?: string;
  spacingRight?: string;
  spacingBottom?: string;
  spacingLeft?: string;
  offsetTop?: string;
  offsetRight?: string;
  offsetBottom?: string;
  offsetLeft?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderSides?: string;
  borderRadius?: number;
  enterAnimation?: EnterAnimationConfig;
  stagger?: number;
}

interface Column {
  id: string;
  sectionId: string;
  gridRow: number;
  gridCol: number;
  span: number;
  sortOrder: number;
  enterAnimation?: EnterAnimationConfig;
  blocks: Block[];
}

// ── Site Interface (from palacms) ──

interface Site {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  userId: string;
  settings: SiteSettings;
  pages: Page[];
  media: Media[];
  createdAt: string;
  updatedAt: string;
}

interface SiteSettings {
  globalColors?: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
  };
  globalTypography?: {
    headingFont: string;
    bodyFont: string;
    sizes: Record<string, string>;
  };
  gridSettings?: {
    width: string;
    outerPadding: string;
    gutterDesktop: string;
    gutterResponsive: string;
    gutterPhone: string;
  };
  customCode?: {
    head: string;
    body: string;
  };
  seoSettings?: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage?: string;
  };
}

// ── Builder State (from andami Zustand store — slice pattern) ──

interface BuilderState {
  // Meta
  pageId: string | null;
  pageTitle: string;
  pageSlug: string;
  pageType: string;
  metadata: PageMetadata;
  publishedAt: string | null;
  draftMode: boolean;

  // Content
  sections: Section[];

  // Selection
  selectedSectionId: string | null;
  selectedColumnId: string | null;
  selectedBlockId: string | null;

  // UI state
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null;
  previewMode: boolean;

  // Page-level settings
  pageSettings: PageSettings;

  // Grid settings
  gridSettings: GridSettings;

  // Canvas
  canvasZoom: number;
  canvasPanX: number;
  canvasPanY: number;
  canvasTool: CanvasTool;
  activeViewport: DeviceViewport;

  // History
  history: HistorySnapshot[];
  future: HistorySnapshot[];
  isTimeTraveling: boolean;
}

interface GridSettings {
  width: string;
  outerPadding: string;
  gutterDesktop: string;
  gutterResponsive: string;
  gutterPhone: string;
}

interface HistorySnapshot {
  sections: Section[];
  pageSettings: PageSettings;
}

interface BuilderActions {
  // Page metadata
  setPageTitle: (title: string) => void;
  setPageSlug: (slug: string) => void;
  setMetadata: (metadata: Partial<PageMetadata>) => void;

  // Section operations
  addSection: (sectionType: string, afterSectionId?: string) => void;
  updateSectionSettings: (sectionId: string, settings: Partial<SectionSettings>) => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  // Column operations
  addColumn: (sectionId: string, gridRow: number, gridCol: number, span: number) => void;
  deleteColumn: (sectionId: string, columnId: string) => void;
  resizeColumn: (sectionId: string, columnId: string, newSpan: number) => void;
  moveColumn: (sectionId: string, columnId: string, targetRow: number, targetCol: number) => void;

  // Block operations
  addBlock: (columnId: string, blockType: string, insertIndex?: number) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  updateBlockDebounced: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  moveBlock: (blockId: string, targetSectionId: string, targetColumnId: string, toIndex: number) => void;
  reorderBlocks: (sectionId: string, columnId: string, fromIndex: number, toIndex: number) => void;

  // Selection
  selectSection: (id: string | null) => void;
  selectColumn: (sectionId: string | null, columnId: string | null) => void;
  selectBlock: (id: string | null) => void;
  clearSelection: () => void;

  // Persistence
  loadPage: (page: Page) => void;
  save: () => Promise<void>;
  reset: () => void;

  // Canvas
  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (x: number, y: number) => void;
  setCanvasTool: (tool: CanvasTool) => void;
  setActiveViewport: (viewport: DeviceViewport) => void;
  togglePreviewMode: () => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Page settings
  updatePageSettings: (settings: Partial<PageSettings>) => void;
}

// ── Collaboration (from excalidraw) ──

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  socketId: string;
}

interface CursorPosition {
  x: number;
  y: number;
  button?: 'up' | 'down';
  tool?: string;
  selectedElementIds?: string[];
  username?: string;
}

// ── Chat / AI (from open-webui — future) ──

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parentId: string | null;
  childrenIds: string[];
  model?: string;
  timestamp: number;
  files?: FileAttachment[];
  sources?: Source[];
  done?: boolean;
  usage?: TokenUsage;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Record<string, ChatMessage>;
  currentId: string | null;
  createdAt: number;
  updatedAt: number;
}
```

---

## Section D: API Routes to Build

### Authentication (from pocketbase)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/password-reset` | Request password reset |
| POST | `/api/auth/oauth2` | OAuth2 login |

### Sites / Projects (from palacms)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/sites` | List user's sites |
| POST | `/api/sites` | Create new site |
| GET | `/api/sites/:id` | Get site details |
| PUT | `/api/sites/:id` | Update site |
| DELETE | `/api/sites/:id` | Delete site |
| GET | `/api/sites/:id/settings` | Get site settings |
| PUT | `/api/sites/:id/settings` | Update site settings |

### Pages (from andami/webframe)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/sites/:siteId/pages` | List pages for site |
| POST | `/api/sites/:siteId/pages` | Create new page |
| GET | `/api/pages/:id` | Get page with sections |
| PUT | `/api/pages/:id` | Update page metadata |
| DELETE | `/api/pages/:id` | Delete page |
| POST | `/api/pages/:id/duplicate` | Duplicate page |
| PUT | `/api/pages/:id/set-home` | Set as homepage |

### Blocks / Sections (from andami/webframe)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/pages/:id/sections` | Add section to page |
| PUT | `/api/sections/:id` | Update section settings |
| DELETE | `/api/sections/:id` | Delete section |
| POST | `/api/sections/:id/columns` | Add column to section |
| PUT | `/api/columns/:id` | Update column |
| DELETE | `/api/columns/:id` | Delete column |
| POST | `/api/columns/:columnId/blocks` | Add block to column |
| PUT | `/api/blocks/:id` | Update block props |
| DELETE | `/api/blocks/:id` | Delete block |
| PATCH | `/api/pages/:id/sections/reorder` | Reorder sections |
| PATCH | `/api/sections/:id/columns/reorder` | Reorder columns |
| PATCH | `/api/columns/:id/blocks/reorder` | Reorder blocks |

### Custom Sections / Reusable Blocks (from palacms)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/sites/:siteId/custom-sections` | List custom sections |
| POST | `/api/sites/:siteId/custom-sections` | Create custom section |
| GET | `/api/custom-sections/:id` | Get custom section data |
| PUT | `/api/custom-sections/:id` | Update custom section |
| DELETE | `/api/custom-sections/:id` | Delete custom section |

### Media (from andami/webframe)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/sites/:siteId/media` | List media files |
| POST | `/api/sites/:siteId/media` | Upload file |
| GET | `/api/media/:id` | Get file metadata |
| DELETE | `/api/media/:id` | Delete file |
| POST | `/api/media/upload-url` | Get presigned upload URL (S3/R2) |

### Forms (from webframe)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/sites/:siteId/forms` | List forms |
| POST | `/api/sites/:siteId/forms` | Create form |
| GET | `/api/forms/:id` | Get form with submissions |
| PUT | `/api/forms/:id` | Update form |
| DELETE | `/api/forms/:id` | Delete form |
| GET | `/api/forms/:id/submissions` | List form submissions |
| POST | `/api/forms/:id/submit` | Public form submission endpoint |

### Deployment (from palacms)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/sites/:siteId/export` | Trigger static export |
| GET | `/api/sites/:siteId/exports` | List exports |
| GET | `/api/exports/:id/download` | Download export ZIP |
| POST | `/api/sites/:siteId/deploy` | Deploy to GitHub Pages/Vercel |

### WebSocket / Real-time (from excalidraw/pocketbase)

| Method | Path | Purpose |
|--------|------|---------|
| WS | `/api/realtime` | SSE connection for real-time updates |
| POST | `/api/realtime` | Subscribe to topics |

### Chat (from open-webui — future)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/chat/sessions` | List chat sessions |
| POST | `/api/chat/sessions` | Create chat session |
| GET | `/api/chat/sessions/:id` | Get chat messages |
| POST | `/api/chat/completions` | Streaming chat completion |

---

## Section E: React Components to Build

### BuilderCanvas
- **Source**: andami/webframe
- **Props**: `{ viewport: DeviceViewport }`
- **Description**: Main canvas area that renders all sections. Uses @dnd-kit DndContext. Supports zoom/pan with canvas transformation. Renders device frame (desktop/tablet/phone). Handles selection via click and drag-drop via @dnd-kit SortableContext.

### BlockPalette
- **Source**: andami/webframe
- **Props**: `{ onAddBlock: (type: string, columnId: string) => void, availableBlocks: BlockTypeInfo[] }`
- **Description**: Sidebar panel listing all available blocks. Groups by category (content/section). Shows icon + label + description. Draggable items that create new blocks when dropped on canvas. Search/filter functionality.

### PropertyPanel
- **Source**: andami/webframe
- **Props**: `{ selectedBlock: Block, onUpdate: (updates: Partial<Block>) => void }`
- **Description**: Dynamic property editor that generates form controls from block type schema. Tabs: Content, Style, Animation, Advanced. Responsive tabs (Desktop/Tablet/Phone) with override indicators. Controls: TextInput, ColorPicker, ImageUpload, Select, Slider, Spacing (margin/padding), Typography, Border, Shadow.

### LayerPanel
- **Source**: webframe
- **Props**: `{ sections: Section[], selection: SelectionState, onSelect: (type: string, id: string) => void }`
- **Description**: Tree view of page structure (sections > columns > blocks). Shows block type icons and labels. Click to select in canvas. Drag to reorder within/across sections.

### SettingsPanel (Section-level)
- **Source**: webframe
- **Props**: `{ section: Section, onUpdate: (settings: Partial<SectionSettings>) => void }`
- **Description**: Section background/image/video settings. Spacing controls (padding/margin). Column layout presets (1-col, 2-col, 3-col, 4-col, 12-col grid). Animation and parallax options.

### MediaLibrary
- **Source**: webframe
- **Props**: `{ siteId: string, onSelect: (media: Media) => void }`
- **Description**: Grid view of all uploaded media. Upload button with drag-drop. Search/filter by type. Image editor overlay (crop, resize). File details panel (dimensions, size, alt text).

### BlockRenderer / LivePreview
- **Source**: andami/webframe
- **Props**: `{ block: Block, viewport?: DeviceViewport, editable?: boolean }`
- **Description**: Recursive JSON-to-React renderer. Resolves responsive overrides per viewport. Applies inline styles from block styles. Wraps block in selection/drag handles when in builder mode.

### CanvasHeader/Toolbar
- **Source**: andami
- **Props**: `{ viewport: DeviceViewport, zoom: number, onViewportChange, onZoomChange, previewMode }`
- **Description**: Top toolbar with device switcher (Desktop/Tablet/Phone), zoom controls (zoom in/out/fit), undo/redo buttons, preview toggle, save button.

### SectionTypePicker
- **Source**: andami/webframe
- **Props**: `{ onSelect: (type: string) => void }`
- **Description**: Modal grid showing available section types with preview cards. Categories: Empty Section, Cover Section, Project Grid, Custom Section instances.

### CodeEditor
- **Source**: palacms (CodeMirror)
- **Props**: `{ value: string, onChange: (value: string) => void, language: string }`
- **Description**: Code editor using CodeMirror/Monaco. Syntax highlighting for HTML, CSS, JS. Used for custom code injection.

### FormBuilder
- **Source**: webframe
- **Props**: `{ form: Form, onChange: (form: Form) => void }`
- **Description**: Visual form builder. Drag-drop field types (text, email, textarea, select, checkbox, radio, file). Field settings panel (label, placeholder, required, validation). Preview mode.

### PopupBuilder
- **Source**: webframe
- **Props**: `{ popup: Popup, onChange: (popup: Popup) => void }`
- **Description**: Popup editor with trigger configuration (time, scroll, exit, click). Content editor using visual builder. Display settings (position, animation, overlay).

### ChatWidget (Future)
- **Source**: open-webui
- **Props**: `{ siteId: string }`
- **Description**: Embedded AI chat widget. Streaming message display. Model selector. File upload for RAG. Conversation history panel.

---

## Section F: Phased Implementation Plan (12-16 weeks)

### Phase 1 (Week 1-2): Foundation
- Initialize Next.js 16 with TypeScript + Tailwind CSS 4
- Configure PostgreSQL with Prisma ORM
- Run initial migrations (users, sites, pages, blocks)
- Implement NextAuth.js with email/password authentication
- Create Site model CRUD API
- Build site dashboard page (list sites, create site)
- **Goal**: User can register, create a site, and see it listed

### Phase 2 (Week 3-4): Block System
- Create BlockRegistry class (singleton pattern from andami)
- Define Block interface and BlockRegistration types
- Build 5 core block components:
  - TextBlock (rich text via TipTap)
  - ImageBlock (with upload, alt text, sizing)
  - ButtonBlock (text, URL, style, size)
  - ContainerBlock (section wrapper with layout)
  - GridBlock (nested column layout)
- Build BlockRenderer (recursive JSON → React)
- Create block default factories
- **Goal**: Can programmatically render blocks from JSON data

### Phase 3 (Week 5-6): Drag-Drop Canvas
- Install @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- Create DraggableBlock component (from andami pattern)
- Create DropZone component (column drop targets)
- Build Canvas layout with DndContext
- Implement block selection (click to select, visual highlight)
- Implement block deletion (keyboard Delete key)
- Implement block duplication (keyboard Cmd+D)
- Implement undo/redo (Zustand history slice — 50 snapshots)
- **Goal**: Full drag-drop experience with selection + undo

### Phase 4 (Week 7-8): Property Panel Complete
- Create PropertyPanel with dynamic form generation
- Build control components:
  - TextInput, TextArea, NumberInput
  - ColorPicker (from webframe pattern)
  - ImageSelector (opens MediaLibrary)
  - Select dropdown, Switch toggle, Slider
  - SpacingControl (margin/padding 4-direction)
  - TypographyControl (font size, weight, alignment, line height)
- Add responsive tabs (Desktop/Tablet/Phone) — from webframe responsive.ts
- Show "inherited" vs "overridden" state per viewport
- **Goal**: All block properties editable with responsive overrides

### Phase 5 (Week 9-10): Persistence & API
- Wire Zustand store to REST API
- Implement savePage action (serialize → PUT)
- Implement loadPage action (GET → deserialize)
- Build Pages list dashboard (create, list, delete pages)
- Implement auto-save with debounce (5s after last change)
- Build MediaLibrary with file upload
- Integrate Cloudflare R2 or S3 for file storage (from andami pattern)
- **Goal**: Full CRUD round-trip: create → edit → save → reload

### Phase 6 (Week 11-12): Publishing
- Implement static export function (from palacms export.go pattern)
  - Extract page data, inline styles, generate HTML
  - Copy media assets to export folder
  - Generate sitemap.xml
- Create ZIP download of exported site
- Implement GitHub integration (OAuth + push)
- Build custom domain settings page
- Document deployment options (Vercel, Netlify, self-hosted)
- **Goal**: Export editable page to deployable static site

### Phase 7 (Week 13-14): Polish & More Blocks
- Add 10+ additional block types:
  - VideoBlock (YouTube, Vimeo, MP4)
  - IconBlock
  - DividerBlock
  - SpacerBlock
  - MapBlock
  - FormBlock (embed forms)
  - ListBlock, TableBlock
  - TestimonialBlock, PricingBlock
  - FAQBlock, AccordionBlock
- Implement enter animations (from andami animation system)
  - Fade, Slide-up, Scale, Blur-in, Typewriter
  - Cascade: page → section → column → block
- Build FormBuilder component
- Build PopupBuilder component
- Performance optimization (React.memo, virtualization for large pages)
- **Goal**: Feature-complete beta

### Phase 8 (Future): Advanced Features
- Real-time collaboration (from excalidraw pattern)
  - WebSocket server with Socket.IO
  - LWW conflict resolution
  - Cursor tracking
  - Presence indicators
- AI chat module (from open-webui pattern)
  - Chat UI widget
  - OpenAI/Ollama integration
  - RAG with document upload
- Code integration (from plasmic pattern)
  - Export blocks to React components
  - Two-way sync with code
- Rust single-file binary (from pocketbase pattern)
  - Embed Next.js build output
  - Embedded SQLite (rusqlite)
  - Self-contained deployment

---

## Section G: Implementation Priorities

### HIGH PRIORITY — Must have for v1

| Feature | Source Inspiration | Est. Effort |
|---------|-------------------|-------------|
| Block registry + 5 core blocks | andami | 1 week |
| Drag-drop canvas (with @dnd-kit) | andami | 1 week |
| Property panel for styles | andami/webframe | 1 week |
| PostgreSQL persistence | palacms schema | 1 week |
| Static export | palacms | 1 week |
| User auth + site CRUD | pocketbase | 1 week |

### MEDIUM PRIORITY — v2

| Feature | Source Inspiration | Est. Effort |
|---------|-------------------|-------------|
| Custom sections (reusable blocks) | palacms | 3 days |
| Media library with S3/R2 | andami | 3 days |
| Animations (enter + hover) | andami | 3 days |
| 10+ additional blocks | andami | 4 days |
| Form builder | webframe | 3 days |
| Popup builder | webframe | 3 days |

### LOW PRIORITY — v3+

| Feature | Source Inspiration | Est. Effort |
|---------|-------------------|-------------|
| Real-time collaboration | excalidraw | 2 weeks |
| AI chat module | open-webui | 2 weeks |
| Code integration (code <-> visual) | plasmic | 2 weeks |
| Single-file Rust binary | pocketbase | 2 weeks |

---

## Key Architecture Decisions

1. **Block System** — Registration pattern from andami: one file declares schema, renderer, editor, preview, factories, animation presets. Blocks are the atomic unit.

2. **State Management** — Zustand 5 with slice pattern from andami. Slices: Meta, Section, Column, Block, Canvas, Selection, History. Each slice owns specific state + actions.

3. **Responsive Model** — Desktop-first with override maps (from webframe responsive.ts). Blocks store base values; `responsive.tablet`/`responsive.phone` store only overrides. `resolveBlock(block, viewport)` merges at render time.

4. **Drag-Drop** — @dnd-kit with SortableContext per column, DndContext at canvas root. Blocks are sortable items, columns are sortable containers, sections are sortable at page level.

5. **Canvas** — Device frames (desktop: 1920, tablet: 810, phone: 390) with CSS transform zoom/pan. Each frame renders an iframe or scaled preview of the page.

6. **Serialization** — Bidirectional JSON converter (from webframe serializer.ts). `stateToDocument()` and `documentToState()` handle keys, defaults, migrations, and clean undefined values.

7. **Export** — Static site generator from palacms: extracts page data → renders to HTML → copies assets → generates sitemap → ZIP. Output is a complete static site.

8. **Database Isolation** — From palacms: every entity scoped to a `siteId`. Multi-tenant by default. Site-specific tables: pages, media, forms, custom sections, menus.
