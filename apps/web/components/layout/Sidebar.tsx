'use client'

import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  Globe,
  Blocks,
  Code2,
  Puzzle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
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
  Shield,
  Palette,
  HardDrive,
  Trash2,
  Wrench,
  BarChart3,
  Webhook,
  Search,
  Timer,
  BookOpen,
  Tags,
  MessageSquare,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string
  children?: { label: string; href: string; icon?: React.ComponentType<{ className?: string }> }[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },

  {
    label: 'Sites', icon: Globe, href: '/sites',
    children: [
      { label: 'All Sites', icon: Globe, href: '/sites' },
      { label: 'Builder', icon: Blocks, href: '/builder' },
      { label: 'Themes', icon: Palette, href: '/themes' },
      { label: 'Pages', icon: FileText, href: '/sites/pages' },
      { label: 'Media', icon: Image, href: '/sites/media' },
      { label: 'Team', icon: Users, href: '/team' },
      { label: 'Backups', icon: HardDrive, href: '/backups' },
      { label: 'Trash', icon: Trash2, href: '/sites/trash' },
    ],
  },

  {
    label: 'Content', icon: BookOpen, href: '/posts',
    children: [
      { label: 'Posts', icon: FileText, href: '/posts' },
      { label: 'Categories', icon: Tags, href: '/taxonomies?type=category' },
      { label: 'Tags', icon: Tags, href: '/taxonomies?type=tag' },
      { label: 'Comments', icon: MessageSquare, href: '/comments' },
      { label: 'Forms', icon: FormInput, href: '/sites/forms' },
    ],
  },

  {
    label: 'Popups', icon: Megaphone, href: '/popups',
    children: [
      { label: 'All Popups', icon: PanelTop, href: '/popups' },
      { label: 'Analytics', icon: BarChart3, href: '/popups/analytics' },
    ],
  },

  {
    label: 'Developer', icon: Code2, href: '/code',
    children: [
      { label: 'Code Editor', icon: Code2, href: '/code' },
      { label: 'Modules', icon: Puzzle, href: '/modules' },
      { label: 'Blocks', icon: Blocks, href: '/blocks' },
      { label: 'Module Marketplace', icon: Store, href: '/modules/marketplace' },
      { label: 'Plugins', icon: Package, href: '/plugins' },
      { label: 'Plugin Registry', icon: Database, href: '/plugins/registry' },
      { label: 'Webhooks', icon: Webhook, href: '/webhooks' },
    ],
  },

  {
    label: 'Deploy', icon: Rocket, href: '/deploy',
    children: [
      { label: 'Providers', icon: Rocket, href: '/deploy' },
      { label: 'CI/CD', icon: GitBranch, href: '/deploy/ci' },
      { label: 'Secrets', icon: Key, href: '/deploy/secrets' },
    ],
  },

  {
    label: 'Tools', icon: Wrench, href: '/audit',
    children: [
      { label: 'Audit Log', icon: ClipboardList, href: '/audit' },
      { label: 'Search', icon: Search, href: '/search' },
      { label: 'SEO', icon: BarChart3, href: '/seo' },
      { label: 'Cron Jobs', icon: Timer, href: '/cron' },
    ],
  },

  {
    label: 'Settings', icon: Settings, href: '/settings',
    children: [
      { label: 'Profile', icon: User, href: '/settings/profile' },
      { label: 'Account', icon: Shield, href: '/settings/account' },
      { label: 'Widgets', icon: LayoutDashboard, href: '/widgets' },
      { label: 'API Keys', icon: Key, href: '/settings/api-keys' },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  currentPath?: string
  user?: { name?: string | null; email?: string; image?: string | null }
}

export default function Sidebar({
  collapsed = false,
  onToggle,
  currentPath = '',
  user,
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const isActive = (href: string) => currentPath === href || currentPath.startsWith(href + '/')

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-card transition-all duration-200 overflow-y-auto',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Blocks className="size-6 text-primary" />
          {!collapsed && <span>SUKIT</span>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'rounded-md p-1.5 text-muted-foreground hover:bg-accent',
            collapsed ? 'mx-auto' : 'ml-auto',
          )}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const hasChildren = !!item.children?.length
          const expanded = expandedItems.has(item.label)

          return (
            <div key={item.href}>
              <a
                href={item.href}
                onClick={(e) => {
                  if (hasChildren) {
                    e.preventDefault()
                    toggleExpand(item.label)
                  }
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active && !hasChildren
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center px-2',
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                    {hasChildren && (
                      <ChevronDown
                        className={cn('size-3 transition-transform', expanded && 'rotate-180')}
                      />
                    )}
                  </>
                )}
              </a>
              {!collapsed && hasChildren && expanded && (
                <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon
                    const childActive = isActive(child.href)
                    return (
                      <a
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors',
                          childActive
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        {ChildIcon && <ChildIcon className="size-3.5 shrink-0" />}
                        <span className="truncate">{child.label}</span>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center">
              <User className="size-4 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              {user?.image ? (
                <img src={user.image} alt="" className="size-8 rounded-full" />
              ) : (
                <User className="size-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
            <a
              href="/api/auth/signout"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </a>
          </div>
        )}
      </div>
    </aside>
  )
}
