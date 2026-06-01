import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { moduleId, siteId } = await request.json();
  return NextResponse.json({ success: true, moduleId });
}
