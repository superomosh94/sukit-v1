import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { message, room } = await request.json();
  return NextResponse.json({
    success: true,
    id: crypto.randomUUID(),
    message,
    room,
    timestamp: new Date().toISOString(),
  });
}
