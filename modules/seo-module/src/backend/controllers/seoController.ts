import { prisma } from './db';

export async function getSeoSettings(siteId: string) {
  let settings = await prisma.seoSettings.findUnique({ where: { siteId } });
  if (!settings) {
    settings = await prisma.seoSettings.create({
      data: {
        siteId,
        metaTitle: '',
        metaDescription: '',
        ogImage: '',
        twitterHandle: '',
        googleAnalyticsId: '',
        googleTagManagerId: '',
        facebookPixelId: '',
        robotsTxt: '',
        customHead: '',
      },
    });
  }
  return settings;
}

export async function updateSeoSettings(siteId: string, data: any) {
  return prisma.seoSettings.upsert({
    where: { siteId },
    update: data,
    create: { siteId, ...data },
  });
}

export async function analyzePage(
  siteId: string,
  url: string,
  content: string
) {
  const issues: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
  }> = [];

  // Meta title
  const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
  const metaTitle = titleMatch?.[1] || '';
  if (!metaTitle)
    issues.push({
      type: 'meta_title',
      severity: 'high',
      message: 'Missing page title',
    });
  else if (metaTitle.length < 30)
    issues.push({
      type: 'meta_title',
      severity: 'medium',
      message: `Title too short (${metaTitle.length} chars, min 30)`,
    });
  else if (metaTitle.length > 60)
    issues.push({
      type: 'meta_title',
      severity: 'low',
      message: `Title too long (${metaTitle.length} chars, max 60)`,
    });

  // Meta description
  const descMatch = content.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
  );
  const metaDesc = descMatch?.[1] || '';
  if (!metaDesc)
    issues.push({
      type: 'meta_description',
      severity: 'high',
      message: 'Missing meta description',
    });
  else if (metaDesc.length < 120)
    issues.push({
      type: 'meta_description',
      severity: 'medium',
      message: `Description too short (${metaDesc.length} chars, min 120)`,
    });

  // Open Graph
  if (!content.includes('og:title'))
    issues.push({
      type: 'og_tags',
      severity: 'medium',
      message: 'Missing Open Graph title tag',
    });
  if (!content.includes('og:description'))
    issues.push({
      type: 'og_tags',
      severity: 'low',
      message: 'Missing Open Graph description tag',
    });
  if (!content.includes('og:image'))
    issues.push({
      type: 'og_tags',
      severity: 'low',
      message: 'Missing Open Graph image tag',
    });

  // Headings
  const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count === 0)
    issues.push({
      type: 'headings',
      severity: 'high',
      message: 'Page has no H1 heading',
    });
  if (h1Count > 1)
    issues.push({
      type: 'headings',
      severity: 'low',
      message: `Page has ${h1Count} H1 headings (recommended: 1)`,
    });

  // Images
  const imgMatches = content.match(/<img[^>]*>/gi) || [];
  const imagesWithoutAlt = imgMatches.filter((img) => !img.includes('alt='));
  if (imagesWithoutAlt.length > 0)
    issues.push({
      type: 'images',
      severity: 'medium',
      message: `${imagesWithoutAlt.length} images missing alt text`,
    });

  // Canonical
  if (!content.includes('rel="canonical"'))
    issues.push({
      type: 'canonical',
      severity: 'low',
      message: 'Missing canonical URL',
    });

  const score = Math.max(
    0,
    100 -
      issues.reduce((s, i) => {
        return (
          s + (i.severity === 'high' ? 10 : i.severity === 'medium' ? 5 : 2)
        );
      }, 0)
  );

  return { url, score, issues };
}

export async function generateSitemap(siteId: string) {
  const pages = await prisma.page.findMany({
    where: { siteId, isPublished: true },
    select: { path: true, updatedAt: true },
  });

  const settings = await getSeoSettings(siteId);
  const baseUrl = settings.siteUrl || `https://${siteId}.sukit.app`;

  const urls = pages.map((page: { path: string; updatedAt: Date }) => ({
    loc: `${baseUrl}${page.path}`,
    lastmod: page.updatedAt.toISOString().split('T')[0],
    changefreq: 'weekly' as const,
    priority: page.path === '/' ? '1.0' : '0.7',
  }));

  return urls;
}

export function generateRobotsTxt(siteUrl: string, sitemapUrl: string) {
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

Sitemap: ${sitemapUrl}
`;
}

export async function generateStructuredData(
  siteId: string,
  type: 'Organization' | 'WebSite' | 'LocalBusiness' | 'Article',
  data: Record<string, any>
) {
  const base: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  return { ...base, ...data };
}
