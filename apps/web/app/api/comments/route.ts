import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (siteId) where.siteId = siteId;
  if (status) where.status = status;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: { user: { select: { name: true, email: true, image: true } }, page: { select: { title: true, slug: true } }, post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);

  return NextResponse.json({ comments, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content, authorName, authorEmail, authorUrl, pageId, postId, parentId, siteId } = body;

  if (!content || !siteId) return NextResponse.json({ error: "Content and siteId required" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      content,
      authorName: authorName || session.user.name || "Anonymous",
      authorEmail: authorEmail || session.user.email || "",
      authorUrl,
      authorIp: req.headers.get("x-forwarded-for") || "",
      siteId,
      pageId: pageId || null,
      postId: postId || null,
      parentId: parentId || null,
      userId: session.user.id,
      status: "APPROVED",
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
