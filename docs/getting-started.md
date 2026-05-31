# Getting Started with SUKIT

## Prerequisites

- **Node.js** 20 or later
- **pnpm** 8 or later
- **PostgreSQL** 15 or later
- **Redis** 7 or later (for sessions, queues, caching)

## 1. Clone & Install

```bash
git clone https://github.com/your-org/sukit.git
cd sukit
pnpm install
```

This installs all dependencies across all workspaces (apps/web, apps/server, packages/*).

## 2. Set Up Database

Copy the environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your `DATABASE_URL`:

```env
DATABASE_URL="postgresql://sukite:password@localhost:5432/sukit"
```

Run the database migration:

```bash
pnpm db:migrate
```

## 3. Seed the Database

```bash
pnpm db:seed
```

This creates default block types, section templates, and a demo user.

## 4. Run in Development

```bash
pnpm dev
```

This starts Turborepo in dev mode, which runs:

- Next.js app at `http://localhost:3000`
- WebSocket server at `http://localhost:3001`
- BullMQ worker processes

## 5. Open the Builder

Navigate to [http://localhost:3000](http://localhost:3000), log in with the seeded demo account, and start building.

## Next Steps

- [Architecture Overview](README.md)
- [Creating Custom Blocks](blocks/creating-blocks.md)
- [API Reference](api-reference.md)
- [Deployment Guide](deployment.md)
