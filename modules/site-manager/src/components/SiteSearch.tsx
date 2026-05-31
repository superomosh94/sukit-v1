'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, FileText, Globe, ArrowRight, X } from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';
import type { SiteSearchResult } from '../types';

interface SiteSearchProps {
  onNavigate?: (url: string) => void;
}

export function SiteSearch({ onNavigate }: SiteSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useSiteManagerStore((s) => s.search);
  const searchResults = useSiteManagerStore((s) => s.searchResults);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (query.trim()) {
      const timer = setTimeout(() => search(query), 200);
      return () => clearTimeout(timer);
    }
  }, [query, search]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
        e.preventDefault();
        const result = searchResults[selectedIndex];
        if (result.url) onNavigate?.(result.url);
        setOpen(false);
        setQuery('');
      }
    },
    [searchResults, selectedIndex, onNavigate]
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => {
              setOpen(false);
              setQuery('');
            }}
          />
          <div className="relative w-full max-w-lg rounded-lg border bg-card shadow-2xl">
            <div className="flex items-center border-b px-4">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                className="h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search pages and sites... (Ctrl+K)"
              />
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            {query.trim() && (
              <div className="max-h-80 overflow-y-auto p-2">
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="size-6 text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No results for &quot;{query}&quot;
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {searchResults.map((result, i) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => {
                          if (result.url) onNavigate?.(result.url);
                          setOpen(false);
                          setQuery('');
                        }}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                          i === selectedIndex
                            ? 'bg-accent'
                            : 'hover:bg-accent/50'
                        )}
                      >
                        {result.type === 'page' ? (
                          <FileText className="size-4 shrink-0 text-blue-500" />
                        ) : (
                          <Globe className="size-4 shrink-0 text-green-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.siteName && `${result.siteName} / `}
                            {result.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t pt-2 mt-2">
                  <p className="text-[10px] text-muted-foreground px-2">
                    <kbd className="rounded border bg-muted px-1 py-0.5 text-[9px]">
                      ↑↓
                    </kbd>{' '}
                    Navigate{' '}
                    <kbd className="rounded border bg-muted px-1 py-0.5 text-[9px]">
                      ↵
                    </kbd>{' '}
                    Open{' '}
                    <kbd className="rounded border bg-muted px-1 py-0.5 text-[9px]">
                      Esc
                    </kbd>{' '}
                    Close
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
