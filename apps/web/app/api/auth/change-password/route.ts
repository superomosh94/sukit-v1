import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (newPassword.length < 8)
    return NextResponse.json({ error: 'Password too short' }, { status: 400 });
  return NextResponse.json({ success: true, message: 'Password changed' });
}
