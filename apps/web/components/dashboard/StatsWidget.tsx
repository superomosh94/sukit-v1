'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, Eye, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StatMetric {
  label: string
  value: string
  change: number
  icon: React.ComponentType<{ className?: string }>
}

const PERIODS = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: 'All', value: 'all' },
] as const

type Period = (typeof PERIODS)[number]['value']

export default function StatsWidget() {
  const [period, setPeriod] = useState<Period>('7d')

  const metrics: StatMetric[] = [
    { label: 'Visitors', value: '1,234', change: 12.5, icon: Users },
    { label: 'Page Views', value: '4,567', change: -3.2, icon: Eye },
    { label: 'Bandwidth', value: '2.1 GB', change: 8.7, icon: HardDrive },
  ]

  const chartData =
    period === '7d'
      ? [30, 45, 38, 52, 48, 61, 55]
      : period === '30d'
        ? [120, 145, 110, 170, 155, 190, 175, 200, 185, 165, 210, 195]
        : [200, 350, 300, 500, 450, 600, 550, 700, 650, 800, 750, 900]

  const maxVal = Math.max(...chartData)

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Analytics</h3>
        <div className="flex gap-1 rounded-md border border-input p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                period === p.value
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon
          const isUp = m.change >= 0
          return (
            <div key={m.label} className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon className="size-3.5" />
                {m.label}
              </div>
              <p className="text-2xl font-bold">{m.value}</p>
              <div
                className={cn(
                  'flex items-center gap-0.5 text-xs',
                  isUp ? 'text-green-600' : 'text-red-600',
                )}
              >
                {isUp ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {Math.abs(m.change)}%
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-end gap-1 pt-2">
        {chartData.map((val, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-primary/20 transition-all hover:bg-primary/40"
            style={{ height: `${(val / maxVal) * 100}%`, minHeight: 4 }}
            title={`${val}`}
          />
        ))}
      </div>
    </div>
  )
}
