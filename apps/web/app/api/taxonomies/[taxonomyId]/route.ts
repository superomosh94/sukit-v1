import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ taxonomyId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { taxonomyId } = await params;
  const body = await req.json();
  const taxonomy = await prisma.taxonomy.update({ where: { id: taxonomyId }, data: body });
  return NextResponse.json({ taxonomy });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ taxonomyId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { taxonomyId } = await params;
  await prisma.taxonomy.delete({ where: { id: taxonomyId } });
  return NextResponse.json({ success: true });
}
