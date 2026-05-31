# SUKIT Documentation

## What is SUKIT?

SUKIT is an open-source, self-hosted visual website builder. Build beautiful websites visually with a drag-drop interface, export static HTML, and deploy anywhere — all while keeping full control of your data and infrastructure.

Inspired by Webflow, built with modern open-source technology, and designed to be extended through a modular plugin system.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SUKIT ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  apps/                                                              │
│  ├── web/         Next.js 16 (App Router) — Frontend + API          │
│  ├── server/      Express + Socket.io + BullMQ — Backend workers    │
│  └── cli/         CLI tools (Rust target for single-binary)         │
│                                                                     │
│  packages/                                                          │
│  ├── shared/      TypeScript interfaces & utilities                 │
│  ├── ui/          Shared shadcn/ui components                       │
│  ├── blocks/      Core block library (17+ block types)             │
│  └── modules-core/ Module system infrastructure                    │
│                                                                     │
│  prisma/          PostgreSQL schema + migrations                     │
│  docker/          Docker Compose for self-hosting                   │
│  tests/           Unit, integration, and E2E test suites            │
│  docs/            This documentation                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
git clone https://github.com/your-org/sukit.git
cd sukit
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start building.

## Key Concepts

- **Blocks** — The fundamental building unit (text, image, button, video, etc.). Each block has a component, schema, default props, and styles.
- **Sections** — Horizontal containers that group blocks. Sections control layout, background, padding, and responsive behavior.
- **Sites** — Each site is a separate website with its own domain, pages, media, and settings. SUKIT supports unlimited sites.
- **Modules** — Extensions that add functionality (e.g., AI Chat, Payments, SEO). Modules can provide widgets, API routes, and admin settings.

## Developer Guides

| Guide | Description |
|-------|-------------|
| [Getting Started](getting-started.md) | Setup your development environment |
| [Deployment](deployment.md) | Deploy SUKIT to production |
| [API Reference](api-reference.md) | Complete API documentation |
| [Creating Blocks](blocks/creating-blocks.md) | Build custom block types |
| [Block API](blocks/block-api.md) | Block system technical reference |
| [Module Development](module-development.md) | Create installable modules |
| [Multisite](guides/multisite.md) | Manage multiple sites |
| [Static Export](guides/static-export.md) | Export sites to static HTML |
| [Collaboration](guides/collaboration.md) | Real-time team editing |
