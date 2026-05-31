'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, FolderUp, Image } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { MediaLibraryDialog } from '../../components/MediaLibraryDialog';
import { cn } from '../../utils/cn';

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
        {open ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
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
    <div className={cn('space-y-1', className)}>
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
  placeholder = 'Select an asset...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
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
          onClick={() => setShowDialog(true)}
        >
          {value ? (
            <Image className="size-3.5" />
          ) : (
            <FolderUp className="size-3.5" />
          )}
        </Button>
      </div>
      <MediaLibraryDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSelect={onChange}
      />
    </>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder = '',
  className,
}: {
  value: number | '';
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '') {
        onChange(0);
        setError(null);
        return;
      }
      const num = Number(raw);
      if (isNaN(num)) {
        setError('Invalid number');
        return;
      }
      if (min !== undefined && num < min) {
        setError(`Min ${min}`);
        return;
      }
      if (max !== undefined && num > max) {
        setError(`Max ${max}`);
        return;
      }
      setError(null);
      onChange(num);
    },
    [onChange, min, max]
  );

  return (
    <div className="relative">
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        className={cn(
          'h-8 text-xs',
          error && 'border-red-500 focus-visible:ring-red-500 pr-7',
          className
        )}
      />
      {error && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-500 pointer-events-none">
          {error}
        </span>
      )}
    </div>
  );
}
