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
  seo?: {
    description?: string;
    ogImage?: string;
    focusKeyword?: string;
  };
}

interface SukitBlock {
  id: string;
  blockType: string;
  props: Record<string, any>;
  styles?: Record<string, any>;
  children?: SukitBlock[];
}

interface MigratingUser {
  username: string;
  email: string;
  role: string;
}

interface ImportComment {
  id: string;
  author: string;
  authorEmail: string;
  content: string;
  status: string;
  postId: string;
  createdAt: string;
}

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  alt?: string;
}

type ErrorStrategy = 'skip' | 'abort' | 'retry';

type ProgressCallback = (step: string, current: number, total: number) => void;

interface DryRunResult {
  platform: string;
  estimatedPages: number;
  estimatedPosts: number;
  estimatedMedia: number;
  estimatedCategories: number;
  estimatedTags: number;
  estimatedUsers: number;
  errors: MigrationError[];
  duration: number;
}

export class MigrationTool {
  private kernel: SukitKernel;
  private errors: MigrationError[] = [];
  private errorStrategy: ErrorStrategy = 'abort';
  private lastImportTimestamp: number = 0;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  setErrorStrategy(strategy: ErrorStrategy): void {
    this.errorStrategy = strategy;
  }

  setLastImport(timestamp: number): void {
    this.lastImportTimestamp = timestamp;
  }

  getLastImport(): number {
    return this.lastImportTimestamp;
  }

  convertWpBlocks(wpContent: string): SukitBlock[] {
    const blocks: SukitBlock[] = [];
    const blockRegex =
      /<!--\s+wp:(\w+(?:\/\w+)?)(?:\s+(\{.*?\}))?\s+-->(.*?)<!--\s+\/wp:\1\s+-->/gs;
    let blockIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(wpContent)) !== null) {
      const [, blockName, attrsJson, innerContent] = match;
      const attrs = attrsJson ? JSON.parse(attrsJson) : {};
      const id = `migrated-block-${blockIndex++}`;

      const block = this.mapWpBlockToSukit(id, blockName, attrs, innerContent);
      if (block) blocks.push(block);
    }

    if (blocks.length === 0) {
      blocks.push({
        id: 'migrated-block-0',
        blockType: 'sukit/rich-text',
        props: { html: wpContent },
      });
    }

    return blocks;
  }

  private mapWpBlockToSukit(
    id: string,
    wpBlockName: string,
    attrs: Record<string, any>,
    innerContent: string
  ): SukitBlock | null {
    switch (wpBlockName) {
      case 'core/paragraph':
        return {
          id,
          blockType: 'sukit/rich-text',
          props: { html: attrs.content || innerContent.trim() || '' },
          styles: {
            fontSize: attrs.fontSize || undefined,
            textAlign: attrs.align || undefined,
            color: attrs.textColor || undefined,
          },
        };

      case 'core/heading':
        return {
          id,
          blockType: 'sukit/heading',
          props: {
            text: attrs.content || innerContent.trim() || '',
            level: attrs.level || 2,
          },
          styles: { textAlign: attrs.align || undefined },
        };

      case 'core/image': {
        const caption = attrs.caption || '';
        return {
          id,
          blockType: 'sukit/image',
          props: {
            src: attrs.url || attrs.id || '',
            alt: attrs.alt || caption,
            caption,
            width: attrs.width || undefined,
            height: attrs.height || undefined,
          },
        };
      }

      case 'core/list': {
        const items = this.parseListItems(innerContent);
        return {
          id,
          blockType: 'sukit/list',
          props: {
            items,
            ordered: attrs.ordered || false,
            type: attrs.ordered ? 'ol' : 'ul',
          },
        };
      }

      case 'core/quote': {
        const citation = attrs.citation || '';
        return {
          id,
          blockType: 'sukit/quote',
          props: {
            text: innerContent.trim(),
            citation,
            align: attrs.align || 'center',
            style: attrs.style || 'default',
          },
        };
      }

      case 'core/columns': {
        const columnRegex =
          /<!--\s+wp:column\s*\{?\s*\}?\s*-->(.*?)<!--\s+\/wp:column\s+-->/gs;
        const columnContents: string[] = [];
        let colMatch: RegExpExecArray | null;
        while ((colMatch = columnRegex.exec(innerContent)) !== null) {
          columnContents.push(colMatch[1].trim());
        }
        return {
          id,
          blockType: 'sukit/columns',
          props: {
            columns: columnContents.map((col, i) => ({
              id: `${id}-col-${i}`,
              width: attrs.columns
                ? `${100 / (attrs.columns || columnContents.length)}%`
                : undefined,
              blocks: this.convertWpBlocks(col),
            })),
            layout: attrs.layout || 'equal',
            gap: attrs.gap || 'normal',
          },
        };
      }

      case 'core/buttons': {
        const btnRegex =
          /<!--\s+wp:button\s*\{?\s*\}?\s*-->(.*?)<!--\s+\/wp:button\s+-->/gs;
        const buttons: Record<string, any>[] = [];
        let btnMatch: RegExpExecArray | null;
        while ((btnMatch = btnRegex.exec(innerContent)) !== null) {
          const btnHtml = btnMatch[1];
          const urlMatch = btnHtml.match(/href="([^"]*)"/);
          const textMatch = btnHtml.match(/>([^<]*)</);
          buttons.push({
            text: textMatch?.[1]?.trim() || 'Button',
            url: urlMatch?.[1] || '#',
          });
        }
        return {
          id,
          blockType: 'sukit/buttons',
          props: { buttons },
        };
      }

      case 'core/separator':
        return {
          id,
          blockType: 'sukit/divider',
          props: {
            style: attrs.style || 'default',
            color: attrs.color || undefined,
          },
        };

      case 'core/spacer':
        return {
          id,
          blockType: 'sukit/spacer',
          props: {
            height: attrs.height || 50,
          },
        };

      default:
        return null;
    }
  }

  private parseListItems(innerContent: string): string[] {
    const items: string[] = [];
    const itemRegex = /<li>(.*?)<\/li>/gs;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(innerContent)) !== null) {
      items.push(match[1].trim());
    }
    return items;
  }

  async downloadMedia(url: string, siteId: string): Promise<MediaItem | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const buffer = Buffer.from(await response.arrayBuffer());
      const urlPath = new URL(url).pathname;
      const filename = urlPath.split('/').pop() || 'untitled';
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        mp4: 'video/mp4',
        webm: 'video/webm',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        pdf: 'application/pdf',
        zip: 'application/zip',
        csv: 'text/csv',
        json: 'application/json',
      };
      const mimeType = mimeMap[ext] || 'application/octet-stream';

      return {
        id: filename.replace(/[^a-zA-Z0-9._-]/g, '_'),
        url,
        filename,
        mimeType,
        alt: filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      };
    } catch {
      return null;
    }
  }

  async importMedia(
    items: { url: string; alt?: string }[],
    siteId: string,
    options?: { dryRun?: boolean; onProgress?: ProgressCallback }
  ): Promise<number> {
    let imported = 0;
    const total = items.length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      options?.onProgress?.('media', i + 1, total);

      if (options?.dryRun) {
        imported++;
        continue;
      }

      const media = await this.downloadMedia(item.url, siteId);
      if (!media) {
        this.errors.push({
          type: 'media',
          originalId: item.url,
          title: item.url,
          message: `Failed to download: ${item.url}`,
          severity: 'error',
        });
        continue;
      }

      try {
        await this.kernel.media.upload(siteId, media.filename, media.mimeType);
        imported++;
      } catch (e: any) {
        this.errors.push({
          type: 'media',
          originalId: media.id,
          title: media.filename,
          message: e.message,
          severity: 'error',
        });
      }
    }

    return imported;
  }

  async importUsers(
    users: MigratingUser[],
    siteId: string,
    options?: { dryRun?: boolean; onProgress?: ProgressCallback }
  ): Promise<number> {
    let imported = 0;
    const total = users.length;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      options?.onProgress?.('users', i + 1, total);

      if (options?.dryRun) {
        imported++;
        continue;
      }

      try {
        await this.kernel.sites.invite(siteId, user.email, user.role);
        imported++;
      } catch (e: any) {
        this.errors.push({
          type: 'user',
          originalId: user.email,
          title: user.username,
          message: e.message,
          severity: 'error',
        });
      }
    }

    return imported;
  }

  async importComments(
    comments: ImportComment[],
    siteId: string,
    options?: { dryRun?: boolean; onProgress?: ProgressCallback }
  ): Promise<number> {
    let imported = 0;
    const total = comments.length;

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      options?.onProgress?.('comments', i + 1, total);

      if (options?.dryRun) {
        imported++;
        continue;
      }

      try {
        await this.kernel.events.emit('comment:create', {
          siteId,
          postId: comment.postId,
          author: comment.author,
          authorEmail: comment.authorEmail,
          content: comment.content,
          status: comment.status || 'approved',
          createdAt: comment.createdAt,
        });
        imported++;
      } catch (e: any) {
        this.errors.push({
          type: 'comment',
          originalId: comment.id,
          title: `Comment by ${comment.author}`,
          message: e.message,
          severity: 'error',
        });
      }
    }

    return imported;
  }

  preserveSeo(item: any): ImportMapping['seo'] {
    const seo: ImportMapping['seo'] = {};

    const metaDesc =
      item['wp:postmeta']?.find(
        (m: any) => m['wp:meta_key'] === '_yoast_wpseo_metadesc'
      )?.['wp:meta_value'] ||
      item['wp:postmeta']?.find(
        (m: any) => m['wp:meta_key'] === '_aioseop_description'
      )?.['wp:meta_value'] ||
      item['excerpt:encoded'] ||
      '';

    const ogImage =
      item['wp:postmeta']?.find(
        (m: any) => m['wp:meta_key'] === '_yoast_wpseo_opengraph-image'
      )?.['wp:meta_value'] ||
      item['wp:postmeta']?.find(
        (m: any) => m['wp:meta_key'] === '_aioseop_opengraph_settings'
      )?.['wp:meta_value'] ||
      item['wp:postmeta']?.find((m: any) => m['wp:meta_key'] === 'og:image')?.[
        'wp:meta_value'
      ] ||
      '';

    const focusKeyword =
      item['wp:postmeta']?.find(
        (m: any) => m['wp:meta_key'] === '_yoast_wpseo_focuskw'
      )?.['wp:meta_value'] ||
      item['wp:postmeta']?.find(
        (m: any) => m['wp:meta_key'] === '_aioseop_keywords'
      )?.['wp:meta_value'] ||
      '';

    if (metaDesc) seo.description = metaDesc;
    if (ogImage) seo.ogImage = ogImage;
    if (focusKeyword) seo.focusKeyword = focusKeyword;

    return Object.keys(seo).length > 0 ? seo : undefined;
  }

  private async withErrorRecovery<T>(
    label: string,
    fn: () => Promise<T>,
    onError: (err: any) => void
  ): Promise<T | false> {
    const maxRetries = this.errorStrategy === 'retry' ? 3 : 1;
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (e: any) {
        lastError = e;
        if (this.errorStrategy === 'abort') {
          onError(e);
          throw e;
        }
        if (this.errorStrategy === 'retry' && attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        onError(e);
        return false;
      }
    }

    return false;
  }

  async importWordpress(
    filePath: string,
    siteId: string,
    options?: {
      dryRun?: boolean;
      incremental?: boolean;
      onProgress?: ProgressCallback;
    }
  ): Promise<MigrationResult | DryRunResult> {
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

    const cutOff = options?.incremental ? this.lastImportTimestamp : 0;
    const filteredItems = cutOff
      ? items.filter((item) => {
          const ts = new Date(item.pubDate || 0).getTime();
          return ts > cutOff;
        })
      : items;

    const total = filteredItems.length;

    for (let idx = 0; idx < filteredItems.length; idx++) {
      const item = filteredItems[idx];
      options?.onProgress?.('items', idx + 1, total);

      const recoveryResult = await this.withErrorRecovery(
        `import-wordpress-${item['wp:post_id']}`,
        async () => {
          if (item['wp:post_type'] === 'page') {
            const mapping = this.mapWxrToSukit(item);

            if (!options?.dryRun) {
              await this.kernel.pages.create(
                siteId,
                mapping.slug,
                mapping.title,
                {
                  content: mapping.content,
                  status: mapping.status,
                  metadata: mapping.seo ? { seo: mapping.seo } : undefined,
                }
              );
            }

            stats.pages++;
          } else if (item['wp:post_type'] === 'post') {
            const mapping = this.mapWxrToSukit(item);

            if (!options?.dryRun) {
              await this.kernel.pages.create(
                siteId,
                mapping.slug,
                mapping.title,
                {
                  content: mapping.content,
                  status: mapping.status,
                  metadata: mapping.seo ? { seo: mapping.seo } : undefined,
                }
              );
            }

            stats.posts++;
          } else if (item['wp:post_type'] === 'attachment') {
            stats.media++;
          }

          if (!options?.dryRun) {
            await this.kernel.events.emit('migration:progress', {
              platform: 'wordpress',
              step: 'items',
              current: idx + 1,
              total,
            });
          }
        },
        (e: any) => {
          this.errors.push({
            type: 'import',
            originalId: item['wp:post_id'] || 'unknown',
            title: item.title || '',
            message: e.message,
            severity: 'error',
          });
        }
      );

      if (recoveryResult === false && this.errorStrategy === 'abort') {
        break;
      }
    }

    const result = {
      platform: 'wordpress',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };

    if (options?.dryRun) {
      return {
        platform: 'wordpress',
        estimatedPages: stats.pages,
        estimatedPosts: stats.posts,
        estimatedMedia: stats.media,
        estimatedCategories: stats.categories,
        estimatedTags: stats.tags,
        estimatedUsers: stats.users,
        errors: this.errors,
        duration: Date.now() - startTime,
      };
    }

    this.lastImportTimestamp = Date.now();
    return result;
  }

  async importWebflow(
    filePath: string,
    siteId: string,
    options?: {
      dryRun?: boolean;
      incremental?: boolean;
      onProgress?: ProgressCallback;
    }
  ): Promise<MigrationResult | DryRunResult> {
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

    const items = content.items || content.collections?.[0]?.items || [];
    const cutOff = options?.incremental ? this.lastImportTimestamp : 0;
    const filteredItems = cutOff
      ? items.filter((item: any) => {
          const ts = new Date(item.updatedOn || item.createdOn || 0).getTime();
          return ts > cutOff;
        })
      : items;

    const total = filteredItems.length;

    for (let idx = 0; idx < filteredItems.length; idx++) {
      const item = filteredItems[idx];
      options?.onProgress?.('items', idx + 1, total);

      const recoveryResult = await this.withErrorRecovery(
        `import-webflow-${item._id}`,
        async () => {
          const title = item.name || item.title || 'Untitled';
          const slug = item.slug || title.toLowerCase().replace(/\s+/g, '-');

          if (!options?.dryRun) {
            await this.kernel.pages.create(siteId, slug, title);
          }

          stats.pages++;

          if (!options?.dryRun) {
            await this.kernel.events.emit('migration:progress', {
              platform: 'webflow',
              step: 'items',
              current: idx + 1,
              total,
            });
          }
        },
        (e: any) => {
          this.errors.push({
            type: 'import',
            originalId: item._id || 'unknown',
            title: item.name || '',
            message: e.message,
            severity: 'error',
          });
        }
      );

      if (recoveryResult === false && this.errorStrategy === 'abort') {
        break;
      }
    }

    const result = {
      platform: 'webflow',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };

    if (options?.dryRun) {
      return {
        platform: 'webflow',
        estimatedPages: stats.pages,
        estimatedPosts: stats.posts,
        estimatedMedia: stats.media,
        estimatedCategories: stats.categories,
        estimatedTags: stats.tags,
        estimatedUsers: stats.users,
        errors: this.errors,
        duration: Date.now() - startTime,
      };
    }

    this.lastImportTimestamp = Date.now();
    return result;
  }

  async importWix(
    filePath: string,
    siteId: string,
    options?: {
      dryRun?: boolean;
      incremental?: boolean;
      onProgress?: ProgressCallback;
    }
  ): Promise<MigrationResult | DryRunResult> {
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

    const pages = content.pages || [];
    const cutOff = options?.incremental ? this.lastImportTimestamp : 0;
    const filtered = cutOff
      ? pages.filter((p: any) => {
          const ts = new Date(p.updatedAt || p.createdAt || 0).getTime();
          return ts > cutOff;
        })
      : pages;

    const total = filtered.length;

    for (let idx = 0; idx < filtered.length; idx++) {
      const page = filtered[idx];
      options?.onProgress?.('items', idx + 1, total);

      const recoveryResult = await this.withErrorRecovery(
        `import-wix-${page.id}`,
        async () => {
          if (!options?.dryRun) {
            await this.kernel.pages.create(
              siteId,
              page.url || page.id,
              page.title || 'Untitled'
            );
          }

          stats.pages++;

          if (!options?.dryRun) {
            await this.kernel.events.emit('migration:progress', {
              platform: 'wix',
              step: 'items',
              current: idx + 1,
              total,
            });
          }
        },
        (e: any) => {
          this.errors.push({
            type: 'import',
            originalId: page.id,
            title: page.title,
            message: e.message,
            severity: 'error',
          });
        }
      );

      if (recoveryResult === false && this.errorStrategy === 'abort') {
        break;
      }
    }

    const result = {
      platform: 'wix',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };

    if (options?.dryRun) {
      return {
        platform: 'wix',
        estimatedPages: stats.pages,
        estimatedPosts: stats.posts,
        estimatedMedia: stats.media,
        estimatedCategories: stats.categories,
        estimatedTags: stats.tags,
        estimatedUsers: stats.users,
        errors: this.errors,
        duration: Date.now() - startTime,
      };
    }

    this.lastImportTimestamp = Date.now();
    return result;
  }

  async importSquarespace(
    filePath: string,
    siteId: string,
    options?: {
      dryRun?: boolean;
      incremental?: boolean;
      onProgress?: ProgressCallback;
    }
  ): Promise<MigrationResult | DryRunResult> {
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
    const cutOff = options?.incremental ? this.lastImportTimestamp : 0;
    const filteredItems = cutOff
      ? items.filter((item) => {
          const ts = new Date(item.pubDate || 0).getTime();
          return ts > cutOff;
        })
      : items;

    const total = filteredItems.length;

    for (let idx = 0; idx < filteredItems.length; idx++) {
      const item = filteredItems[idx];
      options?.onProgress?.('items', idx + 1, total);

      const recoveryResult = await this.withErrorRecovery(
        `import-squarespace-${item.id}`,
        async () => {
          if (!options?.dryRun) {
            await this.kernel.pages.create(siteId, item.slug, item.title);
          }

          stats.pages++;

          if (!options?.dryRun) {
            await this.kernel.events.emit('migration:progress', {
              platform: 'squarespace',
              step: 'items',
              current: idx + 1,
              total,
            });
          }
        },
        (e: any) => {
          this.errors.push({
            type: 'import',
            originalId: item.id || 'unknown',
            title: item.title,
            message: e.message,
            severity: 'error',
          });
        }
      );

      if (recoveryResult === false && this.errorStrategy === 'abort') {
        break;
      }
    }

    const result = {
      platform: 'squarespace',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };

    if (options?.dryRun) {
      return {
        platform: 'squarespace',
        estimatedPages: stats.pages,
        estimatedPosts: stats.posts,
        estimatedMedia: stats.media,
        estimatedCategories: stats.categories,
        estimatedTags: stats.tags,
        estimatedUsers: stats.users,
        errors: this.errors,
        duration: Date.now() - startTime,
      };
    }

    this.lastImportTimestamp = Date.now();
    return result;
  }

  async importGhost(
    filePath: string,
    siteId: string,
    options?: {
      dryRun?: boolean;
      incremental?: boolean;
      onProgress?: ProgressCallback;
    }
  ): Promise<MigrationResult | DryRunResult> {
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

    const posts = content.db?.[0]?.data?.posts || [];
    const cutOff = options?.incremental ? this.lastImportTimestamp : 0;
    const filtered = cutOff
      ? posts.filter((p: any) => {
          const ts = new Date(p.updated_at || p.created_at || 0).getTime();
          return ts > cutOff;
        })
      : posts;

    const total = filtered.length;

    for (let idx = 0; idx < filtered.length; idx++) {
      const post = filtered[idx];
      options?.onProgress?.('items', idx + 1, total);

      const recoveryResult = await this.withErrorRecovery(
        `import-ghost-${post.id}`,
        async () => {
          if (!options?.dryRun) {
            await this.kernel.pages.create(siteId, post.slug, post.title);
          }

          if (post.type === 'page') stats.pages++;
          else stats.posts++;

          if (!options?.dryRun) {
            await this.kernel.events.emit('migration:progress', {
              platform: 'ghost',
              step: 'items',
              current: idx + 1,
              total,
            });
          }
        },
        (e: any) => {
          this.errors.push({
            type: 'import',
            originalId: post.id,
            title: post.title,
            message: e.message,
            severity: 'error',
          });
        }
      );

      if (recoveryResult === false && this.errorStrategy === 'abort') {
        break;
      }
    }

    const result = {
      platform: 'ghost',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };

    if (options?.dryRun) {
      return {
        platform: 'ghost',
        estimatedPages: stats.pages,
        estimatedPosts: stats.posts,
        estimatedMedia: stats.media,
        estimatedCategories: stats.categories,
        estimatedTags: stats.tags,
        estimatedUsers: stats.users,
        errors: this.errors,
        duration: Date.now() - startTime,
      };
    }

    this.lastImportTimestamp = Date.now();
    return result;
  }

  async importStaticHtml(
    directory: string,
    siteId: string,
    options?: {
      dryRun?: boolean;
      incremental?: boolean;
      onProgress?: ProgressCallback;
    }
  ): Promise<MigrationResult | DryRunResult> {
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
    const total = files.length;

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      options?.onProgress?.('items', idx + 1, total);

      const recoveryResult = await this.withErrorRecovery(
        `import-static-${file}`,
        async () => {
          const slug = file.replace('.html', '');
          const title = slug.charAt(0).toUpperCase() + slug.slice(1);

          if (!options?.dryRun) {
            await this.kernel.pages.create(siteId, slug, title);
          }

          stats.pages++;

          if (!options?.dryRun) {
            await this.kernel.events.emit('migration:progress', {
              platform: 'static-html',
              step: 'items',
              current: idx + 1,
              total,
            });
          }
        },
        (e: any) => {
          this.errors.push({
            type: 'import',
            originalId: file,
            title: file,
            message: e.message,
            severity: 'error',
          });
        }
      );

      if (recoveryResult === false && this.errorStrategy === 'abort') {
        break;
      }
    }

    const result = {
      platform: 'static-html',
      ...stats,
      errors: this.errors,
      duration: Date.now() - startTime,
    };

    if (options?.dryRun) {
      return {
        platform: 'static-html',
        estimatedPages: stats.pages,
        estimatedPosts: stats.posts,
        estimatedMedia: stats.media,
        estimatedCategories: stats.categories,
        estimatedTags: stats.tags,
        estimatedUsers: stats.users,
        errors: this.errors,
        duration: Date.now() - startTime,
      };
    }

    this.lastImportTimestamp = Date.now();
    return result;
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
      seo: this.preserveSeo(item),
    };
  }

  private parseWxrItems(xml: string): any[] {
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    const items: any[] = [];
    let match: RegExpExecArray | null;
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
      const getPostMeta = () => {
        const metas: any[] = [];
        const metaRegex = /<wp:postmeta>[\s\S]*?<\/wp:postmeta>/g;
        let metaMatch: RegExpExecArray | null;
        while ((metaMatch = metaRegex.exec(itemXml)) !== null) {
          const metaXml = metaMatch[0];
          const key =
            metaXml.match(/<wp:meta_key>(.*?)<\/wp:meta_key>/)?.[1] || '';
          const value =
            metaXml.match(/<wp:meta_value>(.*?)<\/wp:meta_value>/)?.[1] || '';
          metas.push({ 'wp:meta_key': key, 'wp:meta_value': value });
        }
        return metas;
      };
      items.push({
        title: getTag('title'),
        'wp:post_name': getWpTag('post_name'),
        'wp:post_type': getWpTag('post_type'),
        'wp:post_id': getWpTag('post_id'),
        'content:encoded': getTag('content:encoded'),
        'wp:status': getWpTag('status'),
        pubDate: getTag('pubDate'),
        'excerpt:encoded': getTag('excerpt:encoded'),
        'wp:postmeta': getPostMeta(),
      });
    }
    return items;
  }

  private parseSquarespaceItems(xml: string): {
    id: string;
    title: string;
    slug: string;
    content: string;
    pubDate?: string;
  }[] {
    const itemRegex = /<entry>[\s\S]*?<\/entry>/g;
    const items: {
      id: string;
      title: string;
      slug: string;
      content: string;
      pubDate?: string;
    }[] = [];
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xml)) !== null) {
      const m = match[0];
      const id = m.match(/<id>(.*?)<\/id>/)?.[1] || '';
      const title = m.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const content = m.match(/<content[^>]*>(.*?)<\/content>/s)?.[1] || '';
      const pubDate = m.match(/<published>(.*?)<\/published>/)?.[1] || '';
      items.push({ id, title, slug, content, pubDate });
    }
    return items;
  }

  private async readFile(path: string): Promise<string> {
    const fs = await import('fs/promises');
    return fs.readFile(path, 'utf-8');
  }
}
