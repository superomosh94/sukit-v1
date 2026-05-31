import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");

  const where: any = {};
  if (siteId) where.siteId = siteId;

  const areas = await prisma.widgetArea.findMany({ where, orderBy: { name: "asc" } });
  return NextResponse.json({ areas });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, slug, siteId } = body;

  if (!name || !slug || !siteId) return NextResponse.json({ error: "name, slug, siteId required" }, { status: 400 });

  const area = await prisma.widgetArea.create({
    data: { name, slug, siteId, widgets: [] },
  });

  return NextResponse.json({ area }, { status: 201 });
}
