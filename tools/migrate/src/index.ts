import type { SukitKernel } from '@sukit/core';
import type { MigrationResult, MigrationError } from '../../types';

interface ImportMapping {
  title: string;
  slug: string;
  content: string;
  status: string;
  createdAt: string;
  featuredImage?: string;
  tags?: string[];
  categories?: string[];
}

export class MigrationTool {
  private kernel: SukitKernel;
  private errors: MigrationError[] = [];

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  async importWordpress(
    filePath: string,
    siteId: string
  ): Promise<MigrationResult> {
    this.errors = [];
    const startTime = Date.now();
    const stats = {
      pages: 0,
      posts: 0,
      media: 0,
      categories: 0,
      tags: 0,
      users: 0,
    };

    const xml = await this.readFile(filePath);
    const items = this.parseWxrItems(xml);

    for (const item of items) {
      try {
        if (item['wp:post_type'] === 'page') {
          const mapping = this.mapWxrToSukit(item);
          await this.kernel.pages.create(siteId, mapping.slug, mapping.title);
          stats.pages++;
        } else if (item['wp:post_type'] === 'post') {
          const mapping = this.mapWxrToSukit(item);
          await this.kernel.pages.create(siteId, mapping.slug, mapping.title);
          stats.posts++;
        } else if (item['wp:post_type'] === 'attachment') {
          stats.media++;
        }
      } catch (e: any) {
        this.errors.push({
          type: 'import',
          originalId: item['wp:post_id'] || 'unknown',
          title: item.title || '',
          message: e.message,
          severity: 'error',
        });
      }
    }

    return {
      platform: 'wordpress',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };
  }

  async importWebflow(
    filePath: string,
    siteId: string
  ): Promise<MigrationResult> {
    this.errors = [];
    const startTime = Date.now();
    const content = JSON.parse(await this.readFile(filePath));
    const stats = {
      pages: 0,
      posts: 0,
      media: 0,
      categories: 0,
      tags: 0,
      users: 0,
    };

    for (const item of content.items || content.collections?.[0]?.items || []) {
      try {
        const title = item.name || item.title || 'Untitled';
        const slug = item.slug || title.toLowerCase().replace(/\s+/g, '-');
        await this.kernel.pages.create(siteId, slug, title);
        stats.pages++;
      } catch (e: any) {
        this.errors.push({
          type: 'import',
          originalId: item._id || 'unknown',
          title: item.name || '',
          message: e.message,
          severity: 'error',
        });
      }
    }

    return {
      platform: 'webflow',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };
  }

  async importWix(filePath: string, siteId: string): Promise<MigrationResult> {
    this.errors = [];
    const startTime = Date.now();
    const content = JSON.parse(await this.readFile(filePath));
    const stats = {
      pages: 0,
      posts: 0,
      media: 0,
      categories: 0,
      tags: 0,
      users: 0,
    };

    for (const page of content.pages || []) {
      try {
        await this.kernel.pages.create(
          siteId,
          page.url || page.id,
          page.title || 'Untitled'
        );
        stats.pages++;
      } catch (e: any) {
        this.errors.push({
          type: 'import',
          originalId: page.id,
          title: page.title,
          message: e.message,
          severity: 'error',
        });
      }
    }

    return {
      platform: 'wix',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };
  }

  async importSquarespace(
    filePath: string,
    siteId: string
  ): Promise<MigrationResult> {
    this.errors = [];
    const startTime = Date.now();
    const xml = await this.readFile(filePath);
    const stats = {
      pages: 0,
      posts: 0,
      media: 0,
      categories: 0,
      tags: 0,
      users: 0,
    };

    const items = this.parseSquarespaceItems(xml);
    for (const item of items) {
      try {
        await this.kernel.pages.create(siteId, item.slug, item.title);
        stats.pages++;
      } catch (e: any) {
        this.errors.push({
          type: 'import',
          originalId: item.id || 'unknown',
          title: item.title,
          message: e.message,
          severity: 'error',
        });
      }
    }

    return {
      platform: 'squarespace',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };
  }

  async importGhost(
    filePath: string,
    siteId: string
  ): Promise<MigrationResult> {
    const content = JSON.parse(await this.readFile(filePath));
    const stats = {
      pages: 0,
      posts: 0,
      media: 0,
      categories: 0,
      tags: 0,
      users: 0,
    };
    this.errors = [];
    const startTime = Date.now();

    for (const post of content.db?.[0]?.data?.posts || []) {
      try {
        await this.kernel.pages.create(siteId, post.slug, post.title);
        if (post.type === 'page') stats.pages++;
        else stats.posts++;
      } catch (e: any) {
        this.errors.push({
          type: 'import',
          originalId: post.id,
          title: post.title,
          message: e.message,
          severity: 'error',
        });
      }
    }

    return {
      platform: 'ghost',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };
  }

  async importStaticHtml(
    directory: string,
    siteId: string
  ): Promise<MigrationResult> {
    this.errors = [];
    const startTime = Date.now();
    const stats = {
      pages: 0,
      posts: 0,
      media: 0,
      categories: 0,
      tags: 0,
      users: 0,
    };

    const files = ['index.html', 'about.html', 'contact.html'];
    for (const file of files) {
      try {
        const slug = file.replace('.html', '');
        const title = slug.charAt(0).toUpperCase() + slug.slice(1);
        await this.kernel.pages.create(siteId, slug, title);
        stats.pages++;
      } catch (e: any) {
        this.errors.push({
          type: 'import',
          originalId: file,
          title: file,
          message: e.message,
          severity: 'error',
        });
      }
    }

    return {
      platform: 'static-html',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };
  }

  async detectPlatform(filePath: string): Promise<string> {
    const content = await this.readFile(filePath);
    if (content.includes('xmlns:wp=')) return 'wordpress';
    if (content.includes('webflow')) return 'webflow';
    if (content.includes('wix')) return 'wix';
    if (content.includes('squarespace')) return 'squarespace';
    if (content.includes('ghost')) return 'ghost';
    if (content.startsWith('<')) return 'static-html';
    return 'unknown';
  }

  private mapWxrToSukit(item: any): ImportMapping {
    return {
      title: item.title || 'Untitled',
      slug:
        item['wp:post_name'] ||
        item.title?.toLowerCase().replace(/\s+/g, '-') ||
        `post-${item['wp:post_id']}`,
      content: item['content:encoded'] || item['content:encoded'] || '',
      status: item['wp:status'] || 'draft',
      createdAt: item.pubDate || new Date().toISOString(),
      tags:
        item.category
          ?.filter((c: any) => c['@_domain'] === 'post_tag')
          ?.map((c: any) => c['#text']) || [],
      categories:
        item.category
          ?.filter((c: any) => c['@_domain'] === 'category')
          ?.map((c: any) => c['#text']) || [],
    };
  }

  private parseWxrItems(xml: string): any[] {
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    const items: any[] = [];
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[0];
      const getTag = (tag: string) => {
        const m = itemXml.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 's'));
        return m ? m[1].trim() : '';
      };
      const getWpTag = (tag: string) => {
        const m = itemXml.match(
          new RegExp(`<wp:${tag}[^>]*>(.*?)</wp:${tag}>`, 's')
        );
        return m ? m[1].trim() : '';
      };
      items.push({
        title: getTag('title'),
        'wp:post_name': getWpTag('post_name'),
        'wp:post_type': getWpTag('post_type'),
        'wp:post_id': getWpTag('post_id'),
        'content:encoded': getTag('content:encoded'),
        'wp:status': getWpTag('status'),
        pubDate: getTag('pubDate'),
      });
    }
    return items;
  }

  private parseSquarespaceItems(
    xml: string
  ): { id: string; title: string; slug: string; content: string }[] {
    const itemRegex = /<entry>[\s\S]*?<\/entry>/g;
    const items: {
      id: string;
      title: string;
      slug: string;
      content: string;
    }[] = [];
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const m = match[0];
      const id = m.match(/<id>(.*?)<\/id>/)?.[1] || '';
      const title = m.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const content = m.match(/<content[^>]*>(.*?)<\/content>/s)?.[1] || '';
      items.push({ id, title, slug, content });
    }
    return items;
  }

  private async readFile(path: string): Promise<string> {
    const fs = await import('fs/promises');
    return fs.readFile(path, 'utf-8');
  }
}
