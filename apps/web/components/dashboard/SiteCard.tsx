'use client'

import { FileText, Globe, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SiteCardSite {
  id: string
  name: string
  domain: string
  thumbnail?: string
  pageCount: number
  lastEdited: string
}

interface SiteCardProps {
  site: SiteCardSite
  onClick?: (id: string) => void
  className?: string
}

export default function SiteCard({ site, onClick, className }: SiteCardProps) {
  return (
    <div
      onClick={() => onClick?.(site.id)}
      className={cn(
        'group cursor-pointer overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md',
        className,
      )}
    >
      <div className="aspect-video bg-muted">
        {site.thumbnail ? (
          <img
            src={site.thumbnail}
            alt={site.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Globe className="size-8 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold leading-none">{site.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground truncate">
          {site.domain}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="size-3.5" />
            {site.pageCount} {site.pageCount === 1 ? 'page' : 'pages'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {new Date(site.lastEdited).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}
