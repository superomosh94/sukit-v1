import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const status = searchParams.get("status");
  const taxonomyId = searchParams.get("taxonomyId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (siteId) where.siteId = siteId;
  if (status) where.status = status;
  if (taxonomyId) where.taxonomies = { some: { taxonomyId } };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { author: { select: { name: true, image: true } }, taxonomies: { include: { taxonomy: true } }, _count: { select: { comments: true } } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({ posts, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, content, excerpt, status, siteId, featuredImage, taxonomyIds } = body;

  if (!title || !siteId) return NextResponse.json({ error: "title, siteId required" }, { status: 400 });

  const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content: content || "",
      excerpt: excerpt || "",
      status: status || "DRAFT",
      siteId,
      featuredImage: featuredImage || null,
      authorId: session.user.id,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      taxonomies: taxonomyIds ? { create: taxonomyIds.map((tid: string) => ({ taxonomyId: tid })) } : undefined,
    },
    include: { taxonomies: { include: { taxonomy: true } } },
  });

  return NextResponse.json({ post }, { status: 201 });
}
