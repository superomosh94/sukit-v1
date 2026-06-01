'use client';

import { useState } from 'react';
import {
  FileText,
  Globe,
  Layout,
  Settings,
  User,
  ShoppingCart,
  Mail,
  MessageSquare,
  Image,
  Search,
  Home,
  BookOpen,
  Code,
  BarChart3,
  Calendar,
  Star,
  Heart,
  Bell,
  Flag,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../utils/cn';

const ICONS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: FileText, label: 'File' },
  { icon: Globe, label: 'Globe' },
  { icon: Layout, label: 'Layout' },
  { icon: Home, label: 'Home' },
  { icon: BookOpen, label: 'Blog' },
  { icon: ShoppingCart, label: 'Shop' },
  { icon: User, label: 'User' },
  { icon: Mail, label: 'Mail' },
  { icon: MessageSquare, label: 'Chat' },
  { icon: Image, label: 'Image' },
  { icon: Search, label: 'Search' },
  { icon: Code, label: 'Code' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Calendar, label: 'Calendar' },
  { icon: Star, label: 'Star' },
  { icon: Heart, label: 'Heart' },
  { icon: Bell, label: 'Bell' },
  { icon: Flag, label: 'Flag' },
];

interface PageIconPickerProps {
  value?: string;
  onChange?: (iconName: string) => void;
  className?: string;
}

export function PageIconPicker({
  value,
  onChange,
  className,
}: PageIconPickerProps) {
  const [open, setOpen] = useState(false);

  const SelectedIcon = ICONS.find((i) => i.label === value)?.icon;

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm hover:bg-accent"
      >
        {SelectedIcon ? (
          <SelectedIcon className="size-4" />
        ) : (
          <FileText className="size-4 text-muted-foreground" />
        )}
        <span>{value || 'Select icon'}</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 grid grid-cols-6 gap-1 rounded-lg border bg-card p-2 shadow-xl">
          {ICONS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => {
                onChange?.(label);
                setOpen(false);
              }}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md p-2 text-xs hover:bg-accent',
                value === label && 'bg-accent text-accent-foreground'
              )}
              title={label}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
