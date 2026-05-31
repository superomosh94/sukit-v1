import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { buildSite } from "@/lib/export/sukit-builder";
import os from 'os';
import path from 'path';

export async function POST(
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
    const outputDir = path.join(os.tmpdir(), `sukit-export-${siteId}`);
    const result = await buildSite(siteId, outputDir, { minify: true, cleanBeforeBuild: true });

    return NextResponse.json({
      exportId: crypto.randomUUID(),
      status: "completed",
      files: result.files.map(f => ({ path: f.path, size: Buffer.byteLength(f.content, 'utf-8') })),
      pageCount: result.pageCount,
      assetCount: result.assetCount,
      totalSize: result.totalSize,
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Export failed", code: "EXPORT_ERROR" } },
      { status: 500 },
    );
  }
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

  const { siteId } = await params;

  try {
    const outputDir = path.join(os.tmpdir(), `sukit-export-${siteId}`);
    const result = await buildSite(siteId, outputDir, { minify: true });

    return NextResponse.json({
      siteId,
      exportId: crypto.randomUUID(),
      status: "completed",
      files: result.files.map(f => ({ path: f.path, size: Buffer.byteLength(f.content, 'utf-8') })),
      pageCount: result.pageCount,
      totalSize: result.totalSize,
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Export not available", code: "EXPORT_NOT_FOUND" } },
      { status: 404 },
    );
  }
}
