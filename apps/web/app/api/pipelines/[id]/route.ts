import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.option.deleteMany({
    where: { key: `pipeline:${id}`, siteId: '' },
  });
  return NextResponse.json({ success: true });
}
