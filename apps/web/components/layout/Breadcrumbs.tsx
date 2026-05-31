'use client'

import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BreadcrumbSegment {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[]
}

export default function Breadcrumbs({ segments }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <a
        href="/dashboard"
        className="rounded-md p-1 hover:bg-accent hover:text-accent-foreground"
      >
        <Home className="size-4" />
      </a>

      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5" />
            {seg.href && !isLast ? (
              <a
                href={seg.href}
                className="rounded-md px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground"
              >
                {seg.label}
              </a>
            ) : (
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.5',
                  isLast && 'font-medium text-foreground',
                )}
              >
                {seg.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
