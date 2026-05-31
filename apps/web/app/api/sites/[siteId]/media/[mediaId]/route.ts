import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { getStorageAdapter } from "@/lib/media/storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ siteId: string; mediaId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { siteId, mediaId } = await params;
  const media = await prisma.media.findFirst({
    where: { id: mediaId, siteId, site: { userId: session.user.id } },
  });

  if (!media) {
    return NextResponse.json(
      { error: { message: "Media not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  try {
    const storage = getStorageAdapter();
    const url = new URL(media.url);
    const path = url.pathname.replace("/uploads/", "");
    await storage.delete(path);
  } catch {
    // File may not exist on storage
  }

  await prisma.media.delete({ where: { id: mediaId } });
  return NextResponse.json({ success: true });
}
