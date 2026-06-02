import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  const members = users.map((u) => ({
    id: u.id,
    name: u.name ?? u.email.split('@')[0],
    email: u.email,
    avatar: u.image,
    role: 'owner',
  }));

  return NextResponse.json({ members, total: members.length });
}
