'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { User, Shield, Key, ChevronRight, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useEffect, useState, useSyncExternalStore } from 'react';

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
    label: 'Appearance',
    href: '/settings#appearance',
    icon: Sun,
    desc: 'Theme, dark mode, and display',
  },
  {
    label: 'API Keys',
    href: '/settings/api-keys',
    icon: Key,
    desc: 'Manage API access tokens',
  },
];

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [sysInfo, setSysInfo] = useState<{
    sukit: string;
    node: string;
    platform: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/system/version');
        const data = await res.json();
        setSysInfo(data);
      } catch {
        setSysInfo(null);
      }
    })();
  }, []);

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

      {/* ── Appearance / Theme ── */}
      <div id="appearance" className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sun className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Appearance</h2>
            <p className="text-xs text-muted-foreground">Choose your theme preference</p>
          </div>
        </div>
        <div className="flex gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const active = mounted && theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg border p-4 text-sm font-medium transition-all',
                  active
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-input hover:border-primary/50 hover:bg-accent'
                )}
              >
                <Icon className="size-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {!mounted ? 'Loading…' : theme === 'system'
            ? 'Follows your system preference'
            : `${theme === 'dark' ? 'Dark' : 'Light'} mode applied globally`}
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-medium mb-2">System Information</h2>
        <div className="space-y-1 text-xs text-muted-foreground">
          {sysInfo ? (
            <>
              <p>SUKIT v{sysInfo.sukit}</p>
              <p>{sysInfo.node}</p>
              <p>{sysInfo.platform}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}
