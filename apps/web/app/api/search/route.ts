import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const siteId = searchParams.get("siteId");

  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const whereSite: any = {};
  if (siteId) whereSite.siteId = siteId;

  try {
    const [pages, posts] = await Promise.all([
      prisma.page.findMany({
        where: { ...whereSite, status: "PUBLISHED", title: { contains: q, mode: "insensitive" } },
        select: { id: true, title: true, slug: true, updatedAt: true },
        take: 10,
      }),
      prisma.post.findMany({
        where: { ...whereSite, status: "PUBLISHED", OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ]},
        select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
        take: 10,
      }),
    ]);

    const results = [
      ...pages.map(p => ({ id: p.id, title: p.title, slug: p.slug, type: "page", updatedAt: p.updatedAt.toISOString(), url: `/${p.slug}` })),
      ...posts.map(p => ({ id: p.id, title: p.title, slug: p.slug, type: "post", excerpt: p.excerpt || "", updatedAt: (p.publishedAt || new Date()).toISOString(), url: `/blog/${p.slug}` })),
    ];

    return NextResponse.json({ results, total: results.length, query: q });
  } catch {
    return NextResponse.json({ results: [], total: 0, query: q });
  }
}
