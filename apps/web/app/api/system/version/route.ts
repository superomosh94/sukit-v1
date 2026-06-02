import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  return NextResponse.json({
    sukit: '1.0.0',
    node: process.version,
    platform: os.platform(),
    arch: os.arch(),
    uptime: Math.floor(os.uptime()),
    memory: {
      total: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 10) / 10,
      free: Math.round((os.freemem() / 1024 / 1024 / 1024) * 10) / 10,
    },
  });
}
