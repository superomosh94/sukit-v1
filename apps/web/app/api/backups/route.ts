import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "siteId required" }, { status: 400 });
  }

  const jobs = await prisma.cronJob.findMany({
    where: { hook: "backup", siteId, site: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ backups: jobs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { siteId, name, schedule } = body;

  if (!siteId) {
    return NextResponse.json({ error: "siteId required" }, { status: 400 });
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const job = await prisma.cronJob.create({
    data: {
      name: name || `Backup ${new Date().toISOString().split("T")[0]}`,
      hook: "backup",
      args: { siteId, name: name || null },
      status: "PENDING",
      schedule: schedule || null,
      nextRun: schedule ? new Date() : null,
      siteId,
    },
  });

  return NextResponse.json({ backup: job }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { jobId } = body;

  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  const job = await prisma.cronJob.findFirst({
    where: { id: jobId, site: { userId: session.user.id } },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  await prisma.cronJob.delete({ where: { id: jobId } });
  return NextResponse.json({ success: true });
}
