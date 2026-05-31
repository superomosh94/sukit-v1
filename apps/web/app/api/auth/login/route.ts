import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sign } from "jsonwebtoken";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 },
    );
  }

  const { compare } = await import("bcryptjs");
  const valid = await compare(password, user.hashedPassword);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 },
    );
  }

  const secret = process.env.NEXTAUTH_SECRET || "sukit-dev-secret";
  const token = sign(
    { userId: user.id, email: user.email },
    secret,
    { expiresIn: "7d" },
  );

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}
