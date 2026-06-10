import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const type = searchParams.get("type");

  const where: any = {};
  if (siteId) where.siteId = siteId;
  if (type) where.type = type;

  const taxonomies = await prisma.taxonomy.findMany({
    where,
    include: { terms: { orderBy: { sortOrder: "asc" } }, _count: { select: { pages: true, posts: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ taxonomies });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, slug, description, type, siteId } = body;

  if (!name || !slug || !siteId) return NextResponse.json({ error: "name, slug, siteId required" }, { status: 400 });

  const taxonomy = await prisma.taxonomy.create({
    data: { name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"), description, type: type || "category", siteId },
  });

  return NextResponse.json({ taxonomy }, { status: 201 });
}
