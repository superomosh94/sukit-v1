import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(req: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { pages: { where: { status: "PUBLISHED" }, select: { slug: true, isHome: true, updatedAt: true } }, posts: { where: { status: "PUBLISHED" }, select: { slug: true, publishedAt: true } } },
  });

  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const domain = site.domain || site.host || "";
  const urls: string[] = [];

  for (const page of site.pages) {
    const loc = page.isHome ? domain : `${domain}/${page.slug}`;
    urls.push(`  <url><loc>${loc}</loc><lastmod>${page.updatedAt.toISOString().split("T")[0]}</lastmod></url>`);
  }

  for (const post of site.posts) {
    urls.push(`  <url><loc>${domain}/blog/${post.slug}</loc><lastmod>${(post.publishedAt || new Date()).toISOString().split("T")[0]}</lastmod></url>`);
  }

  urls.push(`  <url><loc>${domain}/blog</loc></url>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
