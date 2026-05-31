'use client'

import { cn } from '@/lib/utils/cn'
import { Package, Download, Settings, Trash2, Loader2 } from 'lucide-react'

interface Module {
  id: string
  name: string
  version: string
  enabled: boolean
  description?: string
  icon?: string
}

interface ModuleCardProps {
  module: Module
  onInstall?: (id: string) => void
  onUninstall?: (id: string) => void
  onConfigure?: (id: string) => void
}

export default function ModuleCard({
  module,
  onInstall,
  onUninstall,
  onConfigure,
}: ModuleCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{module.name}</h3>
            <p className="text-xs text-muted-foreground">v{module.version}</p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
            module.enabled
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {module.enabled ? 'Installed' : 'Available'}
        </span>
      </div>

      {module.description && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {module.description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        {module.enabled ? (
          <>
            <button
              type="button"
              onClick={() => onConfigure?.(module.id)}
              className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              <Settings className="size-3.5" />
              Configure
            </button>
            <button
              type="button"
              onClick={() => onUninstall?.(module.id)}
              className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              Uninstall
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onInstall?.(module.id)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Download className="size-3.5" />
            Install
          </button>
        )}
      </div>
    </div>
  )
}
