import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { exportToZip } from '@/lib/export/export-adapter';

export async function GET(
  _request: Request,
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
    const buffer = await exportToZip(siteId);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${siteId}-pern-app.zip"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json(
      { error: { message, code: 'EXPORT_ERROR' } },
      { status: 500 }
    );
  }
}
