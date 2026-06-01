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
}
