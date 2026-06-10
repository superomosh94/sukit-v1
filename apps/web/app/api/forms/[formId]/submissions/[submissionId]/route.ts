import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string; submissionId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { formId, submissionId } = await params;

  const form = await prisma.form.findFirst({
    where: { id: formId, site: { userId: session.user.id } },
  });

  if (!form) {
    return NextResponse.json(
      { error: { message: "Form not found", code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  await prisma.$executeRawUnsafe(
    `DELETE FROM "form_submissions" WHERE "id" = $1 AND "formId" = $2`,
    submissionId,
    formId
  );

  return NextResponse.json({ success: true });
}
