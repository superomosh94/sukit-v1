import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [siteCount, pageCount, popupCount, mediaCount, postCount, commentCount, sites, recentActivity] =
    await Promise.all([
      userId ? prisma.site.count({ where: { userId } }) : 0,
      userId ? prisma.page.count({ where: { site: { userId } } }) : 0,
      userId ? prisma.popup.count({ where: { site: { userId } } }) : 0,
      userId ? prisma.media.count({ where: { site: { userId } } }) : 0,
      userId ? prisma.post.count({ where: { site: { userId }, status: "PUBLISHED" } }) : 0,
      userId ? prisma.comment.count({ where: { site: { userId } } }) : 0,
      userId
        ? prisma.site.findMany({
            where: { userId },
            include: { _count: { select: { pages: true, posts: true } } },
            orderBy: { updatedAt: "desc" },
            take: 5,
          })
        : Promise.resolve([]),
      userId
        ? prisma.userActivity.findMany({
            where: { userId },
            include: { site: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : Promise.resolve([]),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name ?? "User"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Sites", value: siteCount },
          { label: "Published Pages", value: pageCount },
          { label: "Blog Posts", value: postCount },
          { label: "Comments", value: commentCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your Sites</h2>
          <Link
            href="/sites/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            New Site
          </Link>
        </div>
        {sites.length > 0 ? (
          <div className="mt-4 space-y-2">
            {sites.map((site) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <span className="font-medium">{site.name}</span>
                <span className="text-sm text-muted-foreground">
                  {site._count.pages} pages, {site._count.posts} posts
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-center text-sm text-muted-foreground py-12">
            No sites yet. Create your first site to get started.
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="mt-4 space-y-2">
            {recentActivity.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <span>{a.action}</span>
                <span className="text-muted-foreground">
                  {a.site.name} &middot;{" "}
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-center text-sm text-muted-foreground py-8">
            No recent activity.
          </div>
        )}
      </div>
    </div>
  );
}
