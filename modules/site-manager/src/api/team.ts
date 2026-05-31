import type { TeamMember, TeamRole } from '../types';

let team: TeamMember[] = [
  {
    id: 'tm-1',
    userId: 'admin',
    siteId: 'demo-site',
    role: 'owner',
    invitedBy: 'system',
    invitedAt: new Date().toISOString(),
    acceptedAt: new Date().toISOString(),
    email: 'admin@example.com',
    name: 'Admin User',
    avatar: '',
  },
];

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}

export async function handleGetTeam(siteId: string): Promise<Response> {
  const members = team.filter((m) => m.siteId === siteId);
  return new Response(JSON.stringify(members), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleInviteMember(
  siteId: string,
  req: Request
): Promise<Response> {
  const body = await req.json();
  const member: TeamMember = {
    id: generateId(),
    userId: generateId(),
    siteId,
    role: body.role,
    invitedBy: 'admin',
    invitedAt: new Date().toISOString(),
    email: body.email,
    name: body.email.split('@')[0],
    avatar: '',
  };
  team.push(member);
  return new Response(JSON.stringify(member), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleUpdateMemberRole(
  siteId: string,
  memberId: string,
  req: Request
): Promise<Response> {
  const body = await req.json();
  const idx = team.findIndex((m) => m.id === memberId && m.siteId === siteId);
  if (idx === -1) return new Response('Not found', { status: 404 });
  team[idx].role = body.role;
  return new Response(JSON.stringify(team[idx]), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleRemoveMember(
  siteId: string,
  memberId: string
): Promise<Response> {
  const idx = team.findIndex((m) => m.id === memberId && m.siteId === siteId);
  if (idx === -1) return new Response('Not found', { status: 404 });
  team.splice(idx, 1);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function handleTransferOwnership(
  siteId: string,
  req: Request
): Promise<Response> {
  const body = await req.json();
  const currentOwner = team.find(
    (m) => m.siteId === siteId && m.role === 'owner'
  );
  const newOwner = team.find(
    (m) => m.userId === body.userId && m.siteId === siteId
  );
  if (currentOwner) currentOwner.role = 'admin';
  if (newOwner) newOwner.role = 'owner';
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' },
  });
}
