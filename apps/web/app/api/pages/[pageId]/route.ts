import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(
  _request: Request,
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
  request: Request,
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
  const body = await request.json();

  // Update page-level fields
  await prisma.page.update({
    where: { id: pageId },
    data: {
      title: body.title,
      slug: body.slug,
      isHome: body.isHome,
      metadata: body.metadata,
      pageSettings: body.pageSettings,
    },
  });

  // Replace sections if provided
  if (body.sections) {
    await prisma.section.deleteMany({ where: { pageId } });
    for (const section of body.sections) {
      const created = await prisma.section.create({
        data: {
          pageId,
          sectionType: section.sectionType,
          sortOrder: section.sortOrder,
          settings: section.settings,
          responsive: section.responsive ?? {},
        },
      });

      for (const column of section.columns ?? []) {
        const createdColumn = await prisma.column.create({
          data: {
            sectionId: created.id,
            gridRow: column.gridRow ?? 1,
            gridCol: column.gridCol ?? 1,
            span: column.span ?? 12,
            sortOrder: column.sortOrder,
            settings: column.settings ?? {},
          },
        });

        for (const block of column.blocks ?? []) {
          await prisma.block.create({
            data: {
              columnId: createdColumn.id,
              blockType: block.blockType,
              sortOrder: block.sortOrder,
              props: block.props ?? {},
              styles: block.styles ?? {},
              responsive: block.responsive ?? {},
              animation: block.animation ?? {
                type: "none",
                duration: 300,
                delay: 0,
                easing: "ease-out",
                cascadeLevel: 0,
              },
            },
          });
        }
      }
    }
  }

  const updated = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          columns: {
            orderBy: { sortOrder: "asc" },
            include: { blocks: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  return NextResponse.json(updated);
}
