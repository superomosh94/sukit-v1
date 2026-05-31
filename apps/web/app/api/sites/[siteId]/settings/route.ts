import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

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

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });

  if (!site) {
    return NextResponse.json(
      { error: { message: "Site not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  return NextResponse.json(site.settings ?? {});
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

  const { siteId } = await params;
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });

  if (!site) {
    return NextResponse.json(
      { error: { message: "Site not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();
    const settings = body.settings ?? body;

    const updated = await prisma.site.update({
      where: { id: siteId },
      data: { settings },
    });

    return NextResponse.json(updated.settings);
  } catch {
    return NextResponse.json(
      { error: { message: "Failed to update settings", code: "INTERNAL_ERROR" } },
      { status: 500 },
    );
  }
}
