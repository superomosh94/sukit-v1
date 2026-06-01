'use client';

import { useState } from 'react';
import { Eye, Calendar, Monitor } from 'lucide-react';
import { cn } from '../utils/cn';

interface DisplayConfig {
  frequencyCap: number;
  frequencyPeriod: 'session' | 'day' | 'week' | 'month';
  pages: 'all' | 'specific' | 'except';
  specificPages: string[];
  maxSessions: number;
  hideOnMobile: boolean;
  showOnMobile: boolean;
  startDate?: string;
  endDate?: string;
}

interface DisplayRulesProps {
  value?: DisplayConfig;
  onChange?: (config: DisplayConfig) => void;
  className?: string;
}

export function DisplayRules({
  value,
  onChange,
  className,
}: DisplayRulesProps) {
  const [config, setConfig] = useState<DisplayConfig>(
    value ?? {
      frequencyCap: 1,
      frequencyPeriod: 'session',
      pages: 'all',
      specificPages: [],
      maxSessions: 0,
      hideOnMobile: false,
      showOnMobile: true,
    }
  );

  const updateConfig = (data: Partial<DisplayConfig>) => {
    const next = { ...config, ...data };
    setConfig(next);
    onChange?.(next);
  };

  const [pageInput, setPageInput] = useState('');

  const addPage = () => {
    if (pageInput.trim() && !config.specificPages.includes(pageInput.trim())) {
      updateConfig({
        specificPages: [...config.specificPages, pageInput.trim()],
      });
      setPageInput('');
    }
  };

  const removePage = (page: string) => {
    updateConfig({
      specificPages: config.specificPages.filter((p) => p !== page),
    });
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center gap-2">
        <Eye className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Display Rules</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Frequency Cap (per {config.frequencyPeriod})
          </label>
          <input
            type="number"
            value={config.frequencyCap}
            onChange={(e) =>
              updateConfig({
                frequencyCap: Math.max(1, Number(e.target.value)),
              })
            }
            min={1}
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Period
          </label>
          <select
            value={config.frequencyPeriod}
            onChange={(e) =>
              updateConfig({ frequencyPeriod: e.target.value as any })
            }
            className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs"
          >
            <option value="session">Per Session</option>
            <option value="day">Per Day</option>
            <option value="week">Per Week</option>
            <option value="month">Per Month</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Pages
        </label>
        <select
          value={config.pages}
          onChange={(e) => updateConfig({ pages: e.target.value as any })}
          className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs"
        >
          <option value="all">All Pages</option>
          <option value="specific">Specific Pages</option>
          <option value="except">All Except</option>
        </select>
      </div>

      {(config.pages === 'specific' || config.pages === 'except') && (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder="/page-slug"
              className="h-8 flex-1 rounded-md border bg-background px-3 text-xs font-mono"
              onKeyDown={(e) => e.key === 'Enter' && addPage()}
            />
            <button
              onClick={addPage}
              className="rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
            >
              Add
            </button>
          </div>
          {config.specificPages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {config.specificPages.map((page) => (
                <span
                  key={page}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono"
                >
                  {page}
                  <button
                    onClick={() => removePage(page)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={config.showOnMobile}
              onChange={(e) => updateConfig({ showOnMobile: e.target.checked })}
              className="rounded"
            />
            Show on Mobile
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={config.hideOnMobile}
              onChange={(e) => updateConfig({ hideOnMobile: e.target.checked })}
              className="rounded"
            />
            Hide on Mobile
          </label>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Max Sessions
          </label>
          <input
            type="number"
            value={config.maxSessions}
            onChange={(e) =>
              updateConfig({ maxSessions: Math.max(0, Number(e.target.value)) })
            }
            min={0}
            placeholder="0 = unlimited"
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Start Date
          </label>
          <input
            type="date"
            value={config.startDate ?? ''}
            onChange={(e) => updateConfig({ startDate: e.target.value })}
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            End Date
          </label>
          <input
            type="date"
            value={config.endDate ?? ''}
            onChange={(e) => updateConfig({ endDate: e.target.value })}
            className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
