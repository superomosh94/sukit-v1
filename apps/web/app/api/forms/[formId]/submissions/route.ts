import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { formId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1), 200);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

  const form = await prisma.form.findFirst({
    where: { id: formId, site: { userId: session.user.id } },
  });

  if (!form) {
    return NextResponse.json(
      { error: { message: "Form not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  const [submissions, totalResult] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "form_submissions" WHERE "formId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`,
      formId,
      limit,
      offset
    ),
    prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM "form_submissions" WHERE "formId" = $1`,
      formId
    ),
  ]);
  const total = Number(totalResult[0].count);

  return NextResponse.json({ submissions, total, limit, offset });
}
