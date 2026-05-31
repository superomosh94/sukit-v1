'use client';

import dynamic from 'next/dynamic';

const BuilderEditor = dynamic(
  () => import('./builder-editor').then((m) => m.BuilderEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading builder...</p>
        </div>
      </div>
    ),
  }
);

export function BuilderWrapper({
  siteId,
  pageId,
}: {
  siteId: string;
  pageId: string;
}) {
  return <BuilderEditor siteId={siteId} pageId={pageId} />;
}
