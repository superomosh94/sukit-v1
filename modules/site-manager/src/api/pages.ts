import type { Page, PageStatus } from '../types';

interface PageRecord extends Page {
  children?: PageRecord[];
}

let pages: PageRecord[] = [
  {
    id: 'home',
    siteId: 'demo-site',
    title: 'Home',
    slug: '/',
    status: 'published',
    authorId: 'admin',
    template: 'default',
    order: 0,
    showInNav: true,
    seo: { metaTitle: 'Home', metaDescription: 'Welcome to Demo Site' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'about',
    siteId: 'demo-site',
    title: 'About',
    slug: '/about',
    status: 'published',
    authorId: 'admin',
    template: 'default',
    order: 1,
    showInNav: true,
    seo: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'contact',
    siteId: 'demo-site',
    title: 'Contact',
    slug: '/contact',
    status: 'published',
    authorId: 'admin',
    template: 'default',
    order: 2,
    showInNav: true,
    seo: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}

function buildTree(flatPages: PageRecord[]): PageRecord[] {
  const map = new Map<string, PageRecord>();
  const roots: PageRecord[] = [];

  flatPages.forEach((p) => map.set(p.id, { ...p, children: [] }));
  flatPages.forEach((p) => {
    const node = map.get(p.id)!;
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortFn = (a: PageRecord, b: PageRecord) => a.order - b.order;
  const sortTree = (nodes: PageRecord[]) => {
    nodes.sort(sortFn);
    nodes.forEach((n) => {
      if (n.children?.length) sortTree(n.children);
    });
  };
  sortTree(roots);
  return roots;
}

function flattenTree(nodes: PageRecord[]): PageRecord[] {
  const result: PageRecord[] = [];
  for (const n of nodes) {
    result.push(n);
    if (n.children?.length) result.push(...flattenTree(n.children));
  }
  return result;
}

export async function handleGetPages(siteId: string): Promise<Response> {
  const sitePages = pages.filter((p) => p.siteId === siteId);
  const tree = buildTree(sitePages);
  return new Response(JSON.stringify(tree), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleGetPage(
  siteId: string,
  pageId: string
): Promise<Response> {
  const page = pages.find((p) => p.id === pageId && p.siteId === siteId);
  if (!page) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(page), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleCreatePage(
  siteId: string,
  req: Request
): Promise<Response> {
  const body = await req.json();
  const now = new Date().toISOString();
  const page: PageRecord = {
    id: generateId(),
    siteId,
    parentId: body.parentId ?? undefined,
    title: body.title,
    slug: body.slug ?? body.title.toLowerCase().replace(/\s+/g, '-'),
    status: body.status ?? 'draft',
    authorId: 'admin',
    template: body.template ?? 'default',
    order: pages.filter((p) => p.siteId === siteId).length,
    showInNav: true,
    seo: {},
    createdAt: now,
    updatedAt: now,
  };
  pages.push(page);
  return new Response(JSON.stringify(page), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleUpdatePage(
  siteId: string,
  pageId: string,
  req: Request
): Promise<Response> {
  const body = await req.json();
  const idx = pages.findIndex((p) => p.id === pageId && p.siteId === siteId);
  if (idx === -1) return new Response('Not found', { status: 404 });
  pages[idx] = { ...pages[idx], ...body, updatedAt: new Date().toISOString() };
  return new Response(JSON.stringify(pages[idx]), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleDeletePage(
  siteId: string,
  pageId: string,
  req: Request
): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const idx = pages.findIndex((p) => p.id === pageId && p.siteId === siteId);
  if (idx === -1) return new Response('Not found', { status: 404 });

  if (body.action === 'hard_delete') {
    pages = pages.filter((p) => p.id !== pageId);
  } else {
    pages[idx].status = 'trashed';
    pages[idx].updatedAt = new Date().toISOString();
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleRestorePage(
  siteId: string,
  pageId: string
): Promise<Response> {
  const idx = pages.findIndex((p) => p.id === pageId && p.siteId === siteId);
  if (idx === -1) return new Response('Not found', { status: 404 });
  pages[idx].status = 'draft';
  pages[idx].updatedAt = new Date().toISOString();
  return new Response(JSON.stringify(pages[idx]), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleDuplicatePage(
  siteId: string,
  pageId: string
): Promise<Response> {
  const source = pages.find((p) => p.id === pageId && p.siteId === siteId);
  if (!source) return new Response('Not found', { status: 404 });
  const now = new Date().toISOString();
  const dup: PageRecord = {
    ...JSON.parse(JSON.stringify(source)),
    id: generateId(),
    title: `${source.title} (Copy)`,
    slug: `${source.slug}-copy`,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
  };
  pages.push(dup);
  return new Response(JSON.stringify(dup), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleReorderPage(
  siteId: string,
  pageId: string,
  req: Request
): Promise<Response> {
  const body = await req.json();
  const idx = pages.findIndex((p) => p.id === pageId && p.siteId === siteId);
  if (idx === -1) return new Response('Not found', { status: 404 });
  pages[idx].parentId = body.parentId ?? undefined;
  pages[idx].order = body.order;
  pages[idx].updatedAt = new Date().toISOString();
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' },
  });
}
