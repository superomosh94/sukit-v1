import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, newPassword } = body;

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Token and new password required" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const options = await prisma.option.findMany({
    where: { key: { startsWith: "reset_token_" } },
  });

  let userId: string | null = null;
  for (const opt of options) {
    const val = opt.value as { token: string; expires: string };
    if (val.token === token && new Date(val.expires) > new Date()) {
      userId = opt.key.replace("reset_token_", "");
      break;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { hashedPassword },
  });

  await prisma.option.deleteMany({
    where: { key: `reset_token_${userId}` },
  });

  return NextResponse.json({ success: true });
}
