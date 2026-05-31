import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const secrets = await prisma.option.findMany({
    where: { key: { startsWith: 'secret-' } },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = secrets.map((s) => ({
    id: s.id,
    key: s.key.replace('secret-', ''),
    value: String((s.value as any)?.value ?? s.value ?? ''),
    scope: String((s.value as any)?.scope ?? 'global'),
    scopeName: (s.value as any)?.scopeName ?? null,
    createdAt: s.createdAt.toISOString(),
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, value, scope, scopeName } = body;

  const option = await prisma.option.create({
    data: {
      key: `secret-${key}`,
      value: { value, scope, scopeName },
    },
  });

  return NextResponse.json(
    {
      id: option.id,
      key,
      value,
      scope: scope ?? 'global',
      scopeName,
      createdAt: option.createdAt.toISOString(),
    },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    await prisma.option.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
