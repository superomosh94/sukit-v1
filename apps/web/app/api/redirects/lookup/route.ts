import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get("host");

  if (!host) {
    return NextResponse.json({ redirects: [] });
  }

  const option = await prisma.option.findFirst({
    where: {
      key: { in: [`redirects_${host}`, "redirects_*"] },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ redirects: (option?.value as Record<string, unknown>[]) || [] });
}
