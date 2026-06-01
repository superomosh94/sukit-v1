import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Account deletion requested. Check your email to confirm.',
  });
}
