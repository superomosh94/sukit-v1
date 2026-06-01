import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: 'user_1',
    email: 'user@example.com',
    name: 'User',
    avatar: null,
    createdAt: new Date().toISOString(),
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    id: 'user_1',
    ...body,
    updatedAt: new Date().toISOString(),
  });
}
