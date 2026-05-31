"use client";

import { type HTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "./button";

export interface SidebarNavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
  children?: SidebarNavItem[];
}

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  items: SidebarNavItem[];
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground",
          className,
        )}
        {...props}
      >
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {items.map((item, i) => (
              <SidebarNavItem key={i} item={item} depth={0} />
            ))}
          </nav>
        </div>
      </div>
    );
  },
);
Sidebar.displayName = "Sidebar";

function SidebarNavItem({
  item,
  depth,
}: {
  item: SidebarNavItem;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(
    item.active || item.children?.some((c) => c.active) || false,
  );
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 px-2 text-sm font-normal",
          depth > 0 && "pl-8",
          item.active &&
            "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        )}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          }
        }}
        asChild={!hasChildren}
      >
        {hasChildren ? (
          <>
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </>
        ) : (
          <a href={item.href} className="flex items-center gap-3">
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </a>
        )}
      </Button>
      {hasChildren && expanded && (
        <div className="ml-2 border-l border-sidebar-border pl-2">
          {item.children!.map((child, i) => (
            <SidebarNavItem key={i} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export { Sidebar };
