import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: 'key_1',
      name: 'Production API',
      key: 'suk_abc...',
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    },
  ]);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(
    {
      id: crypto.randomUUID(),
      name: body.name,
      key: `suk_${crypto.randomUUID().substring(0, 16)}`,
      permissions: body.permissions || ['read'],
      createdAt: new Date().toISOString(),
    },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const keyId = url.pathname.split('/').pop();
  return NextResponse.json({ success: true, id: keyId });
}
