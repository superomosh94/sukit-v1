"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";
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
  PanelTop,
  FileText,
  Image,
  FormInput,
  Database,
  Store,
  CreditCard,
  Shield,
  User,
  MessageSquare,
  Tags,
  BookOpen,
  Palette,
  Layout,
  Timer,
} from "lucide-react";

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  children?: { label: string; href: string; icon?: React.ComponentType<{ className?: string }> }[];
}

const navItems: NavGroup[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "Sites", icon: Globe, href: "/sites",
    children: [
      { label: "All Sites", icon: Globe, href: "/sites" },
      { label: "Pages", icon: FileText, href: "/sites/pages" },
      { label: "Media", icon: Image, href: "/sites/media" },
      { label: "Forms", icon: FormInput, href: "/sites/forms" },
    ],
  },
  { label: "Builder", icon: Blocks, href: "/builder" },
  {
    label: "Popups", icon: Megaphone, href: "/popups",
    children: [
      { label: "All Popups", icon: PanelTop, href: "/popups" },
      { label: "Analytics", icon: ClipboardList, href: "/popups/analytics" },
    ],
  },
  {
    label: "Modules", icon: Puzzle, href: "/modules",
    children: [
      { label: "Installed", icon: Package, href: "/modules" },
      { label: "Marketplace", icon: Store, href: "/modules/marketplace" },
    ],
  },
  {
    label: "Plugins", icon: Package, href: "/plugins",
    children: [
      { label: "Installed", icon: Package, href: "/plugins" },
      { label: "Add Plugin", icon: Package, href: "/plugins/add" },
      { label: "Create Plugin", icon: Code2, href: "/plugins/create" },
      { label: "Registry", icon: Database, href: "/plugins/registry" },
    ],
  },
  { label: "Code", icon: Code2, href: "/code" },
  {
    label: "Deploy", icon: Rocket, href: "/deploy",
    children: [
      { label: "Providers", icon: Rocket, href: "/deploy" },
      { label: "CI/CD", icon: GitBranch, href: "/deploy/ci" },
      { label: "Secrets", icon: Key, href: "/deploy/secrets" },
    ],
  },
  { label: "Team", icon: Users, href: "/team" },
  { label: "Audit", icon: ClipboardList, href: "/audit" },
  {
    label: "Content", icon: BookOpen, href: "/posts",
    children: [
      { label: "Posts", icon: FileText, href: "/posts" },
      { label: "Categories", icon: Tags, href: "/taxonomies?type=category" },
      { label: "Tags", icon: Tags, href: "/taxonomies?type=tag" },
    ],
  },
  { label: "Comments", icon: MessageSquare, href: "/comments" },
  {
    label: "Appearance", icon: Palette, href: "/themes",
    children: [
      { label: "Themes", icon: Palette, href: "/themes" },
      { label: "Widgets", icon: Layout, href: "/widgets" },
    ],
  },
  { label: "Cron Jobs", icon: Timer, href: "/cron" },
  {
    label: "Settings", icon: Settings, href: "/settings",
    children: [
      { label: "Profile", icon: User, href: "/settings/profile" },
      { label: "Account", icon: Shield, href: "/settings/account" },
      { label: "API Keys", icon: Key, href: "/settings/api-keys" },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex w-64 flex-col border-r bg-sidebar overflow-y-auto">
      <Link
        href="/dashboard"
        className="flex h-14 items-center border-b px-6 font-bold gap-2"
      >
        <Blocks className="size-5 text-primary" />
        <span>SUKIT</span>
      </Link>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const hasChildren = !!item.children?.length;
          const expanded = expandedItems.has(item.label);

          return (
            <div key={item.href}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(item.label);
                  } else {
                    // navigate via Link below
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active && !hasChildren
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {hasChildren ? (
                  <>
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={cn("size-3 transition-transform", expanded && "rotate-180")}
                    />
                  </>
                ) : (
                  <Link href={item.href} className="flex w-full items-center gap-3">
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </button>
              {hasChildren && expanded && (
                <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                          childActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {ChildIcon && <ChildIcon className="size-3.5 shrink-0" />}
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
      <div className="border-t p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
        >
          <Globe className="size-4" />
          <span>Back to Site</span>
        </Link>
      </div>
    </aside>
  );
}
