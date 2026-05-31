# Changelog

## [1.0.0] — 2025-01-15

### Added

- **Visual Page Builder** — Drag-drop canvas with 17+ block types, section system, and property panel
- **Block System** — Text, Image, Button, Container, Grid, Video, Spacer, Divider, Icon, Map, Form, Accordion, Tabs, Carousel, Testimonial, Pricing, FAQ blocks
- **Block Registry** — Register, discover, and manage block types with Zod schema validation
- **Undo/Redo** — History-limited (50 snapshots) undo/redo with time-travel debugging
- **Responsive Design** — Per-viewport overrides for desktop (1920px), tablet (810px), mobile (390px)
- **Animations** — 7 enter animations, hover effects (CSS + WebGL), cascade system
- **Rich Text Editor** — TipTap 2 editor with inline formatting and embedded content
- **Multisite Management** — Unlimited sites, custom domains, site isolation
- **Static HTML Export** — Full export pipeline with ZIP download, deploy to Netlify/Vercel/GitHub Pages
- **Authentication** — Email/password registration and login via NextAuth.js
- **API Layer** — RESTful API for pages, sites, media, export, modules
- **Module System** — Plugin infrastructure with widget, API route, and settings support
- **AI Chat Module** — Installable chat widget with OpenAI/Ollama support and RAG pipeline
- **Docker Deployment** — Docker Compose with PostgreSQL and Redis
- **Real-time Collaboration** — WebSocket-based multi-editor support with CRDT conflict resolution
- **Media Library** — Upload, manage, and embed images and files (local/S3/R2 storage)
- **Form Builder** — Drag-drop form designer with 19 field types (future)

### Technical

- Next.js 16 with App Router
- TypeScript 5.x strict mode
- Tailwind CSS 4.x with shadcn/ui
- Zustand 5 for builder state management
- Prisma 6 with PostgreSQL
- Turborepo 2 monorepo
- Playwright E2E tests
- Vitest unit and integration tests
