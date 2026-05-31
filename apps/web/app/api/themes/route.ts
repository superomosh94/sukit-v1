import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export const defaultThemeConfig = {
  name: "SUKIT Default",
  slug: "sukit-default",
  description: "The default SUKIT theme with clean typography and responsive layout.",
  version: "1.0.0",
  author: "SUKIT",
  config: {
    version: 2,
    settings: {
      color: { palette: [
        { color: "#ffffff", name: "White", slug: "white" },
        { color: "#0f172a", name: "Slate 900", slug: "slate-900" },
        { color: "#3b82f6", name: "Blue 500", slug: "blue-500" },
        { color: "#10b981", name: "Emerald 500", slug: "emerald-500" },
        { color: "#f59e0b", name: "Amber 500", slug: "amber-500" },
        { color: "#f8fafc", name: "Slate 50", slug: "slate-50" },
        { color: "#e2e8f0", name: "Slate 200", slug: "slate-200" },
        { color: "#1e293b", name: "Slate 800", slug: "slate-800" },
      ]},
      typography: {
        fontFamilies: [
          { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', name: "System UI", slug: "system" },
          { fontFamily: "Inter, sans-serif", name: "Inter", slug: "inter" },
        ],
        fontSizes: [
          { size: "0.875rem", slug: "small" },
          { size: "1rem", slug: "medium" },
          { size: "1.25rem", slug: "large" },
          { size: "2rem", slug: "2xl" },
          { size: "2.5rem", slug: "3xl" },
        ],
      },
      spacing: { spacingSizes: [
        { size: "0.5rem", slug: "1" },
        { size: "1rem", slug: "2" },
        { size: "2rem", slug: "4" },
        { size: "4rem", slug: "6" },
      ]},
      layout: { contentSize: "800px", wideSize: "1200px" },
    },
    styles: { blocks: {}, elements: { link: { color: { text: "var(--wp--preset--color--blue-500)" } } } },
  },
  templates: [],
  styles: {},
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const themes = await prisma.theme.findMany({ orderBy: { name: "asc" } });
  const active = await prisma.theme.findFirst({ where: { active: true } });

  return NextResponse.json({ themes, active: active || null });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, slug, config } = body;

  if (action === "activate") {
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    await prisma.theme.updateMany({ where: { active: true }, data: { active: false } });
    const theme = await prisma.theme.update({ where: { slug }, data: { active: true } });
    return NextResponse.json({ theme });
  }

  if (action === "install-default" || action === "install") {
    const c = action === "install-default" ? defaultThemeConfig : config;
    if (!c?.slug) return NextResponse.json({ error: "config.slug required" }, { status: 400 });

    const existing = await prisma.theme.findUnique({ where: { slug: c.slug } });
    if (existing) {
      await prisma.theme.update({
        where: { slug: c.slug },
        data: { name: c.name, description: c.description || "", version: c.version || "1.0.0", author: c.author || "" },
      });
      return NextResponse.json({ theme: await prisma.theme.findUnique({ where: { slug: c.slug } }) });
    }

    const theme = await prisma.theme.create({
      data: {
        name: c.name, slug: c.slug, description: c.description || "", version: c.version || "1.0.0",
        author: c.author || "", config: JSON.parse(JSON.stringify(c.config || {})),
        templates: JSON.parse(JSON.stringify(c.templates || [])), styles: JSON.parse(JSON.stringify(c.styles || {})),
      },
    });
    return NextResponse.json({ theme }, { status: 201 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
