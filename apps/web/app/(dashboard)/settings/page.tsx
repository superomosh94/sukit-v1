'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Key, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const settingsTabs = [
  {
    label: 'Profile',
    href: '/settings/profile',
    icon: User,
    desc: 'Your name, email, and avatar',
  },
  {
    label: 'Account',
    href: '/settings/account',
    icon: Shield,
    desc: 'Security, password, and sessions',
  },
  {
    label: 'API Keys',
    href: '/settings/api-keys',
    icon: Key,
    desc: 'Manage API access tokens',
  },
];

export default function SettingsPage() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and application settings
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href as any}
              className={cn(
                'group flex items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:shadow-md',
                active && 'border-primary ring-1 ring-primary'
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{tab.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tab.desc}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-medium mb-2">System Information</h2>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>SUKIT v1.0.0</p>
          <p>Node.js 26.2.0</p>
          <p>Next.js 16.0.0</p>
        </div>
      </div>
    </div>
  );
}
