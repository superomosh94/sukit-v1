'use client';

import { useState } from 'react';
import { Zap, Clock, MousePointer, Eye, ScrollText, X } from 'lucide-react';
import { cn } from '../utils/cn';

const TRIGGER_TYPES = [
  {
    value: 'time',
    label: 'Time Delay',
    icon: Clock,
    description: 'Show after N seconds',
  },
  {
    value: 'scroll',
    label: 'Scroll Depth',
    icon: ScrollText,
    description: 'Show at scroll %',
  },
  {
    value: 'exit-intent',
    label: 'Exit Intent',
    icon: X,
    description: 'Show on exit intent',
  },
  {
    value: 'click',
    label: 'On Click',
    icon: MousePointer,
    description: 'Show on element click',
  },
  {
    value: 'inactivity',
    label: 'Inactivity',
    icon: Clock,
    description: 'Show after idle time',
  },
  {
    value: 'page-views',
    label: 'Page Views',
    icon: Eye,
    description: 'Show after N page views',
  },
  {
    value: 'element-visibility',
    label: 'Element Visibility',
    icon: Eye,
    description: 'Show when element visible',
  },
  {
    value: 'on-load',
    label: 'On Load',
    icon: Zap,
    description: 'Show immediately on page load',
  },
];

interface TriggerConfig {
  type: string;
  value: string;
  delay: number;
}

interface TriggerEditorProps {
  value?: TriggerConfig;
  onChange?: (config: TriggerConfig) => void;
  className?: string;
}

export function TriggerEditor({
  value,
  onChange,
  className,
}: TriggerEditorProps) {
  const [config, setConfig] = useState<TriggerConfig>(
    value ?? { type: 'time', value: '5', delay: 0 }
  );

  const selectedTrigger = TRIGGER_TYPES.find((t) => t.value === config.type);

  const updateConfig = (data: Partial<TriggerConfig>) => {
    const next = { ...config, ...data };
    setConfig(next);
    onChange?.(next);
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center gap-2">
        <Zap className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Trigger</h3>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {TRIGGER_TYPES.map((trigger) => (
          <button
            key={trigger.value}
            onClick={() => updateConfig({ type: trigger.value })}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors hover:bg-accent',
              config.type === trigger.value &&
                'border-primary ring-1 ring-primary bg-primary/5'
            )}
          >
            <trigger.icon className="size-5 text-muted-foreground" />
            <span className="text-[10px] font-medium leading-tight">
              {trigger.label}
            </span>
          </button>
        ))}
      </div>

      {config.type === 'time' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Delay (seconds)
          </label>
          <input
            type="number"
            value={config.value}
            onChange={(e) => updateConfig({ value: e.target.value })}
            min={0}
            max={300}
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        </div>
      )}

      {config.type === 'scroll' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Scroll Depth (%)
          </label>
          <input
            type="number"
            value={config.value}
            onChange={(e) => updateConfig({ value: e.target.value })}
            min={1}
            max={100}
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        </div>
      )}

      {config.type === 'click' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            CSS Selector
          </label>
          <input
            type="text"
            value={config.value}
            onChange={(e) => updateConfig({ value: e.target.value })}
            placeholder=".cta-button, #my-element"
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 font-mono text-xs"
          />
        </div>
      )}

      {config.type === 'inactivity' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Idle Time (seconds)
          </label>
          <input
            type="number"
            value={config.value}
            onChange={(e) => updateConfig({ value: e.target.value })}
            min={1}
            max={600}
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        </div>
      )}

      {config.type === 'page-views' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Page Views
          </label>
          <input
            type="number"
            value={config.value}
            onChange={(e) => updateConfig({ value: e.target.value })}
            min={1}
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        </div>
      )}

      {config.type === 'element-visibility' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            CSS Selector
          </label>
          <input
            type="text"
            value={config.value}
            onChange={(e) => updateConfig({ value: e.target.value })}
            placeholder=".section-hero, #pricing"
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}
