import fs from 'fs-extra';
import path from 'path';
import { prisma } from '@/lib/db/prisma';
import { renderBlock } from './block-renderer';

interface BuildFile {
  path: string;
  content: string;
}

interface BuildResult {
  files: BuildFile[];
  sitemap: string;
  robots: string;
  pageCount: number;
  assetCount: number;
  totalSize: number;
}

interface BuildOptions {
  outputDir?: string;
  minify?: boolean;
  cleanBeforeBuild?: boolean;
}

export async function buildSite(
  siteId: string,
  outputDir: string,
  options: BuildOptions = {}
): Promise<BuildResult> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      pages: {
        include: {
          sections: {
            orderBy: { sortOrder: 'asc' },
            include: {
              columns: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  blocks: { orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
        },
      },
      posts: {
        where: { status: 'PUBLISHED' },
        include: {
          author: { select: { name: true } },
          taxonomies: { include: { taxonomy: true } },
        },
        orderBy: { publishedAt: 'desc' },
      },
      taxonomies: {
        include: {
          terms: true,
          _count: { select: { posts: true } },
        },
      },
      widgetAreas: true,
      media: true,
    },
  });

  if (!site) throw new Error(`Site ${siteId} not found`);

  if (options.cleanBeforeBuild) {
    await fs.emptyDir(outputDir);
  }

  const settings = (site.settings as Record<string, any>) || {};
  const seo = settings.seo || {};
  const domain = site.domain || site.host || '';
  const files: BuildFile[] = [];
  let totalSize = 0;

  for (const page of site.pages) {
    const headHtml = (page.pageSettings as any)?.headHtml || '';
    const title = (page.metadata as any)?.title || seo.defaultTitle || '';
    const description =
      (page.metadata as any)?.description || seo.defaultDescription || '';

    const sectionsHtml = page.sections
      .map((section) => {
        const sectionSettings = (section.settings as Record<string, any>) || {};
        const bg = sectionSettings.backgroundColor || 'transparent';
        const pt = sectionSettings.paddingTop ?? 40;
        const pb = sectionSettings.paddingBottom ?? 40;
        const maxWidth = sectionSettings.maxWidth || '1200px';

        const columnsHtml = section.columns
          .map((col) => {
            const colSettings = (col.settings as Record<string, any>) || {};
            const span = col.span || 12;
            const colBg = colSettings.backgroundColor || 'transparent';
            const colPt = colSettings.paddingTop ?? 0;
            const colPb = colSettings.paddingBottom ?? 0;

            const blocksHtml = col.blocks
              .map((block) => {
                const blockStyles =
                  (block.styles as Record<string, unknown>) || {};
                const blockProps =
                  (block.props as Record<string, unknown>) || {};
                return renderBlock({
                  blockType: block.blockType,
                  props: blockProps,
                  styles: blockStyles,
                  id: block.id,
                });
              })
              .join('\n');

            return `<div style="grid-column:span ${span};background-color:${colBg};padding:${colPt}px 0 ${colPb}px">${blocksHtml}</div>`;
          })
          .join('\n');

        return `<section style="background-color:${bg};padding:${pt}px 16px ${pb}px">
  <div style="max-width:${maxWidth};margin:0 auto">
    <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:16px">
${columnsHtml}
    </div>
  </div>
</section>`;
      })
      .join('\n');

    const pagePath = page.isHome ? 'index.html' : `${page.slug}/index.html`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title || page.slug)}</title>
  <meta name="description" content="${escHtml(description)}" />
  ${headHtml}
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;color:#111827;background:#fff;line-height:1.5}
    img,video,iframe{max-width:100%;height:auto}
    a{color:inherit}
    @media(max-width:768px){section{padding-left:8px!important;padding-right:8px!important}}
  </style>
</head>
<body>
${sectionsHtml}
</body>
</html>`;

    const content = options.minify ? minifyHtml(html) : html;
    files.push({ path: pagePath, content });
    totalSize += Buffer.byteLength(content, 'utf-8');
  }

  if (site.posts.length > 0) {
    const blogHtml = generateBlogArchive(site.posts, site.name, seo);
    files.push({
      path: 'blog/index.html',
      content: options.minify ? minifyHtml(blogHtml) : blogHtml,
    });

    for (const post of site.posts) {
      const postHtml = generatePostPage(post, site.widgetAreas);
      files.push({
        path: `blog/${post.slug}/index.html`,
        content: options.minify ? minifyHtml(postHtml) : postHtml,
      });
      totalSize += Buffer.byteLength(postHtml, 'utf-8');
    }

    for (const taxonomy of site.taxonomies) {
      const postsInTax = site.posts.filter((p) =>
        p.taxonomies.some((pt) => pt.taxonomy.id === taxonomy.id)
      );
      if (postsInTax.length === 0) continue;
      const archiveHtml = generateTaxonomyArchive(
        taxonomy,
        postsInTax,
        site.name,
        seo
      );
      files.push({
        path: `${taxonomy.type}/${taxonomy.slug}/index.html`,
        content: options.minify ? minifyHtml(archiveHtml) : archiveHtml,
      });
    }
  }

  if (site.widgetAreas.length > 0) {
    const sidebarHtml = generateWidgetAreas(site.widgetAreas);
    for (const f of files) {
      if (f.path.endsWith('.html') && !f.path.includes('/blog/')) {
        f.content = f.content.replace('</body>', `${sidebarHtml}\n</body>`);
      }
    }
  }

  const sitemap = generateSitemap(site.pages, site.posts, domain);
  const robots = generateRobots(domain);

  files.push({ path: 'sitemap.xml', content: sitemap });
  files.push({ path: 'robots.txt', content: robots });

  return {
    files,
    sitemap,
    robots,
    pageCount: site.pages.length + site.posts.length,
    assetCount: site.media.length,
    totalSize,
  };
}

function generateBlogArchive(posts: any[], siteName: string, seo: any): string {
  const items = posts
    .map(
      (p) => `
    <article style="margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #e2e8f0">
      <h2 style="font-size:1.5rem;margin-bottom:0.25rem"><a href="/blog/${escHtml(p.slug)}/" style="color:#0f172a;text-decoration:none">${escHtml(p.title)}</a></h2>
      <div style="font-size:0.875rem;color:#64748b;margin-bottom:0.5rem">${p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ''} by ${escHtml(p.author?.name || '')}</div>
      ${p.excerpt ? `<p style="color:#475569;line-height:1.6">${escHtml(p.excerpt)}</p>` : ''}
      <div style="margin-top:0.5rem">${p.taxonomies.map((pt: any) => `<a href="/${escHtml(pt.taxonomy.type)}/${escHtml(pt.taxonomy.slug)}/" style="display:inline-block;padding:0.125rem 0.5rem;background:#e2e8f0;border-radius:4px;font-size:0.75rem;margin-right:0.25rem;color:#475569;text-decoration:none">${escHtml(pt.taxonomy.name)}</a>`).join('')}</div>
    </article>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Blog - ${escHtml(siteName)}</title><meta name="description" content="${escHtml(seo.defaultDescription || '')}"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background:#fff;line-height:1.5;padding:2rem 1rem">
  <div style="max-width:800px;margin:0 auto">
    <h1 style="font-size:2rem;margin-bottom:2rem">Blog</h1>
    ${items}
  </div>
</body></html>`;
}

function generatePostPage(post: any, widgetAreas: any[]): string {
  const comments = post.comments || [];
  const commentsHtml =
    comments.length > 0
      ? `
    <section style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid #e2e8f0">
      <h3 style="font-size:1.25rem;margin-bottom:1rem">Comments (${comments.length})</h3>
      ${comments
        .filter((c: any) => c.status === 'APPROVED')
        .map(
          (c: any) => `
        <div style="padding:0.75rem;margin-bottom:0.75rem;background:#f8fafc;border-radius:6px">
          <div style="font-weight:600;font-size:0.875rem">${escHtml(c.authorName)}</div>
          <div style="font-size:0.75rem;color:#64748b;margin-bottom:0.25rem">${new Date(c.createdAt).toLocaleDateString()}</div>
          <p style="font-size:0.875rem;line-height:1.5">${escHtml(c.content)}</p>
        </div>`
        )
        .join('\n')}
    </section>`
      : '';

  const widgetHtml = generateWidgetAreas(widgetAreas);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${escHtml(post.title)}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background:#fff;line-height:1.5;padding:2rem 1rem">
  <div style="max-width:800px;margin:0 auto">
    <article>
      <h1 style="font-size:2rem;margin-bottom:0.5rem">${escHtml(post.title)}</h1>
      <div style="font-size:0.875rem;color:#64748b;margin-bottom:1.5rem">${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''} by ${escHtml(post.author?.name || '')}</div>
      ${post.featuredImage ? `<img src="${escAttr(post.featuredImage)}" alt="" style="max-width:100%;border-radius:8px;margin-bottom:1.5rem" />` : ''}
      <div style="line-height:1.8">${post.content}</div>
    </article>
    ${commentsHtml}
    ${widgetHtml}
  </div>
</body></html>`;
}

function generateTaxonomyArchive(
  taxonomy: any,
  posts: any[],
  siteName: string,
  seo: any
): string {
  const items = posts
    .map(
      (p) => `
    <article style="margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid #e2e8f0">
      <h2 style="font-size:1.25rem"><a href="/blog/${escHtml(p.slug)}/" style="color:#0f172a;text-decoration:none">${escHtml(p.title)}</a></h2>
      <div style="font-size:0.875rem;color:#64748b">${p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ''}</div>
    </article>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${escHtml(taxonomy.name)} - ${escHtml(siteName)}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background:#fff;line-height:1.5;padding:2rem 1rem">
  <div style="max-width:800px;margin:0 auto">
    <h1 style="font-size:2rem;margin-bottom:0.5rem">${escHtml(taxonomy.name)}</h1>
    <p style="color:#64748b;margin-bottom:2rem">${posts.length} posts</p>
    ${items}
  </div>
</body></html>`;
}

function generateWidgetAreas(areas: any[]): string {
  return areas
    .map((area) => {
      const widgets = (area.widgets as any[]) || [];
      if (widgets.length === 0) return '';
      return `<aside style="margin-top:2rem;padding:1rem;background:#f8fafc;border-radius:8px" data-widget-area="${escAttr(area.slug)}">
      <h3 style="font-size:1rem;margin-bottom:0.75rem">${escHtml(area.name)}</h3>
      ${widgets.map((w: any) => `<div data-widget="${escAttr(w.type || '')}" style="margin-bottom:0.75rem">${escHtml(w.content || '')}</div>`).join('\n')}
    </aside>`;
    })
    .join('\n');
}

function generateSitemap(
  pages: Array<{ isHome: boolean; slug: string; updatedAt: Date }>,
  posts: Array<{ slug: string; publishedAt: Date | null }>,
  domain: string
): string {
  const urls: string[] = pages.map(
    (p) =>
      `  <url><loc>${p.isHome ? domain : `${domain}/${p.slug}`}</loc><lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod></url>`
  );
  for (const p of posts) {
    urls.push(
      `  <url><loc>${domain}/blog/${p.slug}</loc><lastmod>${(p.publishedAt || new Date()).toISOString().split('T')[0]}</lastmod></url>`
    );
  }
  if (posts.length > 0) urls.push(`  <url><loc>${domain}/blog</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.5">
${urls.join('\n')}
</urlset>`;
}

function generateRobots(domain: string): string {
  return `User-agent: *
Allow: /
Sitemap: ${domain}/sitemap.xml
`;
}

function minifyHtml(html: string): string {
  return html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+\/?>/g, '>')
    .replace(/<!--.*?-->/g, '')
    .trim();
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const escAttr = escHtml;
