import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ areaId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { areaId } = await params;
  const body = await req.json();

  if (body.widgets) {
    const area = await prisma.widgetArea.update({
      where: { id: areaId },
      data: { widgets: JSON.parse(JSON.stringify(body.widgets)) },
    });
    return NextResponse.json({ area });
  }

  const area = await prisma.widgetArea.update({ where: { id: areaId }, data: body });
  return NextResponse.json({ area });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ areaId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { areaId } = await params;
  await prisma.widgetArea.delete({ where: { id: areaId } });
  return NextResponse.json({ success: true });
}
