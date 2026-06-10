import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Invalid input", code: "VALIDATION_ERROR" } },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: { message: "Email already registered", code: "CONFLICT" } },
        { status: 409 },
      );
    }

    const { hash } = await import("bcryptjs");
    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, hashedPassword },
    });

    const { sign } = await import("jsonwebtoken");
    const secret = process.env.NEXTAUTH_SECRET || "sukit-dev-secret";
    const token = sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: "7d" },
    );

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500 },
    );
  }
}
