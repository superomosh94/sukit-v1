import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const pipelines = await prisma.option.findMany({
    where: { key: { startsWith: 'pipeline:' } },
    select: { key: true, value: true },
  });

  const mapped = pipelines.map((p) => ({
    id: p.key.replace('pipeline:', ''),
    ...(p.value as any),
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, repo, branch, provider } = body;

  if (!id || !name) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  await prisma.option.upsert({
    where: { key_siteId: { key: `pipeline:${id}`, siteId: '' } },
    update: {
      value: {
        name,
        repo,
        branch,
        provider,
        status: 'active',
        lastRun: new Date().toISOString(),
        lastStatus: 'success',
      },
    },
    create: {
      key: `pipeline:${id}`,
      value: {
        name,
        repo,
        branch,
        provider,
        status: 'active',
        lastRun: new Date().toISOString(),
        lastStatus: 'success',
      },
      autoload: false,
    },
  });

  return NextResponse.json({ success: true });
}
