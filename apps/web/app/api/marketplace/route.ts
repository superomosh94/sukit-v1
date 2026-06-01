import { NextResponse } from 'next/server';

// GET /api/marketplace/modules
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const category = searchParams.get('category');
  const page = parseInt(searchParams.get('page') ?? '1');
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20');

  // TODO: Query database via Prisma
  const modules = [];
  const total = 0;

  return NextResponse.json({
    modules,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// POST /api/marketplace/install/:moduleId
export async function POST(request: Request) {
  const body = await request.json();
  const { moduleId, version, siteId } = body;

  if (!moduleId) {
    return NextResponse.json(
      { error: 'moduleId is required' },
      { status: 400 }
    );
  }

  // TODO: Install module via kernel.modules.load()
  return NextResponse.json({
    success: true,
    moduleId,
    version: version || '1.0.0',
    dependencies: [],
  });
}
