import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { exportFullStack } from '@/lib/export/export-adapter';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { siteId } = await params;

  try {
    const tree = await exportFullStack(siteId);
    return NextResponse.json({
      exportId: crypto.randomUUID(),
      format: 'pern-stack',
      status: 'completed',
      files: tree.getAll().map((f) => ({
        path: f.path,
        size:
          typeof f.content === 'string'
            ? Buffer.byteLength(f.content, 'utf-8')
            : f.content.byteLength,
      })),
      fileCount: tree.size,
      totalSize: tree.totalBytes(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          message: err instanceof Error ? err.message : 'Export failed',
          code: 'EXPORT_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { siteId } = await params;

  try {
    const tree = await exportFullStack(siteId);
    return NextResponse.json({
      siteId,
      exportId: crypto.randomUUID(),
      format: 'pern-stack',
      status: 'completed',
      files: tree.getAll().map((f) => ({
        path: f.path,
        size:
          typeof f.content === 'string'
            ? Buffer.byteLength(f.content, 'utf-8')
            : f.content.byteLength,
      })),
      fileCount: tree.size,
      totalSize: tree.totalBytes(),
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Export not available', code: 'EXPORT_NOT_FOUND' } },
      { status: 404 }
    );
  }
}
