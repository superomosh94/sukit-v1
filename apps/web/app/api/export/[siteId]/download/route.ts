import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { buildSite } from "@/lib/export/sukit-builder";
import { createZipBuffer } from "@/lib/export/zip";

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

  try {
    const result = await buildSite(siteId, '/tmp/sukit-export', { minify: true });
    const buffer = await createZipBuffer(
      result.files.map(f => ({ path: f.path, content: f.content }))
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${siteId}-export.zip"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Export failed", code: "EXPORT_ERROR" } },
      { status: 500 },
    );
  }
}
