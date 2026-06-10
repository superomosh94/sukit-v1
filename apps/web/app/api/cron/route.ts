import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const status = searchParams.get("status");

  const where: any = {};
  if (siteId) where.siteId = siteId;
  if (status) where.status = status;

  const jobs = await prisma.cronJob.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, hook, args, schedule, siteId } = body;

  if (!name || !hook) return NextResponse.json({ error: "name, hook required" }, { status: 400 });

  const job = await prisma.cronJob.create({
    data: {
      name,
      hook,
      args: JSON.parse(JSON.stringify(args || {})),
      schedule: schedule || null,
      nextRun: schedule ? new Date() : null,
      siteId: siteId || null,
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
