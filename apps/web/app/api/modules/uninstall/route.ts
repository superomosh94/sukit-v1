import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { moduleId, siteId } = await request.json();
  return NextResponse.json({ success: true, moduleId });
}
