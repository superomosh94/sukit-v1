import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { z } from "zod";

const createSiteSchema = z.object({
  name: z.string().min(1).max(100),
  subdomain: z.string().optional(),
  template: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sites);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const parsed = createSiteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Invalid input", code: "VALIDATION_ERROR" } },
        { status: 400 },
      );
    }

    const { name, subdomain, template } = parsed.data;

    const site = await prisma.site.create({
      data: {
        name,
        domain: subdomain ?? name.toLowerCase().replace(/\s+/g, "-"),
        userId: session.user.id,
        settings: {
          theme: {
            primaryColor: "#0f172a",
            secondaryColor: "#64748b",
            backgroundColor: "#ffffff",
            textColor: "#0f172a",
            fontFamily: "Inter",
            headingFont: "Inter",
            borderRadius: 8,
          },
          typography: {},
          seo: {
            defaultTitle: name,
            defaultDescription: "",
            favicon: "",
          },
          domain: { custom: null, subdomain: subdomain ?? "" },
          code: { head: "", body: "" },
        },
      },
    });

    // Create home page if template is provided
    if (template && template !== "blank") {
      await prisma.page.create({
        data: {
          siteId: site.id,
          title: "Home",
          slug: "home",
          isHome: true,
          metadata: { title: name, description: "" },
          pageSettings: { headHtml: "", pageSettings: {}, seoSettings: {} },
        },
      });
    }

    return NextResponse.json(site, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500 },
    );
  }
}
