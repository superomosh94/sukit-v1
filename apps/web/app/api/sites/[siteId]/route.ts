import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

async function getSiteOrThrow(siteId: string, userId: string) {
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId },
  });
  if (!site) {
    throw new Error("NOT_FOUND");
  }
  return site;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  try {
    const { siteId } = await params;
    const site = await getSiteOrThrow(siteId, session.user.id);
    return NextResponse.json(site);
  } catch {
    return NextResponse.json(
      { error: { message: "Site not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  try {
    const { siteId } = await params;
    await getSiteOrThrow(siteId, session.user.id);
    const body = await request.json();
    const site = await prisma.site.update({
      where: { id: siteId },
      data: { name: body.name },
    });
    return NextResponse.json(site);
  } catch {
    return NextResponse.json(
      { error: { message: "Site not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  try {
    const { siteId } = await params;
    await getSiteOrThrow(siteId, session.user.id);
    await prisma.site.delete({ where: { id: siteId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: { message: "Site not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }
}
