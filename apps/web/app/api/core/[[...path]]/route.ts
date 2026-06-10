import { NextRequest, NextResponse } from 'next/server';

const handlers: Record<
  string,
  (params: any, body?: any) => Promise<NextResponse>
> = {
  // ─── Modules ──────────────────────────────────────────────────────
  async 'GET /modules'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    const modules = getSukitKernel().modules.getAll();
    return NextResponse.json(modules);
  },
  async 'GET /modules/:id/health'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    const result = await getSukitKernel().modules.healthCheck(params.id);
    return NextResponse.json(result);
  },
  async 'GET /modules/health'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    const results = await getSukitKernel().modules.runAllHealthChecks();
    return NextResponse.json(results);
  },
  async 'GET /modules/metrics'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    const metrics = getSukitKernel().modules.getMetrics();
    const entries = metrics instanceof Map ? Object.fromEntries(metrics) : (metrics ?? {});
    return NextResponse.json(entries);
  },
  async 'GET /modules/dependencies'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    return NextResponse.json(getSukitKernel().modules.getDependencyGraph());
  },

  // ─── Events ───────────────────────────────────────────────────────
  async 'GET /events/metrics'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    const metrics = getSukitKernel().events.getMetrics();
    const entries = metrics instanceof Map ? Object.fromEntries(metrics) : (metrics ?? {});
    return NextResponse.json(entries);
  },
  async 'GET /events/traces'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    const event = new URL(params.url).searchParams.get('event') || undefined;
    return NextResponse.json(getSukitKernel().events.getTrace(event));
  },
  async 'GET /events/snapshots'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    return NextResponse.json(getSukitKernel().events.getSnapshots());
  },

  // ─── Permissions ──────────────────────────────────────────────────
  async 'GET /permissions/audit'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    const moduleId =
      new URL(params.url).searchParams.get('moduleId') || undefined;
    return NextResponse.json(
      (getSukitKernel().permissions.getAuditLog as (id?: string) => any)(moduleId)
    );
  },

  // ─── Blocks ───────────────────────────────────────────────────────
  async 'GET /blocks'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    const { searchParams } = new URL(params.url);
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    let blocks = category
      ? getSukitKernel().blocks.getByCategory(category)
      : getSukitKernel().blocks.getAll();
    if (q) blocks = getSukitKernel().blocks.search(q);
    return NextResponse.json(blocks);
  },
  async 'GET /blocks/templates'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    return NextResponse.json(getSukitKernel().blocks.getTemplates());
  },

  // ─── Settings ─────────────────────────────────────────────────────
  async 'GET /settings/search'(params) {
    const { searchParams } = new URL(params.url);
    const q = searchParams.get('q') || '';
    const { settingsService } =
      await import('@/lib/core/services/settings-service');
    return NextResponse.json(await settingsService.search(q));
  },
  async 'GET /settings/export'(params) {
    const { settingsService } =
      await import('@/lib/core/services/settings-service');
    const data = await settingsService.exportJSON();
    return new NextResponse(data, {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  async 'POST /settings/import'(params, body) {
    const { settingsService } =
      await import('@/lib/core/services/settings-service');
    const count = await settingsService.importJSON(body?.json || '{}');
    return NextResponse.json({ imported: count });
  },
  async 'GET /settings/audit'(params) {
    const { settingsService } =
      await import('@/lib/core/services/settings-service');
    const key = new URL(params.url).searchParams.get('key') || undefined;
    return NextResponse.json(await settingsService.getAuditLog(key));
  },

  // ─── Sites ────────────────────────────────────────────────────────
  async 'GET /sites/search'(params) {
    const { searchParams } = new URL(params.url);
    const { sitesService } = await import('@/lib/core/services/sites-service');
    return NextResponse.json(
      await sitesService.search(searchParams.get('q') || '')
    );
  },
  async 'POST /sites/:id/duplicate'(params, body) {
    const { sitesService } = await import('@/lib/core/services/sites-service');
    const site = await sitesService.duplicate(
      params.id,
      body?.name || `${params.id}-copy`
    );
    return NextResponse.json(site);
  },
  async 'POST /sites/:id/transfer'(params, body) {
    const { sitesService } = await import('@/lib/core/services/sites-service');
    await sitesService.transfer(params.id, body?.userId || '');
    return NextResponse.json({ success: true });
  },
  async 'GET /sites/:id/export'(params) {
    const { sitesService } = await import('@/lib/core/services/sites-service');
    return NextResponse.json(await sitesService.exportJSON(params.id));
  },
  async 'GET /sites/:id/health'(params) {
    const { sitesService } = await import('@/lib/core/services/sites-service');
    return NextResponse.json(await sitesService.healthCheck(params.id));
  },
  async 'POST /sites/:id/repair'(params) {
    const { sitesService } = await import('@/lib/core/services/sites-service');
    return NextResponse.json(await sitesService.repair(params.id));
  },

  // ─── Pages ────────────────────────────────────────────────────────
  async 'GET /pages/:siteId/tree'(params) {
    const { pagesService } = await import('@/lib/core/services/pages-service');
    return NextResponse.json(await pagesService.getTree(params.siteId));
  },
  async 'POST /pages/:siteId/reorder'(params, body) {
    const { pagesService } = await import('@/lib/core/services/pages-service');
    await pagesService.reorder(params.siteId, body?.pageIds || []);
    return NextResponse.json({ success: true });
  },
  async 'POST /pages/:id/publish'(params) {
    const { pagesService } = await import('@/lib/core/services/pages-service');
    await pagesService.setStatus(params.id, 'PUBLISHED');
    return NextResponse.json({ success: true });
  },
  async 'GET /pages/:id/revisions'(params) {
    const { pagesService } = await import('@/lib/core/services/pages-service');
    return NextResponse.json(await pagesService.getRevisions(params.id));
  },
  async 'POST /pages/bulk'(params, body) {
    const { pagesService } = await import('@/lib/core/services/pages-service');
    const count = await pagesService.bulkOperation(
      body?.siteId,
      body?.operation,
      body?.pageIds || []
    );
    return NextResponse.json({ affected: count });
  },
  async 'POST /pages/:id/copy'(params, body) {
    const { pagesService } = await import('@/lib/core/services/pages-service');
    const page = await pagesService.copy(params.id, body?.targetSiteId || '');
    return NextResponse.json(page);
  },
  async 'POST /pages/:id/merge'(params, body) {
    const { pagesService } = await import('@/lib/core/services/pages-service');
    await pagesService.merge(params.id, body?.targetPageId || '');
    return NextResponse.json({ success: true });
  },

  // ─── Media ────────────────────────────────────────────────────────
  async 'GET /media/search'(params) {
    const { searchParams } = new URL(params.url);
    const siteId = searchParams.get('siteId') || '';
    const { mediaService } = await import('@/lib/core/services/media-service');
    return NextResponse.json(
      await mediaService.search(searchParams.get('q') || '', siteId)
    );
  },
  async 'GET /media/folders/:siteId'(params) {
    const { mediaService } = await import('@/lib/core/services/media-service');
    const tree = await mediaService.getFolderTree(params.siteId);
    return NextResponse.json(tree);
  },
  async 'POST /media/folders'(params, body) {
    const { mediaService } = await import('@/lib/core/services/media-service');
    const folder = await mediaService.createFolder(
      body?.siteId,
      body?.name,
      body?.parentId
    );
    return NextResponse.json(folder);
  },
  async 'GET /media/tags/:siteId'(params) {
    const { mediaService } = await import('@/lib/core/services/media-service');
    return NextResponse.json(await mediaService.listTags(params.siteId));
  },

  // ─── Export ───────────────────────────────────────────────────────
  async 'POST /export'(params, body) {
    const { exportService } =
      await import('@/lib/core/services/export-service');
    const id = await exportService.create(
      body?.siteId,
      body?.type || 'static',
      body?.options
    );
    return NextResponse.json({ exportId: id });
  },
  async 'GET /export/:id/progress'(params) {
    const { exportService } =
      await import('@/lib/core/services/export-service');
    return NextResponse.json(exportService.getProgress(params.id));
  },
  async 'GET /export/history/:siteId'(params) {
    const { exportService } =
      await import('@/lib/core/services/export-service');
    return NextResponse.json(await exportService.getHistory(params.siteId));
  },
  async 'GET /export/validate/:siteId'(params) {
    const { exportService } =
      await import('@/lib/core/services/export-service');
    return NextResponse.json(await exportService.validate(params.siteId));
  },

  // ─── Auth ─────────────────────────────────────────────────────────
  async 'GET /auth/users'(params) {
    const { authService } = await import('@/lib/core/services/auth-service');
    const siteId = new URL(params.url).searchParams.get('siteId') || undefined;
    return NextResponse.json(await authService.listUsers(siteId));
  },
  async 'POST /auth/users/:id/role'(params, body) {
    const { authService } = await import('@/lib/core/services/auth-service');
    await authService.updateRole(params.id, body?.siteId, body?.role);
    return NextResponse.json({ success: true });
  },
  async 'DELETE /auth/users/:id'(params) {
    const { authService } = await import('@/lib/core/services/auth-service');
    await authService.deleteAccount(params.id);
    return NextResponse.json({ success: true });
  },
  async 'GET /auth/sessions/:userId'(params) {
    const { authService } = await import('@/lib/core/services/auth-service');
    return NextResponse.json(await authService.listSessions(params.userId));
  },
  async 'DELETE /auth/sessions/:token'(params) {
    const { authService } = await import('@/lib/core/services/auth-service');
    await authService.revokeSession(params.token);
    return NextResponse.json({ success: true });
  },
  async 'POST /auth/:id/verify-email'(params) {
    const { authService } = await import('@/lib/core/services/auth-service');
    const token = await authService.sendVerificationEmail(params.id);
    return NextResponse.json({ token });
  },

  // ─── Tasks ────────────────────────────────────────────────────────
  async 'GET /tasks/queue'(params) {
    const { taskService } = await import('@/lib/core/services/task-service');
    return NextResponse.json(await taskService.getQueueMetrics());
  },
  async 'POST /tasks/enqueue'(params, body) {
    const { taskService } = await import('@/lib/core/services/task-service');
    const id = await taskService.enqueue(body);
    return NextResponse.json({ taskId: id });
  },
  async 'POST /tasks/:id/retry'(params) {
    const { taskService } = await import('@/lib/core/services/task-service');
    const ok = await taskService.retry(params.id);
    return NextResponse.json({ success: ok });
  },
  async 'GET /tasks/:id/logs'(params) {
    const { taskService } = await import('@/lib/core/services/task-service');
    return NextResponse.json(await taskService.getLogs(params.id));
  },
  async 'POST /tasks/batch'(params, body) {
    const { taskService } = await import('@/lib/core/services/task-service');
    const ids = await taskService.batch(body?.operations || []);
    return NextResponse.json({ taskIds: ids });
  },

  // ─── Storage ──────────────────────────────────────────────────────
  async 'POST /storage/query'(params, body) {
    const { storageService } =
      await import('@/lib/core/services/storage-service');
    return NextResponse.json(
      await storageService.query(body?.model, body?.options)
    );
  },
  async 'POST /storage/seed'(params, body) {
    const { storageService } =
      await import('@/lib/core/services/storage-service');
    const count = await storageService.seed(body?.model, body?.data || []);
    return NextResponse.json({ seeded: count });
  },
  async 'POST /storage/backup'(params, body) {
    const { storageService } =
      await import('@/lib/core/services/storage-service');
    return NextResponse.json(await storageService.backup(body?.model));
  },
  async 'POST /storage/migrate'(params, body) {
    const { storageService } =
      await import('@/lib/core/services/storage-service');
    await storageService.migrate(body?.migrations || []);
    return NextResponse.json({ success: true });
  },

  // ─── Cache ────────────────────────────────────────────────────────
  async 'GET /cache/stats'(params) {
    const { cacheService } = await import('@/lib/core/services/cache-service');
    return NextResponse.json(cacheService.getStats());
  },
  async 'DELETE /cache'(params) {
    const { cacheService } = await import('@/lib/core/services/cache-service');
    await cacheService.clear();
    return NextResponse.json({ success: true });
  },
  async 'DELETE /cache/tag/:tag'(params) {
    const { cacheService } = await import('@/lib/core/services/cache-service');
    await cacheService.invalidateTag(params.tag);
    return NextResponse.json({ success: true });
  },
  async 'POST /cache/warmup'(params, body) {
    const { cacheService } = await import('@/lib/core/services/cache-service');
    const count = await cacheService.warmup(body?.entries || []);
    return NextResponse.json({ warmed: count });
  },

  // ─── Log ──────────────────────────────────────────────────────────
  async 'GET /log/query'(params) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    const { searchParams } = new URL(params.url);
    return NextResponse.json(
      getSukitKernel().log.query({
        level: searchParams.get('level') || undefined,
        moduleId: searchParams.get('moduleId') || undefined,
        since: searchParams.get('since')
          ? parseInt(searchParams.get('since')!)
          : undefined,
        until: searchParams.get('until')
          ? parseInt(searchParams.get('until')!)
          : undefined,
      })
    );
  },
  async 'POST /log/forward'(params, body) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    await getSukitKernel().log.forward(body?.url, { headers: body?.headers });
    return NextResponse.json({ success: true });
  },
  async 'POST /log/transport'(params, body) {
    const { getSukitKernel } = await import('@/lib/core/create-core');
    getSukitKernel().log.addTransport((entry: any) => {
      fetch(body?.url || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {});
    });
    return NextResponse.json({ success: true });
  },
};

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/core\/?/, '');
    const segments = path.split('/').filter(Boolean);

    let method = request.method;
    let body: any = null;
    try {
      body = await request.json();
    } catch {}

    // Try exact match first
    const exactKey = `${method} /${segments.join('/')}`;
    if (handlers[exactKey])
      return handlers[exactKey]({ url: request.url }, body);

    // Try with params
    for (const [key] of Object.entries(handlers)) {
      const [handlerMethod, handlerPath] = key.split(' ');
      if (handlerMethod !== method) continue;
      const handlerSegments = handlerPath.split('/').filter(Boolean);
      if (handlerSegments.length !== segments.length) continue;

      const params: Record<string, string> = {};
      let match = true;
      for (let i = 0; i < handlerSegments.length; i++) {
        if (handlerSegments[i].startsWith(':')) {
          params[handlerSegments[i].slice(1)] = segments[i];
        } else if (handlerSegments[i] !== segments[i]) {
          match = false;
          break;
        }
      }
      if (match) return handlers[key]({ ...params, url: request.url }, body);
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
