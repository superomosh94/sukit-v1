import type { Site, SiteStatus } from '../types';

// In-memory store for development (replace with DB in production)
let sites: Site[] = [
  {
    id: 'demo-site',
    name: 'Demo Site',
    description: 'A demo site for testing',
    slug: 'demo-site',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    privacy: 'public',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    status: 'active',
    settings: {
      seo: { defaultTitle: 'Demo Site', defaultDescription: '' },
      domain: {
        sslEnabled: false,
        verified: false,
        redirectRules: [],
        aliases: [],
      },
      backups: {
        enabled: true,
        frequency: 'daily',
        retentionDays: 30,
        storage: 'local',
      },
      codeInjection: { head: '', body: '', css: '', js: '' },
    },
  },
];

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}

export async function handleGetSites(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') as SiteStatus | null;
  const search = url.searchParams.get('q');

  let filtered = sites;
  if (status) filtered = filtered.filter((s) => s.status === status);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(q) || s.slug.includes(q)
    );
  }

  filtered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return new Response(JSON.stringify(filtered), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleCreateSite(req: Request): Promise<Response> {
  const body = await req.json();
  const now = new Date().toISOString();
  const site: Site = {
    id: generateId(),
    name: body.name,
    description: body.description ?? '',
    slug: body.slug ?? body.name.toLowerCase().replace(/\s+/g, '-'),
    timezone: body.timezone ?? 'UTC',
    language: body.language ?? 'en',
    dateFormat: 'MM/DD/YYYY',
    privacy: 'public',
    createdAt: now,
    updatedAt: now,
    createdBy: 'admin',
    status: 'active',
    settings: {
      seo: { defaultTitle: body.name, defaultDescription: '' },
      domain: {
        sslEnabled: false,
        verified: false,
        redirectRules: [],
        aliases: [],
      },
      backups: {
        enabled: true,
        frequency: 'daily',
        retentionDays: 30,
        storage: 'local',
      },
      codeInjection: { head: '', body: '', css: '', js: '' },
    },
  };
  sites.push(site);
  return new Response(JSON.stringify(site), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleGetSite(
  req: Request,
  siteId: string
): Promise<Response> {
  const site = sites.find((s) => s.id === siteId);
  if (!site) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(site), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleUpdateSite(
  req: Request,
  siteId: string
): Promise<Response> {
  const body = await req.json();
  const idx = sites.findIndex((s) => s.id === siteId);
  if (idx === -1) return new Response('Not found', { status: 404 });
  sites[idx] = { ...sites[idx], ...body, updatedAt: new Date().toISOString() };
  return new Response(JSON.stringify(sites[idx]), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleDeleteSite(
  req: Request,
  siteId: string
): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const action = body.action;

  if (action === 'hard_delete') {
    sites = sites.filter((s) => s.id !== siteId);
  } else {
    const idx = sites.findIndex((s) => s.id === siteId);
    if (idx === -1) return new Response('Not found', { status: 404 });
    sites[idx].status = 'trashed';
    sites[idx].updatedAt = new Date().toISOString();
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleRestoreSite(siteId: string): Promise<Response> {
  const idx = sites.findIndex((s) => s.id === siteId);
  if (idx === -1) return new Response('Not found', { status: 404 });
  sites[idx].status = 'active';
  sites[idx].updatedAt = new Date().toISOString();
  return new Response(JSON.stringify(sites[idx]), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleArchiveSite(siteId: string): Promise<Response> {
  const idx = sites.findIndex((s) => s.id === siteId);
  if (idx === -1) return new Response('Not found', { status: 404 });
  sites[idx].status = sites[idx].status === 'archived' ? 'active' : 'archived';
  sites[idx].archivedAt =
    sites[idx].status === 'archived' ? new Date().toISOString() : undefined;
  sites[idx].updatedAt = new Date().toISOString();
  return new Response(JSON.stringify(sites[idx]), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleDuplicateSite(siteId: string): Promise<Response> {
  const source = sites.find((s) => s.id === siteId);
  if (!source) return new Response('Not found', { status: 404 });
  const now = new Date().toISOString();
  const dup: Site = {
    ...JSON.parse(JSON.stringify(source)),
    id: generateId(),
    name: `${source.name} (Copy)`,
    slug: `${source.slug}-copy`,
    createdAt: now,
    updatedAt: now,
    status: 'active',
  };
  sites.push(dup);
  return new Response(JSON.stringify(dup), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
}
