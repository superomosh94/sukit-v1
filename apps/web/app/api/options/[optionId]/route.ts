import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ optionId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { optionId } = await params;
  const body = await req.json();
  const option = await prisma.option.update({ where: { id: optionId }, data: { value: JSON.parse(JSON.stringify(body.value)) } });
  return NextResponse.json({ option });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ optionId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { optionId } = await params;
  await prisma.option.delete({ where: { id: optionId } });
  return NextResponse.json({ success: true });
}
