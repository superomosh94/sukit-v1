import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { generateStaticExport } from "@/lib/export/static-export";

export async function POST(
  _request: NextRequest,
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

  try {
    const result = await generateStaticExport(siteId);
    return NextResponse.json({
      success: true,
      files: result.files.length,
      sitemap: result.sitemap,
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Export failed", code: "EXPORT_ERROR" } },
      { status: 500 },
    );
  }
}
