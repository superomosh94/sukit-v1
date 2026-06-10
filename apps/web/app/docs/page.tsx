"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const sun = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const moon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
const check = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const searchIcon = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;

const navSections = [
  { id: "getting-started", title: "Getting Started", items: [
    { label: "Quick Start", href: "#quick-start" }, { label: "Prerequisites", href: "#prerequisites" },
    { label: "Configuration", href: "#configuration" }, { label: "Project Structure", href: "#project-structure" },
    { label: "Available Scripts", href: "#scripts" },
  ]},
  { id: "architecture", title: "Architecture", items: [
    { label: "8-Layer Overview", href: "#layers" }, { label: "Core Kernel", href: "#kernel" },
    { label: "Module SDK", href: "#module-sdk" }, { label: "Kernel API Surface", href: "#api-surface" },
  ]},
  { id: "cli", title: "CLI Reference", items: [
    { label: "All Commands", href: "#cli-commands" }, { label: "Project Commands", href: "#cli-project" },
    { label: "Module Commands", href: "#cli-modules" }, { label: "Deploy & CI", href: "#cli-deploy" },
  ]},
  { id: "database", title: "Database", items: [
    { label: "Schema Overview", href: "#db-overview" }, { label: "Core Models", href: "#db-core" },
    { label: "Page System", href: "#db-pages" }, { label: "Commerce", href: "#db-commerce" },
  ]},
  { id: "api", title: "API Routes", items: [
    { label: "Auth", href: "#api-auth" }, { label: "Sites & Pages", href: "#api-sites" },
    { label: "Media & Forms", href: "#api-media" }, { label: "Marketplace", href: "#api-marketplace" },
    { label: "System", href: "#api-system" },
  ]},
  { id: "env", title: "Environment", items: [
    { label: "Reference", href: "#env-all" },
  ]},
  { id: "modules", title: "Module System", items: [
    { label: "Module Lifecycle", href: "#module-lifecycle" }, { label: "30 Modules", href: "#module-list" },
    { label: "Modules Core", href: "#modules-core" },
  ]},
  { id: "auth", title: "Authentication", items: [
    { label: "NextAuth Config", href: "#auth-config" }, { label: "Middleware", href: "#auth-middleware" },
  ]},
  { id: "testing", title: "Testing", items: [
    { label: "Test Structure", href: "#test-structure" }, { label: "Running Tests", href: "#test-running" },
  ]},
];

const CODE = {
  kernel: [
    "interface SukitKernel {",
    "  modules:     ModulesAPI       // load, unload, reload, list, scan, healthCheck, rollback, detectConflicts",
    "  events:      EventsAPI        // on, once, emit, off, namespace, middleware, replay, snapshot, tracing",
    "  auth:        AuthAPI          // login, logout, register, user, isAuthenticated, hasRole",
    "  permissions: PermissionsAPI   // check, request, batchCheck, checkRole, defineRole",
    "  fs:          FSAPI            // read, write, exists, list, delete",
    "  storage:     StorageAPI       // get, set, delete, clear, encrypt (AES-256-GCM)",
    "  sites:       SitesAPI         // create, get, update, delete, list",
    "  pages:       PagesAPI         // create, get, save, delete, list",
    "  blocks:      BlocksAPI        // register, unregister, render, validate, search, compose",
    "  media:       MediaAPI         // upload, get, list, url, delete",
    "  export:      ExportAPI        // toStatic, toNextJS, toGitHub, deploy",
    "  api:         APIRoutesAPI     // get, post, put, delete, middleware, rateLimit, webhooks",
    "  ui:          UIAPI            // registerSlot, renderSlot",
    "  settings:    SettingsAPI      // get, set, registerPanel, search, reset, versionHistory",
    "  tasks:       TasksAPI         // enqueue, schedule, status, cancel",
    "  cache:       CacheAPI         // get, set, delete, invalidateTag, namespace",
    "  log:         LogAPI           // debug, info, warn, error, forModule, addTransport",
    "",
    "  forModule(moduleId): SukitKernel",
    "}",
  ].join("\n"),
  moduleInterface: ["interface Module {", "  manifest: ModuleManifest;", "  activate(kernel: KernelForModule): Promise<void>;", "  deactivate(kernel: KernelForModule): Promise<void>;", "}"].join("\n"),
  mpesaActivate: [
    "async activate(kernel: KernelForModule) {",
    "  kernel.api.post('/api/mpesa/stkpush', handler);",
    "  kernel.api.post('/api/mpesa/callback', callbackHandler);",
    "  kernel.api.post('/api/mpesa/query', queryHandler);",
    "  kernel.api.get('/api/mpesa/transactions', listHandler);",
    "  kernel.api.post('/api/mpesa/test', testHandler);",
    "  kernel.blocks.register({ type: 'mpesaButton', ... });",
    "  kernel.settings.registerPanel({ id: 'mpesa', ... });",
    "  kernel.events.on('page:beforeSave', callback);",
    "}",
  ].join("\n"),
  nextAuth: [
    "NextAuth({",
    "  providers: [",
    "    Credentials({ async authorize(credentials) { ... } }),",
    "    GitHub({ clientId, clientSecret }),",
    "    Google({ clientId, clientSecret }),",
    "  ],",
    "  session: { strategy: 'jwt' },",
    "  pages: { signIn: '/login', error: '/login' },",
    "  callbacks: {",
    "    jwt({ token, user }) { token.id = user.id; token.role = user.role; },",
    "    session({ session, token }) { session.user.id = token.id; session.user.role = token.role; },",
    "  },",
    "})",
  ].join("\n"),
};

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border bg-muted/40">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground/60">terminal</span>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground/80"><code>{code}</code></pre>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModelGrid({ groups }: { groups: { group: string; models: string[] }[] }) {
  return (
    <div className="my-4 grid gap-4 sm:grid-cols-2">
      {groups.map((g) => (
        <div key={g.group} className="rounded-xl border border-border bg-card p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</h4>
          <div className="flex flex-wrap gap-2">
            {g.models.map((m) => (
              <span key={m} className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/10">
                {check}
                {m}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ModuleGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="my-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([name, desc]) => (
        <div key={name} className="rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/20 hover:shadow-sm">
          <div className="text-sm font-medium text-foreground">{name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
        </div>
      ))}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/sukit-logo.svg" alt="SUKIT" className="h-9 w-auto" />
            <span className="text-sm font-medium text-muted-foreground">/ Documentation</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Back to Home</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 px-6 py-10">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-5 overflow-y-auto pr-4">
            {navSections.map((s) => (
              <div key={s.id}>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">{s.title}</h3>
                <ul className="space-y-0.5">
                  {s.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-0 lg:px-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-8">
              <Badge>Reference</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Documentation</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Developer-first visual website builder with 30 modules, M-Pesa payments, and one-click export to standalone React + Express applications.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>202,580 lines of TypeScript</Badge>
                <Badge>4 apps</Badge>
                <Badge>10 packages</Badge>
                <Badge>30 modules</Badge>
                <Badge>75 database models</Badge>
                <Badge>150+ API routes</Badge>
              </div>
            </div>

            <hr className="mb-10 border-border" />

            <h2 id="quick-start" className="mb-4 text-2xl font-bold tracking-tight">Quick Start</h2>
            <CodeBlock code={[
              "# 1. Prerequisites",
              "Node.js 20+, pnpm 8.15+, PostgreSQL 14+",
              "",
              "# 2. Install dependencies",
              "pnpm install",
              "",
              "# 3. Configure environment",
              "cp .env.example .env",
              "# Edit DATABASE_URL in .env for your PostgreSQL instance",
              "",
              "# 4. Push schema and seed data",
              "pnpm db:push",
              "pnpm db:seed",
              "# Demo user: demo@sukit.dev / demo1234",
              "",
              "# 5. Start development",
              "pnpm dev:watch",
              "# Web:  http://localhost:3000",
              "# API:  http://localhost:3001/health",
              "",
              "# 6. (Optional) Start Redis for queues and collaboration",
              "redis-server --daemonize yes",
            ].join("\n")} />

            <h2 id="prerequisites" className="mb-4 mt-10 text-2xl font-bold tracking-tight">Prerequisites</h2>
            <Table headers={["Dependency", "Required", "Notes"]} rows={[
              ["Node.js", "20+", "Runtime"],
              ["pnpm", "8.15+", "Package manager"],
              ["PostgreSQL", "14+", "Primary database (local or Supabase)"],
              ["Redis", "Optional", "Caching, queues, Socket.IO scaling"],
              ["Docker", "Optional", "Production deployment only"],
            ]} />

            <h2 id="configuration" className="mb-4 mt-10 text-2xl font-bold tracking-tight">Configuration</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">All environment variables go in <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">.env</code> at the project root. Key settings:</p>
            <CodeBlock code={[
              "DATABASE_URL=\"postgresql://user:pass@localhost:5432/sukit\"",
              "NEXTAUTH_SECRET=\"your-secret\"",
              "NEXTAUTH_URL=\"http://localhost:3000\"",
              "REDIS_URL=\"redis://localhost:6379\"        # optional",
              "STORAGE_TYPE=\"local\"                      # local, s3, r2",
              "EMAIL_PROVIDER=\"resend\"                   # resend, smtp",
            ].join("\n")} />

            <h2 id="project-structure" className="mb-4 mt-10 text-2xl font-bold tracking-tight">Project Structure</h2>
            <CodeBlock code={[
              "sukit/",
              "  apps/",
              "    web/              # Next.js 16 (UI, API routes, auth)",
              "    server/           # Express + Socket.IO + BullMQ workers",
              "    cli/              # 25 CLI commands via Commander",
              "    visual-builder/   # Standalone visual builder app",
              "  packages/",
              "    core/             # SukitKernel (DI, events, 16 APIs)",
              "    modules-core/     # Module loader, installer, uninstaller",
              "    module-sdk/       # React hooks for module devs",
              "    blocks/           # Block registry",
              "    shared/           # Shared types",
              "    ui/               # UI components",
              "    shell-ui/         # Shell desktop environment",
              "    marketplace/      # Marketplace integration",
              "  modules/            # 30 pre-built modules",
              "    visual-builder/   # 18,353 lines",
              "    media-library/    # 10,889 lines",
              "    export-engine/    # 7,069 lines",
              "    site-manager/     # 5,851 lines",
              "    mpesa/            # 1,309 lines",
              "    commerce/         # 1,175 lines",
              "    ... (25 more)",
              "  tools/              # 12 standalone tool services",
              "  prisma/             # 75 models, 2,127 lines",
              "  tests/              # 30+ test files",
              "  enterprise-os/      # SSO, compliance, billing",
            ].join("\n")} />

            <h2 id="scripts" className="mb-4 mt-10 text-2xl font-bold tracking-tight">Available Scripts</h2>
            <Table headers={["Script", "Description"]} rows={[
              ["pnpm dev:watch", "Start web + server concurrently"],
              ["pnpm dev:web", "Start Next.js dev server only"],
              ["pnpm dev:server", "Start Express server only"],
              ["pnpm build", "Build all packages via Turborepo"],
              ["pnpm test", "Run all tests"],
              ["pnpm lint", "Lint all packages"],
              ["pnpm typecheck", "TypeScript type checking"],
              ["pnpm db:push", "Push Prisma schema to database"],
              ["pnpm db:migrate", "Run database migrations"],
              ["pnpm db:seed", "Seed demo data"],
              ["pnpm db:studio", "Open Prisma Studio"],
              ["pnpm db:generate", "Generate Prisma client"],
              ["pnpm modules:build", "Build all modules"],
              ["pnpm modules:install", "Install modules from script"],
              ["pnpm clean", "Clean all build artifacts"],
              ["pnpm docker:up", "Start Docker services"],
              ["pnpm docker:down", "Stop Docker services"],
              ["pnpm export", "Export all sites"],
            ]} />

            <hr className="my-10 border-border" />

            <h2 id="layers" className="mb-4 text-2xl font-bold tracking-tight">8-Layer Architecture</h2>
            <Table headers={["Layer", "Description"]} rows={[
              ["L8: Enterprise OS", "SSO/SAML, org management, billing, compliance (SOC2/GDPR/HIPAA), API gateway, white-label resale"],
              ["L7: Production Infra", "Security, performance optimization, testing suite, CI/CD pipelines, Docker/K8s, Prometheus/Grafana"],
              ["L6: Tools Layer", "CLI (build/dev/export), GitHub integration, Docker orchestration, backup/restore, webhooks, API server, WebSocket, search engine"],
              ["L5: Marketplace", "Module registry, installer, dependency resolver, developer portal, payments (Stripe + M-Pesa), reviews, 150+ API endpoints"],
              ["L4: 30 Modules", "M-Pesa, Media Library, Visual Builder, Form Builder, Analytics, SEO, Code Editor, AI Chat, Commerce, Blog, Membership, Booking, Events, Newsletter, Reviews, Translation, Cookie Consent, Webhooks, Pricing Table, Testimonials, Countdown, Redirect Manager, Custom Code, Social Feed, FAQ, Auth Module"],
              ["L3: 36+ Block Types", "Container, Section, Row, Column, Grid, Stack, Heading, Paragraph, Image, Button, Link, List, Divider, Accordion, Carousel, Gallery, Map, Video, Code, Product Card, Cart, M-Pesa Button, Pricing Table, Form, Input, Textarea, Select, Checkbox, Radio"],
              ["L2: UI Layer", "Shell desktop environment (sidebar, toolbar, canvas, slots), 48+ page routes, 103+ UI components, dark/light mode, responsive design, WCAG accessibility"],
              ["L1: Core Kernel", "SukitKernel (dependency injection, event bus, permissions), module loader, registry, state management, 16 API domains"],
            ]} />

            <h2 id="kernel" className="mb-4 mt-10 text-2xl font-bold tracking-tight">Core Kernel</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">The kernel is created via <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">createKernel()</code> from <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">@sukit/core</code> and provides all API surfaces:</p>
            <CodeBlock code={CODE.kernel} />

            <h2 id="module-sdk" className="mb-4 mt-10 text-2xl font-bold tracking-tight">Module SDK</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">Located at <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">packages/module-sdk/</code>. Provides React context and hooks for module development:</p>
            <CodeBlock code={[
              "import { SukitProvider, useSukit } from '@sukit/module-sdk';",
              "",
              "useBlocks()      // Block registry and rendering",
              "useEvents()      // Event bus subscription",
              "useAuth()        // Authentication state",
              "useFS()          // File system operations",
              "useStorage()     // Key-value storage",
              "useSites()       // Site CRUD",
              "usePages()       // Page management",
              "useMedia()       // Media upload and management",
              "useSettings()    // Module-scoped settings",
              "useTasks()       // Background task queue",
              "useCache()       // Cache operations",
              "useLog()         // Namespaced logging",
              "useUI()          // UI slot registration",
              "useAPIRoutes()   // API route registration",
              "useModules()     // Module lifecycle",
            ].join("\n")} />

            <h2 id="api-surface" className="mb-4 mt-10 text-2xl font-bold tracking-tight">Kernel API Surface Details</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">Each API surface supports adapter injection for testability:</p>
            <CodeBlock code={[
              "// Adapter pattern - inject custom implementations",
              "createKernel({",
              "  auth: myAuthAdapter,",
              "  storage: myStorageAdapter,",
              "  sites: mySitesAdapter,",
              "  pages: myPagesAdapter,",
              "  media: myMediaAdapter,",
              "  export: myExportAdapter,",
              "  tasks: myTasksAdapter,",
              "  cache: myCacheAdapter,",
              "  settings: mySettingsAdapter,",
              "  fs: myFSAdapter,",
              "})",
            ].join("\n")} />

            <hr className="my-10 border-border" />

            <h2 id="cli-commands" className="mb-4 text-2xl font-bold tracking-tight">CLI Reference</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">The CLI at <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">apps/cli/</code> provides 25 commands via Commander.js.</p>

            <h3 id="cli-project" className="mb-3 mt-8 text-lg font-semibold">Project Commands</h3>
            <Table headers={["Command", "Description"]} rows={[
              ["sukit new &lt;name&gt;", "Scaffold a new SUKIT project"],
              ["sukit dev", "Start development servers (web + server)"],
              ["sukit build", "Build Next.js frontend, record build metadata"],
              ["sukit serve", "Start production server"],
              ["sukit status", "Show project status, versions, installed plugins"],
              ["sukit export &lt;siteId&gt;", "Export site as standalone ZIP archive"],
            ]} />

            <h3 id="cli-modules" className="mb-3 mt-8 text-lg font-semibold">Module &amp; Plugin Commands</h3>
            <Table headers={["Command", "Description"]} rows={[
              ["sukit add &lt;plugin&gt;", "Install a plugin with dependency resolution"],
              ["sukit remove &lt;plugin&gt;", "Uninstall a plugin safely"],
              ["sukit list", "List installed plugins with version and status"],
              ["sukit search &lt;query&gt;", "Search the module registry"],
              ["sukit info &lt;plugin&gt;", "Show detailed plugin information"],
              ["sukit update [plugin]", "Check for and apply plugin updates"],
              ["sukit install &lt;moduleId&gt;", "Install a module from URL or local path"],
              ["sukit publish [path]", "Validate and publish a module to the registry"],
              ["sukit create-plugin &lt;name&gt;", "Scaffold a new plugin"],
              ["sukit module add/remove/list", "Module management sub-commands"],
            ]} />

            <h3 id="cli-deploy" className="mb-3 mt-8 text-lg font-semibold">Deploy &amp; Auth Commands</h3>
            <Table headers={["Command", "Description"]} rows={[
              ["sukit deploy [target]", "Deploy to Vercel, Railway, or AWS"],
              ["sukit ci [provider]", "Generate CI config (GitHub Actions, GitLab CI, CircleCI)"],
              ["sukit secret &lt;action&gt;", "Manage env secrets (list, add, remove)"],
              ["sukit team &lt;action&gt;", "Team management (init, add, remove, list, sync)"],
              ["sukit audit [--limit]", "Show audit log of plugin operations"],
              ["sukit login", "Authenticate with the SUKIT registry"],
              ["sukit logout", "Log out of the SUKIT registry"],
            ]} />

            <hr className="my-10 border-border" />

            <h2 id="db-overview" className="mb-4 text-2xl font-bold tracking-tight">Database Schema</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">75 Prisma models across 2,127 lines. PostgreSQL with migrations, indexes, and cascading relations.</p>

            <h3 className="mb-3 mt-8 text-lg font-semibold">Core Models</h3>
            <ModelGrid groups={[
              { group: "User System", models: ["User", "Account", "Session", "VerificationToken", "SocialAccount", "PasswordReset", "Role", "UserRole", "NotificationPreference"] },
              { group: "Sites & Pages", models: ["Site", "SiteGroup", "SiteRoleAssignment", "Page", "PageRevision", "Section", "Column", "Block", "SiteField", "SiteEntry"] },
            ]} />

            <h3 className="mb-3 mt-8 text-lg font-semibold">Content &amp; Media</h3>
            <ModelGrid groups={[
              { group: "Content", models: ["Post", "PostRevision", "Comment", "Taxonomy", "Term", "Theme", "WidgetArea", "Popup"] },
              { group: "Media", models: ["Media", "MediaAsset", "MediaVariant", "MediaFolder", "MediaTag", "MediaFavorite", "Folder", "Tag"] },
            ]} />

            <h3 className="mb-3 mt-8 text-lg font-semibold">Commerce &amp; Marketplace</h3>
            <ModelGrid groups={[
              { group: "Commerce", models: ["Product", "ProductVariant", "Cart", "CartItem", "Order", "OrderItem", "MpesaTransaction", "SeoSettings"] },
              { group: "Marketplace", models: ["MarketplaceModule", "ModuleVersion", "ModuleInstall", "ModuleReview", "Developer", "Transaction", "Subscription", "License", "AuditLog"] },
            ]} />

            <hr className="my-10 border-border" />

            <h2 id="api-auth" className="mb-4 text-2xl font-bold tracking-tight">API Routes</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">150+ API endpoints across the web app and server.</p>

            <h3 className="mb-3 mt-8 text-lg font-semibold">Authentication</h3>
            <Table headers={["Route", "Methods", "Description"]} rows={[
              ["/api/auth/[...nextauth]", "*", "NextAuth handler (login, session, callback)"],
              ["/api/auth/login", "POST", "Email/password login"],
              ["/api/auth/register", "POST", "Create account"],
              ["/api/auth/logout", "POST", "End session"],
              ["/api/auth/forgot-password", "POST", "Request password reset"],
              ["/api/auth/reset-password", "POST", "Reset password with token"],
              ["/api/auth/change-password", "POST", "Change current password"],
              ["/api/auth/profile", "GET/PUT", "Get/update profile"],
            ]} />

            <h3 id="api-sites" className="mb-3 mt-8 text-lg font-semibold">Sites &amp; Pages</h3>
            <Table headers={["Route", "Methods", "Description"]} rows={[
              ["/api/sites", "GET/POST", "List/create sites"],
              ["/api/sites/[siteId]", "GET/PUT/DELETE", "Site CRUD"],
              ["/api/sites/[siteId]/pages", "GET/POST", "List/create pages"],
              ["/api/sites/[siteId]/pages/[pageId]", "GET/PUT/DELETE", "Page CRUD"],
              ["/api/sites/[siteId]/settings", "GET/PUT", "Site settings"],
              ["/api/sites/[siteId]/export", "POST", "Trigger site export"],
              ["/api/pages/[pageId]/publish", "POST", "Publish page"],
              ["/api/pages/[pageId]/sections", "GET/POST", "Page sections"],
              ["/api/pages/[pageId]/revisions", "GET", "Revision history"],
              ["/api/pages/[pageId]/blocks/[blockId]", "PUT/DELETE", "Block operations"],
            ]} />

            <h3 id="api-media" className="mb-3 mt-8 text-lg font-semibold">Media, Forms &amp; Content</h3>
            <Table headers={["Route", "Methods", "Description"]} rows={[
              ["/api/media", "GET/POST", "List/upload media"],
              ["/api/folders", "GET/POST", "Folder management"],
              ["/api/tags", "GET/POST", "Tag management"],
              ["/api/forms/[formId]/submit", "POST", "Submit form data"],
              ["/api/forms/[formId]/submissions", "GET", "List submissions"],
              ["/api/posts", "GET/POST", "List/create posts"],
              ["/api/posts/[postId]", "GET/PUT/DELETE", "Post CRUD"],
              ["/api/comments", "GET", "List comments"],
              ["/api/search", "GET", "Global search"],
              ["/api/sitemap/[siteId]", "GET", "Generate sitemap"],
            ]} />

            <h3 id="api-marketplace" className="mb-3 mt-8 text-lg font-semibold">Marketplace &amp; Modules</h3>
            <Table headers={["Route", "Methods", "Description"]} rows={[
              ["/api/marketplace/[[...path]]", "GET/POST", "Marketplace proxy"],
              ["/api/marketplace/featured", "GET", "Featured modules"],
              ["/api/marketplace/popular", "GET", "Popular modules"],
              ["/api/marketplace/install/[moduleId]", "POST", "Install marketplace module"],
              ["/api/modules", "GET", "List installed modules"],
              ["/api/modules/install", "POST", "Install module"],
              ["/api/modules/uninstall", "POST", "Uninstall module"],
            ]} />

            <h3 id="api-system" className="mb-3 mt-8 text-lg font-semibold">System &amp; Admin</h3>
            <Table headers={["Route", "Methods", "Description"]} rows={[
              ["/api/export/[siteId]", "POST", "Start export"],
              ["/api/export/[siteId]/download", "GET", "Download export ZIP"],
              ["/api/deploy", "GET/POST", "Deployment management"],
              ["/api/webhook/github", "POST", "GitHub webhook receiver"],
              ["/api/backups", "GET/POST", "System backups"],
              ["/api/redirects", "GET/POST", "Redirect management"],
              ["/api/chat/message", "POST", "AI chat message"],
              ["/api/github/auth", "GET", "GitHub OAuth"],
              ["/api/settings/secrets", "GET/POST", "Manage secrets"],
              ["/api/admin/audit", "GET", "System audit log"],
              ["/api/admin/health", "GET", "System health"],
            ]} />

            <hr className="my-10 border-border" />

            <h2 id="env-all" className="mb-4 text-2xl font-bold tracking-tight">Environment Variables</h2>

            <h3 className="mb-3 mt-8 text-lg font-semibold">Database</h3>
            <Table headers={["Variable", "Default", "Description"]} rows={[
              ["DATABASE_URL", "postgresql://...", "PostgreSQL connection string"],
              ["DIRECT_URL", "postgresql://...", "Direct database URL for Prisma migrations"],
            ]} />

            <h3 className="mb-3 mt-8 text-lg font-semibold">Authentication</h3>
            <Table headers={["Variable", "Default", "Description"]} rows={[
              ["NEXTAUTH_SECRET", "Auto-generated", "NextAuth JWT signing secret"],
              ["NEXTAUTH_URL", "http://localhost:3000", "Base URL for auth callbacks"],
              ["GITHUB_CLIENT_ID", "(empty)", "GitHub OAuth client ID"],
              ["GITHUB_CLIENT_SECRET", "(empty)", "GitHub OAuth client secret"],
              ["GOOGLE_CLIENT_ID", "(empty)", "Google OAuth client ID"],
              ["GOOGLE_CLIENT_SECRET", "(empty)", "Google OAuth client secret"],
            ]} />

            <h3 className="mb-3 mt-8 text-lg font-semibold">Storage &amp; Redis</h3>
            <Table headers={["Variable", "Default", "Description"]} rows={[
              ["STORAGE_TYPE", "local", "Storage provider: local, s3, r2"],
              ["STORAGE_PATH", "./storage", "Local storage directory"],
              ["S3_ACCESS_KEY_ID", "(empty)", "S3/R2 access key"],
              ["S3_SECRET_ACCESS_KEY", "(empty)", "S3/R2 secret key"],
              ["S3_BUCKET_NAME", "sukit-media", "S3/R2 bucket name"],
              ["S3_REGION", "us-east-1", "S3/R2 region"],
              ["S3_ENDPOINT", "(empty)", "Custom endpoint (e.g., Cloudflare R2)"],
              ["REDIS_URL", "redis://localhost:6379", "Redis connection string"],
            ]} />

            <h3 className="mb-3 mt-8 text-lg font-semibold">Email &amp; AI</h3>
            <Table headers={["Variable", "Default", "Description"]} rows={[
              ["EMAIL_PROVIDER", "resend", "Provider: resend, smtp"],
              ["RESEND_API_KEY", "(empty)", "Resend API key"],
              ["SMTP_HOST", "(empty)", "SMTP server host"],
              ["SMTP_PORT", "587", "SMTP server port"],
              ["SMTP_FROM", "noreply@sukit.dev", "From address"],
              ["OPENAI_API_KEY", "(empty)", "OpenAI API key for chat module"],
              ["OPENAI_MODEL", "gpt-4-turbo", "OpenAI model"],
              ["OLLAMA_BASE_URL", "http://localhost:11434", "Local Ollama endpoint"],
            ]} />

            <h3 className="mb-3 mt-8 text-lg font-semibold">Security &amp; Performance</h3>
            <Table headers={["Variable", "Default", "Description"]} rows={[
              ["ENCRYPTION_KEY", "32-char string", "AES-256-GCM encryption key"],
              ["RATE_LIMIT_REQUESTS", "100", "Rate limit per window"],
              ["RATE_LIMIT_WINDOW_MS", "900000", "Rate limit window (15min)"],
              ["CORS_ORIGINS", "Comma-separated", "Allowed CORS origins"],
              ["CACHE_TTL_SECONDS", "3600", "Default cache TTL"],
              ["CDN_URL", "(empty)", "CDN URL for media"],
              ["LOG_LEVEL", "info", "Log level (debug/info/warn/error)"],
              ["LOG_FORMAT", "json", "Log format (json/pretty)"],
              ["EXPORT_PATH", "./exports", "Export output directory"],
              ["MAX_EXPORT_SIZE_MB", "100", "Maximum export size"],
              ["MODULES_PATH", "./modules", "Module installation path"],
              ["MODULE_MARKETPLACE_URL", "https://...", "Marketplace registry URL"],
              ["NODE_ENV", "development", "Node environment"],
              ["PORT", "3000", "Application HTTP port"],
            ]} />

            <hr className="my-10 border-border" />

            <h2 id="module-lifecycle" className="mb-4 text-2xl font-bold tracking-tight">Module System</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">Every module in <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">modules/</code> follows the Module SDK contract:</p>
            <CodeBlock code={CODE.moduleInterface} />
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">Modules register API routes, blocks, settings panels, and event hooks through the scoped kernel API. Each module gets <strong className="text-foreground">isolated storage, settings, and logging namespaces</strong> via <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">kernel.forModule(moduleId)</code>.</p>

            <h3 className="mb-3 mt-8 text-lg font-semibold">Example: M-Pesa Module Activation</h3>
            <CodeBlock code={CODE.mpesaActivate} />

            <h2 id="module-list" className="mb-4 mt-10 text-2xl font-bold tracking-tight">30 Modules</h2>
            <ModuleGrid items={[
              ["M-Pesa Payments", "Daraja API, STK Push, B2C, callbacks"],
              ["Media Library", "10,889 lines -- upload, crop, WebP, folders, tags"],
              ["Visual Builder", "18,353 lines -- drag-drop canvas, 36+ blocks"],
              ["Form Builder", "Conditional logic, file uploads, integrations"],
              ["Analytics", "Page views, events, custom dashboards"],
              ["SEO Module", "Meta editor, JSON-LD schema, sitemap"],
              ["Code Editor", "Monaco editor, file tree, git, terminal"],
              ["AI Chat", "OpenAI/Ollama, training config, lead capture"],
              ["Popup Builder", "Triggers, animations, targeting, A/B testing"],
              ["Commerce", "Products, variants, cart, checkout, orders"],
              ["Site Manager", "5,851 lines -- multi-site, page tree, team"],
              ["Export Engine", "7,069 lines -- code generator, GitHub push"],
              ["Blog", "Posts, categories, tags, comments, revisions"],
              ["Membership", "Plans, subscriptions, member directory"],
              ["Booking", "Calendar, staff, time slots, services"],
              ["Events", "Ticketing, QR check-in, agenda, speakers"],
              ["Newsletter", "Campaigns, subscribers, templates"],
              ["Reviews", "Star ratings, pros/cons, moderation"],
              ["Translation", "Multi-language editor, auto-detect"],
              ["Cookie Consent", "GDPR/CCPA compliant banner"],
              ["Webhooks", "15+ integrations, retry logic"],
              ["Pricing Table", "Visual tiers, feature comparison"],
              ["Testimonials", "Carousel, grid, moderation"],
              ["Countdown", "Timers, evergreen mode, analytics"],
              ["Redirect Manager", "URL redirects, pattern matching"],
              ["Custom Code", "HTML/CSS/JS injection"],
              ["Social Feed", "Instagram/Facebook feed"],
              ["FAQ", "Accordion, categories, search"],
              ["Auth Module", "Login, register, password reset, MFA"],
              ["Stripe (Coming)", "Credit card payments, subscriptions"],
            ]} />

            <h2 id="modules-core" className="mb-4 mt-10 text-2xl font-bold tracking-tight">Modules Core Package</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground"><code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">packages/modules-core/src/</code> provides the full module engine:</p>
            <Table headers={["Module", "Description"]} rows={[
              ["loader.ts", "Lazy-loads module components with Suspense, caches widgets"],
              ["module-installer.ts", "Copies module files, resolves dependencies, updates .env"],
              ["module-uninstaller.ts", "Removes module files safely, checks for dependents"],
              ["module-publisher.ts", "Validates and packages modules for registry publishing"],
              ["dependency-resolver.ts", "Resolves module dependency chains"],
              ["conflict-resolver.ts", "Detects and resolves file conflicts between modules"],
              ["state-manager.ts", "Manages .sukit/ state (plugins, audit, metadata)"],
              ["registry-client.ts", "Interacts with remote module registry API"],
              ["hooks.ts", "Action/filter system"],
              ["project-generator.ts", "Scaffolds new SUKIT projects"],
              ["ci-generator.ts", "Generates CI/CD pipeline config files"],
              ["deploy-manager.ts", "Deploys to Vercel, Railway, AWS"],
              ["team-manager.ts", "Team creation, member management, roles"],
              ["backup-restore.ts", "Backup and restore functionality"],
              ["theme-manager.ts", "Theme management"],
            ]} />

            <hr className="my-10 border-border" />

            <h2 id="auth-config" className="mb-4 text-2xl font-bold tracking-tight">Authentication</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">NextAuth v5 with JWT session strategy. Three providers:</p>
            <CodeBlock code={CODE.nextAuth} />

            <h3 className="mb-3 mt-8 text-lg font-semibold">Auth Middleware</h3>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">Located at <code className="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">apps/web/lib/auth/middleware.ts</code>:</p>
            <Table headers={["Helper", "Description"]} rows={[
              ["requireAuth()", "Throws UnauthorizedError if no session"],
              ["requireAdmin()", "Throws ForbiddenError if user is not admin"],
              ["requireDeveloper()", "Throws if user is not an approved developer"],
              ["getOptionalAuth()", "Returns session or null"],
              ["isProtectedRoute(path)", "Checks if a path requires authentication"],
            ]} />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground"><strong className="text-foreground">Protected routes:</strong> /dashboard, /builder, /api/sites, /api/pages, /api/export, /settings, /sites, /modules</p>

            <hr className="my-10 border-border" />

            <h2 id="test-structure" className="mb-4 text-2xl font-bold tracking-tight">Testing</h2>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">30+ test files across unit, integration, e2e, accessibility, security, and performance:</p>
            <CodeBlock code={[
              "tests/",
              "  unit/",
              "    builder/",
              "      store.test.ts           # Builder state management",
              "      renderer.test.tsx       # Block renderer",
              "      serializer.test.ts      # Page serializer",
              "      snapshot.test.ts        # Builder snapshots",
              "      block-registry.test.ts  # Block registration",
              "    stores/builder-store.test.ts",
              "    hooks/use-history.test.ts",
              "    components/block-library.test.tsx",
              "    enterprise/security.test.ts",
              "  integration/api/",
              "    auth.test.ts              # Auth API endpoints",
              "    pages.test.ts             # Pages API endpoints",
              "    export.test.ts            # Export API endpoints",
              "  e2e/",
              "    auth.spec.ts              # Auth flows (Playwright)",
              "    builder.spec.ts           # Builder workflows",
              "    media.spec.ts             # Media management",
              "    export.spec.ts            # Export functionality",
              "  security/auth.test.ts       # Auth security",
              "  performance/load.test.ts    # Load testing",
              "  accessibility/builder.test.ts",
              "  visual/builder-screenshots.test.ts",
            ].join("\n")} />

            <h2 id="test-running" className="mb-4 mt-10 text-2xl font-bold tracking-tight">Running Tests</h2>
            <CodeBlock code={[
              "pnpm test                    # Run all tests via Turbo",
              "pnpm --filter sukit-web test  # Run web app tests only",
              "npx playwright test           # Run E2E tests only",
            ].join("\n")} />
          </motion.div>
        </main>
      </div>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SUKIT. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isRendered = useRef(false);
  useEffect(() => {
    if (!isRendered.current) {
      isRendered.current = true;
      setMounted(true);
    }
  }, []);
  if (!mounted) return <div className="h-9 w-9" />;
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-accent/10 hover:text-foreground active:scale-[0.95]" aria-label="Toggle theme">
      {theme === "dark" ? sun : moon}
    </button>
  );
}
