import type { SukitKernel } from '@sukit/core';

export interface DocConfig {
  docsUrl: string;
  versions: string[];
  defaultVersion: string;
  languages: string[];
  defaultLanguage: string;
  features: {
    search: boolean;
    pdfExport: boolean;
    darkMode: boolean;
    interactiveExamples: boolean;
    editOnGitHub: boolean;
    feedback: boolean;
  };
}

const DEFAULT_CONFIG: DocConfig = {
  docsUrl: 'https://docs.sukit.dev',
  versions: ['v1'],
  defaultVersion: 'v1',
  languages: ['en'],
  defaultLanguage: 'en',
  features: {
    search: true,
    pdfExport: true,
    darkMode: true,
    interactiveExamples: true,
    editOnGitHub: true,
    feedback: true,
  },
};

interface DocArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  content: string;
  order: number;
  hidden?: boolean;
}

export class DocumentationSystem {
  private kernel: SukitKernel;
  private config: DocConfig;

  constructor(kernel: SukitKernel, config?: Partial<DocConfig>) {
    this.kernel = kernel;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateUserDocs(): DocArticle[] {
    return [
      {
        slug: 'getting-started',
        title: 'Getting Started',
        description: 'Your first 10 minutes with SUKIT',
        category: 'Basics',
        order: 1,
        content:
          '# Getting Started\n\nWelcome to SUKIT! This guide will help you create your first site in 10 minutes.\n\n## Step 1: Create an Account\n\nVisit [app.sukit.dev](https://app.sukit.dev) and sign up for a free account.\n\n## Step 2: Create a Site\n\nClick "New Site" and choose a template (Blank, Blog, Portfolio, or E-Commerce).\n\n## Step 3: Add Content\n\nUse the Visual Builder to drag and drop blocks onto your page.\n\n## Step 4: Publish\n\nClick "Export" to generate your site files, then "Deploy" to publish.',
      },
      {
        slug: 'visual-builder',
        title: 'Visual Builder Guide',
        description: 'Building pages with drag-and-drop',
        category: 'Editor',
        order: 2,
        content:
          "# Visual Builder\n\nThe Visual Builder is SUKIT's drag-and-drop page editor.\n\n## Block Palette\n\nBlocks are organized by category: Content, Media, Layout, Forms, Widgets, Advanced.\n\n## Editing Properties\n\nSelect any block to see its properties in the right panel.",
      },
      {
        slug: 'site-manager',
        title: 'Site Manager',
        description: 'Managing multiple sites',
        category: 'Management',
        order: 3,
        content:
          '# Site Manager\n\nManage multiple sites from one dashboard.\n\n## Page Tree\n\nOrganize pages in a hierarchical tree with drag-drop reordering.',
      },
      {
        slug: 'media-library',
        title: 'Media Library',
        description: 'Uploading and managing media',
        category: 'Media',
        order: 4,
        content:
          '# Media Library\n\nUpload, optimize, and manage your images and files.\n\n## Supported Formats\n\nImages: JPG, PNG, GIF, WebP, AVIF, SVG\n\n## Optimization\n\nImages are automatically converted to WebP and AVIF.',
      },
      {
        slug: 'export-deploy',
        title: 'Export & Deploy',
        description: 'Publishing your site',
        category: 'Deployment',
        order: 5,
        content:
          '# Export & Deploy\n\n## Export Formats\n\n- **ZIP**: Download all files as a ZIP archive\n- **Next.js**: Export as a Next.js project\n- **Static HTML**: Clean static HTML files\n\n## Deploy Targets\n\n- Netlify, Vercel, GitHub Pages, AWS S3, Cloudflare Pages',
      },
      {
        slug: 'modules',
        title: 'Module Installation',
        description: 'Extending SUKIT with modules',
        category: 'Marketplace',
        order: 6,
        content:
          '# Module Installation\n\nExtend your site with modules from the SUKIT Marketplace.\n\n## Finding Modules\n\nBrowse the Marketplace by category or search by keyword.\n\n## Installing\n\nClick "Install" on any module. Review permissions, then confirm.',
      },
      {
        slug: 'faq',
        title: 'Frequently Asked Questions',
        description: 'Common questions',
        category: 'Support',
        order: 7,
        content:
          '# FAQ\n\n## What is SUKIT?\n\nSUKIT is a modular site building platform.\n\n## Is SUKIT free?\n\nYes! The core platform is free and open source.',
      },
      {
        slug: 'troubleshooting',
        title: 'Troubleshooting',
        description: 'Common issues and fixes',
        category: 'Support',
        order: 8,
        content:
          '# Troubleshooting\n\n## Builder not loading\n\nClear your browser cache and reload.\n\n## Export failing\n\nCheck your site for broken blocks or missing media.',
      },
    ];
  }

  generateDevDocs(): DocArticle[] {
    return [
      {
        slug: 'module-development',
        title: 'Module Development Guide',
        description: 'Creating SUKIT modules',
        category: 'Modules',
        order: 1,
        content:
          "# Module Development\n\n## Module Structure\n\n```\nmy-module/\n├── manifest.json\n├── src/\n│   ├── index.ts\n│   └── settings.tsx\n├── package.json\n└── tsconfig.json\n```\n\n## Manifest\n\nThe `manifest.json` defines your module's metadata, permissions, and entrypoints.",
      },
      {
        slug: 'block-development',
        title: 'Block Development Guide',
        description: 'Creating visual blocks',
        category: 'Modules',
        order: 2,
        content:
          "# Block Development\n\n## Registering a Block\n\n```typescript\nkernel.blocks.register({\n  type: 'my-block',\n  name: 'My Block',\n  component: MyBlockComponent,\n  schema: { /* props */ }\n})\n```",
      },
      {
        slug: 'api-reference',
        title: 'API Reference',
        description: 'REST API documentation',
        category: 'API',
        order: 3,
        content:
          '# API Reference\n\n## Authentication\n\nAll API requests require an API key passed in the `X-API-Key` header.\n\n## Endpoints\n\n- `GET /api/sites` - List sites\n- `POST /api/sites` - Create site\n- `GET /api/sites/:id/pages` - List pages',
      },
      {
        slug: 'cli-reference',
        title: 'CLI Reference',
        description: 'All CLI commands',
        category: 'Tools',
        order: 4,
        content:
          '# CLI Reference\n\n## Commands\n\n- `sukit create [name]` - Create a new site\n- `sukit build <siteId>` - Build for production\n- `sukit deploy <siteId>` - Deploy to hosting\n- `sukit module add <id>` - Install module',
      },
      {
        slug: 'best-practices',
        title: 'Best Practices',
        description: 'Recommended patterns',
        category: 'Guides',
        order: 5,
        content:
          '# Best Practices\n\n## Module Design\n\n- Follow single responsibility principle\n- Use kernel events for cross-module communication\n- Keep bundles under 50KB',
      },
      {
        slug: 'security-guidelines',
        title: 'Security Guidelines',
        description: 'Secure module development',
        category: 'Guides',
        order: 6,
        content:
          '# Security Guidelines\n\n## Input Validation\n\nAlways validate user input using Zod schemas.\n\n## Permissions\n\nRequest only the permissions your module needs.',
      },
    ];
  }

  generateOpenAPISpec(): Record<string, any> {
    return {
      openapi: '3.0.0',
      info: {
        title: 'SUKIT API',
        version: '1.0.0',
        description: 'REST API for programmatic SUKIT access',
      },
      servers: [
        { url: 'https://app.sukit.dev/api/v1', description: 'Production' },
        { url: 'https://staging.sukit.dev/api/v1', description: 'Staging' },
        { url: 'http://localhost:3042/api/v1', description: 'Development' },
      ],
      security: [{ ApiKeyAuth: [] }],
      components: {
        securitySchemes: {
          ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'object' },
            },
          },
          Pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              pageSize: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
          Site: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              domain: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          Page: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              siteId: { type: 'string' },
              title: { type: 'string' },
              slug: { type: 'string' },
              status: { type: 'string', enum: ['draft', 'published'] },
            },
          },
          Module: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              version: { type: 'string' },
              category: { type: 'string' },
              price: { type: 'number' },
              rating: { type: 'number' },
              downloads: { type: 'integer' },
            },
          },
        },
      },
      paths: {
        '/sites': {
          get: {
            summary: 'List all sites',
            parameters: [
              { name: 'page', in: 'query', schema: { type: 'integer' } },
              { name: 'pageSize', in: 'query', schema: { type: 'integer' } },
              { name: 'sort', in: 'query', schema: { type: 'string' } },
            ],
            responses: {
              '200': {
                description: 'OK',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        sites: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Site' },
                        },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
              '401': { description: 'Unauthorized' },
              '429': { description: 'Rate limited' },
            },
          },
          post: {
            summary: 'Create site',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: { type: 'string' },
                      template: { type: 'string' },
                      domain: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              '201': { description: 'Created' },
              '400': { description: 'Validation error' },
            },
          },
        },
        '/sites/{id}': {
          get: {
            summary: 'Get site by ID',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
              {
                name: 'include',
                in: 'query',
                schema: {
                  type: 'string',
                  description: 'Relationships to include',
                },
              },
            ],
            responses: {
              '200': { description: 'OK' },
              '404': { description: 'Not found' },
            },
          },
          put: {
            summary: 'Update site',
            responses: { '200': { description: 'Updated' } },
          },
          delete: {
            summary: 'Delete site',
            responses: { '204': { description: 'Deleted' } },
          },
        },
        '/sites/{id}/pages': {
          get: {
            summary: 'List pages',
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
              },
              {
                name: 'status',
                in: 'query',
                schema: { type: 'string', enum: ['draft', 'published'] },
              },
              { name: 'page', in: 'query', schema: { type: 'integer' } },
            ],
            responses: { '200': { description: 'OK' } },
          },
          post: {
            summary: 'Create page',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['title', 'slug'],
                    properties: {
                      title: { type: 'string' },
                      slug: { type: 'string' },
                      content: { type: 'object' },
                      status: { type: 'string', default: 'draft' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: 'Created' } },
          },
        },
        '/modules': {
          get: {
            summary: 'List installed modules',
            responses: { '200': { description: 'OK' } },
          },
        },
        '/modules/install': {
          post: {
            summary: 'Install module',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['moduleId'],
                    properties: {
                      moduleId: { type: 'string' },
                      version: { type: 'string' },
                      siteId: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { '200': { description: 'Installed' } },
          },
        },
        '/health': {
          get: {
            summary: 'Health check',
            responses: { '200': { description: 'OK' } },
          },
        },
        '/metrics': {
          get: {
            summary: 'Prometheus metrics',
            responses: { '200': { description: 'Metrics' } },
          },
        },
      },
    };
  }

  getVersionedUrl(slug: string, version?: string, language?: string): string {
    const v = version || this.config.defaultVersion;
    const lang = language || this.config.defaultLanguage;
    return `${this.config.docsUrl}/${lang}/${v}/${slug}`;
  }

  getSiteMap(): { loc: string; changefreq: string; priority: number }[] {
    const articles = [...this.generateUserDocs(), ...this.generateDevDocs()];
    return articles.map((a) => ({
      loc: this.getVersionedUrl(a.slug),
      changefreq: 'weekly',
      priority: a.slug === 'getting-started' ? 1 : 0.8,
    }));
  }

  // ─── Docs Site Rendering ──────────────────────────────────────

  generateDocsSiteHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SUKIT Documentation</title>
  <link rel="stylesheet" href="/docs/assets/style.css">
  <script src="/docs/assets/search.js" defer></script>
</head>
<body>
  <nav class="docs-nav">
    <div class="nav-header">
      <a href="/" class="logo">SUKIT Docs</a>
      <div class="version-select">
        <select id="version-select">
          <option value="latest">Latest</option>
          <option value="1.0">1.0</option>
          <option value="0.9">0.9</option>
        </select>
      </div>
    </div>
    <div class="search-bar">
      <input type="search" id="docs-search" placeholder="Search documentation..." />
      <div id="search-results" class="search-results"></div>
    </div>
    <div class="nav-sidebar">
      <div class="nav-section">
        <h3>User Guide</h3>
        <ul>
          <li><a href="/docs/latest/en/getting-started">Getting Started</a></li>
          <li><a href="/docs/latest/en/builder-guide">Visual Builder</a></li>
          <li><a href="/docs/latest/en/site-manager">Site Manager</a></li>
          <li><a href="/docs/latest/en/media-library">Media Library</a></li>
          <li><a href="/docs/latest/en/export-deploy">Export & Deploy</a></li>
          <li><a href="/docs/latest/en/modules">Modules</a></li>
          <li><a href="/docs/latest/en/faq">FAQ</a></li>
          <li><a href="/docs/latest/en/troubleshooting">Troubleshooting</a></li>
        </ul>
      </div>
      <div class="nav-section">
        <h3>Developer Guide</h3>
        <ul>
          <li><a href="/docs/latest/en/module-development">Module Development</a></li>
          <li><a href="/docs/latest/en/block-development">Block Development</a></li>
          <li><a href="/docs/latest/en/api-reference">API Reference</a></li>
          <li><a href="/docs/latest/en/cli-reference">CLI Reference</a></li>
          <li><a href="/docs/latest/en/best-practices">Best Practices</a></li>
          <li><a href="/docs/latest/en/security">Security</a></li>
        </ul>
      </div>
    </div>
  </nav>
  <main class="docs-content">
    <article id="doc-content">
      <h1>{{title}}</h1>
      <div class="doc-meta">
        <span class="last-updated">Last updated: {{lastUpdated}}</span>
        <a href="{{editUrl}}" class="edit-link">Edit on GitHub</a>
      </div>
      <div class="doc-body">{{content}}</div>
      <div class="doc-footer">
        <div class="feedback">
          <span>Was this helpful?</span>
          <button class="feedback-btn" data-value="yes">Yes</button>
          <button class="feedback-btn" data-value="no">No</button>
        </div>
        <div class="related-articles">
          <h3>Related Articles</h3>
          <ul>{{relatedArticles}}</ul>
        </div>
      </div>
    </article>
  </main>
  <script>
    document.querySelectorAll('.feedback-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        fetch('/api/docs/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: window.location.pathname, value: btn.dataset.value })
        });
        btn.disabled = true;
      });
    });
  </script>
</body>
</html>`;
  }

  generateDocsStyleCss(): string {
    return `:root { --primary: #4F46E5; --bg: #ffffff; --text: #1f2937; --sidebar: #f9fafb; --border: #e5e7eb; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: var(--text); line-height: 1.6; display: flex; min-height: 100vh; }
.docs-nav { width: 280px; background: var(--sidebar); border-right: 1px solid var(--border); padding: 24px; position: fixed; top: 0; left: 0; height: 100vh; overflow-y: auto; }
.nav-header { margin-bottom: 24px; }
.logo { font-size: 20px; font-weight: 700; color: var(--primary); text-decoration: none; }
.version-select { margin-top: 8px; }
.version-select select { width: 100%; padding: 6px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; }
.search-bar { position: relative; margin-bottom: 24px; }
#docs-search { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; }
.search-results { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: none; z-index: 100; max-height: 300px; overflow-y: auto; }
.search-results.active { display: block; }
.search-result-item { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
.search-result-item:hover { background: #f3f4f6; }
.search-result-item .result-title { font-weight: 600; }
.search-result-item .result-description { font-size: 12px; color: #666; }
.nav-section { margin-bottom: 24px; }
.nav-section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; }
.nav-section ul { list-style: none; }
.nav-section li { margin-bottom: 4px; }
.nav-section a { color: var(--text); text-decoration: none; font-size: 14px; padding: 4px 8px; display: block; border-radius: 4px; }
.nav-section a:hover { background: #e5e7eb; }
.docs-content { margin-left: 280px; flex: 1; padding: 48px 64px; max-width: 900px; }
.docs-content h1 { font-size: 36px; margin-bottom: 16px; }
.doc-meta { display: flex; gap: 16px; font-size: 13px; color: #6b7280; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.edit-link { color: var(--primary); text-decoration: none; }
.doc-body { font-size: 16px; }
.doc-body h2 { font-size: 24px; margin: 32px 0 16px; }
.doc-body h3 { font-size: 20px; margin: 24px 0 12px; }
.doc-body p { margin-bottom: 16px; }
.doc-body code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
.doc-body pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 16px; }
.doc-body pre code { background: none; padding: 0; }
.doc-body ul, .doc-body ol { margin-bottom: 16px; padding-left: 24px; }
.doc-body li { margin-bottom: 8px; }
.doc-body table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.doc-body th, .doc-body td { padding: 8px 12px; border: 1px solid var(--border); text-align: left; }
.doc-body th { background: #f9fafb; font-weight: 600; }
.doc-footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border); }
.feedback { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.feedback-btn { padding: 6px 16px; border: 1px solid var(--border); border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; }
.feedback-btn:hover { background: #f3f4f6; }
.feedback-btn:disabled { opacity: 0.5; cursor: default; }
.related-articles h3 { font-size: 16px; margin-bottom: 12px; }
.related-articles ul { list-style: none; }
.related-articles li { margin-bottom: 8px; }
.related-articles a { color: var(--primary); text-decoration: none; }
@media (max-width: 768px) { .docs-nav { display: none; } .docs-content { margin-left: 0; padding: 24px; } }`;
  }

  // ─── Search ───────────────────────────────────────────────────

  generateSearchIndex(): { title: string; slug: string; content: string; category: string }[] {
    const articles = [...this.generateUserDocs(), ...this.generateDevDocs()];
    return articles.map(a => ({
      title: a.title,
      slug: a.slug,
      content: (a.sections || []).map((s: any) => `${s.title} ${s.content}`).join(' '),
      category: a.category || 'general',
    }));
  }

  generateSearchJs(): string {
    return `const searchIndex = [];
let searchTimeout;

async function loadSearchIndex() {
  try {
    const res = await fetch('/docs/search-index.json');
    const data = await res.json();
    searchIndex.push(...data);
  } catch (e) {
    console.error('Failed to load search index');
  }
}

function searchDocs(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return searchIndex
    .filter(item => item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q))
    .slice(0, 10)
    .map(item => ({
      title: item.title,
      url: '/docs/latest/en/' + item.slug,
      description: item.content.substring(0, 150) + '...',
      category: item.category,
    }));
}

document.addEventListener('DOMContentLoaded', function() {
  loadSearchIndex();
  const searchInput = document.getElementById('docs-search');
  const resultsContainer = document.getElementById('search-results');

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function() {
        const results = searchDocs(searchInput.value);
        if (results.length > 0 && searchInput.value.length >= 2) {
          resultsContainer.innerHTML = results.map(r => (
            '<div class="search-result-item" onclick="window.location.href=\\'' + r.url + '\\'">' +
            '<div class="result-title">' + r.title + '</div>' +
            '<div class="result-description">' + r.description + '</div>' +
            '</div>'
          )).join('');
          resultsContainer.classList.add('active');
        } else {
          resultsContainer.classList.remove('active');
        }
      }, 300);
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-bar')) {
        resultsContainer.classList.remove('active');
      }
    });
  }
});`;
  }

  generateSearchIndexJson(): string {
    const index = this.generateSearchIndex();
    return JSON.stringify(index, null, 2);
  }

  // ─── PDF Export ───────────────────────────────────────────────

  generatePdfExportHtml(article: { title: string; content: string; sections?: any[] }): string {
    const sections = (article.sections || []).map(s =>
      `<h2>${s.title}</h2><div class="section-content">${s.content}</div>`
    ).join('\n');
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${article.title} - SUKIT Docs</title>
<style>
  @page { margin: 40px; }
  body { font-family: -apple-system, 'Helvetica Neue', sans-serif; color: #1f2937; line-height: 1.6; font-size: 12pt; }
  h1 { font-size: 24pt; color: #4F46E5; margin-bottom: 16px; border-bottom: 2px solid #4F46E5; padding-bottom: 8px; }
  h2 { font-size: 18pt; color: #374151; margin-top: 24px; }
  h3 { font-size: 14pt; color: #374151; }
  p { margin-bottom: 12px; }
  code { background: #f3f4f6; padding: 1px 4px; font-size: 10pt; }
  pre { background: #f3f4f6; padding: 12px; border-radius: 4px; font-size: 10pt; overflow-x: auto; page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; page-break-inside: avoid; }
  th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 11pt; }
  th { background: #f9fafb; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #d1d5db; font-size: 10pt; color: #6b7280; }
  @media print { a { color: #4F46E5; text-decoration: none; } }
</style></head><body>
  <h1>${article.title}</h1>
  <div class="content">${sections || article.content}</div>
  <div class="footer">
    <p>Generated from SUKIT Documentation - https://docs.sukit.dev</p>
    <p>Page 1</p>
  </div>
  <script>window.print();</script>
</body></html>`;
  }

  generatePdfExportConfig(): Record<string, any> {
    return {
      engine: 'puppeteer',
      format: 'A4',
      margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="font-size:9px;margin-left:40px;color:#666;"><span class="date"></span></div>',
      footerTemplate: '<div style="font-size:9px;margin:0 40px;color:#666;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      includeInBody: true,
    };
  }

  // ─── Dark Mode ────────────────────────────────────────────────

  generateDarkModeCss(): string {
    return `@media (prefers-color-scheme: dark) {
  :root { --bg: #111827; --text: #f3f4f6; --sidebar: #1f2937; --border: #374151; }
  .docs-nav { background: var(--sidebar); }
  .search-results { background: #1f2937; border-color: #374151; }
  .search-result-item:hover { background: #374151; }
  .nav-section a:hover { background: #374151; }
  .doc-body code { background: #374151; }
  .doc-body pre { background: #0f172a; }
  .doc-body th { background: #1f2937; }
  .feedback-btn { background: #374151; border-color: #4b5563; color: var(--text); }
  .feedback-btn:hover { background: #4b5563; }
  .metric-card { background: #1f2937; border-color: #374151; }
  .panel { background: #1f2937; }
  .slo-item { background: #111827; }
}`;
  }

  // ─── Translations Framework ───────────────────────────────────

  generateTranslations(): Record<string, Record<string, string>> {
    return {
      en: {
        'getting-started': 'Getting Started',
        'builder-guide': 'Visual Builder Guide',
        'site-manager': 'Site Manager',
        'faq': 'Frequently Asked Questions',
        'search-placeholder': 'Search documentation...',
        'edit-on-github': 'Edit on GitHub',
        'feedback-question': 'Was this helpful?',
        'related-articles': 'Related Articles',
        'last-updated': 'Last updated',
        'version': 'Version',
      },
      es: {
        'getting-started': 'Primeros Pasos',
        'builder-guide': 'Guía del Constructor Visual',
        'site-manager': 'Administrador de Sitios',
        'faq': 'Preguntas Frecuentes',
        'search-placeholder': 'Buscar en la documentación...',
        'edit-on-github': 'Editar en GitHub',
        'feedback-question': '¿Fue útil esto?',
        'related-articles': 'Artículos Relacionados',
        'last-updated': 'Última actualización',
        'version': 'Versión',
      },
      fr: {
        'getting-started': 'Pour Commencer',
        'builder-guide': 'Guide du Constructeur Visuel',
        'site-manager': 'Gestionnaire de Sites',
        'faq': 'Questions Fréquentes',
        'search-placeholder': 'Rechercher dans la documentation...',
        'edit-on-github': 'Modifier sur GitHub',
        'feedback-question': 'Cela a-t-il été utile ?',
        'related-articles': 'Articles Connexes',
        'last-updated': 'Dernière mise à jour',
        'version': 'Version',
      },
      de: {
        'getting-started': 'Erste Schritte',
        'builder-guide': 'Visueller Builder-Leitfaden',
        'site-manager': 'Site-Manager',
        'faq': 'Häufig Gestellte Fragen',
        'search-placeholder': 'Dokumentation durchsuchen...',
        'edit-on-github': 'Auf GitHub bearbeiten',
        'feedback-question': 'War das hilfreich?',
        'related-articles': 'Verwandte Artikel',
        'last-updated': 'Zuletzt aktualisiert',
        'version': 'Version',
      },
    };
  }

  // ─── Video Tutorials ──────────────────────────────────────────

  generateVideoTutorials(): { id: string; title: string; description: string; duration: string; category: string; url: string }[] {
    return [
      { id: 'intro', title: 'Introduction to SUKIT', description: 'Overview of the platform and its capabilities', duration: '5:30', category: 'getting-started', url: 'https://youtube.com/watch?v=intro' },
      { id: 'builder-basics', title: 'Visual Builder Basics', description: 'Learn how to use the drag-and-drop builder', duration: '12:45', category: 'builder', url: 'https://youtube.com/watch?v=builder-basics' },
      { id: 'blocks', title: 'Working with Blocks', description: 'How to add, configure, and style blocks', duration: '8:20', category: 'builder', url: 'https://youtube.com/watch?v=blocks' },
      { id: 'media', title: 'Media Library', description: 'Uploading, managing, and optimizing media', duration: '6:15', category: 'media', url: 'https://youtube.com/watch?v=media' },
      { id: 'export', title: 'Exporting Your Site', description: 'Export to static files, ZIP, or deploy', duration: '4:50', category: 'deploy', url: 'https://youtube.com/watch?v=export' },
      { id: 'modules', title: 'Module Development', description: 'Creating custom modules for SUKIT', duration: '15:00', category: 'development', url: 'https://youtube.com/watch?v=modules' },
      { id: 'api', title: 'API Integration', description: 'Using the SUKIT REST API', duration: '10:30', category: 'development', url: 'https://youtube.com/watch?v=api' },
    ];
  }

  // ─── Interactive Walkthroughs ─────────────────────────────────

  generateWalkthroughConfig(): Record<string, any> {
    return {
      enabled: true,
      provider: 'shepherd',
      steps: [
        { id: 'welcome', title: 'Welcome to SUKIT', text: 'This walkthrough will guide you through the main features.', attachTo: { element: '.app-header', on: 'bottom' } },
        { id: 'builder', title: 'The Builder', text: 'Drag and drop blocks to build your pages.', attachTo: { element: '.builder-canvas', on: 'right' } },
        { id: 'blocks', title: 'Block Library', text: 'Choose from a wide variety of blocks.', attachTo: { element: '.block-library', on: 'left' } },
        { id: 'settings', title: 'Page Settings', text: 'Configure page metadata and SEO settings.', attachTo: { element: '.page-settings', on: 'bottom' } },
        { id: 'publish', title: 'Publish', text: 'Export or deploy your site with one click.', attachTo: { element: '.publish-button', on: 'top' } },
      ],
      options: {
        exitOnEsc: true,
        keyboardNavigation: true,
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    };
  }

  // ─── API Playground ───────────────────────────────────────────

  // ─── Search Analytics ───────────────────────────────────────

  private searchQueries: { query: string; resultsCount: number; timestamp: string }[] = [];

  trackSearchQuery(query: string, resultsCount: number): void {
    this.searchQueries.push({ query, resultsCount, timestamp: new Date().toISOString() });
    if (this.searchQueries.length > 10000) this.searchQueries = this.searchQueries.slice(-5000);
  }

  getSearchAnalytics(): {
    totalSearches: number;
    topQueries: { query: string; count: number }[];
    noResultQueries: { query: string; count: number }[];
    avgResultsPerSearch: number;
    searchesByDay: { date: string; count: number }[];
  } {
    const queryCounts: Record<string, number> = {};
    const noResultCounts: Record<string, number> = {};
    for (const s of this.searchQueries) {
      queryCounts[s.query] = (queryCounts[s.query] || 0) + 1;
      if (s.resultsCount === 0) noResultCounts[s.query] = (noResultCounts[s.query] || 0) + 1;
    }
    const topQueries = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([query, count]) => ({ query, count }));
    const noResultQueries = Object.entries(noResultCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([query, count]) => ({ query, count }));
    const dayCounts: Record<string, number> = {};
    for (const s of this.searchQueries) {
      const day = s.timestamp.substring(0, 10);
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    const searchesByDay = Object.entries(dayCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
    const totalResults = this.searchQueries.reduce((s, q) => s + q.resultsCount, 0);
    return {
      totalSearches: this.searchQueries.length,
      topQueries,
      noResultQueries,
      avgResultsPerSearch: this.searchQueries.length > 0 ? Math.round(totalResults / this.searchQueries.length * 10) / 10 : 0,
      searchesByDay,
    };
  }

  generateSearchAnalyticsHtml(): string {
    const analytics = this.getSearchAnalytics();
    return `import { useState, useEffect } from 'react';

export function SearchAnalytics() {
  const [analytics, setAnalytics] = useState(${JSON.stringify(analytics)});

  useEffect(() => {
    fetch('/api/docs/search-analytics').then(r => r.json()).then(setAnalytics);
  }, []);

  return (
    <div className="search-analytics">
      <header><h1>Search Analytics</h1></header>
      <div className="analytics-metrics">
        <div className="metric-card"><span className="metric-value">{analytics.totalSearches}</span><span>Total Searches</span></div>
        <div className="metric-card"><span className="metric-value">{analytics.avgResultsPerSearch}</span><span>Avg Results</span></div>
        <div className="metric-card"><span className="metric-value">{analytics.noResultQueries.length}</span><span>No-Result Queries</span></div>
      </div>
      <div className="analytics-grid">
        <div className="panel">
          <h3>Top Queries</h3>
          <table><thead><tr><th>Query</th><th>Count</th></tr></thead>
            <tbody>{analytics.topQueries.slice(0, 10).map(q => <tr key={q.query}><td>{q.query}</td><td>{q.count}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="panel">
          <h3>No-Result Queries</h3>
          <table><thead><tr><th>Query</th><th>Count</th></tr></thead>
            <tbody>{analytics.noResultQueries.slice(0, 10).map(q => <tr key={q.query}><td>{q.query}</td><td>{q.count}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <style>{`
        .search-analytics { padding: 24px; font-family: -apple-system, sans-serif; }
        .analytics-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .metric-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: 700; color: #4F46E5; display: block; }
        .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
        .panel h3 { margin: 0 0 12px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        th { font-weight: 600; color: #6B7280; }
      `}</style>
    </div>
  );
}`;
  }

  // ─── Docs Deploy Configuration ───────────────────────────────

  generateDocsDeployConfig(): Record<string, any> {
    return {
      provider: 'cloudflare-pages',
      projectName: 'sukit-docs',
      domain: 'docs.sukit.dev',
      branch: 'main',
      buildCommand: 'pnpm build:docs',
      outputDir: 'dist/docs',
      environment: {
        NODE_VERSION: '20',
        PNPM_VERSION: '8',
        DOCS_URL: 'https://docs.sukit.dev',
        SEARCH_INDEX: 'true',
        PDF_EXPORT: 'true',
      },
      deployTriggers: [
        { type: 'push', branch: 'main', path: 'apps/docs/**' },
        { type: 'push', branch: 'main', path: 'packages/docs-content/**' },
        { type: 'schedule', cron: '0 6 * * *', description: 'Rebuild with latest content daily' },
      ],
      previewDeployments: {
        enabled: true,
        domainPattern: '{branch}.docs.sukit.dev',
        ttl: 604800,
        autoCleanup: true,
      },
      cacheControl: [
        { pattern: '*.html', ttl: 3600, staleWhileRevalidate: 86400 },
        { pattern: '*.css', ttl: 31536000, immutable: true },
        { pattern: '*.js', ttl: 31536000, immutable: true },
        { pattern: '*.{png,jpg,gif,webp,avif,svg}', ttl: 86400 },
        { pattern: '*.pdf', ttl: 3600 },
      ],
      headers: [
        { path: '/*', headers: { 'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' } },
        { path: '/api/*', headers: { 'Access-Control-Allow-Origin': 'https://app.sukit.dev', 'Access-Control-Allow-Methods': 'GET, POST' } },
      ],
      redirects: [
        { source: '/', destination: '/en/v1/getting-started', statusCode: 302 },
        { source: '/latest', destination: '/en/v1/getting-started', statusCode: 302 },
        { source: '/en', destination: '/en/v1/getting-started', statusCode: 302 },
      ],
      searchConfig: {
        provider: 'algolia',
        indexName: 'sukit-docs',
        apiKey: process.env.ALGOLIA_API_KEY || '',
        appId: process.env.ALGOLIA_APP_ID || '',
        crawlerUrl: 'https://docs.sukit.dev/sitemap.xml',
        schedule: '0 */6 * * *',
      },
      analytics: {
        provider: 'plausible',
        domain: 'docs.sukit.dev',
        selfHostedUrl: process.env.PLAUSIBLE_URL || '',
      },
      monitoring: {
        uptimeChecks: [{ path: '/en/v1/getting-started', interval: 60 }],
        alertOnFailure: true,
        notify: ['docs-team@sukit.dev'],
      },
      sitemap: {
        enabled: true,
        changefreq: 'weekly',
        priority: { root: 1.0, sections: 0.8, articles: 0.6 },
        excludePaths: ['/api/*', '/404', '/search'],
      },
    };
  }

  generateApiPlaygroundHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Playground - SUKIT</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; font-family: -apple-system, sans-serif; }
    #swagger-ui { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .topbar { display: none; }
    .api-key-banner {
      background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;
      padding: 16px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;
    }
    .api-key-banner input { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; }
    .api-key-banner button { padding: 8px 16px; background: #4F46E5; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="api-key-banner">
    <label>API Key:</label>
    <input type="text" id="api-key-input" placeholder="Enter your API key (suk_...)" />
    <button onclick="setApiKey()">Apply</button>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    let apiKey = '';

    function setApiKey() {
      apiKey = document.getElementById('api-key-input').value;
      localStorage.setItem('sukit-api-key', apiKey);
    }

    const savedKey = localStorage.getItem('sukit-api-key');
    if (savedKey) {
      document.getElementById('api-key-input').value = savedKey;
      apiKey = savedKey;
    }

    const ui = SwaggerUIBundle({
      url: '/api/openapi.json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis],
      layout: 'BaseLayout',
      requestInterceptor: (req) => {
        if (apiKey) {
          req.headers['X-API-Key'] = apiKey;
        }
        return req;
      },
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true,
    });
  </script>
</body>
</html>`;
  }
}
