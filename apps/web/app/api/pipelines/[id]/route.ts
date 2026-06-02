import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.option.deleteMany({
    where: { key: `pipeline:${id}`, siteId: null },
  });
  return NextResponse.json({ success: true });
}
