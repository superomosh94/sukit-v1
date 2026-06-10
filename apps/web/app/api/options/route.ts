import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");

  const where: any = { siteId: siteId || null };
  const options = await prisma.option.findMany({ where, orderBy: { key: "asc" } });
  return NextResponse.json({ options });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { key, value, autoload, siteId } = body;

  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const option = await prisma.option.upsert({
    where: { key_siteId: { key, siteId: siteId || "" } },
    update: { value: JSON.parse(JSON.stringify(value)), autoload: autoload ?? true },
    create: { key, value: JSON.parse(JSON.stringify(value || {})), autoload: autoload ?? true, siteId: siteId || null },
  });

  return NextResponse.json({ option }, { status: 201 });
}
