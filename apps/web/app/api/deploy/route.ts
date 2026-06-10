import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const siteId = url.searchParams.get('siteId');

  const deployments = await prisma.$queryRawUnsafe<any[]>(
    `SELECT d.*, json_build_object('name', s.name) AS "site"
     FROM "deployments" d
     LEFT JOIN "sites" s ON s.id = d."siteId"
     ${siteId ? 'WHERE d."siteId" = $1' : ''}
     ORDER BY d."createdAt" DESC
     LIMIT 20`,
    ...(siteId ? [siteId] : [])
  );

  return NextResponse.json(deployments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { siteId, type = 'static', pages = 0, assets = 0 } = body;

  const [deployment] = await prisma.$queryRawUnsafe<any[]>(
    `INSERT INTO "deployments" ("siteId", "type", "status", "pages", "assets", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    siteId,
    type,
    'PENDING',
    pages,
    assets
  );

  return NextResponse.json(deployment, { status: 201 });
}
