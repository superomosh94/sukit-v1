import type { ActivityLogEntry } from '../types';

let activityLog: ActivityLogEntry[] = [];

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}

export async function handleGetActivity(
  siteId: string,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);
  const entries = activityLog
    .filter((a) => a.siteId === siteId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
  return new Response(JSON.stringify(entries), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleCreateActivity(
  siteId: string,
  req: Request
): Promise<Response> {
  const body = await req.json();
  const entry: ActivityLogEntry = {
    id: generateId(),
    siteId,
    userId: body.userId,
    userName: body.userName,
    userAvatar: body.userAvatar,
    action: body.action,
    entityType: body.entityType,
    entityId: body.entityId,
    entityName: body.entityName,
    changes: body.changes,
    timestamp: new Date().toISOString(),
  };
  activityLog.unshift(entry);
  return new Response(JSON.stringify(entry), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
}
