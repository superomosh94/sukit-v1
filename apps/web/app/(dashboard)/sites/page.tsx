import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { formatRelativeTime } from "@/lib/utils/format";

export default async function SitesPage() {
  const session = await auth();
  const sites = await prisma.site.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pages: true } } },
  });

  // Serialize for client
  const serialized = sites.map((s) => ({
    id: s.id,
    name: s.name,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    _count: s._count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-muted-foreground">
            Manage your websites
          </p>
        </div>
        <Link
          href="/sites/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Site
        </Link>
      </div>

      {serialized.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
          <p className="text-sm text-muted-foreground">No sites yet</p>
          <Link
            href="/sites/new"
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Create Your First Site
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {serialized.map((site) => (
          <Link
            key={site.id}
            href={`/sites/${site.id}/pages`}
            className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/50"
          >
            <h3 className="font-semibold">{site.name}</h3>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{site._count.pages} pages</span>
              <span>{formatRelativeTime(site.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
