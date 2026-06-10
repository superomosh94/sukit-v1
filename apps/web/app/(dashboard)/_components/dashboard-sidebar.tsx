'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Globe,
  Blocks,
  Code2,
  Puzzle,
  Settings,
  Megaphone,
  Package,
  Rocket,
  GitBranch,
  Key,
  Users,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  PanelTop,
  FileText,
  Image,
  FormInput,
  Database,
  Store,
  Shield,
  User,
  MessageSquare,
  Tags,
  BookOpen,
  Palette,
  Layout,
  Timer,
  HardDrive,
  Trash2,
  Wrench,
  BarChart3,
  Webhook,
  Search,
} from 'lucide-react';

interface NavChild {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  children?: NavChild[];
}

const navItems: NavGroup[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },

  // Site Manager module
  {
    label: 'Sites',
    icon: Globe,
    href: '/sites',
    children: [
      { label: 'All Sites', icon: Globe, href: '/sites' },
      { label: 'Builder', icon: Blocks, href: '/builder' },
      { label: 'Pages', icon: FileText, href: '/sites/pages' },
      { label: 'Media', icon: Image, href: '/sites/media' },
      { label: 'Team', icon: Users, href: '/team' },
      { label: 'Backups', icon: HardDrive, href: '/backups' },
      { label: 'Trash', icon: Trash2, href: '/sites/trash' },
    ],
  },

  // Content module
  {
    label: 'Content',
    icon: BookOpen,
    href: '/posts',
    children: [
      { label: 'Posts', icon: FileText, href: '/posts' },
      { label: 'Categories', icon: Tags, href: '/taxonomies?type=category' },
      { label: 'Tags', icon: Tags, href: '/taxonomies?type=tag' },
      { label: 'Comments', icon: MessageSquare, href: '/comments' },
      { label: 'Forms', icon: FormInput, href: '/sites/forms' },
    ],
  },

  // Popup Builder module
  {
    label: 'Popups',
    icon: Megaphone,
    href: '/popups',
    children: [
      { label: 'All Popups', icon: PanelTop, href: '/popups' },
      { label: 'Analytics', icon: BarChart3, href: '/popups/analytics' },
    ],
  },

  // Developer section
  {
    label: 'Developer',
    icon: Code2,
    href: '/code',
    children: [
      { label: 'Code Editor', icon: Code2, href: '/code' },
      { label: 'Modules', icon: Puzzle, href: '/modules' },
      { label: 'Blocks', icon: Blocks, href: '/blocks' },
      {
        label: 'Module Marketplace',
        icon: Store,
        href: '/modules/marketplace',
      },
      { label: 'Plugins', icon: Package, href: '/plugins' },
      { label: 'Plugin Registry', icon: Database, href: '/plugins/registry' },
      { label: 'Webhooks', icon: Webhook, href: '/webhooks' },
    ],
  },

  // Deploy
  {
    label: 'Deploy',
    icon: Rocket,
    href: '/deploy',
    children: [
      { label: 'Providers', icon: Rocket, href: '/deploy' },
      { label: 'CI/CD', icon: GitBranch, href: '/deploy/ci' },
      { label: 'Secrets', icon: Key, href: '/deploy/secrets' },
    ],
  },

  // Tools
  {
    label: 'Tools',
    icon: Wrench,
    href: '/audit',
    children: [
      { label: 'Audit Log', icon: ClipboardList, href: '/audit' },
      { label: 'Search', icon: Search, href: '/search' },
      { label: 'SEO', icon: BarChart3, href: '/seo' },
      { label: 'Cron Jobs', icon: Timer, href: '/cron' },
    ],
  },

  // Settings
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    children: [
      { label: 'Profile', icon: User, href: '/settings/profile' },
      { label: 'Account', icon: Shield, href: '/settings/account' },
      { label: 'Themes', icon: Palette, href: '/themes' },
      { label: 'Widgets', icon: Layout, href: '/widgets' },
      { label: 'API Keys', icon: Key, href: '/settings/api-keys' },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const isParentActive = (item: NavGroup): boolean => {
    if (isActive(item.href)) return true;
    return !!item.children?.some((c) => isActive(c.href));
  };

  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () => new Set([])
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const next = new Set<string>();
      for (const item of navItems) {
        if (item.children?.some((c) => isActive(c.href))) {
          next.add(item.label);
        }
      }
      setExpandedItems(next);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      if (prev.has(label)) {
        prev.delete(label);
        return new Set(prev);
      }
      return new Set([label]);
    });
  };

  return (
    <aside className="flex w-64 flex-col border-r bg-sidebar overflow-y-auto">
      <Link
        href="/dashboard"
        className="flex h-14 items-center border-b px-6 font-bold gap-2 shrink-0"
      >
        <Blocks className="size-5 text-primary" />
        <span>SUKIT</span>
      </Link>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;
          const expanded = expandedItems.has(item.label);
          const parentActive = isParentActive(item);

          return (
            <div key={item.href}>
              <div className="flex items-center">
                {hasChildren ? (
                  <>
                    <Link
                      href={item.href as any}
                      className={cn(
                        'flex flex-1 items-center gap-3 rounded-l-lg px-3 py-2 text-sm font-medium transition-colors',
                        parentActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={cn(
                        'flex items-center justify-center rounded-r-lg px-2 py-2 text-sm transition-colors',
                        parentActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      title={expanded ? 'Collapse' : 'Expand'}
                    >
                      {expanded ? (
                        <ChevronDown className="size-3.5" />
                      ) : (
                        <ChevronRight className="size-3.5" />
                      )}
                    </button>
                  </>
                ) : (
                  <Link
                    href={item.href as any}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>

              {hasChildren && (
                <div
                  className={cn(
                    'ml-4 mt-0.5 space-y-0.5 border-l pl-2 overflow-hidden transition-all duration-200 ease-in-out',
                    expanded
                      ? 'max-h-96 opacity-100'
                      : 'max-h-0 opacity-0 pointer-events-none'
                  )}
                >
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href as any}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors',
                          childActive
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {ChildIcon && (
                          <ChildIcon className="size-3.5 shrink-0" />
                        )}
                        <span className="truncate">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t p-3 shrink-0 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
        >
          <Globe className="size-4" />
          <span>Back to Site</span>
        </Link>
        <a
          href="/blog"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
        >
          <FileText className="size-4" />
          <span>Visit Blog</span>
        </a>
      </div>
    </aside>
  );
}
