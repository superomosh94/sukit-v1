import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(
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

  const maxOrder = await prisma.section.aggregate({
    where: { pageId },
    _max: { sortOrder: true },
  });

  const section = await prisma.section.create({
    data: {
      pageId,
      sectionType: body.sectionType ?? "container",
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      settings: body.settings ?? {},
      responsive: body.responsive ?? {},
      columns: {
        create: [
          {
            gridRow: 1,
            gridCol: 1,
            span: 12,
            sortOrder: 0,
            settings: {},
          },
        ],
      },
    },
    include: { columns: true },
  });

  return NextResponse.json(section, { status: 201 });
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

  if (body.sections && Array.isArray(body.sections)) {
    for (const s of body.sections) {
      await prisma.section.update({
        where: { id: s.id, pageId },
        data: { sortOrder: s.sortOrder },
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
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

  await prisma.section.delete({
    where: { id: body.sectionId, pageId },
  });

  return NextResponse.json({ success: true });
}
