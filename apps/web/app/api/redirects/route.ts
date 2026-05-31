import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

interface RedirectRule {
  source: string;
  target: string;
  type: '301' | '302';
}

function buildKey(siteId: string): string {
  return `redirects_${siteId}`;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json({ error: 'siteId required' }, { status: 400 });
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });

  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }

  const option = await prisma.option.findUnique({
    where: { key_siteId: { key: buildKey(siteId), siteId } },
  });

  return NextResponse.json({
    redirects: (option?.value as unknown as RedirectRule[]) || [],
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { siteId, source, target, type } = body;

  if (!siteId || !source || !target) {
    return NextResponse.json(
      { error: 'siteId, source, target required' },
      { status: 400 }
    );
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });

  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }

  const redirectType = type === '302' ? '302' : '301';
  const key = buildKey(siteId);

  const existing = await prisma.option.findUnique({
    where: { key_siteId: { key, siteId } },
  });

  const rules: RedirectRule[] =
    (existing?.value as unknown as RedirectRule[]) || [];
  const existingIndex = rules.findIndex((r) => r.source === source);

  const newRule: RedirectRule = { source, target, type: redirectType };

  if (existingIndex >= 0) {
    rules[existingIndex] = newRule;
  } else {
    rules.push(newRule);
  }

  const option = await prisma.option.upsert({
    where: { key_siteId: { key, siteId } },
    update: { value: rules as any },
    create: { key, value: rules as any, siteId },
  });

  return NextResponse.json(
    { redirects: option.value as unknown as RedirectRule[] },
    { status: 201 }
  );
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { siteId, source } = body;

  if (!siteId || !source) {
    return NextResponse.json(
      { error: 'siteId, source required' },
      { status: 400 }
    );
  }

  const key = buildKey(siteId);

  const existing = await prisma.option.findUnique({
    where: { key_siteId: { key, siteId } },
  });

  if (!existing) {
    return NextResponse.json({ error: 'No redirects found' }, { status: 404 });
  }

  const rules: RedirectRule[] = (
    existing.value as unknown as RedirectRule[]
  ).filter((r) => r.source !== source);

  await prisma.option.update({
    where: { key_siteId: { key, siteId } },
    data: { value: rules as any },
  });

  return NextResponse.json({ redirects: rules });
}
