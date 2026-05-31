import type { SiteStats, SiteSearchResult } from '../types';

export async function handleGetStats(siteId: string): Promise<Response> {
  const stats: SiteStats = {
    totalPages: 3,
    totalBlocks: 12,
    totalMedia: 2,
    totalTeamMembers: 1,
    storageUsed: 256000,
    storageLimit: 104857600,
    publishedPages: 3,
    draftPages: 0,
    trashedPages: 0,
    recentActivity: [],
    topContributors: [{ userId: 'admin', name: 'Admin User', edits: 15 }],
    performanceScore: 92,
    seoScore: 78,
    accessibilityScore: 85,
  };
  return new Response(JSON.stringify(stats), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleSearch(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const query = url.searchParams.get('q')?.toLowerCase() ?? '';
  const siteId = url.searchParams.get('siteId');

  if (!query) {
    return new Response(JSON.stringify([]), {
      headers: { 'content-type': 'application/json' },
    });
  }

  const results: SiteSearchResult[] = [];
  const demoPages = [
    { id: 'home', title: 'Home', slug: '/' },
    { id: 'about', title: 'About', slug: '/about' },
    { id: 'contact', title: 'Contact', slug: '/contact' },
  ];

  for (const page of demoPages) {
    if (page.title.toLowerCase().includes(query) || page.slug.includes(query)) {
      results.push({
        type: 'page',
        id: page.id,
        siteId: siteId ?? 'demo-site',
        siteName: 'Demo Site',
        title: page.title,
        subtitle: page.slug,
        matchField: 'title',
        matchPreview: page.title,
        url: `/builder/${siteId ?? 'demo-site'}/${page.id}`,
      });
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { 'content-type': 'application/json' },
  });
}
