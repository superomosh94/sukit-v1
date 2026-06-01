'use client';

import { useState } from 'react';
import { Calendar, Clock, Save } from 'lucide-react';
import { cn } from '../utils/cn';
import type { ExportFormat } from './ExportFormatSelector';

interface ScheduleConfig {
  enabled: boolean;
  cron: string;
  format: ExportFormat;
  notifyOnComplete: boolean;
}

interface ExportSchedulerProps {
  onSave?: (config: ScheduleConfig) => void;
  className?: string;
}

const CRON_PRESETS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Weekly on Monday', value: '0 0 * * 1' },
  { label: 'Monthly 1st', value: '0 0 1 * *' },
  { label: 'Custom', value: '' },
];

export function ExportScheduler({ onSave, className }: ExportSchedulerProps) {
  const [config, setConfig] = useState<ScheduleConfig>({
    enabled: false,
    cron: '0 0 * * *',
    format: 'zip',
    notifyOnComplete: true,
  });

  const handleSave = () => {
    onSave?.(config);
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Export Schedule</h3>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) =>
              setConfig({ ...config, enabled: e.target.checked })
            }
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
        </label>
      </div>

      {config.enabled && (
        <>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Schedule
            </label>
            <select
              value={
                CRON_PRESETS.find((p) => p.value === config.cron)?.label
                  ? config.cron
                  : ''
              }
              onChange={(e) => {
                const preset = CRON_PRESETS.find(
                  (p) => p.value === e.target.value
                );
                if (preset) setConfig({ ...config, cron: preset.value });
              }}
              className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs"
            >
              {CRON_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {!config.cron && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Cron Expression
              </label>
              <input
                type="text"
                value={config.cron}
                onChange={(e) => setConfig({ ...config, cron: e.target.value })}
                placeholder="*/5 * * * *"
                className="mt-1 h-8 w-full rounded-md border bg-background px-2 font-mono text-xs"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Format
            </label>
            <select
              value={config.format}
              onChange={(e) =>
                setConfig({ ...config, format: e.target.value as ExportFormat })
              }
              className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs"
            >
              <option value="html">HTML</option>
              <option value="pdf">PDF</option>
              <option value="zip">ZIP Archive</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={config.notifyOnComplete}
              onChange={(e) =>
                setConfig({ ...config, notifyOnComplete: e.target.checked })
              }
              className="rounded"
            />
            Notify on completion
          </label>

          <button
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-1 rounded-md bg-primary py-2 text-xs font-medium text-primary-foreground"
          >
            <Save className="size-3" />
            Save Schedule
          </button>
        </>
      )}
    </div>
  );
}
