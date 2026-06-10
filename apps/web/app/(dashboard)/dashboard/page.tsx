import Link from 'next/link';
import {
  Globe,
  FileText,
  Newspaper,
  MessageSquare,
  Layout,
  Image,
  Users,
  Settings,
  ChevronRight,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

const statCards = [
  {
    label: 'Total Sites',
    key: 'siteCount',
    icon: Globe,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Published Pages',
    key: 'pageCount',
    icon: FileText,
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'Blog Posts',
    key: 'postCount',
    icon: Newspaper,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Media Files',
    key: 'mediaCount',
    icon: Image,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    label: 'M-Pesa Transactions',
    key: 'mpesaCount',
    icon: Smartphone,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    label: 'Comments',
    key: 'commentCount',
    icon: MessageSquare,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
] as const;

const quickActions = [
  {
    label: 'New Site',
    href: '/sites/new',
    icon: Globe,
    description: 'Create a new website',
  },
  {
    label: 'Blog Editor',
    href: '/posts',
    icon: Newspaper,
    description: 'Write a blog post',
  },
  {
    label: 'Design Themes',
    href: '/themes',
    icon: Layout,
    description: 'Customize your look',
  },
  { label: 'Team', href: '/team', icon: Users, description: 'Manage members' },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configure your account',
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [
    siteCount,
    pageCount,
    mediaCount,
    postCount,
    commentCount,
    sites,
    recentActivity,
  ] = await Promise.all([
    userId ? prisma.site.count({ where: { userId } }) : 0,
    userId ? prisma.page.count({ where: { site: { userId } } }) : 0,
    userId ? prisma.media.count({ where: { site: { userId } } }) : 0,
    userId
      ? prisma.post.count({ where: { site: { userId }, status: 'PUBLISHED' } })
      : 0,
    userId ? prisma.comment.count({ where: { site: { userId } } }) : 0,
    userId
      ? prisma.site.findMany({
          where: { userId },
          include: { _count: { select: { pages: true, posts: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        })
      : Promise.resolve([]),
    userId
      ? prisma.userActivity.findMany({
          where: { userId },
          include: { site: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  // Get M-Pesa transaction count separately
  const userSiteIds = sites.map(s => s.id);
  let mpesaCount = 0;
  try {
    if (userId && userSiteIds.length && (prisma as any).mpesaTransaction) {
      mpesaCount = await (prisma as any).mpesaTransaction.count({ where: { siteId: { in: userSiteIds } } });
    }
  } catch {
    // M-Pesa table may not exist yet
  }

  const stats = {
    siteCount,
    pageCount,
    mediaCount,
    postCount,
    mpesaCount,
    commentCount,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back,{' '}
            <span className="font-medium text-foreground">
              {session?.user?.name ?? 'User'}
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {statCards.map(({ label, key, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md"
          >
            <div className={`mb-3 inline-flex rounded-lg ${bg} p-2.5 ${color}`}>
              <Icon className="size-5" />
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {stats[key as keyof typeof stats]}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold">Your Sites</h2>
              <Link
                href="/sites/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              >
                <Globe className="size-4" />
                New Site
              </Link>
            </div>
            {sites.length > 0 ? (
              <div className="divide-y">
                {sites.map((site) => (
                  <Link
                    key={site.id}
                    href={`/sites/${site.id}/pages` as any}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent/50 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                        <Globe className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {site.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {site._count.pages} pages &middot; {site._count.posts}{' '}
                          posts
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                  <Globe className="size-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium">No sites yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Create your first site to get started.
                </p>
                <Link
                  href="/sites/new"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  <Globe className="size-4" />
                  Create Site
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Recent Activity</h2>
            </div>
            {recentActivity.length > 0 ? (
              <div className="divide-y">
                {recentActivity.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between px-6 py-3.5 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{a.action}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        on {a.site.name}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground ml-4 tabular-nums">
                      {relativeTime(a.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-12">
                No recent activity.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map(({ label, href, icon: Icon, description }) => (
                <Link
                  key={label}
                  href={href as any}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent group"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {description}
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {mpesaCount > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold mb-1">M-Pesa Summary</h2>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Smartphone className="size-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold tabular-nums">{mpesaCount}</div>
                  <div className="text-xs text-muted-foreground">Total Transactions</div>
                </div>
              </div>
              <a
                href="#"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                View Transactions
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          )}

          {!mpesaCount && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold mb-1">Quick Tip</h2>
              <p className="text-sm text-muted-foreground">
                Add M-Pesa payments to your sites to start accepting mobile money from Kenyan customers.
              </p>
              <Link
                href="/modules"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Enable M-Pesa
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
