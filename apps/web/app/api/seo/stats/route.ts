import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const sites = await prisma.site.findMany({
    select: {
      id: true,
      name: true,
      pages: { select: { id: true } },
    },
  });

  const seoSettings = await prisma.seoSettings.findMany();

  const seoMap = new Map(seoSettings.map((s) => [s.siteId, s]));

  const stats = sites.map((site) => {
    const settings = seoMap.get(site.id);
    let seoScore = 50;
    let issues = 0;

    if (settings?.metaTitle) seoScore += 10;
    else issues += 1;
    if (settings?.metaDescription) seoScore += 15;
    else issues += 1;
    if (settings?.ogImage) seoScore += 5;
    if (settings?.googleAnalyticsId) seoScore += 5;
    if (settings?.robotsTxt) seoScore += 5;

    return {
      id: site.id,
      name: site.name,
      seoScore: Math.min(seoScore, 100),
      issues,
      pages: site.pages.length,
      hasSettings: !!settings,
    };
  });

  const totalScore = stats.length
    ? Math.round(stats.reduce((a, b) => a + b.seoScore, 0) / stats.length)
    : 0;
  const totalIssues = stats.reduce((a, b) => a + b.issues, 0);
  const totalPages = stats.reduce((a, b) => a + b.pages, 0);

  return NextResponse.json({
    sites: stats,
    summary: {
      seoScore: totalScore,
      issues: totalIssues,
      pages: totalPages,
    },
  });
}
