import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const results: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    details?: Record<string, any>;
    error?: string;
    lastChecked: string;
  }> = [];

  // Database
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({
      name: 'database',
      status: 'healthy',
      latency: Date.now() - dbStart,
      details: { provider: 'PostgreSQL', connections: 0 },
      lastChecked: new Date().toISOString(),
    });
  } catch (e: any) {
    results.push({
      name: 'database',
      status: 'unhealthy',
      latency: Date.now() - dbStart,
      error: e.message,
      lastChecked: new Date().toISOString(),
    });
  }

  // System info
  const mem = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  results.push({
    name: 'system',
    status: 'healthy',
    latency: 0,
    details: {
      platform: os.platform(),
      arch: os.arch(),
      uptime: Math.floor(os.uptime()),
      cpus: os.cpus().length,
      memoryTotal: `${Math.round((totalMem / 1024 / 1024 / 1024) * 10) / 10}GB`,
      memoryFree: `${Math.round((freeMem / 1024 / 1024 / 1024) * 10) / 10}GB`,
      memoryUsage: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
    },
    lastChecked: new Date().toISOString(),
  });

  // Version info
  results.push({
    name: 'version',
    status: 'healthy',
    latency: 0,
    details: {
      node: process.version,
      platform: os.platform(),
      arch: os.arch(),
    },
    lastChecked: new Date().toISOString(),
  });

  return NextResponse.json(results);
}
