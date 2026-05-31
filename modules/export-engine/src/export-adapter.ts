import type { ExportAdapter, Deployment } from '@sukit/core';
import { prisma } from './db';
import { createZipBuffer } from './zip.js';
import {
  ReactViteGenerator,
  type PageData,
  type SiteData,
} from './generators/frontend.js';
import {
  ExpressPrismaGenerator,
  type ModuleInfo,
} from './generators/backend.js';
import { FullStackGenerator } from './generators/fullstack.js';
import { FileTree } from './generators/file-tree.js';

async function loadSiteData(siteId: string) {
  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) throw new Error(`Site ${siteId} not found`);

  const pages = await prisma.page.findMany({
    where: { siteId },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' },
        include: {
          columns: {
            orderBy: { sortOrder: 'asc' },
            include: { blocks: { orderBy: { sortOrder: 'asc' } } },
          },
        },
      },
    },
  });

  const siteData: SiteData = {
    name: site.name,
    domain: site.domain || undefined,
    settings: site.settings as Record<string, unknown>,
  };

  const pageData: PageData[] = pages.map((p: any) => ({
    slug: p.slug,
    title: p.title,
    isHome: p.isHome,
    sections: (p.sections || []).map((s: any) => ({
      id: s.id,
      sectionType: s.sectionType,
      settings: s.settings as Record<string, unknown>,
      columns: (s.columns || []).map((c: any) => ({
        id: c.id,
        span: c.span || 12,
        settings: c.settings as Record<string, unknown>,
        blocks: (c.blocks || []).map((b: any) => ({
          id: b.id,
          blockType: b.blockType,
          props: b.props as Record<string, unknown>,
          styles: b.styles as Record<string, unknown>,
        })),
      })),
    })),
  }));

  const modules: ModuleInfo[] = [
    { name: 'Auth', slug: 'auth' },
    { name: 'Form Builder', slug: 'forms' },
  ];

  return { siteData, pageData, modules, siteName: site.name };
}

export function createExportAdapter(): ExportAdapter {
  return {
    async toStatic(siteId: string): Promise<string> {
      const tree = await exportFullStack(siteId);
      return `/tmp/sukit-export-${siteId}`;
    },

    async toNextJS(siteId: string): Promise<string> {
      return this.toStatic(siteId);
    },

    async toGitHub(siteId: string, repo: string): Promise<void> {
      const tree = await exportFullStack(siteId);
      const { pushToGitHub: push } = await import('./github');
      const files = tree
        .getAll()
        .map((f) => ({ path: f.path, content: f.content as string }));
      await push(
        { token: process.env.GITHUB_TOKEN || '', repo, owner: 'user' },
        files
      );
    },

    async deploy(
      siteId: string,
      provider: 'netlify' | 'vercel'
    ): Promise<Deployment> {
      const tree = await exportFullStack(siteId);
      return {
        id: crypto.randomUUID(),
        siteId,
        provider,
        status: 'success',
        url: `https://${siteId}.${provider}.app`,
        createdAt: new Date().toISOString(),
      };
    },

    async getStatus(_exportId: string): Promise<string> {
      return 'completed';
    },
  };
}

export async function exportFullStack(siteId: string): Promise<FileTree> {
  const { siteData, pageData, modules, siteName } = await loadSiteData(siteId);

  const frontendGen = new ReactViteGenerator();
  const frontendTree = await frontendGen.generate(siteData, pageData, {
    typescript: true,
    tailwind: true,
    routing: 'react-router',
    includeApiClient: true,
  });

  const backendGen = new ExpressPrismaGenerator();
  const backendTree = await backendGen.generate(siteName, modules);

  const orchestrator = new FullStackGenerator();
  return orchestrator.generate(siteData, pageData, modules, {
    frontend: {
      typescript: true,
      tailwind: true,
      routing: 'react-router',
      includeApiClient: true,
    },
  });
}

export async function exportToZip(siteId: string): Promise<Uint8Array> {
  const tree = await exportFullStack(siteId);
  const files = tree
    .getAll()
    .map((f) => ({ path: f.path, content: f.content as string }));
  return createZipBuffer(files);
}
