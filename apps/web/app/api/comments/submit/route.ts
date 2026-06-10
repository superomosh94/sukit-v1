import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content, authorName, authorEmail, authorUrl, pageId, postId, parentId, siteId } = body;

  if (!content || !authorName || !authorEmail || !siteId) {
    return NextResponse.json({ error: "content, authorName, authorEmail, siteId required" }, { status: 400 });
  }

  if (!pageId && !postId) {
    return NextResponse.json({ error: "pageId or postId required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorName,
      authorEmail,
      authorUrl: authorUrl || null,
      authorIp: req.headers.get("x-forwarded-for") || "",
      userAgent: req.headers.get("user-agent") || "",
      siteId,
      pageId: pageId || null,
      postId: postId || null,
      parentId: parentId || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ comment, message: "Comment submitted for moderation" }, { status: 201 });
}
