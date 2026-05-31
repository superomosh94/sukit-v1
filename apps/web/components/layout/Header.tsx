'use client'

import { Menu, Bell, Moon, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  title?: string
  onMenuToggle?: () => void
}

export default function Header({ title = 'Dashboard', onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent"
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>

        <button
          type="button"
          className="relative rounded-md p-2 text-muted-foreground hover:bg-accent"
          title="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
        </button>

        <button
          type="button"
          className="rounded-md p-1 text-muted-foreground hover:bg-accent"
          title="User menu"
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-muted">
            <User className="size-4" />
          </div>
        </button>
      </div>
    </header>
  )
}
