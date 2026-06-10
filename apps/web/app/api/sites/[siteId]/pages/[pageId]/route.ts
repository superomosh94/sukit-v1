import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { siteId, pageId } = await params;
  const page = await prisma.page.findFirst({
    where: { id: pageId, siteId, site: { userId: session.user.id } },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          columns: {
            orderBy: { sortOrder: "asc" },
            include: {
              blocks: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!page) {
    return NextResponse.json(
      { error: { message: "Page not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  return NextResponse.json(page);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { siteId, pageId } = await params;
  const body = await request.json();

  const page = await prisma.page.update({
    where: { id: pageId, siteId },
    data: {
      title: body.title,
      slug: body.slug,
      isHome: body.isHome,
      metadata: body.metadata,
      pageSettings: body.pageSettings,
    },
  });

  return NextResponse.json(page);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string; pageId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { siteId, pageId } = await params;
  await prisma.page.delete({ where: { id: pageId, siteId } });
  return NextResponse.json({ success: true });
}
