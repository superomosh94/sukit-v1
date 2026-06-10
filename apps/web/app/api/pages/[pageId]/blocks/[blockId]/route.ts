import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string; blockId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { blockId } = await params;
  const body = await request.json();

  const block = await prisma.block.update({
    where: { id: blockId },
    data: {
      props: body.props,
      styles: body.styles,
      responsive: body.responsive,
      animation: body.animation,
    },
  });

  return NextResponse.json(block);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string; blockId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { blockId } = await params;
  await prisma.block.delete({ where: { id: blockId } });
  return NextResponse.json({ success: true });
}
