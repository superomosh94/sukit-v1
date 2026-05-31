"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, FolderUp, Image } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function SettingsSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 pb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 py-1.5 text-xs font-medium text-muted-foreground"
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        {title}
      </button>
      {open && <div className="space-y-2 pt-1">{children}</div>}
    </div>
  );
}

export function SettingsField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function ResponsiveField({
  label,
  viewport,
  hasOverride,
  children,
}: {
  label: string;
  viewport: string;
  hasOverride: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {hasOverride && <ViewportBadge viewport={viewport} />}
      </div>
      {children}
    </div>
  );
}

export function ViewportBadge({ viewport }: { viewport: string }) {
  return (
    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
      {viewport}
    </span>
  );
}

export function AssetPathInput({
  value,
  onChange,
  placeholder = "Select an asset...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const handleBrowse = () => {
    const url = window.prompt("Enter media URL:", value || "https://");
    if (url) onChange(url);
  };

  return (
    <div className="flex gap-1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 flex-1 text-xs font-mono"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 shrink-0"
        onClick={handleBrowse}
      >
        {value ? <Image className="size-3.5" /> : <FolderUp className="size-3.5" />}
      </Button>
    </div>
  );
}
