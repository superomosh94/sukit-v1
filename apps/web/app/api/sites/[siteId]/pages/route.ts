import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { siteId } = await params;
  const pages = await prisma.page.findMany({
    where: { siteId, site: { userId: session.user.id } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(pages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { siteId } = await params;
  const body = await request.json();

  const page = await prisma.page.create({
    data: {
      siteId,
      title: body.title ?? "Untitled",
      slug: body.slug ?? body.title?.toLowerCase().replace(/\s+/g, "-") ?? "untitled",
      isHome: body.isHome ?? false,
      metadata: body.metadata ?? { title: body.title ?? "", description: "" },
      pageSettings: { headHtml: "", pageSettings: {}, seoSettings: {} },
    },
  });

  return NextResponse.json(page, { status: 201 });
}
