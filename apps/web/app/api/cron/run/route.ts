import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(req: Request) {
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

  if (job.hook === "backup") {
    const args = job.args as { siteId: string; name?: string | null };

    await prisma.cronJob.update({
      where: { id: jobId },
      data: { status: "RUNNING" },
    });

    try {
      const siteId = args.siteId;

      const pages = await prisma.page.findMany({
        where: { siteId },
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: {
              columns: {
                orderBy: { sortOrder: "asc" },
                include: {
                  blocks: { orderBy: { sortOrder: "asc" } },
                },
              },
            },
          },
        },
      });

      const media = await prisma.media.findMany({ where: { siteId } });
      const forms = await prisma.form.findMany({ where: { siteId } });
      const menus = await prisma.menu.findMany({ where: { siteId } });

      const snapshot = JSON.stringify({
        exportedAt: new Date().toISOString(),
        siteId,
        pages,
        media,
        forms,
        menus,
      });

      await prisma.siteSnapshot.create({
        data: {
          siteId,
          file: snapshot,
        },
      });

      const completed = await prisma.cronJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          lastRun: new Date(),
          error: null,
        },
      });

      return NextResponse.json({ job: completed });
    } catch (error) {
      const failed = await prisma.cronJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown error",
          lastRun: new Date(),
        },
      });

      return NextResponse.json({ job: failed }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: { message: `Unknown hook: ${job.hook}`, code: "UNKNOWN_HOOK" } },
    { status: 400 },
  );
}
