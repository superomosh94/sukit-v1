import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { pageId } = await params;

  const page = await prisma.page.findFirst({
    where: { id: pageId, site: { userId: session.user.id } },
    include: { sections: { include: { columns: { include: { blocks: true } } } } },
  });

  if (!page) {
    return NextResponse.json(
      { error: { message: "Page not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  const latestRevision = await prisma.publishedPage.findFirst({
    where: { pageId },
    orderBy: { version: "desc" },
  });

  const nextVersion = (latestRevision?.version ?? 0) + 1;

  await prisma.publishedPage.create({
    data: {
      pageId,
      version: nextVersion,
      content: JSON.parse(JSON.stringify({ sections: page.sections, pageSettings: page.pageSettings, metadata: page.metadata })),
    },
  });

  const published = await prisma.page.update({
    where: { id: pageId },
    data: { publishedAt: new Date() },
  });

  return NextResponse.json({ ...published, version: nextVersion });
}
